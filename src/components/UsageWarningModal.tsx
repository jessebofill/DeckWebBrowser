import { DialogBodyText, DialogButtonSecondary, DialogSubHeader, ModalPosition, SimpleModal  } from "decky-frontend-lib";
import { VFC } from "react";

interface UsageWarningModalProps {
    closeModal: () => void
    onOk: () => void
    onCancel: () => void
}

export const UsageWarningModal: VFC<UsageWarningModalProps> = ({ closeModal, onOk, onCancel }) => {
    return (
        <SimpleModal active={true}>
            <ModalPosition>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        padding: '12px',
                    }}
                >
                    <DialogSubHeader
                        style={{
                            justifyContent: 'center',
                            display: 'flex',
                            margin: '0px 0px 30px 0px'
                        }}
                    >
                        WARNING
                    </DialogSubHeader>
                    <DialogBodyText style={{ textAlign: 'justify' }}>
                        This plugin uses the Steam Deck's implementation of CEF which has known security vulnerabilities. Caution is advised when navigating external sites and it is not recommended to login to personal accounts. Use at your own risk.
                    </DialogBodyText>
                </div>
                <DialogButtonSecondary
                    onClick={() => {
                        closeModal()
                        onOk()
                    }}
                    onCancelButton={() => {
                        closeModal()
                        onCancel()
                    }}
                >
                    I Understand
                </DialogButtonSecondary>
            </ModalPosition>
        </SimpleModal >
    )
}