
# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`
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

# settings.read()
class Plugin:
    
    async def _main(self):
        # decky_plugin.logger.info("Hello World!")
        # tabs = await get_tabs()
        # for tab in tabs:
        #     decky_plugin.logger.info("Tab: %s" %tab)
        #     for prop, value in tab.__dict__.items():
        #         decky_plugin.logger.info("%s: %s" %(prop, value))
        pass
        # browser_tab = await get_tab_lambda(lambda tab: tab.id == "93316A0B0A4520E9B09CAABEDEC2B938")
        # decky_plugin.logger.info("Found Browser tab> %s" %browser_tab)

        # res = await browser_tab.evaluate_js("console.log('lets see if this worked!!!')")
        # decky_plugin.logger.info("res %s" %res)

    async def assign_target(self, frontendId):
        tab = await get_tab(f'data:text/plain,{frontendId}')
        if(tab != None):
            tabs[frontendId] = tab
            decky_plugin.logger.info(tabs)
        return str(tab.id)
        
    async def execute_in_target(self, frontendId, code, run_async=False):
        await tabs[frontendId].evaluate_js(code, run_async)

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        # decky_plugin.logger.info("Goodbye World!")
        pass

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        # decky_plugin.logger.info("Migrating")
        # Here's a migration example for logs:
        # - `~/.config/decky-template/template.log` will be migrated to `decky_plugin.DECKY_PLUGIN_LOG_DIR/template.log`
        # decky_plugin.migrate_logs(os.path.join(decky_plugin.DECKY_USER_HOME,
        #                                        ".config", "decky-template", "template.log"))
        # Here's a migration example for settings:
        # - `~/homebrew/settings/template.json` is migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/template.json`
        # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/`
        # decky_plugin.migrate_settings(
        #     os.path.join(decky_plugin.DECKY_HOME, "settings", "template.json"),
        #     os.path.join(decky_plugin.DECKY_USER_HOME, ".config", "decky-template"))
        # Here's a migration example for runtime data:
        # - `~/homebrew/template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
        # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
        # decky_plugin.migrate_runtime(
        #     os.path.join(decky_plugin.DECKY_HOME, "template"),
        #     os.path.join(decky_plugin.DECKY_USER_HOME, ".local", "share", "decky-template"))
        pass
    
    async def load(self, manager):
        decky_plugin.logger.info(manager)
        settingManagers[manager].read()
        return settingManagers[manager].settings
    
    # async def save(self, manager):
    #     settingManagers[manager].commit()

    async def save_data(self, manager, data):
        settingManagers[manager].settings = data
        settingManagers[manager].commit()
    
    async def save_setting(self, key: str, value):
        settingManagers['settings'].setSetting(key, value)

    # async def get_setting(self, key: str, defaults):
    #     return settingManagers['setting'].getSetting(key, defaults)
    
    
    # async def save_favorites(self, favorites_data):
    #     return self.set_setting('favorites', favorites_data)
    
    # async def load_favorites(self):
    #     return self.get_setting('favorites')