import { VFC } from 'react';
import myFont from "../assets/FORCED_SQUARE.ttf"
import { warnN } from "./log";
import { status } from './pluginState';

const tabBarPadding = 5
//tabHeight is defined by component and should not be changed
const tabHeight = 34
export const tabBarHeight = tabBarPadding * 2 + tabHeight
export const tabContentRealY = Math.round((tabBarHeight + 40) * 1.5) //40px offset for header
export const tabContentRealHeight = 800 - Math.round((80 + tabBarHeight) * 1.5) //80px for header + footer

export const BrowserStyling: VFC<{}> = () => {
    return <style>{`
    @font-face {
        font-family: MyFont;
        src: url('${myFont}') format('truetype');
    }

    .tabAddonExit * {
        font-family: MyFont !important;
    }

    .tabbedBrowserContainer .gamepadtabbedpage_Floating_3I3IM .gamepadtabbedpage_TabContentsScroll_1X4dt {
        clip: initial
    }

    .tabbedBrowserContainer .gamepadtabbedpage_Right_1-jlW>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_Enter_11zfc,
    .tabbedBrowserContainer .gamepadtabbedpage_Right_1-jlW>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_EnterActive_3lqCS,
    .tabbedBrowserContainer .gamepadtabbedpage_Right_1-jlW>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_Exit_3Rv4M,
    .tabbedBrowserContainer .gamepadtabbedpage_Right_1-jlW>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_ExitActive_1V17j,
    .tabbedBrowserContainer .gamepadtabbedpage_Left_3lSTy>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_Enter_11zfc,
    .tabbedBrowserContainer .gamepadtabbedpage_Left_3lSTy>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_EnterActive_3lqCS,
    .tabbedBrowserContainer .gamepadtabbedpage_Left_3lSTy>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_Exit_3Rv4M,
    .tabbedBrowserContainer .gamepadtabbedpage_Left_3lSTy>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_ExitActive_1V17j {
        transform: initial;
    }
    .tabbedBrowserContainer .gamepadtabbedpage_TabHeaderRowWrapper_2Jobs {
        ${status.noTabBar ? 'display: none;' : ''}
        background: #060709;
    }
    .tabbedBrowserContainer .gamepadtabbedpage_FixCenterAlignScroll_1CJeU {
        padding: ${tabBarPadding}px 0px;
    }
    .tabbedBrowserContainer .gamepadtabbedpage_TabContentsScroll_1X4dt {
        bottom: var(--gamepadui-current-footer-height);
        padding: 0;
    }
    .tabbedBrowserContainer .gamepadtabbedpage_TabContentsScroll_1X4dt > .Panel {
    }
    .tabbedBrowserContainer .mainbrowser_ExternalBrowserContainer_3FyI1 {
        background: linear-gradient(to bottom, #060709 .5%, #1d2027 40%);
        top: ${status.noTabBar ? '0' : tabBarHeight}px;
    }
    .destructiveModal button.gamepaddialog_Button_1kn70.DialogButton.gpfocus.Primary {
        background: #de3618;
        color: #fff
    }
    `}
    </style>
}

export function appendStyles(_window?: Window) {
    if (!_window) warnN('Styling', 'No SP Window')
    else {

        let style = _window.document.createElement('style')

        style.textContent = `
    .destructiveModal button.gamepaddialog_Button_1kn70.DialogButton.gpfocus.Primary {
        background: #de3618;
        color: #fff
    }
    `

        _window.document.head.appendChild(style);
    }
}