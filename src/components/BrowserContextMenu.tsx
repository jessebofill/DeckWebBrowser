import { log, warnN } from "../log";
import { Marquee, Menu, MenuGroup, MenuItem, showModal, GamepadButton, GamepadEvent, ModalRoot, Focusable, MenuGroupProps, ConfirmModal, MenuItemProps, Navigation, sleep } from "decky-frontend-lib";
import { VFC } from "react";
import { NewFavoriteFolderModal } from "./NewFavoriteFolderModal";
import { NewFavoriteModal } from "./NewFavoriteModal";
import { favoritesManager } from "../classes/FavoritesManager";
import { TabManager } from "../classes/TabManager";
import { structureMappingFn } from "../classes/StructureController";
import { ConfirmFavoriteDeleteModal } from "./ConfrimationModals";
import { settingsManager } from "../classes/SettingsManager";
import { routePath, status } from "../init";

type SubemenuProps = MenuItemProps & MenuGroupProps

const formatFavoriteListMenu: structureMappingFn = (children, value, path, tabManager, menu: { instance: any }) => {
    path[0] = 'Favorites'
    const label = path[path.length - 1]

    const showDeleteItemModal = () => {
        menu.instance.Hide()
        const closeModal = () => { }
        showModal(
            <ConfirmFavoriteDeleteModal
                path={path}
                isFolder={!!children}
                url={value}
                closeModal={closeModal}
            />
        )
    }

    if (children) {
        if (children.length === 0) children[0] = <MenuItem onMenuButton={() => { menu.instance.Hide() }}>Empty</MenuItem>
        const groupProps: SubemenuProps = { label: label }
        if (path.length !== 1) groupProps.onSecondaryActionDescription = 'Delete'
        groupProps.onMenuButton = () => {
            menu.instance.Hide()
        }
        groupProps.onSecondaryButton = () => { showDeleteItemModal() }
        return (
            <MenuGroup {...groupProps} >
                {...children}
            </MenuGroup>
        )
    }
    return (
        <MenuItem
            actionDescriptionMap={{ [GamepadButton.SELECT]: 'View Url' }}
            onSecondaryActionDescription='Delete'
            onOptionsActionDescription='Open in New Tab'
            onOKActionDescription='Open in Current Tab'
            onClick={() => { tabManager.activeTabLoad(value) }}
            //X button
            onSecondaryButton={() => { showDeleteItemModal() }}
            //Y button
            onOptionsButton={() => {
                menu.instance.Hide()
                setTimeout(() => tabManager.createTab(value), 50)
            }}
            //start button
            onMenuButton={() => { menu.instance.Hide() }}

            onButtonDown={(evt: GamepadEvent) => {
                switch (evt.detail.button) {
                    case GamepadButton.SELECT:
                        const modal: { instance: any } = { instance: null }
                        modal.instance = showModal(
                            <ModalRoot>
                                <Focusable
                                    onOKActionDescription='Open'
                                    onOptionsActionDescription='Open in New Tab'
                                    noFocusRing={true}
                                    onActivate={() => {
                                        modal.instance.Close()
                                        menu.instance.Hide()
                                        setTimeout(() => tabManager.activeTabLoad(value), 50)
                                    }}
                                    onOptionsButton={(evt: GamepadEvent) => {
                                        modal.instance.Close()
                                        menu.instance.Hide()
                                        setTimeout(() => tabManager.createTab(value), 50)
                                    }}
                                >
                                    <Marquee play={true} center={true}>{value}</Marquee>
                                </Focusable>
                            </ModalRoot>)
                        break
                }
            }}
        >
            {label.slice(0, -2)}
        </MenuItem >
    )
}

const formatAddToFavoritesMenu: structureMappingFn = (children, value, path, tabManager, menu: { instance: any }) => {
    let propName = path[path.length - 1]
    const label = path.length === 1 ? 'Add to Favorites' : propName
    path[0] = 'Favorites'

    //what to return if level is a parent
    if (children) return (
        //@ts-ignore
        <MenuGroup label={label} onMenuButton={() => { menu.instance.Hide() }}>
            <MenuItem
                //@ts-ignore
                className="gamepadcontextmenu_Positive_2gJWj"
                onClick={() => {
                    showModal(<NewFavoriteModal parentPath={path} tabManager={tabManager} closeModal={() => { }} />)
                }}
                onMenuButton={() => { menu.instance.Hide() }}
            >
                Save
            </MenuItem>
            <MenuItem
                //@ts-ignore
                className="gamepadcontextmenu_Emphasis_1viOG"
                onClick={() => {
                    showModal(<NewFavoriteFolderModal parentPath={path} tabManager={tabManager} closeModal={() => { }} />)
                }}
                onMenuButton={() => { menu.instance.Hide() }}
            >
                New Folder
            </MenuItem>
            {children.length > 0 ? <div className="gamepadcontextmenu_ContextMenuSeparator_1KL6n" /> : null}
            {...children}
        </MenuGroup>
    )
    //what to return if level is not a parent
    return null
}

interface BrowserContextMenuProps {
    tabManager: TabManager
    menu: { instance: any }
}

export const BrowserContextMenu: VFC<BrowserContextMenuProps> = ({ menu, tabManager }) => {
    log('rendering BrowserContext Menu')
    if (!favoritesManager.loaded) {
        warnN('Context Menu', 'Favorites have not loaded')
    }
    if (!settingsManager.settingsLoaded) {
        warnN('Context Menu', 'Settings have not loaded')
    }
    const addToFavoritesMenuItem = favoritesManager.loaded ?
        favoritesManager.map(formatAddToFavoritesMenu, [tabManager, menu]) :
        <MenuGroup label='Add to Favorites' disabled={true} />
    const favoritesMenuItem = favoritesManager.loaded ?
        favoritesManager.map(formatFavoriteListMenu, [tabManager, menu]) :
        <MenuGroup label='Favorites' disabled={true} />

    return (
        //@ts-ignore
        <Menu onMenuButton={() => { menu.instance.Hide() }}>
            <MenuItem
                //@ts-ignore
                className="gamepadcontextmenu_Emphasis_1viOG"
                actionDescriptionMap={{ [GamepadButton.SELECT]: 'View Home Page Url' }}
                onClick={() => { tabManager.activeTabLoadHome() }}
                disabled={!settingsManager.settingsLoaded}
                onButtonDown={(evt: GamepadEvent) => {
                    switch (evt.detail.button) {
                        case GamepadButton.SELECT:
                            const modal: { instance: any } = { instance: null }
                            modal.instance = showModal(
                                <ModalRoot >
                                    <Focusable noFocusRing={true} onActivate={() => { modal.instance.Close() }}>
                                        <Marquee play={true} center={true}>
                                            {settingsManager.settings.homeUrl}
                                        </Marquee>
                                    </Focusable>
                                </ModalRoot>)
                    }
                }}
            >
                Home
            </MenuItem>
            <MenuItem onClick={() => { tabManager.getActiveTabBrowserView().Reload() }}>
                Refresh Page
            </MenuItem>
            <div className="gamepadcontextmenu_ContextMenuSeparator_1KL6n" />
            {addToFavoritesMenuItem}
            {favoritesMenuItem}
            <div className="gamepadcontextmenu_ContextMenuSeparator_1KL6n" />
            <MenuItem
                onClick={() => {
                    const closeModal = () => { }
                    showModal(
                        <ConfirmModal
                            className='destructiveModal'
                            strTitle='Are you sure you want to set your Home Page as'
                            strCancelButtonText='Cancel'
                            onOK={() => {
                                closeModal()
                                tabManager.saveActiveTabAsHomePage()
                            }}
                            onCancel={closeModal}
                            closeModal={closeModal}
                        >
                            <div style={{ height: 15 }}>
                                <Marquee play={true}>{tabManager.getActiveTabUrlRequested()}</Marquee>
                            </div>
                        </ConfirmModal>
                    )
                }}
            >
                Set as Home Page
            </MenuItem >
            <MenuItem
                disabled={!settingsManager.settingsLoaded}
                onClick={() => {
                    settingsManager.settings.defaultTabs.push(tabManager.getActiveTabUrlRequested())
                    settingsManager.saveSetting('defaultTabs')
                }}
            >
                Add to Default Tabs
            </MenuItem>
            <div className="gamepadcontextmenu_ContextMenuSeparator_1KL6n" />
            <MenuItem >History</MenuItem>
            <div className="gamepadcontextmenu_ContextMenuSeparator_1KL6n" />
            {/* <MenuItem
                onClick={() => {

                }}
            >
                Settings
            </MenuItem> */}
            <MenuItem
                onClick={() => {

                }}
            >
                Inspect
            </MenuItem>
            <MenuItem
                //@ts-ignore
                className="gamepadcontextmenu_Destructive_3aIFv"
                onClick={async () => {
                    Navigation.NavigateBack()
                    while (window.location.pathname === '/routes' + routePath) {
                        await sleep(100)
                    }
                    status.running = false
                    tabManager.closeAllTabs()
                }}
            >
                Kill Browser
            </MenuItem>
        </Menu >
    )
}

