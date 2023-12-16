import { GamepadButton, GamepadEvent, afterPatch, showContextMenu, showModal } from 'decky-frontend-lib'
import { BrowserTab } from "../components/BrowserTab"
import { BrowserTabCloser } from "../components/BrowserTabCloser"
import { TabManager } from "./TabManager"
import { BrowserContextMenu } from "../components/BrowserContextMenu"
import { searchBarNavFocusable } from '../components/SearchBarInput'
import { FallbackSearchModal } from '../components/FallbackSearchModal'
import { searchBarPatchState } from '../searchBarPatch'

export default class BrowserTabHandler {
    title: string
    id: string
    tab: any
    browser: any
    closeTab: any
    onTitleChange: any
    navNode: any
    targetId: string | undefined
    hasTarget: boolean
    constructor(id: string, browser: any, tabManager: TabManager, targetId?: string) {
        browser.m_browserView.on('set-title', this.onSetTitle)

        this.title = 'data:text/html,<body><%2Fbody>'
        this.id = id
        this.browser = browser
        this.navNode = null
        this.targetId = targetId
        this.hasTarget = !!targetId

        const outerTabActionProps = {
            //X button
            onSecondaryButton: () => {
                browser.m_browserView.SetFocus(false)
                tabManager.closeTab(id)
            },

            //Y button
            onOptionsButton: () => {
                tabManager.createTab()
            },

            // start button
            onMenuButton: () => {
                const shownContextMenu: { instance: any } = { instance: null }
                shownContextMenu.instance = showContextMenu(<BrowserContextMenu menu={shownContextMenu} tabManager={tabManager} />)
            },

            onButtonDown: (evt: GamepadEvent) => {
                switch (evt.detail.button) {
                    case GamepadButton.REAR_LEFT_LOWER:
                        //shift
                        SteamClient.Input.ControllerKeyboardSetKeyState(101, true)
                        //tab
                        SteamClient.Input.ControllerKeyboardSetKeyState(43, true)
                        SteamClient.Input.ControllerKeyboardSetKeyState(43, false)
                        SteamClient.Input.ControllerKeyboardSetKeyState(101, false)
                        break

                    case GamepadButton.REAR_RIGHT_LOWER:
                        //tab
                        SteamClient.Input.ControllerKeyboardSetKeyState(43, true)
                        SteamClient.Input.ControllerKeyboardSetKeyState(43, false)
                        break

                    case GamepadButton.REAR_LEFT_UPPER:
                        //page back
                        if (browser.m_URLRequested !== browser.m_history.entries[1].url) {
                            browser.m_browserView.GoBack()
                        }
                        break

                    case GamepadButton.REAR_RIGHT_UPPER:
                        //page forward
                        browser.m_browserView.GoForward()
                        break

                    case GamepadButton.SELECT:
                        //focus searchbar or show search modal
                        if (searchBarPatchState.isPatched && searchBarNavFocusable && searchBarNavFocusable.BTakeFocus) searchBarNavFocusable.BTakeFocus();
                        else showModal(<FallbackSearchModal tabManager={tabManager}/>)
                        break
                }

            },
            onOKActionDescription: '',
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
    registerOnTitleChange(handler: () => void) {
        this.onTitleChange = handler
    }

    loadUrl(url: string) {
        this.browser.LoadURL(url)
    }

    getNavNode = (browserTabElement: any) => {
        if (!this.navNode) {
            afterPatch(browserTabElement.type, 'render', (_: any, ret: any) => {
                this.navNode = ret.props.value
                return ret
            }, { singleShot: true })
        }
    }

    clearNavNode = () => {
        this.navNode = null
    }

    async takeFocus() {
        this.navNode.BTakeFocus(3)
    }

}