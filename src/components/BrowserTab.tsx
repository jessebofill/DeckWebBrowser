import { Focusable, GamepadEvent, FooterLegendProps, GamepadButton, sleep, GamepadEventDetail } from "decky-frontend-lib";
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
    const containerClass = 'focus-container';
    const { browser, tabId, tabManager, getNavNode, clearNavNode, focusableActionProps } = props
    const browserMountAnimation = useContext(BrowserMountAnimationContext)
    if (!browserMountAnimation.done) return <></>;

    useEffect(() => {
        return () => clearNavNode()
    }, [])

    const element = (
        <Focusable
            className={containerClass}
            noFocusRing={true}
            onGamepadFocus={async (evt: CustomEvent<GamepadEventDetail & { focusedNode?: NavNode }>) => {
                // @ts-ignore
                if (evt.target?.classList?.contains?.(containerClass)) { //only fire from top level element focused
                    await sleep(1); //defer is necessary so that focus tracks correctly
                    evt.detail.focusedNode?.BChildTakeFocus()
                }
            }}

            //A button
            onOKButton={(evt: GamepadEvent) => {
                if (browser.m_gamepadBridge.GetGameInputSupportLevel().Value !== BrowserInputSupport.Full) {
                    SteamClient.Input.ControllerKeyboardSetKeyState(88, true)
                    SteamClient.Input.ControllerKeyboardSetKeyState(88, false)
                }
            }}

            onGamepadDirection={(evt: GamepadEvent) => {
                if (browser.m_gamepadBridge.GetGameInputSupportLevel().Value !== BrowserInputSupport.Full) {
                    switch (evt.detail.button) {
                        case GamepadButton.DIR_UP:
                            //page up
                            SteamClient.Input.ControllerKeyboardSetKeyState(75, true)
                            SteamClient.Input.ControllerKeyboardSetKeyState(75, false)
                            break
                        case GamepadButton.DIR_DOWN:
                            //page down
                            SteamClient.Input.ControllerKeyboardSetKeyState(78, true)
                            SteamClient.Input.ControllerKeyboardSetKeyState(78, false)
                            break
                        case GamepadButton.DIR_LEFT:
                            //arrow left
                            SteamClient.Input.ControllerKeyboardSetKeyState(80, true)
                            SteamClient.Input.ControllerKeyboardSetKeyState(80, false)
                            break
                        case GamepadButton.DIR_RIGHT:
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