import {
    afterPatch,
    ButtonItem,
    definePlugin,
    Menu,
    MenuItem,
    PanelSection,
    PanelSectionRow,
    Router,
    ServerAPI,
    showContextMenu,
    staticClasses,
    sleep,
    findInReactTree,
    getGamepadNavigationTrees,
    findSP,
    getFocusNavController,
    findModuleChild,
} from "decky-frontend-lib";
import { VFC } from "react";
import { lle, llog } from "./log";
import { FaShip } from "react-icons/fa";
import logo from "../assets/logo.png";
import { routePath, reactTree, SP_Window } from "./init";
import { appendStyles } from "./styling";
import { TabbedBrowser } from "./components/TabbedBrowser";
import { tabManager } from "./classes/TabManager";
import { moveMouse } from "./mouse";

const Content: VFC = ({ }) => {

    // const [result, setResult] = useState<number | undefined>();

    // const onClick = async () => {
    //   const result = await serverAPI.callPluginMethod<AddMethodArgs, number>(
    //     "add",
    //     {
    //       left: 2,
    //       right: 2,
    //     }
    //   );
    //   if (result.success) {
    //     setResult(result.result);
    //   }
    // };

    return (
        <PanelSection title="Panel Section">
            <PanelSectionRow>
                <ButtonItem
                    layout="below"
                    onClick={(e) =>
                        showContextMenu(
                            <Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => { }}>
                                <MenuItem onSelected={() => { }}>Item #1</MenuItem>
                                <MenuItem onSelected={() => { }}>Item #2</MenuItem>
                                <MenuItem onSelected={() => { }}>Item #3</MenuItem>
                            </Menu>,
                            e.currentTarget ?? window
                        )
                    }
                >
                    Server says yolo
                </ButtonItem>
            </PanelSectionRow>

            <PanelSectionRow>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <img src={logo} />
                </div>
            </PanelSectionRow>

            <PanelSectionRow>
                <ButtonItem
                    layout="below"
                    onClick={() => {
                        Router.CloseSideMenus();
                        Router.Navigate(routePath);
                    }}
                >
                    Router
                </ButtonItem>
            </PanelSectionRow>
        </PanelSection>
    );
};

const findNode = (currentNode: any, iters: number, str: string): any => {
    if (iters >= 65) {
        // currently 45
        return null;
    }
    if (
        typeof currentNode?.memoizedProps?.visible == 'boolean' &&
        currentNode?.type?.toString()?.includes(str)
    ) {
        console.log('MY LOG: ', `${str} root was found in ${iters} recursion cycles`);
        console.log('MY LOG: ', currentNode.type.toString())
        return currentNode;
    }
    if (currentNode.child) {
        let node = findNode(currentNode.child, iters + 1, str);
        if (node !== null) return node;
    }
    if (currentNode.sibling) {
        let node = findNode(currentNode.sibling, iters + 1, str);
        if (node !== null) return node;
    }
    return null;
};


/**
 * 
 * TODO also search needs to be patch after menu open as well
 */

export default definePlugin((serverApi: ServerAPI) => {
    // let _window = findSP()
    appendStyles(SP_Window)
    // SteamClient.Input.RegisterForControllerAnalogInputMessages(moveMouse)

    llog('react tree ', reactTree)

    serverApi.routerHook.addRoute(routePath, () => {
        // return <BrowserContexts.Provider value={myContexts}>
        return <TabbedBrowser tabManager={tabManager} />
        // </BrowserContexts.Provider>
    })

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
    const mainBNode = findInReactTree(reactTree, (x) => x?.props?.path == '/steamweb')
    
    //@ts-ignore
    window.test = {
        router: Router,
        navtrees: getGamepadNavigationTrees(),
        focusNavController: getFocusNavController(),
        // webroot: externalwebRoot,
        tabmManager: tabManager,
        // si: steamInputModule,
        // appid: a,
        bnode: mainBNode
        // focus: FocusableInput,
        // searchElt: searchInputElt,
        // qlt: searchBarRootNode,
    }

    let menuRoot: any;
    let menuPatch: any
    (async () => {
        menuRoot = findNode(reactTree, 0, 'MainMenuBrowserView');
        while (!menuRoot) {
            console.error('MY LOG: ',
                'Failed to find Main Menu root node, reattempting in 5 seconds. A developer may need to increase the recursion limit.',
            );
            await sleep(5000);
            menuRoot = findNode(reactTree, 0, 'MainMenuBrowserView');

        }
        llog('menu root: ', menuRoot)

        menuPatch = afterPatch(menuRoot.return, 'type', (_: any, ret: any) => {
            try {
                if (!menuRoot?.child) {
                    menuRoot = findNode(reactTree, 0, 'MainMenuBrowserView');
                }
                if (menuRoot?.child && !menuRoot?.child?.type?.decky) {
                    afterPatch(menuRoot.child, 'type', (_: any, ret: any) => {
                        // llog('l1: ', ret)

                        // wrapReactType(ret)
                        afterPatch(ret.props.children[1], 'type', (_: any, ret: any) => {
                            // llog('l2: ', ret)
                            // const qamTabsRenderer = findInReactTree(ret, (x) => x?.props?.children)
                            // llog('qamTabsRenderer: ',qamTabsRenderer)
                            afterPatch(ret.props.children.children, 'type', (_: any, ret: any) => {
                                // llog('l3: ', ret)
                                afterPatch(ret.props.children.props.children[0], 'type', (_: any, ret: any) => {
                                    // llog('l4: ', ret)
                                    // afterPatch(ret.props.children[0], 'type', (_: any, ret: any) => {
                                    // llog('l5: ', ret)
                                    const storeCopy = { ...ret.props.children[5] }
                                    storeCopy.label = 'Browser'
                                    storeCopy.props = {
                                        ...storeCopy.props,
                                        label: storeCopy.label,
                                        route: routePath,
                                        // routeState: {
                                        //     url: defaultUrl
                                        // }
                                    }

                                    ret.props.children.splice(5, 0, storeCopy)
                    
                                    return ret
                                })
                                return ret
                            })
                            return ret
                        })
                        return ret
                    })
                    menuRoot.child.type.decky = true;
                    menuRoot.child.alternate.type = menuRoot.child.type;
                }
            } catch (e) {
                lle('Error patching Menu', e);
            }
            return ret

        })

        if (menuRoot.return.alternate) {
            menuRoot.return.alternate.type = menuRoot.return.type;
        }
    })()

    return {
        title: <div className={staticClasses.Title}>Example Plugin</div>,
        content: <Content />,
        icon: <FaShip />,
        onDismount() {
            serverApi.routerHook.removeRoute(routePath);

            menuPatch?.unpatch()
            menuRoot.return.alternate.type = menuRoot.return.type;
        },
    };
});


