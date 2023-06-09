import { VFC, useEffect, useState } from "react"
import { Navigation, Tabs, showModal, sleep } from "decky-frontend-lib"
import { TabManager } from "../classes/TabManager"
import { tabContentRealHeight, tabContentRealY } from "../styling"
import { routePath, status } from "../init"
import { SteamSpinner } from "decky-frontend-lib"
import { settingsManager } from "../classes/SettingsManager"
import { UsageWarningModal } from "./UsageWarningModal"

interface TabbedBrowserProps {
    tabManager: TabManager
}

export const TabbedBrowser: VFC<TabbedBrowserProps> = ({ tabManager }) => {
    const [update, setUpdate] = useState(false)
    const [activeTab, setActiveTab] = useState<string | null>(tabManager.tabHandlers.length > 0 ? tabManager.activeTab : null);

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
                tabManager.getActiveTabBrowserView().SetBounds(0, tabContentRealY, 1280, tabContentRealHeight + 1)
            }, 300)

        })()

        return () => {
            if (tabManager.browserViewName === tabManager.headerStore.GetCurrentBrowserAndBackstack().browser.name) {
                tabManager.headerStore.SetCurrentBrowserAndBackstack(null, false)
            }
        }
    }, [])

    return (!activeTab ? <SteamSpinner /> :
        <div style={{ marginTop: '40px', height: 'calc( 100% - 40px)', background: '#3D4450' }} className="tabbedBrowserContainer">
            <Tabs
                title="Web Browser"
                activeTab={activeTab}
                onShowTab={activateTab}
                tabs={tabManager.tabHandlers.map(tabHandler => tabHandler.tab)}
                autoFocusContents={true}
            />
        </div >
    )
}
