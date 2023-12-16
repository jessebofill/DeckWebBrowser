import { ConfirmModal, TextField } from 'decky-frontend-lib';
import { VFC, useState } from 'react';

interface CustomSearchUrlModalProps {
    value: string
    onSave: (value: string) => void
    closeModal?: () => void
}

export const CustomSearchUrlModal: VFC<CustomSearchUrlModalProps> = ({ value, onSave, closeModal }) => {
    const [url, setUrl] = useState(value)


    return (
        <ConfirmModal
            onOK={() => onSave(url)}
            closeModal={closeModal}
            strTitle='Custom URL'
            strDescription={(
                <div>
                    <div>
                        This should include the query string with the query parameter at the end. The query will be appended to this.
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        Ex: https://www.google.com/search?q=
                    </div>
                </div>
            )}>
            <TextField value={url} onChange={e => setUrl(e.target.value)}/>
        </ConfirmModal>
    )
}