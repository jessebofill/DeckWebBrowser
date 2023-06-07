
import os
import decky_plugin
from injector import get_tab, Tab
from settings import SettingsManager
from typing import Dict

settingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]

settingManagers = {
    'settings': SettingsManager(name="settings", settings_directory=settingsDir),
    'favorites': SettingsManager(name="favorites", settings_directory=settingsDir),
    'history': SettingsManager(name="history", settings_directory=settingsDir)
}

tabs: Dict[str, Tab] = {}

class Plugin:
    
    async def _main(self):
        pass

    async def assign_target(self, frontendId):
        tab = await get_tab(f'data:text/plain,{frontendId}')
        if(tab != None):
            tabs[frontendId] = tab
            decky_plugin.logger.info(tabs)
        return str(tab.id)
        
    async def execute_in_target(self, frontendId, code, run_async=False):
        return await tabs[frontendId].evaluate_js(code, run_async)

    async def load(self, manager):
        decky_plugin.logger.info(manager)
        settingManagers[manager].read()
        return settingManagers[manager].settings

    async def save_data(self, manager, data):
        settingManagers[manager].settings = data
        settingManagers[manager].commit()
    
    async def save_setting(self, key: str, value):
        settingManagers['settings'].setSetting(key, value)