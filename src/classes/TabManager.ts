import { log, warnN } from "../log"
import { defaultUrl, windowRouter } from "../init"
import BrowserTabHandler from "./BroswerTabHandler"
import isURL from "validator/lib/isURL"
import { v4 as uuidv4 } from "uuid"
import { settingsManager } from "./SettingsManager"
import { backendService } from "./BackendService"

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
    onCloseTab?: () => void
    defaultSearchEngine: SearchEngine
    loadTabPromise: Promise<void> | undefined
    constructor(defaultUrl: string, windowRouter: any) {
        this.fallbackUrl = defaultUrl
        this.tabHandlers = []
        this.windowRouter = windowRouter
        this.headerStore = windowRouter.HeaderStore
        this.activeTab = ""
        this.defaultSearchEngine = SearchEngine.GOOGLE
    }
    waitForUniqueUriLoad = (browser: any, id: string) => {
        let onFinish: any
        browser.m_browserView.on('finished-request', (title: string) => {
            if (title === `data:text/plain,${id}`) {
                onFinish()
            }
        })
        return Promise.race([new Promise((resolve) => {
            onFinish = resolve
        }),
        new Promise((resolve, reject) => {
            setTimeout(() => {
                reject({ msg: 'Could not load unique URI within time limit' })
            }, 1000)
        })])
    }

    createTab = async (Url?: string) => {
        const id = uuidv4()
        const url = (Url && Url !== 'home') ? Url : (settingsManager.settings.homeUrl || this.fallbackUrl)
        const browser = this.windowRouter.CreateBrowserView('ExternalWeb')
        browser.LoadURL(`data:text/plain,${id}`)
        const response = await this.waitForUniqueUriLoad(browser, id).then(() => {
            return backendService.serverApi!.callPluginMethod('assign_target', { frontendId: id })
        }).then((res) => {
            if (!res.success) warnN('Tab Manager', 'Backend method "assign_target" returned this message> ')
            return res
        }).catch(({ msg }) => {
            warnN('Tab Manager', msg)
            return { success: false, result: undefined }
        })
        this.tabHandlers.push(new BrowserTabHandler(id, browser, this, response.success ? response.result as string : undefined))
        browser.LoadURL(url)
        this.setActiveTabById(id)
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
        if (this.onCloseTab) this.onCloseTab()
    }

    createDefaultTabs() {
        if (!settingsManager.settingsLoaded) {
            warnN('Tab Manager', 'Settings have not loaded when trying to create default tabs. Using fallback url to create tab instead.')
            this.createTab()
        } else {
            for ( let i = 0; i < settingsManager.settings.defaultTabs.length; i++) {
                const tab = settingsManager.settings.defaultTabs[i]
                const tabPromise = this.createTab(tab)
                if(i === settingsManager.settings.defaultTabs.length - 1){
                    this.loadTabPromise = tabPromise
                }
            }
        }
    }

    setActiveBrowserHeaderByIndex(index: number) {
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

    getActiveTabUrlRequested() {
        return this.getActiveTabHandler().browser.m_URLRequested
    }

    registerOnCloseTab(handler: () => void) {
        this.onCloseTab = handler
    }
    registerOnNewTab(handler: () => void) {
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

    activeTabLoad(Url?: string) {
        const url = (Url && Url !== 'home') ? Url : (settingsManager.settings.homeUrl || this.fallbackUrl)
        this.getActiveTabHandler().loadUrl(url)
    }
    activeTabLoadHome() {
        this.getActiveTabHandler().loadUrl(settingsManager.settings.homeUrl || this.fallbackUrl)
    }

    saveActiveTabAsHomePage() {
        settingsManager.setSetting('homeUrl', this.getActiveTabUrlRequested())
    }

    closeAllTabs() {
        for (let i = 0; i < this.tabHandlers.length; i++) {
            this.tabHandlers[i].closeBrowser()
        }
        this.tabHandlers = []
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
