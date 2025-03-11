import { Field, gamepadDialogClasses, quickAccessControlsClasses } from 'decky-frontend-lib';
import { FC } from 'react';

export interface QAMHiglightableProps {
    bottomSeparator?: 'standard' | 'thick' | 'none';
}

export const QAMHiglightable: FC<QAMHiglightableProps> = ({ children, bottomSeparator }) => {
    return <>
        <style>{`
        .qam-focusable-item .${gamepadDialogClasses.Field} {
            padding-top: 0;
        }
        .qam-focusable-item .${gamepadDialogClasses.FieldLabel} {
            display: none;
         }
        `}
        </style>
        <div className={`qam-focusable-item ${quickAccessControlsClasses.PanelSectionRow}`}>
            <Field description={children} bottomSeparator={bottomSeparator} />
        </div>
    </>
};