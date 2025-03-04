import { VFC } from 'react';
import myFont from "../assets/FORCED_SQUARE.ttf"
import { warnN } from "../lib/log";
import { status } from '../pluginState';
import { browserClasses, classes, spinnerClasses } from '../lib/staticClasses';
import { gamepadDialogClasses, gamepadTabbedPageClasses } from 'decky-frontend-lib';

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

    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.Floating} .${gamepadTabbedPageClasses.TabContentsScroll} {
        clip: initial
    }
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.Right}>.${gamepadTabbedPageClasses.ContentTransition}.${gamepadTabbedPageClasses.Enter},
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.Right}>.${gamepadTabbedPageClasses.ContentTransition}.${gamepadTabbedPageClasses.EnterActive},
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.Right}>.${gamepadTabbedPageClasses.ContentTransition}.${gamepadTabbedPageClasses.Exit},
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.Right}>.${gamepadTabbedPageClasses.ContentTransition}.${gamepadTabbedPageClasses.ExitActive},
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.Left}>.${gamepadTabbedPageClasses.ContentTransition}.${gamepadTabbedPageClasses.Enter},
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.Left}>.${gamepadTabbedPageClasses.ContentTransition}.${gamepadTabbedPageClasses.EnterActive},
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.Left}>.${gamepadTabbedPageClasses.ContentTransition}.${gamepadTabbedPageClasses.Exit},
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.Left}>.${gamepadTabbedPageClasses.ContentTransition}.${gamepadTabbedPageClasses.ExitActive} {
        transform: initial;
    }
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.TabHeaderRowWrapper} {
        ${status.noTabBar ? 'display: none;' : ''}
        background: #060709;
    }
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.FixCenterAlignScroll} {
        padding: ${tabBarPadding}px 0px;
    }
    .${classes.tabbedBrowserContainer} .${gamepadTabbedPageClasses.TabContentsScroll} {
        bottom: var(--gamepadui-current-footer-height);
        padding: 0;
    }
    .${classes.tabbedBrowserContainer} .${browserClasses.ExternalBrowserContainer} {
        background: linear-gradient(to bottom, #060709 .5%, #1d2027 40%);
        top: ${status.noTabBar ? '0' : tabBarHeight}px;
    }
    .${classes.tabbedBrowserContainer} .${spinnerClasses.ContainerBackground} {
        background: transparent;
    }
    .${classes.tabbedBrowserContainer} .${spinnerClasses.LoadingStatus} {
        display: none;
    }
    .${classes.destructiveModal} button.${gamepadDialogClasses.Button}.DialogButton.gpfocus.Primary {
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
    .${classes.destructiveModal} button.${gamepadDialogClasses.Button}.DialogButton.gpfocus.Primary {
        background: #de3618;
        color: #fff
    }
    `

        _window.document.head.appendChild(style);
    }
}