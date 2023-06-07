import { ConfirmModal, Marquee, TextField, DialogButton, showModal } from "decky-frontend-lib"
import { VFC, useState, ChangeEvent } from "react"
import { TabManager } from "../classes/TabManager"
import { favoritesManager } from "../classes/FavoritesManager"
import { NewFavoriteModal } from "./NewFavoriteModal"

interface NewFavoriteFolderModalProps {
    tabManager: TabManager
    parentPath: string[]
    closeModal: any
}

export const NewFavoriteFolderModal: VFC<NewFavoriteFolderModalProps> = ({ tabManager, parentPath, closeModal }) => {
    const [folderName, setFolderName] = useState('')
    const [alreadyExists, setAlreadyExists] = useState(false)
    const updateFolderName = (newName: string) => {
        setFolderName(newName)
        setAlreadyExists(favoritesManager.doesExist([...parentPath, newName], true))
    }
    const dir = favoritesManager.pathToString(parentPath, '> ')

    return (
        <ConfirmModal
            strTitle={dir + folderName}
            strOKButtonText={'Make favorite' + (folderName ? ' in ' + folderName : '')}
            strCancelButtonText='Cancel'
            onOK={() => {
                closeModal()
                if (!favoritesManager.doesExist([...parentPath, folderName], true)) {
                    favoritesManager.addFolder(folderName, parentPath)
                }
                showModal(<NewFavoriteModal parentPath={[...parentPath, folderName]} tabManager={tabManager} closeModal={() => { }} />)
            }}
            onCancel={closeModal}
            bOKDisabled={!folderName}
        >
            <Marquee
                style={{ position: 'relative', top: '-100px' }}
                play={true}
                center={true}
            >
                {tabManager.getActiveTabUrlRequested()}
            </Marquee>
            <TextField
                description={alreadyExists ? 'A folder with this name already exists in this location' : 'Enter a folder name'}
                onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                    updateFolderName(evt.target.value)
                }}
                //@ts-ignore
                onEnterKeyPress={() => { return 'VKClose' }}
                inlineControls={
                    <DialogButton
                        className='DialogInput_CopyAction'
                        disabled={!folderName}
                        focusable={!!folderName}
                        style={{ marginLeft: '25px' }}
                        onClick={() => {
                            closeModal()
                            if (!favoritesManager.doesExist([...parentPath, folderName], true)) {
                                favoritesManager.addFolder(folderName, parentPath)
                            }
                            showModal(<NewFavoriteFolderModal parentPath={[...parentPath, folderName]} tabManager={tabManager} closeModal={() => { }} />)
                        }}
                    >
                        {'Make folder within'}
                    </DialogButton>
                }
            />
        </ConfirmModal>
    )
}
