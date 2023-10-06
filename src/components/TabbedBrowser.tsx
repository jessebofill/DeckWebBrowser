import { VFC, createContext, useEffect, useState } from "react"
import { Navigation, Tabs, showModal, sleep } from "decky-frontend-lib"
import { TabManager } from "../classes/TabManager"
import { routePath } from "../init"
import { status } from '../pluginState'
import { SteamSpinner } from "decky-frontend-lib"
import { settingsManager } from "../classes/SettingsManager"
import { UsageWarningModal } from "./UsageWarningModal"

interface TabbedBrowserProps {
    tabManager: TabManager
}

export const BrowserMountAnimationContext = createContext<{ done: boolean }>({done: false})

export const TabbedBrowser: VFC<TabbedBrowserProps> = ({ tabManager }) => {
    const [update, setUpdate] = useState(false)
    const [activeTab, setActiveTab] = useState<string | null>(tabManager.tabHandlers.length > 0 ? tabManager.activeTab : null)
    const [mountAnimationFinished, setMountAnimationFinished] = useState(false)

    const activateTab = (id: string) => {
        tabManager.setActiveTabById(id)
        setActiveTab(id)
    }
    const onTitleChange = () => {
        setUpdate(title => !title)
    }

    const onCloseTab = () => {
        setActiveTab(tabManager.activeTab)
    }

    const onNewTab = () => {
        tabManager.tabHandlers[tabManager.tabHandlers.length - 1].registerOnTitleChange(onTitleChange)
        setActiveTab(tabManager.activeTab)
    }

    if (!status.running) {
        status.running = true
        tabManager.createDefaultTabs()
    }

    useEffect(() => {
        if (!settingsManager.settings.seenWarning) {
            showModal(<UsageWarningModal
                closeModal={() => { }}
                onOk={() => { settingsManager.setSetting('seenWarning', true) }}
                onCancel={async () => {
                    Navigation.NavigateBack()
                    while (window.location.pathname === '/routes' + routePath) {
                        await sleep(100)
                    }
                    status.running = false
                    tabManager.closeAllTabs()
                }}
            />)

        }
        (async () => {
            await tabManager.loadTabPromise
            tabManager.setActiveBrowserHeader()
            setActiveTab(tabManager.activeTab)
            tabManager.registerOnNewTab(onNewTab)
            tabManager.registerOnCloseTab(onCloseTab)
            tabManager.tabHandlers.forEach(tabHandler => tabHandler.registerOnTitleChange(onTitleChange))
            setTimeout(() => {
                setMountAnimationFinished(true)
            }, 800)

        })()

        return () => {
            if (tabManager.browserViewName === tabManager.headerStore.GetCurrentBrowserAndBackstack().browser.name) {
                tabManager.headerStore.SetCurrentBrowserAndBackstack(null, false)
            }
        }
    }, [])

    return (!activeTab ? <SteamSpinner /> :
        <div style={{ marginTop: '40px', height: 'calc( 100% - 40px)', background: '#3D4450' }} className="tabbedBrowserContainer">
            <BrowserMountAnimationContext.Provider value={{ done: mountAnimationFinished }}>
                <Tabs
                    title="Web Browser"
                    activeTab={activeTab}
                    onShowTab={activateTab}
                    tabs={tabManager.tabHandlers.map(tabHandler => tabHandler.tab)}
                    autoFocusContents={true}
                />
            </BrowserMountAnimationContext.Provider>
        </div >
    )
}
