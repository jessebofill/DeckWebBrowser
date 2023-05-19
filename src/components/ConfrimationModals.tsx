import { ConfirmModal, Marquee } from "decky-frontend-lib";
import { ReactNode, VFC } from "react";

interface ConfirmFavoriteOverwriteModalProps {
    name: string
    oldUrl: string
    newUrl: string
    onConfirm: () => void
    closeModal: any
}
export const ConfirmFavoriteOverwriteModal: VFC<ConfirmFavoriteOverwriteModalProps> = ({ name, oldUrl, newUrl, onConfirm, closeModal }) => {

    return (
        <ConfirmModal
            className={'destructiveModal'}
            strTitle={'Are you sure you want to overwrite ' + name}
            bDestructiveWarning={true}
            strCancelButtonText='Cancel'
            onOK={() => {
                closeModal()
                onConfirm()
            }}
            onCancel={closeModal}

        >
            <div style={{ marginTop: '10px', top: '10px', position: 'relative' }}>
                <div >
                    <span style={{ width: '150px' }}>Old Url</span>
                    <Marquee style={{ left: '70px', top: '-20px', width: '88%' }}>
                        {oldUrl}
                    </Marquee>
                </div>
                <div>
                    <span style={{ width: '90px' }}>New Url</span>
                    <Marquee style={{ left: '70px', top: '-20px', width: '88%' }}>
                        {newUrl}
                    </Marquee>
                </div>
            </div>

        </ConfirmModal >
    )

}