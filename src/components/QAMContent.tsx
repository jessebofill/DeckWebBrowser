import { PanelSection, PanelSectionRow, Field, GamepadEvent, GamepadButton, showModal, ButtonItem, DropdownItem, ToggleField } from "decky-frontend-lib";
import { VFC, useMemo, useState } from "react";
import { defaultUrl } from "../init";
import { SearchEngine, settingsManager } from "../classes/SettingsManager";
import { ReorderableEntry, ReorderableList } from "./ReorderableListModified";
import { ConfirmDeleteDefaultTabModal } from "./ConfrimationModals";
import { EnhancedSelector } from './generic/EnhancedSelector';
import { status } from '../pluginState';
import { killBrowser, openUrl } from '../lib/utils';
import { CustomSearchUrlModal } from './CustomSearchUrlModal';
import { SiGithub, SiKofi } from "react-icons/si";
import { SocialButton } from './SocialButton';

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
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img alt="Loading..." src="/images/steam_spinner.png" style={{ width: '50%' }} />
                    </div>
                </PanelSection>) :
                <>
                    <PanelSection title='Home Page' >
                        <PanelSectionRow >
                            <Field
                                focusable={true}
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
                                bottomSeparator={settingsManager.settings.searchEngine === SearchEngine.CUSTOM ? 'none' : 'standard'}
                                layout='below'
                                rgOptions={[
                                    { label: 'Google', data: SearchEngine.GOOGLE },
                                    { label: 'Bing', data: SearchEngine.BING },
                                    { label: 'Yahoo', data: SearchEngine.YAHOO },
                                    { label: 'Custom', data: SearchEngine.CUSTOM }
                                ]}
                                selectedOption={settingsManager.settings.searchEngine ?? SearchEngine.GOOGLE}
                                onChange={(option) => {
                                    settingsManager.setSetting('searchEngine', option.data)
                                }}
                            />
                        </PanelSectionRow>
                        {settingsManager.settings.searchEngine === SearchEngine.CUSTOM && <>
                            <PanelSectionRow>
                                <ButtonItem
                                    description={settingsManager.settings.customSearchUrl}
                                    onClick={() => showModal(<CustomSearchUrlModal value={settingsManager.settings.customSearchUrl ?? ''} onSave={url => settingsManager.setSetting('customSearchUrl', url)} />)}
                                    layout='below'
                                >
                                    Edit Custom Url
                                </ButtonItem>
                            </PanelSectionRow>
                        </>}
                    </PanelSection>
                    <PanelSection title='Tab Bar'>
                        <PanelSectionRow>
                            <ToggleField
                                label={<div style={{ display: 'flex', alignItems: 'baseline' }}>
                                    <div>
                                        Start Hidden
                                    </div>
                                    <div style={{ fontSize: '.7em', lineHeight: '.7em', marginLeft: '1ch' }}>
                                        requires reload
                                    </div>
                                </div>}
                                checked={!!settingsManager.settings.noTabBar}
                                onChange={checked => settingsManager.setSetting('noTabBar', checked)}
                            />
                        </PanelSectionRow>
                    </PanelSection>
                    <PanelSection title='Menu Position' >
                        <PanelSectionRow>
                            <Field label={
                                <div style={{ width: '100%' }}>
                                    <EnhancedSelector
                                        rgOptions={[
                                            { label: '1', data: 1 },
                                            { label: '2', data: 2 },
                                            { label: '3', data: 3 },
                                            { label: '4', data: 4 },
                                            { label: '5', data: 5 },
                                            { label: '6', data: 6 },
                                            { label: '7', data: 7 },
                                            { label: '8', data: 8 },
                                            { label: '9', data: 9 },
                                        ]}
                                        onChange={option => {
                                            settingsManager.setSetting('menuPosition', option.data)
                                        }}
                                        selectedOption={settingsManager.settings.menuPosition}
                                        fullWidth={true}
                                    />
                                </div>}
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
                        onClick={() => killBrowser(() => setIsRunning(false))}
                    >
                        Kill Browser
                    </ButtonItem>
                </PanelSectionRow>
                <SocialButton icon={<SiGithub />} url='https://github.com/jessebofill/DeckWebBrowser#readme' minHeight='40px'>
                    Plugin GitHub
                </SocialButton>
                <SocialButton icon={<SiKofi />} url='https://ko-fi.com/jessebofill' minHeight='40px'>
                    Kofi
                </SocialButton>
            </PanelSection>
        </>
    );
};