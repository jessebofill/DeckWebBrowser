import { status } from './pluginState';
import { Navigation, sleep } from 'decky-frontend-lib';
import { tabManager } from './classes/TabManager';
import { routePath } from './init';
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

