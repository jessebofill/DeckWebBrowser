import myFont from "../assets/FORCED_SQUARE.ttf"
import { pluginName } from "./init";
import { llog } from "./log";

llog('FONT ', myFont)
const tabPadding = 5
const tabHeight = 34
export const tabContainerHeight = tabPadding * 2 + tabHeight
export function appendStyles(_window: any) {
    let style = _window.document.createElement('style');
    // const font_name = new FontFace('MyFont', `url(http://127.0.0.1:1337/plugins/${pluginName}/assets/FORCED_SQUARE.ttf)`);
    // const font_name = new FontFace('MyFont', myFont);
    // _window.document.fonts.add(font_name);
    // font_name.load()

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
        padding: ${tabPadding}px 0px;
    }
    .tabbedBrowserContainer .mainbrowser_ExternalBrowserContainer_3FyI1 {
        top: ${tabContainerHeight}px;
        background: linear-gradient(to bottom, #363941 .5%, #464d58 40%);
        flex: 1;
        display: flex;
        flex-direction: column;
        max-width: 100%
    }
    `
    // .tabbedBrowserContainer .gamepadtabbedpage_TabContentsScroll_1X4dt {
    //     position: absolute;
    //     top: 0;
    //     right: 0;
    //     bottom: 0;
    //     left: 0;
    //     padding-top: 0px;
    //     padding-left: 0vw;
    //     padding-right: 0vw;
    //     scroll-padding-top: 116px;
    //     scroll-padding-bottom: 56px;
    // }
    // .tabbedBrowserContainer .mainbrowser_BrowserContainer_3-G5o {
    //     position: absolute;
    //     top: 0;
    //     right: 0;
    //     bottom: 0;
    //     left: 0;
    // }
    // .tabbedBrowserContainer .mainbrowser_MainBrowser_12QSs {

    // }
    // background: #3D4450;

    // Append the style element to the head section of the document
    _window.document.head.appendChild(style);
}