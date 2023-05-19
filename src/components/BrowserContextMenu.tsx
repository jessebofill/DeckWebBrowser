import { llog } from "../log";
import { Marquee, Menu, MenuGroup, MenuItem, showModal, GamepadButton, GamepadEvent, ModalRoot, Focusable, MenuGroupProps, ConfirmModal } from "decky-frontend-lib";
import { VFC } from "react";
import { NewFavoriteFolderModal } from "./NewFavoriteFolderModal";
import { NewFavoriteModal } from "./NewFavoriteModal";
import { favoritesManager } from "../classes/FavoritesManager";
import { TabManager } from "../classes/TabManager";
import { structureMappingFn } from "../classes/StructureController";


const formatFavoriteListMenu: structureMappingFn = (children, value, path, tabManager, menu) => {
    let propName = path[path.length - 1]
    if (path.length === 1) propName = 'Favorites'

    if (children) {
        const groupProps: MenuGroupProps = {
            label: propName,
            disabled: children.length === 0
        }
        //@ts-ignore
        if (path.length !== 1) groupProps.onSecondaryActionDescription = 'Delete Folder'
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
            onSecondaryButton={(evt: GamepadEvent) => {
            }}

            //Y button
            onOptionsButton={(evt: GamepadEvent) => {
                menu.result.Hide()
                setTimeout(() => tabManager.createTab(value), 50)
            }}

            //start button
            onMenuButton={(evt: GamepadEvent) => {
            }}

            onButtonDown={(evt: GamepadEvent) => {
                const modal: { result: any } = { result: null }
                switch (evt.detail.button) {
                    case GamepadButton.SELECT:
                        const closeModal = () => {}
                        modal.result = showModal(
                            <ModalRoot
                            closeModal={closeModal}
                            >
                                <Focusable
                                    onOKActionDescription='Open'
                                    onOptionsActionDescription='Open in New Tab'
                                    noFocusRing={true}
                                    onActivate={() => {
                                        modal.result.Close()
                                        menu.result.Hide()
                                        setTimeout(() => tabManager.activeTabLoad(value), 50)
                                    }}
                                    onOptionsButton={(evt: GamepadEvent) => {
                                        modal.result.Close()
                                        menu.result.Hide()
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
            {propName.slice(0, -2)}
        </MenuItem >
    )
}
const formatAddToFavoritesMenu: structureMappingFn = (children, value, path, tabManager) => {
    let propName = path[path.length - 1]
    path[0] = 'Favorites'
    const label = path.length === 1 ? 'Add to Favorites' : propName

    //what to return if level is a parent
    if (children) return (
        <MenuGroup label={label}>
            <MenuItem
                //@ts-ignore
                className="gamepadcontextmenu_Positive_2gJWj"
                onClick={() => {
                    showModal(<NewFavoriteModal path={path} tabManager={tabManager} closeModal={() => { }} />)
                }}>
                Save
            </MenuItem>
            <MenuItem
                //@ts-ignore
                className="gamepadcontextmenu_Emphasis_1viOG"
                onClick={() => {
                    showModal(<NewFavoriteFolderModal path={path} tabManager={tabManager} closeModal={() => { }} />)
                }}
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
    menu: any
}

export const BrowserContextMenu: VFC<BrowserContextMenuProps> = ({ menu, tabManager }) => {
    llog('rendering BrowserContext Menu')

    return (
        //@ts-ignore
        <Menu >
            <MenuItem
                //@ts-ignore
                className="gamepadcontextmenu_Emphasis_1viOG"
                onClick={() => { tabManager.activeTabLoadHome() }}
            >
                Home
            </MenuItem>
            <MenuItem
                onClick={() => { tabManager.getActiveTabBrowserView().Reload() }}
            >
                Refresh Page
            </MenuItem>
            <div className="gamepadcontextmenu_ContextMenuSeparator_1KL6n" />
            {favoritesManager.map(formatAddToFavoritesMenu, [tabManager])}
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
                            <Marquee play={true}>{tabManager.getActiveTabUrlRequested()}</Marquee>
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

