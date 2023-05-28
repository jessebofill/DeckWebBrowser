import { log } from "../log"
import { VFC, useEffect, useState } from "react"
import { Tabs } from "../native-components/Tabs"
import { patchSearchRootMemo } from "./SearchBarInput"
import { TabManager } from "../classes/TabManager"
import { tabContentRealHeight, tabContentRealY } from "../styling"
import { status } from "../init"
import { SteamSpinner } from "decky-frontend-lib"
import { mouse } from "../mouse"


log('height: ', tabContentRealHeight, ' y: ', tabContentRealY)

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
        log('first run')
        status.running = true
        tabManager.createDefaultTabs()
    }

    useEffect(() => {
        // const unregisterForAnalogInputMessages = window.SteamClient.Input.RegisterForControllerAnalogInputMessages(mouse.move).unregister;        
        (async () => {
            log('mounted')
            await tabManager.loadTabPromise
            tabManager.setActiveBrowserHeader()
            setActiveTab(tabManager.activeTab)
            tabManager.registerOnNewTab(onNewTab)
            tabManager.registerOnCloseTab(onCloseTab)
            tabManager.tabHandlers.forEach(tabHandler => tabHandler.registerOnTitleChange(onTitleChange))
            setTimeout(() => {
                tabManager.getActiveTabBrowserView().SetBounds(0, tabContentRealY, 1280, tabContentRealHeight + 1)
                patchSearchRootMemo({ tabManager: tabManager })
            }, 300)

        })()
        return () => {
            // unregisterForAnalogInputMessages()
            if (tabManager.browserViewName === tabManager.headerStore.GetCurrentBrowserAndBackstack().browser.name) {
                tabManager.headerStore.SetCurrentBrowserAndBackstack(null, false)
            }
            log('unmounted')
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
