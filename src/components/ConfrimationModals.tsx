import { ConfirmModal, Marquee } from "decky-frontend-lib";
import { VFC } from "react";
import { favoritesManager } from "../classes/FavoritesManager";

interface ConfirmFavoriteOverwriteModalProps {
    name: string
    oldUrl: string
    newUrl: string
    onConfirm: () => void
    closeModal: () => void
}
export const ConfirmFavoriteOverwriteModal: VFC<ConfirmFavoriteOverwriteModalProps> = ({ name, oldUrl, newUrl, onConfirm, closeModal }) => {

    return (
        <ConfirmModal
            className={'destructiveModal'}
            strTitle={'Are you sure you want to overwrite ' + name}
            // bDestructiveWarning={true}
            strCancelButtonText='Back'
            onOK={() => {
                closeModal()
                onConfirm()
            }}
            onCancel={closeModal}

        >
            <div style={{ marginTop: '10px', top: '10px', position: 'relative' }}>
                <div >
                    <span style={{ width: '150px' }}>Old Url</span>
                    <Marquee style={{ left: '70px', top: '-20px', width: '88%' }} play={true}>
                        {oldUrl}
                    </Marquee>
                </div>
                <div>
                    <span style={{ width: '90px' }}>New Url</span>
                    <Marquee style={{ left: '70px', top: '-20px', width: '88%' }} play={true}>
                        {newUrl}
                    </Marquee>
                </div>
            </div>

        </ConfirmModal >
    )
}

interface ConfirmFavoriteItemDeleteProps {
    path: string[]
    url?: string
    isFolder?: boolean
    closeModal: () => void
}

export const ConfirmFavoriteDeleteModal: VFC<ConfirmFavoriteItemDeleteProps> = ({ path, url, isFolder, closeModal }) => {
    const name = path[path.length - 1]
    const pathStr = favoritesManager.pathToString(path, '> ', true)
    const body: any[] = []
    if (isFolder) {
        body[0] = pathStr
    } else {
        body[0] = pathStr.slice(0, -2)
        body[1] = (<Marquee
            style={{ position: 'relative', top: '-120px' }}
            play={true}
            center={true}
        >
            {url}
        </Marquee>)
    }

    return (
        <ConfirmModal
            className={'destructiveModal'}
            strTitle={'Are you sure you want to delete ' + (isFolder ? 'folder ' + name : name.slice(0, -2))}
            strOKButtonText='Delete'
            strCancelButtonText='Cancel'
            onOK={() => {
                favoritesManager.delete(path)
                closeModal()
            }}
            onCancel={closeModal}
        >
            <div style={{ height: 15 }}>
                {...body}
            </div>

        </ConfirmModal>
    )
}