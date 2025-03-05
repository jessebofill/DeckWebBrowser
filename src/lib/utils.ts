import { status } from '../pluginState';
import { Navigation, Router, sleep } from 'decky-frontend-lib';
import { tabManager } from '../classes/TabManager';
import { routePath } from '../init';
import { SFXPath } from './GamepadUIAudio';


export const killBrowser = async (onClose?: () => void) => {
    if (window.location.pathname === '/routes' + routePath) {
        Navigation.NavigateBack()
    }
    while (window.location.pathname === '/routes' + routePath) {
        await sleep(100)
    }
    status.running = false
    tabManager.closeAllTabs()
    onClose?.()
}

export function playUISound(path: SFXPath) {
    //@ts-ignore
    if (settingsStore?.m_ClientSettings?.enable_ui_sounds) GamepadUIAudio.AudioPlaybackManager.PlayAudioURL(path);
}

export function addClasses(...strings: any[]) {
    return strings.filter(string => string).join(' ');
}
export const openUrl = (url: string, inNewtab?: boolean) => {
    if (!status.running) {
        status.running = true;
        tabManager.createTab(url);
        Router.CloseSideMenus();
        Router.Navigate(routePath);
    } else {
        if (inNewtab) {
            tabManager.createTab(url);
        } else {
            tabManager.activeTabLoad(url);
        }
        Router.CloseSideMenus();
        if (window.location.pathname !== '/routes' + routePath) {
            Router.Navigate(routePath);
        }
    }
};

