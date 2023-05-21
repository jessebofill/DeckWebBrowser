import { llog } from "../log";
import { Marquee, Menu, MenuGroup, MenuItem, showModal, GamepadButton, GamepadEvent, ModalRoot, Focusable, MenuGroupProps, ConfirmModal, MenuItemProps } from "decky-frontend-lib";
import { VFC } from "react";
import { NewFavoriteFolderModal } from "./NewFavoriteFolderModal";
import { NewFavoriteModal } from "./NewFavoriteModal";
import { favoritesManager } from "../classes/FavoritesManager";
import { TabManager } from "../classes/TabManager";
import { structureMappingFn } from "../classes/StructureController";
import { ConfirmFavoriteDeleteModal } from "./ConfrimationModals";

type SubemenuProps = MenuItemProps & MenuGroupProps

const formatFavoriteListMenu: structureMappingFn = (children, value, path, tabManager, menu: { instance: any }) => {
    path[0] = 'Favorites'
    const label = path[path.length - 1]

    if (children) {
        if (children.length === 0) children[0] = <MenuItem onMenuButton={() => { menu.instance.Hide() }}>Empty</MenuItem>
        const groupProps: SubemenuProps = { label: label }
        if (path.length !== 1) groupProps.onSecondaryActionDescription = 'Delete Folder'
        groupProps.onMenuButton = () => {
            menu.instance.Hide()
        }
        groupProps.onSecondaryButton = () => {
            menu.instance.Hide()
            const closeModal = () => { }
            showModal(
                <ConfirmFavoriteDeleteModal
                    name={label}
                    pathStr={favoritesManager.pathToString(path, '> ', true)}
                    isFolder={true}
                    onConfirm={() => { closeModal() }}
                    closeModal={closeModal}
                />
            )
        }
        return (
            <MenuGroup {...groupProps} >
                {...children}
            </MenuGroup>
        )
    }
    return (
        <MenuItem
            actionDescriptionMap={{ [GamepadButton.SELECT]: 'View Url' }}
            onSecondaryActionDescription='Delete Favorite'
            onOptionsActionDescription='Open in New Tab'
            onOKActionDescription='Open Here'
            onClick={() => { tabManager.activeTabLoad(value) }}
            //X button
            onSecondaryButton={() => {
                menu.instance.Hide()
                const closeModal = () => { }
                showModal(
                    <ConfirmFavoriteDeleteModal
                        name={label}
                        url={value}
                        pathStr={favoritesManager.pathToString(path, '> ', true)}
                        onConfirm={() => { }}
                        closeModal={closeModal}
                    />
                )
            }}
            //Y button
            onOptionsButton={() => {
                menu.instance.Hide()
                setTimeout(() => tabManager.createTab(value), 50)
            }}
            //start button
            onMenuButton={() => { menu.instance.Hide() }}

            onButtonDown={(evt: GamepadEvent) => {
                const modal: { instance: any } = { instance: null }
                switch (evt.detail.button) {
                    case GamepadButton.SELECT:
                        const closeModal = () => { }
                        modal.instance = showModal(
                            <ModalRoot closeModal={closeModal}>
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
                    showModal(<NewFavoriteModal path={path} tabManager={tabManager} closeModal={() => { }} />)
                }}
                onMenuButton={() => { menu.instance.Hide() }}
            >
                Save
            </MenuItem>
            <MenuItem
                //@ts-ignore
                className="gamepadcontextmenu_Emphasis_1viOG"
                onClick={() => {
                    showModal(<NewFavoriteFolderModal path={path} tabManager={tabManager} closeModal={() => { }} />)
                }}
                onMenuButton={() => { menu.instance.Hide() }}
            >
                New Folder
            </MenuItem>
            <div className="gamepadcontextmenu_ContextMenuSeparator_1KL6n" style={{ paddingTop: '2px' }} />
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
    llog('rendering BrowserContext Menu')

    return (
        //@ts-ignore
        <Menu onMenuButton={() => { menu.instance.Hide() }}>
            <MenuItem
                //@ts-ignore
                className="gamepadcontextmenu_Emphasis_1viOG"
                onClick={() => { tabManager.activeTabLoadHome() }}
            >
                Home
            </MenuItem>
            <MenuItem onClick={() => { tabManager.getActiveTabBrowserView().Reload() }}>
                Refresh Page
            </MenuItem>
            <div className="gamepadcontextmenu_ContextMenuSeparator_1KL6n" />
            {favoritesManager.map(formatAddToFavoritesMenu, [tabManager, menu])}
            {favoritesManager.map(formatFavoriteListMenu, [tabManager, menu])}
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
                        </ConfirmModal>,
                    )
                }}
            >
                Set as Home Page
            </MenuItem >
            <div className="gamepadcontextmenu_ContextMenuSeparator_1KL6n" />
            <MenuItem >History</MenuItem>
            <div className="gamepadcontextmenu_ContextMenuSeparator_1KL6n" />
            <MenuItem
                onClick={() => {

                }}
            >
                Settings
            </MenuItem>
            <MenuItem
                onClick={() => {

                }}
            >
                Inspect
            </MenuItem>
            <MenuItem
                //@ts-ignore
                className="gamepadcontextmenu_Destructive_3aIFv"
                onClick={() => {

                }}
            >
                Kill Browser
            </MenuItem>
        </Menu >
    )
}

