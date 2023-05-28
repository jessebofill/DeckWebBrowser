import { PanelSection, PanelSectionRow, Router, Field, GamepadEvent, GamepadButton, showModal, SteamSpinner, ButtonItem, Navigation, sleep, DropdownItem } from "decky-frontend-lib";
import { VFC, useMemo, useState } from "react";
import { defaultUrl, routePath, status } from "../init";
import { SearchEngine, settingsManager } from "../classes/SettingsManager";
import { ReorderableEntry, ReorderableList } from "./ReorderableListModified";
import { ConfirmDeleteDefaultTabModal } from "./ConfrimationModals";
import { tabManager } from "../classes/TabManager";
import { log } from "../log";

const openUrl = (url: string, inNewtab?: boolean) => {
    if (!status.running) {
        status.running = true
        log('first run menu')
        tabManager.createTab(url)
        Router.CloseSideMenus()
        Router.Navigate(routePath)
    } else {
        if (inNewtab) {
            tabManager.createTab(url)
        } else {
            tabManager.activeTabLoad(url)
        }
        Router.CloseSideMenus()
        if (window.location.pathname !== '/routes' + routePath) {
            Router.Navigate(routePath)
        }
    }
}
export const QAMContent: VFC = ({ }) => {
    const [isRunning, setIsRunning] = useState(status.running)
    const defaultTabItems = useMemo(() => {
        const items: ReorderableEntry<{ tab: string }>[] = []
        for (let i = 0; i < settingsManager.settings.defaultTabs.length; i++) {
            const tab = settingsManager.settings.defaultTabs[i]
            const label = tab === 'home' ? 'Home Page' : tab
            items.push(
                {
                    description: (
                        <div style={{ wordBreak: 'break-all', marginTop: '-8px' }}>
                            {label}
                        </div>),
                    data: {
                        tab: tab
                    },
                    position: i
                }
            )
        }
        return items
    }, [settingsManager.settings.defaultTabs.length])

    return (
        <>
            {!settingsManager.settingsLoaded ?
                (<PanelSection title='Loading Settings'>
                    <SteamSpinner />
                </PanelSection>) :
                <>
                    <PanelSection title='Home Page' >
                        <PanelSectionRow >
                            <Field focusable={true}
                                description={
                                    <div style={{ wordBreak: 'break-all', marginTop: '-8px' }}>
                                        {settingsManager.settings.homeUrl || defaultUrl}
                                    </div>
                                }
                                onOptionsActionDescription={status.running ? 'Open in New Tab' : ''}
                                onOKActionDescription={status.running ? 'Open in Current Tab' : 'Open'}
                                onOKButton={() => openUrl(settingsManager.settings.homeUrl || defaultUrl)}
                                onOptionsButton={() => { openUrl(settingsManager.settings.homeUrl || defaultUrl, true) }}
                            />
                        </PanelSectionRow>
                    </PanelSection>
                    <PanelSection title="Default Tabs">
                        <PanelSectionRow style={{ marginLeft: '-16px', marginRight: '-16px' }}>
                            <ReorderableList<{ tab: string }>
                                entries={defaultTabItems}
                                onSave={(entries) => {
                                    settingsManager.setSetting('defaultTabs', entries.map((entry) => entry.data!.tab))
                                }}
                                onButtonPress={(evt: GamepadEvent, entry: ReorderableEntry<{ tab: string }>) => {
                                    const tab = entry.data!.tab
                                    switch (evt.detail.button) {
                                        case GamepadButton.SECONDARY:
                                            if (tab !== 'home') {
                                                const closeModal = () => { }
                                                showModal(<ConfirmDeleteDefaultTabModal index={entry.position} closeModal={closeModal} />)
                                            }
                                            break
                                        case GamepadButton.OK:
                                            openUrl(tab)
                                            break
                                        case GamepadButton.OPTIONS:
                                            openUrl(tab, true)

                                    }
                                }}
                                reorderButton={GamepadButton.START}
                                saveOrderOnOk={true}
                                fieldProps={{
                                    onSecondaryActionDescription: 'Delete',
                                    onOptionsActionDescription: status.running ? 'Open in New Tab' : '',
                                    onOKActionDescription: status.running ? 'Open in Current Tab' : 'Open'
                                }}
                            />
                        </PanelSectionRow>
                    </PanelSection>
                    <PanelSection title='Search Engine' >
                        <PanelSectionRow>
                            <DropdownItem
                                layout='below'
                                rgOptions={[
                                    { label: 'Google', data: SearchEngine.GOOGLE },
                                    { label: 'Bing', data: SearchEngine.BING },
                                    { label: 'Yahoo', data: SearchEngine.YAHOO }
                                ]}
                                selectedOption={settingsManager.settings.searchEngine}
                                onChange={(option) => {
                                    settingsManager.setSetting('searchEngine', option.data)
                                }}
                            />
                        </PanelSectionRow>
                    </PanelSection>
                </>
            }
            <PanelSection title='other'>
                <PanelSectionRow>
                    <ButtonItem layout='below' onClick={() => openUrl('localhost:8080', true)}>
                        Open Inspector
                    </ButtonItem>
                </PanelSectionRow>
                <PanelSectionRow>
                    <ButtonItem
                        disabled={!isRunning}
                        layout='below'
                        onClick={async () => {
                            setIsRunning(false)
                            if (window.location.pathname === '/routes' + routePath) {
                                Navigation.NavigateBack()
                            }
                            while (window.location.pathname === '/routes' + routePath) {
                                await sleep(100)
                            }
                            status.running = false
                            tabManager.closeAllTabs()
                        }}
                    >
                        Kill Browser
                    </ButtonItem>
                </PanelSectionRow>
            </PanelSection>
        </>
    );
};