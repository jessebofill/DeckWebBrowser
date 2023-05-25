import { log } from "../log"
import { VFC, useEffect, useState } from "react"
import { Tabs } from "../native-components/Tabs"
import { patchSearchRootMemo } from "./SearchBarInput"
import { TabManager } from "../classes/TabManager"
import { tabContainerHeight } from "../styling"
import { status } from "../init"
import { SteamSpinner, sleep } from "decky-frontend-lib"

const contentY = Math.round((tabContainerHeight + 40) * 1.5)
const contentHeight = 800 - Math.round((80 + tabContainerHeight) * 1.5)
log('height: ', contentHeight, ' y: ', contentY)

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
        (async () => {
            // log('mounted')
            await tabManager.loadTabPromise
            tabManager.setActiveBrowserHeader()
            setActiveTab(tabManager.activeTab)
            tabManager.registerOnNewTab(onNewTab)
            tabManager.registerOnCloseTab(onCloseTab)
            tabManager.tabHandlers.forEach(tabHandler => tabHandler.registerOnTitleChange(onTitleChange))
            setTimeout(() => {
                tabManager.getActiveTabBrowserView().SetBounds(0, contentY + 1, 1280, contentHeight)
                patchSearchRootMemo({ tabManager: tabManager })
            }, 200)

        })()
        return () => {
            tabManager.headerStore.SetCurrentBrowserAndBackstack(null, false)
            // log('unmounted')
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
