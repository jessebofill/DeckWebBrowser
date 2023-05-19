import { llog } from "../log";
import { ConfirmModal, Marquee, TextField, showModal } from "decky-frontend-lib";
import { ChangeEvent, VFC, useState } from "react";
import { favoritesManager } from "../classes/FavoritesManager";
import { TabManager } from "../classes/TabManager";
import { ConfirmFavoriteOverwriteModal } from "./ConfrimationModals";

interface NewFavoriteModalProps {
    tabManager: TabManager
    path: string[]
    closeModal: any
}

export const NewFavoriteModal: VFC<NewFavoriteModalProps> = ({tabManager, path, closeModal }) => {
    const [editedUrl, setEditedUrl] = useState(tabManager.getActiveTabUrlRequested())
    const [favoriteName, setFavoriteName] = useState(tabManager.getActiveTabHandler().title)
    const [alreadyExists, setAlreadyExists] = useState(favoritesManager.doesExist(favoriteName, path, false))
    const updateFavoriteName = (newName: string) => {
        setFavoriteName(newName)
        setAlreadyExists(favoritesManager.doesExist(newName, path, false))
    }
    const dir = favoritesManager.pathToString(path, '> ')

    return (
        <ConfirmModal
            className={alreadyExists ? 'destructiveModal' : ''}
            //'Update favorite
            strTitle={dir + favoriteName}
            strOKButtonText={alreadyExists ? 'Update ' + favoriteName : ('Save favorite' + (favoriteName ? ' as ' + favoriteName : ''))}
            strCancelButtonText='Cancel'
            onOK={() => {
                closeModal()
                if (favoritesManager.doesExist(favoriteName, path, false)) {
                    llog('favorite exists')
                    showModal(
                        <ConfirmFavoriteOverwriteModal
                            name={favoriteName}
                            oldUrl={favoritesManager.getFavorite(favoriteName, path)}
                            newUrl={editedUrl}
                            onConfirm={() => { }}
                            closeModal={() => { }}
                        />)
                } else {
                    llog('favorite does not exist ')
                    // toast showing new favorite created
                    favoritesManager.addFavorite(favoriteName, editedUrl, path)
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
                onChange={(evt: ChangeEvent) => {
                    //@ts-ignore
                    setEditedUrl(evt.target.value)
                }}
                //@ts-ignore
                onEnterKeyPress={() => { return 'VKClose' }}
            />
            <TextField
                description={alreadyExists ? 'WARNING: ' + favoriteName + ' already exists in this location' : 'Enter a name for favorite'}
                value={favoriteName}
                onChange={(evt: ChangeEvent) => {
                    //@ts-ignore
                    updateFavoriteName(evt.target.value)
                }}
                //@ts-ignore
                onEnterKeyPress={() => { return 'VKClose' }}
                focusOnMount={true}
            />
        </ConfirmModal>
    )
}