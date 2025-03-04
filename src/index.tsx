import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib";
import { routePath, SP_Window } from "./init";
import { QAMContent } from "./components/QAMContent";
import { PluginIcon } from "./components/native-components/PluginIcon";
import { appendStyles } from "./components/styling";
import { TabbedBrowser } from "./components/TabbedBrowser";
import { tabManager } from "./classes/TabManager";
import { patchMenu } from "./patches/menuPatch";
import { settingsManager } from "./classes/SettingsManager";
import { favoritesManager } from "./classes/FavoritesManager";
import { patchSearchBar, searchBarState, unpatchSearchBar } from "./patches/searchBarPatch";
import { backendService } from "./classes/BackendService";
import { WSManager } from './classes/WSManager';
import { error } from './lib/log';

export default definePlugin((serverApi: ServerAPI) => {
    backendService.init(serverApi)
    backendService.setMainTab()
        .then(({ id, key }) => tabManager.setWSManager(new WSManager(id, key)))
        .catch(e => error('Error setting main tab for establishing ws server', e))
    settingsManager.init()
    favoritesManager.init()

    appendStyles(SP_Window)
    serverApi.routerHook.addRoute(routePath, () => { return <TabbedBrowser tabManager={tabManager} /> })
    const unpatchMenu = patchMenu()
    patchSearchBar()
    const unregisterOnResume = SteamClient.System.RegisterForOnResumeFromSuspend(patchSearchBar).unregister
    const unregisterForAppLifetime = SteamClient.GameSessions.RegisterForAppLifetimeNotifications(patchSearchBar).unregister
    const unregisterForAppOvelay = SteamClient.Overlay.RegisterForOverlayActivated(() => { if (searchBarState.useFallbackSearch) patchSearchBar() }).unregister;
    return {
        title: <div className={staticClasses.Title}>Web Browser</div>,
        content: <QAMContent />,
        icon: <PluginIcon size='1em' />,
        onDismount() {
            serverApi.routerHook.removeRoute(routePath);
            unpatchMenu()
            unpatchSearchBar()
            unregisterOnResume()
            unregisterForAppLifetime()
            unregisterForAppOvelay()
        },
    };
});


