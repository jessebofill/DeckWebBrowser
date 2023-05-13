import os

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky_plugin
from injector import get_tab_lambda, Tab, get_tabs, close_old_tabs


class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def add(self, left, right):
        return left + right

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        decky_plugin.logger.info("Hello World!")
        tabs = await get_tabs()
        for tab in tabs:
            decky_plugin.logger.info("Tab: %s" %tab)
            for prop, value in tab.__dict__.items():
                decky_plugin.logger.info("%s: %s" %(prop, value))

        browser_tab = await get_tab_lambda(lambda tab: tab.id == "93316A0B0A4520E9B09CAABEDEC2B938")
        decky_plugin.logger.info("Found Browser tab> %s" %browser_tab)

        res = await browser_tab.evaluate_js("console.log('lets see if this worked!!!')")
        decky_plugin.logger.info("res %s" %res)


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
