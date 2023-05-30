import { definePlugin, Router, ServerAPI, staticClasses, getGamepadNavigationTrees, getFocusNavController } from "decky-frontend-lib";
import { reactTree, routePath, SP_Window } from "./init";
import { QAMContent } from "./components/QAMContent";
// import { IoMdPlanet } from "react-icons/io";
// import { BsGlobeAmericas } from "react-icons/bs";
import { PluginIcon } from "./native-components/PluginIcon";
import { appendStyles } from "./styling";
import { TabbedBrowser } from "./components/TabbedBrowser";
import { tabManager } from "./classes/TabManager";
import { patchMenu } from "./menuPatch";
import { mouse } from "./mouse";
import { settingsManager } from "./classes/SettingsManager";
import { favoritesManager } from "./classes/FavoritesManager";
import { patchSearchBar, unpatchSearchBar } from "./searchBarPatch";
import { backendService } from "./classes/BackendService";
import { log } from "./log";

export default definePlugin((serverApi: ServerAPI) => {
    backendService.init(serverApi)
    settingsManager.init()
    favoritesManager.init()
    appendStyles(SP_Window)

    serverApi.routerHook.addRoute(routePath, () => { return <TabbedBrowser tabManager={tabManager} /> })

    const unpatchMenu = patchMenu()
    patchSearchBar()
    const unregisterOnResume = SteamClient.System.RegisterForOnResumeFromSuspend(patchSearchBar).unregister

    //@ts-ignore
    window.test = {
        router: Router,
        navtrees: getGamepadNavigationTrees(),
        focusNavController: getFocusNavController(),
        tabManager: tabManager,
        react: reactTree,
        // webroot: externalwebRoot,
        // si: steamInputModule,
        // appid: a,
        // bnode: mainBNode,
        // focus: FocusableInput,
        // searchElt: searchInputElt,
        // qlt: searchBarRootNode,
    }

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


