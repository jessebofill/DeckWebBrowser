import { Focusable, GamepadEvent, FooterLegendProps } from "decky-frontend-lib";
import { llog } from "../log";
import { VFC, useEffect } from "react";
import { BrowserContainer } from "../native-components/BrowserContainer";
import { TabManager } from "../classes/TabManager";
import { dispatchClick } from "../mouse";

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

    useEffect(() => {
        return () => clearNavNode()
    }, [])

    llog('tab rerendered')

    const element = (
        <Focusable
            focusClassName='tabContentContainer'
            noFocusRing={true}
            onGamepadFocus={(evt: GamepadEvent) => {
                // @ts-ignore
                if (evt.target?.classList[0] !== 'mainbrowser_BrowserContainer_3-G5o') {
                    setTimeout(() => {
                        // SteamClient.Input.ControllerKeyboardSetKeyState(43, true)
                        // SteamClient.Input.ControllerKeyboardSetKeyState(43, false)
                        // @ts-ignore
                        evt.detail.focusedNode.m_rgChildren[0].BTakeFocus(3)
                    }, 200)
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

                llog('direction pressed:  gamepad supported')
                if (browser.m_gamepadBridge.GetGameInputSupportLevel().Value < 3) {
                    llog('direction pressed without gamepad support')
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
            // onOKActionDescription='Enter'
            {...focusableActionProps}
        >
            <BrowserContainer
                browser={browser}
                className={"mainbrowser_ExternalBrowserContainer_3FyI1" + (tabManager.activeTab === tabId ? ' activeBrowserTab_BrowserContainer' : '')}
                visible={tabManager.activeTab === tabId}
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