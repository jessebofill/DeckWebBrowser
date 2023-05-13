import { Router} from "decky-frontend-lib";
// import { name } from '../plugin.json'

export const pluginName = 'Web Browser'
export const routePath = '/webbrowser'
export const defaultUrl = 'https://youtube.com'

export const windowRouter = Router.WindowStore?.GamepadUIMainWindowInstance
export const SP_Window = windowRouter?.BrowserWindow
export const reactTree = (document.getElementById('root') as any)._reactRootContainer._internalRoot.current;

// const header = findInReactTree(tree, node => node?.type?.toString().includes('GetFlexGrowPriority()'))
// export const searchInputNode = findInReactTree(reactTree, node => node?.type?.toString().includes('GamepadUI.Search.Root()'))

