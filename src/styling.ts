import myFont from "../assets/FORCED_SQUARE.ttf"
import { warnN } from "./log";

const tabBarPadding = 5
//tabHeight is defined by component and should not be changed
const tabHeight = 34
export const tabBarHeight = tabBarPadding * 2 + tabHeight
export const tabContentRealY = Math.round((tabBarHeight + 40) * 1.5) //40px offset for header
export const tabContentRealHeight = 800 - Math.round((80 + tabBarHeight) * 1.5) //80px for header + footer

export function appendStyles(_window?: Window) {
    if (!_window) warnN('Styling', 'No SP Window')
    else {

        let style = _window.document.createElement('style')

        style.textContent = `
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

    .tabbedBrowserContainer .gamepadtabbedpage_Right_1-jlW>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_Enter_11zfc {
        transform: initial;
    }

    .tabbedBrowserContainer .gamepadtabbedpage_Right_1-jlW>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_EnterActive_3lqCS {
        transform: initial;
        
    }

    .tabbedBrowserContainer .gamepadtabbedpage_Right_1-jlW>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_Exit_3Rv4M {
        transform: initial;
    }

    .tabbedBrowserContainer .gamepadtabbedpage_Right_1-jlW>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_ExitActive_1V17j {
        transform: initial;
    }

    .tabbedBrowserContainer .gamepadtabbedpage_Left_3lSTy>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_Enter_11zfc {
        transform: initial;
    }

    .tabbedBrowserContainer .gamepadtabbedpage_Left_3lSTy>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_EnterActive_3lqCS {
        transform: initial;
    }

    .tabbedBrowserContainer .gamepadtabbedpage_Left_3lSTy>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_Exit_3Rv4M {
        transform: initial;
    }

    .tabbedBrowserContainer .gamepadtabbedpage_Left_3lSTy>.gamepadtabbedpage_ContentTransition_L_ehQ.gamepadtabbedpage_ExitActive_1V17j {
        transform: initial;
    }

    .tabbedBrowserContainer .gamepadtabbedpage_FixCenterAlignScroll_1CJeU {
        padding: ${tabBarPadding}px 0px;
    }
    .tabbedBrowserContainer .mainbrowser_ExternalBrowserContainer_3FyI1 {
        top: ${tabBarHeight}px;
        background: linear-gradient(to bottom, #363941 .5%, #464d58 40%);
        flex: 1;
        display: flex;
        flex-direction: column;
        max-width: 100%
    }
    .destructiveModal button.gamepaddialog_Button_1kn70.DialogButton.gpfocus.Primary {
        background: #de3618;
        color: #fff
    }
    `

        _window.document.head.appendChild(style);
    }
}