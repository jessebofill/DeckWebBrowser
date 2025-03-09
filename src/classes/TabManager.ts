import { Logger } from "../lib/log"
import { defaultUrl, windowRouter } from "../init"
import BrowserTabHandler, { MicAccess, MicAccessChangeEvent, OnCancelType } from "./BrowserTabHandler"
import isURL from "validator/lib/isURL"
import { v4 as uuidv4 } from "uuid"
import { SearchEngine, settingsManager } from "./SettingsManager"
import { backendService } from "./BackendService"
import { WSManager } from './WSManager'
import { killBrowser } from '../lib/utils'

const tmLogger = new Logger('Tab Manager');
export class TabManager {
    tabHandlers: BrowserTabHandler[]
    fallbackUrl: string
    browserViewName: string
    windowRouter: any
    headerStore: any
    activeTab: string
    onNewTab?: () => void
    onCloseTab?: () => void
    defaultSearchEngine: SearchEngine
    loadTabPromise: Promise<void> | undefined
    eventTarget = new EventTarget()
    wsm?: WSManager
    constructor(defaultUrl: string, windowRouter: any) {
        this.fallbackUrl = defaultUrl
        this.browserViewName = 'TabbedWebBrowser'
        this.tabHandlers = []
        this.windowRouter = windowRouter
        this.headerStore = windowRouter?.HeaderStore
        this.activeTab = ""
        this.defaultSearchEngine = SearchEngine.GOOGLE
    }

    createTab = async (Url?: string, onCancelType = OnCancelType.NONE) => {
        const id = uuidv4()
        const url = (Url && Url !== 'home') ? Url : (settingsManager.settings.homeUrl || this.fallbackUrl)
        const browser = this.windowRouter?.CreateBrowserView(this.browserViewName)
        browser.LoadURL(`data:text/plain,${id}`)
        const tabHandler = new BrowserTabHandler(id, browser, this, onCancelType)
        this.tabHandlers.push(tabHandler)
        this.setActiveTabById(id)
        const response = await waitForUniqueUriLoad(browser, id).then(() => {
            return backendService.serverApi!.callPluginMethod('setup_target', { frontend_id: id })
        }).then((res) => {
            if (!res.success) tmLogger.warn('Backend method "assign_target" returned this message> ')
            else {
                tabHandler.targetId = res.result as string
                tabHandler.hasTarget = true
            }
            return res
        }).catch(({ msg }) => {
            tmLogger.warn(msg)
            return { success: false, result: undefined }
        })
        browser.LoadURL(url)
        if (this.onNewTab) this.onNewTab()
    }

    closeTab(id: string, killIfLastTab = false) {
        if (killIfLastTab && this.tabHandlers.length === 1) {
            killBrowser()
            return
        }
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
            tmLogger.warn('Settings have not loaded when trying to create default tabs. Using fallback url to create tab instead.')
            this.createTab()
        } else {
            for (let i = 0; i < settingsManager.settings.defaultTabs.length; i++) {
                const tab = settingsManager.settings.defaultTabs[i]
                const tabPromise = this.createTab(tab)
                if (i === settingsManager.settings.defaultTabs.length - 1) {
                    this.loadTabPromise = tabPromise
                }
            }
        }
    }

    setActiveBrowserHeaderByIndex(index: number) {
        this.headerStore?.SetCurrentBrowserAndBackstack(this.tabHandlers[index].browser, true)
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

    getTabIdByTargetId(targetId: string) {
        return this.tabHandlers.find(tabHandler => tabHandler.targetId === targetId)?.id
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
                browserHandler.loadUrl(getQueriedUrl(input, settingsManager.settings.searchEngine || this.defaultSearchEngine))
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

    openCefInspectorTab(targetId?: string) {
        const url = targetId ? 'localhost:8080/devtools/inspector.html?ws=localhost:8080/devtools/page/' + targetId : 'localhost:8080'
        this.createTab(url)
    }

    inspectActiveTab() {
        const targetId = this.getActiveTabHandler().targetId
        targetId && this.openCefInspectorTab(targetId)
    }
    setWSManager(wsm: WSManager) {
        this.wsm = wsm;
        wsm.onMicAccessChange = (id: string, state: MicAccess) => {
            const event: MicAccessChangeEvent = new CustomEvent('micAccesChange', { detail: { id, state } });
            this.eventTarget.dispatchEvent(event);
        }
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
            break
        case SearchEngine.CUSTOM:
            prefix = settingsManager.settings.customSearchUrl ?? 'https://www.google.com/search?q='
    }
    return prefix + query
}

function waitForUniqueUriLoad(browser: any, id: string) {
    let onFinish: any
    browser.m_browserView.on('finished-request', (title: string) => {
        if (title === `data:text/plain,${id}`) {
            onFinish?.()
        }
    })
    return Promise.race([new Promise((resolve) => {
        onFinish = resolve
    }),
    new Promise((resolve, reject) => {
        setTimeout(() => {
            reject({ msg: 'Could not load unique URI within time limit' })
        }, 1500)
    })])
}

export const tabManager = new TabManager(defaultUrl, windowRouter)
