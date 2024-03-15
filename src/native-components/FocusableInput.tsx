import { FooterLegendProps, findModuleChild } from "decky-frontend-lib"
import { VFC } from "react"


export interface FocusableInputProps extends FooterLegendProps {
    ref?: any
    value?: string
    type?: string
    placeholder?: string
    className?: string
    focusable?: boolean
    noFocusRing?: boolean
    preferredFocus?: boolean
    strEnterKeyLabel?: string
    onFocusWithin?: Function
    onFocus?: Function
    onKeyDown?: Function
    onKeyboardShow?: Function
    onEnterKeyPress?: Function
    onChange?: Function
    onKeyboardNavOut?: Function
    onKeyboardFullyVisible?: Function
    onTextEntered?: Function
}
export const FocusableInput: VFC<FocusableInputProps> = (findModuleChild((mod) => {
    if (typeof mod !== 'object') return undefined;
    for (let prop in mod) {
        if (mod[prop]?.toString().includes('virtualKeyboardProps') && mod[prop]?.toString().includes('BIsElementValidForInput')) return mod[prop];
    }
}))?.('input');