import { llog } from "../log"
import { VFC, useEffect, useState } from "react"
import { Tabs } from "../native-components/Tabs"
import { patchSearchRootMemo } from "./SearchBarInput"
import { TabManager } from "../classes/TabManager"
import { tabContainerHeight } from "../styling"

const contentY = Math.round((tabContainerHeight + 40) * 1.5)
const contentHeight = 800 - Math.round((80 + tabContainerHeight) * 1.5)
llog('height: ', contentHeight, ' y: ', contentY)

interface TabbedBrowserProps {
    tabManager: TabManager
}



export const TabbedBrowser: VFC<TabbedBrowserProps> = ({ tabManager }) => {
    const [update, setUpdate] = useState(false)
    const [activeTab, setActiveTab] = useState<string>(tabManager.tabHandlers.length > 0 ? tabManager.activeTab : '');
    // const [tabs, setTabs] = useState(null)

    const activateTab = (id: string) => {
        tabManager.setActiveTabById(id)
        setActiveTab(id)
    }
    const onTitleChange = () => {
        // llog('main set title')
        setUpdate(title => !title)
    }

    const onTabClose = () => {
        setActiveTab(tabManager.activeTab)
    }

    const onNewTab = () => {
        // llog('main set newtab')
        tabManager.tabHandlers[tabManager.tabHandlers.length - 1].registerTitleChangeListener(onTitleChange)
        setActiveTab(tabManager.activeTab)
        // setUpdate(title => !title)
    }

    if (tabManager.tabHandlers.length === 0) {
        tabManager.createTab()
        tabManager.createTab('https://bing.com')
        tabManager.createTab('https://store.steampowered.com')
        // llog('creating tab ', tabManager, ' with active tab: ', tabManager.activeTab)
    }

    useEffect(() => {
        llog('mounted')
        tabManager.setActiveBrowserHeader()
        setActiveTab(tabManager.activeTab)
        // llog('running effect, using active tab: ', tabManager.activeTab)
        tabManager.registerNewTabListener(onNewTab)
        tabManager.registerCloseListener(onTabClose)
        //TODO dont want to register a new listener on every mount
        tabManager.tabHandlers.forEach(tabHandler => tabHandler.registerTitleChangeListener(onTitleChange))
        // const activeTabIndex = tabManager.getActiveTabIndex()
        // llog('tabManager.activeTab: ', tabManager.activeTab, 'activeTabIndex', activeTabIndex)
        setTimeout(() => {
            tabManager.getActiveTabHandler().browser.m_browserView.SetBounds(0, contentY + 1, 1280, contentHeight)
            patchSearchRootMemo({ tabManager: tabManager })
        }, 200)

        return () => {
            tabManager.headerStore.SetCurrentBrowserAndBackstack(null, false)
            llog('unmounted')
        }
    }, [])

    // llog('rendering main, handlers: ')//, handlers)
    return (
        <div style={{ marginTop: '40px', height: 'calc( 100% - 40px)', background: '#3D4450' }} className="tabbedBrowserContainer"        >
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
