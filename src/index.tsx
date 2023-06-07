import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib";
import { routePath, SP_Window } from "./init";
import { QAMContent } from "./components/QAMContent";
import { PluginIcon } from "./native-components/PluginIcon";
import { appendStyles } from "./styling";
import { TabbedBrowser } from "./components/TabbedBrowser";
import { tabManager } from "./classes/TabManager";
import { patchMenu } from "./menuPatch";
import { settingsManager } from "./classes/SettingsManager";
import { favoritesManager } from "./classes/FavoritesManager";
import { patchSearchBar, unpatchSearchBar } from "./searchBarPatch";
import { backendService } from "./classes/BackendService";

export default definePlugin((serverApi: ServerAPI) => {
    backendService.init(serverApi)
    settingsManager.init()
    favoritesManager.init()
    appendStyles(SP_Window)
    serverApi.routerHook.addRoute(routePath, () => { return <TabbedBrowser tabManager={tabManager} /> })
    const unpatchMenu = patchMenu()
    patchSearchBar()
    const unregisterOnResume = SteamClient.System.RegisterForOnResumeFromSuspend(patchSearchBar).unregister

    return {
        title: <div className={staticClasses.Title}>Web Browser</div>,
        content: <QAMContent />,
        icon: <PluginIcon />,
        onDismount() {
            serverApi.routerHook.removeRoute(routePath);
            unpatchMenu()
            unpatchSearchBar?.()
            unregisterOnResume()
        },
    };
});


