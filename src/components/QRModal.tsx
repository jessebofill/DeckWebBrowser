import { SimpleModal, Focusable } from 'decky-frontend-lib';
import { FC } from 'react';
import QRCode from 'react-qr-code';

export interface QRModalProps {
    url: string;
    closeModal?: () => void;
}

export const QRModal: FC<QRModalProps> = ({ url, closeModal }) => {
    return (
        <SimpleModal active={true}>
            <Focusable onCancel={closeModal} onActivate={() => { }}>
                <div style={{
                    display: 'flex',
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '10px',
                    backdropFilter: 'blur(15px)',
                    background: '#00000029'
                }}>
                    <div style={{ display: 'flex', padding: '10px', borderRadius: '10px', background: 'white' }}>
                        <QRCode value={url} size={220} />
                    </div>
                    <span style={{ textAlign: "center", wordBreak: "break-word" }}>
                        {url}
                    </span>
                </div>
            </Focusable>
        </SimpleModal>
    );
};