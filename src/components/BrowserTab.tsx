import { Focusable, GamepadEvent, FooterLegendProps } from "decky-frontend-lib";
import { VFC, useContext, useEffect } from "react";
import { BrowserContainer } from "./native-components/BrowserContainer";
import { TabManager } from "../classes/TabManager";
import { BrowserMountAnimationContext } from "./TabbedBrowser";
import { browserClasses } from '../lib/staticClasses';

interface BrowserTabProps {
    browser: any
    tabId: string
    tabManager: TabManager
    getNavNode: Function
    clearNavNode: Function
    focusableActionProps: FooterLegendProps
}

export const BrowserTab: VFC<BrowserTabProps> = (props: BrowserTabProps) => {
    const { browser, tabId, tabManager, getNavNode, clearNavNode, focusableActionProps } = props
    const browserMountAnimation = useContext(BrowserMountAnimationContext)

    useEffect(() => {
        return () => clearNavNode()
    }, [])

    const element = (
        <Focusable
            noFocusRing={true}
            onGamepadFocus={(evt: GamepadEvent) => {
                // @ts-ignore
                if (evt.target?.classList[0] !== browserClasses.BrowserContainer) { //prevents from triggering twice
                    setTimeout(() => {
                        // @ts-ignore
                        evt.detail.focusedNode?.m_rgChildren[0]?.BTakeFocus(3)
                    }, browserMountAnimation.done ? 200 : 1100)
                }
            }}

            //A button
            onOKButton={(evt: GamepadEvent) => {
                if (browser.m_gamepadBridge.GetGameInputSupportLevel().Value < 3) {
                    SteamClient.Input.ControllerKeyboardSetKeyState(88, true)
                    SteamClient.Input.ControllerKeyboardSetKeyState(88, false)
                }
            }}

            onGamepadDirection={(evt: GamepadEvent) => {
                if (browser.m_gamepadBridge.GetGameInputSupportLevel().Value < 3) {
                    switch (evt.detail.button) {
                        case 9:
                            //arrow up
                            SteamClient.Input.ControllerKeyboardSetKeyState(75, true)
                            SteamClient.Input.ControllerKeyboardSetKeyState(75, false)
                            break
                        case 10:
                            //arrow down
                            SteamClient.Input.ControllerKeyboardSetKeyState(78, true)
                            SteamClient.Input.ControllerKeyboardSetKeyState(78, false)
                            break
                        case 11:
                            //arrow left
                            SteamClient.Input.ControllerKeyboardSetKeyState(80, true)
                            SteamClient.Input.ControllerKeyboardSetKeyState(80, false)
                            break
                        case 12:
                            //arrow right
                            SteamClient.Input.ControllerKeyboardSetKeyState(79, true)
                            SteamClient.Input.ControllerKeyboardSetKeyState(79, false)
                    }
                }
            }}
            {...focusableActionProps}
        >
            <BrowserContainer
                browser={browser}
                className={browserClasses.ExternalBrowserContainer}
                visible={tabManager.activeTab === tabId && browserMountAnimation.done}
                hideForModals={true}
                external={true}
                displayURLBar={false}
                autoFocus={false}
            />
        </Focusable >
    )
    getNavNode(element)
    return element
}