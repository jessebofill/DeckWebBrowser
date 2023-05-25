import { definePlugin, Router, ServerAPI, staticClasses, getGamepadNavigationTrees, getFocusNavController, } from "decky-frontend-lib";
import { routePath, SP_Window } from "./init";
import { QAMContent } from "./components/QAMContent";
// import { IoMdPlanet } from "react-icons/io";
// import { BsGlobeAmericas } from "react-icons/bs";
import { PluginIcon } from "./native-components/PluginIcon";
import { appendStyles } from "./styling";
import { TabbedBrowser } from "./components/TabbedBrowser";
import { tabManager } from "./classes/TabManager";
import { patchMenu } from "./patchMenu";
import { moveMouse } from "./mouse";
import { settingsManager } from "./classes/SettingsManager";
import { favoritesManager } from "./classes/FavoritesManager";
import { backendService } from "./classes/BackendService";

/**
 * 
 * TODO also search needs to be patch after menu open as well
 */


export default definePlugin((serverApi: ServerAPI) => {
    backendService.init(serverApi)
    settingsManager.init()
    favoritesManager.init()
    appendStyles(SP_Window)
    // SteamClient.Input.RegisterForControllerAnalogInputMessages(moveMouse)

    serverApi.routerHook.addRoute(routePath, () => {
        return <TabbedBrowser tabManager={tabManager} />
        
    })
    const unpatchMenu = patchMenu()

    // const steamInputModule = findModuleChild((mod) => {
    //     for (let prop in mod) {
    //         if (mod[prop]?.OnControllerCommandMessage) {
    //             return mod
    //         }

    //     }
    // })

    // const a = findModuleChild((mod) => {
    //     for (let prop in mod) {
    //         if (mod[prop]?.UpdateStreamingInputPauseState) {
    //             return mod
    //         }

    //     }
    // })

    //@ts-ignore
    window.test = {
        router: Router,
        navtrees: getGamepadNavigationTrees(),
        focusNavController: getFocusNavController(),
        tabManager: tabManager,
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
        },
    };
});


