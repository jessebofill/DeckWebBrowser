import { DialogButton, Focusable, FooterLegendProps, showModal } from 'decky-frontend-lib';
import { FC, ReactNode } from 'react';
import { HiQrCode } from 'react-icons/hi2';
import { QAMHiglightableProps, QAMHiglightable } from './QAMHiglightable';
import { QRModal } from './QRModal';
import { openUrl } from '../lib/utils';

export interface SocialButtonProps extends QAMHiglightableProps, FooterLegendProps {
    icon: ReactNode;
    url: string;
    fontSize?: string;
    minHeight?: string;
    gap?: string;
}

export const SocialButton: FC<SocialButtonProps> = ({ children, icon, url, fontSize, minHeight, gap, bottomSeparator, ...buttonProps }) => {
    return (
        <QAMHiglightable bottomSeparator={bottomSeparator}>
            <Focusable
                style={{ display: 'flex', gap: gap ?? '15px' }}
                //@ts-ignore
                navEntryPreferPosition={2}
            >
                <div style={{ display: 'flex', fontSize: '1.5em', justifyContent: 'center', alignItems: 'center' }}>
                    {icon}
                </div>
                <DialogButton
                    onClick={() => openUrl(url, true)}
                    style={{ padding: '0px', minHeight: minHeight ?? '30px', fontSize }}
                    {...buttonProps}
                >
                    {children}
                </DialogButton>
                <DialogButton
                    onOKActionDescription="Show QR Code"
                    onClick={() => showModal(<QRModal url={url} />)}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '0px',
                        maxWidth: '40px',
                        minWidth: 'auto',
                    }}
                >
                    <HiQrCode />
                </DialogButton>
            </Focusable>
        </QAMHiglightable>
    )
};