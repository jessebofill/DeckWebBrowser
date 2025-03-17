import asyncio
import json
import os
from uuid import uuid4
import aiohttp
import aiohttp.web
import aiohttp.web_middlewares
import decky_plugin
from injector import get_tab, get_gamepadui_tab, Tab
from settings import SettingsManager
from typing import Dict, TypedDict

settingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]

settingManagers = {
    'settings': SettingsManager(name="settings", settings_directory=settingsDir),
    'favorites': SettingsManager(name="favorites", settings_directory=settingsDir),
    'history': SettingsManager(name="history", settings_directory=settingsDir)
}

tabs: Dict[str, Tab] = {}
class Plugin:
    async def _main(self):
        decky_plugin.logger.info("Starting Plugin")
        self.load_client_script(self)
        self.ws_server = WSServer()
        self.tasks = [asyncio.create_task(self.ws_server.run(), name='ws_server')]

    async def _unload(self):
        decky_plugin.logger.info("Unloading plugin")

        for task in self.tasks:
            decky_plugin.logger.info(f"cancelling {task}")
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                decky_plugin.logger.info(f"Task {task} cancelled")

        decky_plugin.logger.info('Plugin unloaded')

    async def load(self, manager):
        settingManagers[manager].read()
        return settingManagers[manager].settings

    async def save_data(self, manager, data):
        settingManagers[manager].settings = data
        settingManagers[manager].commit()
    
    async def save_setting(self, key: str, value):
        settingManagers['settings'].setSetting(key, value)

    async def set_main_tab(self, frontend_id):
        tab = await get_gamepadui_tab()
        decky_plugin.logger.info(f'Got main tab with frontend id {frontend_id}: {tab.ws_url}')
        tabs[frontend_id] = tab
        port = await self.ws_server.getPort()
        return { 'key': self.ws_server.generate_api_key(frontend_id), 'port': port }

    async def setup_target(self, frontend_id):
        try: 
            tab = await get_tab(f'data:text/plain,{frontend_id}')
        except ValueError:
            msg = f"Couldn't fint tab with frontend id {frontend_id}"
            decky_plugin.logger.error(msg)
            raise ValueError(msg)
            
        decky_plugin.logger.info(f'Got tab with frontend id {frontend_id}: {tab.ws_url}')
        tabs[frontend_id] = tab
        
        self.tasks.append(asyncio.create_task(self.auto_inject_target(self, tab, frontend_id), name=f'cdp_{frontend_id}'))
        return str(tab.id)

    async def add_client_script(self, tab: Tab, frontend_id):
        if (self.client_js):
            port = await self.ws_server.getPort()
            key = self.ws_server.generate_api_key(frontend_id)
            js = f"const id = '{frontend_id}'; const key = '{key}'; const port = '{port}'; {self.client_js}"
            await tab._send_devtools_cmd({
                "method": "Page.addScriptToEvaluateOnNewDocument",
                "params": {
                    "source": js,
                    "runImmediately": True
                }
            }, True)
            await tab._send_devtools_cmd({
                "method": "Page.enable",
            }, True)

    async def auto_inject_target(self, tab: Tab, frontend_id):
        already_removed = False
        while frontend_id in tabs:
            tab = tabs[frontend_id]

            try:
                await tab.open_websocket()
                decky_plugin.logger.info(f'Connected cdp ws {tab.ws_url}')
                await self.add_client_script(self, tab, frontend_id)
                async for msg in tab.websocket:
                    if msg.type == aiohttp.WSMsgType.CLOSE:
                        raise ValueError('WebSocket connection closed')
                    elif msg.type == aiohttp.WSMsgType.ERROR:
                        raise ValueError(f'WebSocket error: {msg.data}')
                    elif msg.type == aiohttp.WSMsgType.TEXT:
                        message_data = json.loads(msg.data)
                        if (message_data.get("method") == "Inspector.detached" and message_data.get("params", {}).get("reason") == "target_closed"):
                            decky_plugin.logger.info(f"Target closed detected for {frontend_id}, removing tab")
                            del self.ws_server.api_keys[frontend_id]
                            await tab.close_websocket()
                            tabs.pop(frontend_id, None)
                            already_removed = True
                            break
                    
            except (aiohttp.ClientConnectionError, aiohttp.WSServerHandshakeError, ValueError) as e:
                decky_plugin.logger.info(f"Target cdp ws {tab.ws_url} error: {e}")
            except Exception as e:
                decky_plugin.logger.info(f"Error: {e}")
            finally:
                try:
                    await tab.close_websocket()
                except:
                    pass

            if already_removed:
                return

            decky_plugin.logger.info(f'Problem with cdp ws {tab.ws_url} connection. Will auto reconnect if target still exists')
            await asyncio.sleep(5)
        decky_plugin.logger.info(f'Target {tab.ws_url} no longer exists, will not reconnect ')
        
    async def execute_in_target(self, frontendId, code, run_async=False):
        return await tabs[frontendId].evaluate_js(code, run_async)
        
    def load_client_script(self):
        try:
            with open(os.path.join(decky_plugin.DECKY_PLUGIN_DIR, 'client.js'), 'r', encoding='utf-8') as file:
                self.client_js = file.read()
        except FileNotFoundError:
            decky_plugin.logger.error("Error getting client js. File not found")
        except IOError:
            decky_plugin.logger.error("Error getting client js")

class ClientTarget(TypedDict):
    target_id: str
    connection: aiohttp.web.WebSocketResponse
    watch: bool
class WSServer:
    def __init__(self):
        self.connection_id = 0
        self.client_targets: Dict[str, ClientTarget] = {}
        self.main_target = None
        self.api_keys = {}
        self.port = 51212
        self.started = False

    def generate_api_key(self, target_id):
        api_key = str(uuid4())
        self.api_keys[target_id] = api_key
        return api_key

    async def handle_websocket(self, request):
        try:
            api_key = request.query.get('api_key')
            if not api_key or not any(key == api_key for key in self.api_keys.values()):
                decky_plugin.logger.info(f"WebSocket connection refused due to invalid API key.")
                raise aiohttp.web.HTTPUnauthorized(reason='Invalid API key')

            ws = aiohttp.web.WebSocketResponse()
            await ws.prepare(request)

        except aiohttp.web.HTTPUnauthorized as e:
            return aiohttp.web.Response(status=401, text=str(e))

        except Exception as e:
            decky_plugin.logger.error(f"Error during WebSocket preparation or API key validation: {e}")
            return aiohttp.web.Response(status=500, text='Internal Server Error')

        self.connection_id += 1
        id = self.connection_id
        decky_plugin.logger.info(f"Client connected to WebSocket. Assigned id: {id}")

        try:
            async for msg in ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    try:
                        data = json.loads(msg.data)
                        # decky_plugin.logger.info(f"Received message from {id}: {data}")
                        
                        msg_id = data.get('msgId')
                        server_message_type = data.get('type')
                        if data.get('response'):
                            await ws.send_str(self.server_error(msg_id, 'Unacceptable field'))
                        if server_message_type == "register":
                            await self.handle_register(ws, data)
                        else:
                            from_target_id = self.find_from_target_id(ws)
                            if server_message_type == "broadcastClients":
                                await self.handle_broadcast_clients(data, from_target_id)
                            elif server_message_type == "sendToTarget":
                                await self.handle_send_to_target(data, from_target_id)
                            elif server_message_type == "sendToMain":
                                await self.handle_send_to_main(data, from_target_id)
                            elif server_message_type == "watchConnection":
                                await self.handle_watch(data, from_target_id)
                            else:
                                await ws.send_str(self.server_error(msg_id, "Unknown server message type"))

                    except json.JSONDecodeError:
                        await ws.send_str(self.server_error(msg_id, "Invalid JSON format"))

                    except ValueError as e:
                        await ws.send_str(self.server_error(msg_id, str(e)))

        except Exception as e:
            decky_plugin.logger.error(f"Error handling message from {id}: {e}")

        finally:
            await self.on_connection_close(ws)
            decky_plugin.logger.info(f"WebSocket connection with client {id} closed.")
        return ws

    async def handle_register(self, connection, recieved):
        if 'targetType' not in recieved:
            raise ValueError("Missing required field: 'targetType'")
        if 'targetId' not in recieved or not recieved['targetId'].strip():
            raise ValueError("Missing required field: 'targetId'")

        target_type = recieved['targetType']
        target_id = recieved['targetId'].strip()

        if target_id not in tabs:
            raise ValueError(f'Unrecognized target')
        if target_type == "client":
            self.client_targets[target_id] = {'target_id': target_id, 'connection': connection}
            decky_plugin.logger.info(f"Registered client target: {target_id}")
        elif target_type == "main":
            self.main_target = {'target_id': target_id, 'connection': connection}
            decky_plugin.logger.info(f"Registered main target: {target_id}")
        else:
            raise ValueError(f"Invalid targetType")
        await connection.send_str(self.server_success(recieved.get('msgId'), 'Registration successful'))

    async def handle_broadcast_clients(self, recieved, from_id):
        if 'mainId' not in recieved:
            raise ValueError("Missing required field: 'mainId'")

        main_id = recieved['mainId']
        if self.main_target is None or main_id != self.main_target['target_id']:
            raise ValueError("Invalid mainId")

        for client_id, client in self.client_targets.items():
            await client['connection'].send_str(self.get_send_msg(recieved, from_id))

    async def handle_send_to_target(self, recieved, from_id):
        if 'toTargetId' not in recieved:
            raise ValueError("Missing required field: 'toTargetId'")

        to_target_id = recieved['toTargetId']
        target = self.client_targets.get(to_target_id) or (self.main_target if self.main_target and self.main_target['target_id'] == to_target_id else None)
        
        if target is None:
            raise ValueError("Invalid toTargetId")
        try:
            await target['connection'].send_str(self.get_send_msg(recieved, from_id))
        except Exception as e:
            decky_plugin.logger.info(f'dsff: {e}')

    async def handle_send_to_main(self, recieved, from_id):
        if self.main_target is None: 
            raise ValueError('Main target has not yet been registered')
        await self.main_target['connection'].send_str(self.get_send_msg(recieved, from_id))

    async def handle_watch(self, recieved, from_id):
        if not from_id == self.main_target['target_id']:
            raise ValueError('Only main target can watch other connections')
        if 'idToWatch' not in recieved:
            raise ValueError("Missing required field: 'idToWatch'")
        self.client_targets[recieved['idToWatch']]['watch'] = True
        
    async def on_connection_close(self, connection):
        for id, client in list(self.client_targets.items()):
            if client['connection'] == connection:
                del self.client_targets[id]
                if client['watch']:
                    await self.main_target['connection'].send_str(self.get_send_msg({'message': {'messageType': 'connectionClosed', 'data': {'targetId': id}}}, 'server'))

    def get_send_msg(self, recieved, from_id):
        if 'message' not in recieved:
            raise ValueError("Missing required field: 'message'")
        message = recieved['message']
        if 'messageType' not in message:
            raise ValueError("Message field missing required field: 'messageType'")
        if 'data' not in message:
            raise ValueError("Message field missing required field: 'data'")
        return json.dumps({"messageType": message['messageType'], "data": message['data'], 'fromTargetId': from_id})
    
    def server_response(self, msg_id, result, message):
        return json.dumps({"msgId": msg_id, "response": {"result": result, "message": message }})

    def server_success(self, msg_id, message):
        return self.server_response(msg_id, 'success', message)
    
    def server_error(self, msg_id, message):
        return self.server_response(msg_id, 'error', message)

    def find_from_target_id(self, connection):
        if self.main_target and self.main_target['connection'] == connection:
            return self.main_target['target_id']

        for target_id, target_info in self.client_targets.items():
            if target_info['connection'] == connection:
                return target_id
        raise ValueError('Sender must be registered first')
    
    async def init_websocket_app(self):
        app = aiohttp.web.Application()
        app.router.add_get('/ws', self.handle_websocket)
        return app

    async def run(self):
        try:
            decky_plugin.logger.info("Starting WebSocket server...")
            app = await self.init_websocket_app()
            runner = aiohttp.web.AppRunner(app)
            await runner.setup()
            while True:
                try:
                    site = aiohttp.web.TCPSite(runner, 'localhost', self.port)
                    await site.start()
                    break
                except OSError:
                    decky_plugin.logger.info(f"Port {self.port} is in use, trying the next one...")
                    self.port += 1
            decky_plugin.logger.info(f"WebSocket server is running on port {self.port}.")
            self.started = True
            
            while True:
                await asyncio.sleep(3600)
        except asyncio.CancelledError:
            decky_plugin.logger.info("WebSocket server task was cancelled.")
        except Exception as e:
            decky_plugin.logger.info(f"WebSocket server encountered an error: {e}")
        finally:
            await runner.cleanup()
            decky_plugin.logger.info("WebSocket server has ended.")
            
    async def getPort(self):
        while not self.started:
            await asyncio.sleep(1)
        return self.port