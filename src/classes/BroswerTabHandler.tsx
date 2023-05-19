import { llog } from "../log"
import { GamepadButton, GamepadEvent, Menu, afterPatch, showContextMenu, showModal } from 'decky-frontend-lib'
import { BrowserTab } from "../components/BrowserTab"
import { BrowserTabCloser } from "../components/BrowserTabCloser"
import { TabManager } from "./TabManager"
import { BrowserContextMenu } from "../components/BrowserContextMenu"

export default class BrowserTabHandler {
    title: string
    id: string
    tab: any
    browser: any
    closeTab: any
    onTitleChange: any
    navNode: any
    constructor(id: string, browser: any, tabManager: TabManager) {
        browser.m_browserView.on('set-title', this.onSetTitle)

        this.title = 'data:text/html,<body><%2Fbody>'
        this.id = id
        this.browser = browser
        this.navNode = null

        const outerTabActionProps = {
            //X button
            onSecondaryButton: (evt: GamepadEvent) => {
                browser.m_browserView.SetFocus(false)
                tabManager.closeTab(id)
                // llog('button secondary: ', evt)
            },

            //Y button
            onOptionsButton: (evt: GamepadEvent) => {
                tabManager.createTab()
                // llog('button options: ', evt)
            },

            //start button
            onMenuButton: (evt: GamepadEvent) => {
                const shownContextMenu: { result: any } = { result: null }
                shownContextMenu.result = showContextMenu(<BrowserContextMenu menu={shownContextMenu} tabManager={tabManager}/>)
            },

            onButtonDown: (evt: GamepadEvent) => {
                switch (evt.detail.button) {
                    case GamepadButton.REAR_LEFT_UPPER:
                        //shift
                        SteamClient.Input.ControllerKeyboardSetKeyState(101, true)
                        //tab
                        SteamClient.Input.ControllerKeyboardSetKeyState(43, true)
                        SteamClient.Input.ControllerKeyboardSetKeyState(43, false)
                        SteamClient.Input.ControllerKeyboardSetKeyState(101, false)
                        break

                    case GamepadButton.REAR_RIGHT_UPPER:
                        //tab
                        SteamClient.Input.ControllerKeyboardSetKeyState(43, true)
                        SteamClient.Input.ControllerKeyboardSetKeyState(43, false)
                        break

                    case GamepadButton.REAR_LEFT_LOWER:
                        //page back
                        if (browser.m_URLRequested !== browser.m_history.entries[1].url) {
                            browser.m_browserView.GoBack()
                        }
                        break

                    case GamepadButton.REAR_RIGHT_LOWER:
                        //page forward
                        browser.m_browserView.GoForward()
                        break
                }
            },
            // onOKActionDescription='Enter'
            actionDescriptionMap: {
                [GamepadButton.REAR_LEFT_UPPER]: 'Tab',
                [GamepadButton.REAR_RIGHT_UPPER]: 'Shift Tab',
                [GamepadButton.REAR_LEFT_LOWER]: 'Pg Back',
                [GamepadButton.REAR_RIGHT_LOWER]: 'Pg Forward',
                [GamepadButton.SELECT]: 'Search',
            },
            onCancelActionDescription: 'Back',
            onSecondaryActionDescription: 'Close Tab',
            onOptionsActionDescription: 'New Tab',
            onMenuActionDescription: 'Options'
        }

        this.tab = {
            id: id,
            title: '',
            content: <BrowserTab
                browser={this.browser}
                tabId={id}
                tabManager={tabManager}
                getNavNode={this.getNavNode}
                clearNavNode={this.clearNavNode}
                focusableActionProps={outerTabActionProps}
            />,
            renderTabAddon: () => <BrowserTabCloser close={() => tabManager.closeTab(id)} />,
            footer: outerTabActionProps
        }
    }

    closeBrowser() {
        setTimeout(() => this.browser.Destroy(), 200)
        llog('Closing tab id: ' + this.id)
    }

    //make sure this is an arrow function so 'this' keeps its reference as this class instance
    onSetTitle = (title: string) => {
        if (title !== this.title) {
            this.title = title
            if (title.length > 30) title = title.slice(0, 30)
            this.tab.title = title
            if (this.onTitleChange) this.onTitleChange()
        }
    }
    registerTitleChangeListener(handler: () => void) {
        this.onTitleChange = handler
    }

    loadUrl(url: string) {
        this.browser.LoadURL(url)
    }

    getNavNode = (browserTabElement: any) => {
        if (!this.navNode) {
            llog('trying tp get navref ', browserTabElement)
            afterPatch(browserTabElement.type, 'render', (_: any, ret: any) => {
                llog('my focusbale ', ret)
                this.navNode = ret.props.value
                return ret
            }, { singleShot: true })
            // const patch = afterPatch(browserTabElement, 'type', (_: any, ret: any) => {
            //     llog('component T rendered', ret, _)
            //     afterPatch(ret.props.children[2], 'type', (_: any, ret: any) => {
            //         llog('Component B rendered ', this.id, ret, _)
            //         const navHandle = ret.props.children.props.navRef.current
            //         if (!this.navNode) {
            //             llog('getting new nav handle: ', this.id)
            //             this.navNode = ret.props.children.props.navRef.current
            //         } else {
            //             llog('already have handle: ', this.id)
            //             if (this.navNode !== navHandle) {
            //                 if (navHandle === undefined) llog('nav handle is undefined')
            //                 else {
            //                     this.navNode = ret.props.children.props.navRef.current
            //                     llog('nav handle has changed for: ', this.id)
            //                 }
            //             }
            //         }

            //         // llog(this.navNode)
            //         // setTimeout(patch.unpatch , 50)
            //         return ret
            //     })
            //     return ret
            // }, { singleShot: false })
        }
    }

    clearNavNode = () => {
        llog('clearing nav node ', this.id)
        this.navNode = null
    }

    takeFocus() {
        llog('trying to focus: ', this.id, ' with nav handle ', this.navNode)
        setTimeout(() => this.navNode.m_rgChildren[0].BTakeFocus(3), 500)
        // this.navNode.Tree.DeferredFocus.RequestFocus(this.navNode, { bFocusDescendant: true })
        // this.navNode.Tree.DeferredFocus.RequestFocus(this.navNode.m_rgChildren[0].m_rgChildren[0])
    }
}

