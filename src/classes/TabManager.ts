import { log } from "../log"
import { defaultUrl, windowRouter } from "../init"
import BrowserTabHandler from "./BroswerTabHandler"
import isURL from "validator/lib/isURL"
import { v4 as uuidv4 } from "uuid"
import { settingsManager } from "./SettingsManager"

export enum SearchEngine {
    GOOGLE,
    BING,
    YAHOO
}

export class TabManager {
    tabHandlers: BrowserTabHandler[]
    fallbackUrl: string
    windowRouter: any
    headerStore: any
    activeTab: string
    onNewTab?: () => void
    onTabClose?: () => void
    defaultSearchEngine: SearchEngine
    static instance: TabManager
    constructor(defaultUrl: string, windowRouter: any) {
        if (!TabManager.instance) {
            TabManager.instance = this
        }
        this.fallbackUrl = defaultUrl
        this.tabHandlers = []
        this.windowRouter = windowRouter
        this.headerStore = windowRouter.HeaderStore
        this.activeTab = ""
        this.defaultSearchEngine = SearchEngine.GOOGLE
        return TabManager.instance
    }
    createTab = (Url?: string) => {
        const id = uuidv4()
        const url = Url || settingsManager.settings.homeUrl || this.fallbackUrl
        const browser = this.windowRouter.CreateBrowserView('ExternalWeb')
        this.tabHandlers.push(new BrowserTabHandler(id, browser, this))
        browser.LoadURL(url)
        this.setActiveTabById(id)
        // llog('new active tab: ', this.activeTab)
        if (this.onNewTab) this.onNewTab()
    }

    closeTab(id: string) {
        const index = this.tabHandlers.findIndex(tabHandler => tabHandler.id === id)
        this.tabHandlers[index].closeBrowser()
        if (this.tabHandlers.length === 1) this.createTab()
        if (id === this.activeTab) {
            this.setActiveTabByIndex(index === 0 ? index + 1 : index - 1)
        }
        this.tabHandlers.splice(index, 1)
        if (this.onTabClose) this.onTabClose()
    }

    setActiveBrowserHeaderByIndex(index: number) {
        // llog('setting backstack: ', this.tabHandlers[index].id, ' activetab: ', this.activeTab)
        this.headerStore.SetCurrentBrowserAndBackstack(this.tabHandlers[index].browser, true)
    }

    setActiveBrowserHeader() {
        const index = this.getActiveTabIndex()
        this.setActiveBrowserHeaderByIndex(index)
    }

    setActiveTabByIndex(index: number) {
        const id = this.tabHandlers[index].id
        this.activeTab = id
        this.setActiveBrowserHeaderByIndex(index)
    }

    setActiveTabById(id: string) {
        this.activeTab = id
        this.setActiveBrowserHeader()
    }

    getTabIndexById(id: string) {
        return this.tabHandlers.findIndex(tabHandler => tabHandler.id === id)
    }

    getActiveTabIndex() {
        return this.tabHandlers.findIndex(tabHandler => tabHandler.id === this.activeTab)
    }

    getActiveTabHandler() {
        return this.tabHandlers[this.getActiveTabIndex()]
    }

    getActiveTabBrowserView() {
        return this.getActiveTabHandler().browser.m_browserView
    }

    getActiveTabUrlRequested(){
        return this.getActiveTabHandler().browser.m_URLRequested
    }

    registerCloseListener(handler: () => void) {
        this.onTabClose = handler
    }
    registerNewTabListener(handler: () => void) {
        this.onNewTab = handler
    }

    browserRequest(input: string) {
        const browserHandler = this.getActiveTabHandler()
        if (input !== browserHandler.browser.m_URLRequested) {
            if (isURL(input, { protocols: ['https', 'http', 'ftp', 'file', 'smb'] }) ||
                isOtherProtocol(input, ['https', 'http', 'ftp', 'file', 'smb']) ||
                isURL(localhostToIp(input))) {
                browserHandler.loadUrl(convertLocalhostIpIfNeeded(input))
            } else {
                browserHandler.loadUrl(getQueriedUrl(input, this.defaultSearchEngine))
            }
        }
    }

    focusActiveBrowser() {
        this.getActiveTabHandler().takeFocus()
    }

    activeTabLoad(url: string) {
        this.getActiveTabHandler().loadUrl(url)
    }
    activeTabLoadHome() {
        this.getActiveTabHandler().loadUrl(settingsManager.settings.homeUrl || this.fallbackUrl)
    }

    saveActiveTabAsHomePage() {
        settingsManager.saveSetting('homeUrl', this.getActiveTabUrlRequested())
    }

    closeAllTabs() {

    }
}

function isOtherProtocol(input: string, protocols: string[]) {
    for (let protocol of protocols) {
        if (input.startsWith(protocol + '://')) return true
    }
    return false
}

function localhostToIp(input: string) {
    if (input.includes('localhost')) return input.replace(/localhost/g, '127.0.0.1');
    return ''
}

function convertLocalhostIpIfNeeded(input: string) {
    let splitIp: string[]
    if (input.includes(':') && (splitIp = input.split(':'))[0] === '127.0.0.1') {
        splitIp[0] = 'localhost:'
        input = splitIp.join('')
    }
    log('conversion: ', input)
    return input
}

function getQueriedUrl(query: string, searchEngine: SearchEngine) {
    let prefix: string
    switch (searchEngine) {
        case SearchEngine.GOOGLE:
            prefix = 'https://www.google.com/search?q='
            break
        case SearchEngine.BING:
            prefix = 'https://www.bing.com/search?q='
            break
        case SearchEngine.YAHOO:
            prefix = 'https://search.yahoo.com/search?p='
    }
    return prefix + query
}

export const tabManager = new TabManager(defaultUrl, windowRouter)
