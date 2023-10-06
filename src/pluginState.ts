import { Navigation, sleep } from 'decky-frontend-lib'
import { tabManager } from './classes/TabManager'
import { routePath } from './init'

export const status = {
    running: false
}

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
