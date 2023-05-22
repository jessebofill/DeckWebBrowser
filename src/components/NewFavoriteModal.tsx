import { log } from "../log";
import { ConfirmModal, Marquee, TextField, getFocusNavController, showModal, sleep } from "decky-frontend-lib";
import { ChangeEvent, FocusEvent, VFC, useEffect, useState } from "react";
import { favoritesManager } from "../classes/FavoritesManager";
import { TabManager } from "../classes/TabManager";
import { ConfirmFavoriteOverwriteModal } from "./ConfrimationModals";

interface NewFavoriteModalProps {
    tabManager: TabManager
    parentPath: string[]
    closeModal: any
}

export const NewFavoriteModal: VFC<NewFavoriteModalProps> = ({ tabManager, parentPath, closeModal }) => {
    const [editedUrl, setEditedUrl] = useState(tabManager.getActiveTabUrlRequested())
    const [favoriteName, setFavoriteName] = useState(tabManager.getActiveTabHandler().title)
    const [alreadyExists, setAlreadyExists] = useState(favoritesManager.doesExist([...parentPath, favoriteName], false))
    const updateFavoriteName = (newName: string) => {
        setFavoriteName(newName)
        setAlreadyExists(favoritesManager.doesExist([...parentPath, newName], false))
    }
    const dir = favoritesManager.pathToString(parentPath, '> ')

    // hacky way to select second text box on mount, focusOnMount doesnt work
    useEffect(() => {
        (async () => {
            const activeContext = getFocusNavController().m_ActiveContext
            while (activeContext.m_ActiveFocusChange.to?.m_element.classList[0] !== "gamepaddialog_BasicTextInput_3GCBi") {
                await sleep(5)
            }
            activeContext.m_ActiveFocusChange.to.m_Parent.m_rgChildren[0].m_Parent.m_Parent.m_rgChildren[1].BTakeFocus(3)
        })()
    }, [])

    //STOP HERE
    return (
        <ConfirmModal
            className={alreadyExists ? 'destructiveModal' : ''}
            //'Update favorite
            strTitle={dir + favoriteName}
            strOKButtonText={alreadyExists ? 'Update ' + favoriteName : ('Save favorite' + (favoriteName ? ' as ' + favoriteName : ''))}
            strCancelButtonText='Cancel'
            onOK={() => {
                const confirm = () => {
                    closeModal()
                    // toast showing new favorite created
                    favoritesManager.addFavorite(favoriteName, editedUrl, parentPath)
                }
                if (favoritesManager.doesExist([...parentPath, favoriteName], false)) {
                    log('favorite exists')
                    showModal(
                        <ConfirmFavoriteOverwriteModal
                            name={favoriteName}
                            oldUrl={favoritesManager.getFavorite([...parentPath, favoriteName])}
                            newUrl={editedUrl}
                            onConfirm={confirm}
                            closeModal={() => { }}
                        />)
                } else {
                    confirm()
                }
            }}
            onCancel={closeModal}
            bOKDisabled={!favoriteName || !editedUrl}
        >
            <Marquee
                style={{ position: 'relative', top: '-100px' }}
                play={true}
                center={true}
            >
                {tabManager.getActiveTabUrlRequested()}
            </Marquee>
            <TextField
                description='Edit url'
                value={editedUrl}
                onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                    setEditedUrl(evt.target.value)
                }}
                //@ts-ignore
                onEnterKeyPress={() => { return 'VKClose' }}
            />
            <TextField
                description={alreadyExists ? 'WARNING: ' + favoriteName + ' already exists in this location' : 'Enter a name for favorite'}
                value={favoriteName}
                onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                    updateFavoriteName(evt.target.value)
                }}
                //@ts-ignore
                onEnterKeyPress={() => { return 'VKClose' }}
                onFocus={(evt: FocusEvent<HTMLInputElement>) => { evt.target.select() }}
            />
        </ConfirmModal>
    )
}