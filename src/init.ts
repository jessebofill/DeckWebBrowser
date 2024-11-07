import { Router, getReactRoot } from "decky-frontend-lib";
// import { name } from '../plugin.json'

export const pluginName = 'Web Browser'
export const routePath = '/webbrowser'
export const defaultUrl = 'https://store.steampowered.com'

export const windowRouter = Router.WindowStore?.GamepadUIMainWindowInstance
export const SP_Window = windowRouter?.BrowserWindow
export const getReactTree = () => getReactRoot(document.getElementById('root') as any)


