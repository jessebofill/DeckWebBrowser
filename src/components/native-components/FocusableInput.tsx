import { FooterLegendProps, findModuleChild } from "decky-frontend-lib"
import { HTMLAttributes, InputHTMLAttributes, VFC } from "react"


export interface FocusableInputProps extends FooterLegendProps, InputHTMLAttributes<HTMLInputElement> {
    ref?: any
    focusable?: boolean
    noFocusRing?: boolean
    preferredFocus?: boolean
    strEnterKeyLabel?: string
    onFocusWithin?: Function
    onKeyboardShow?: Function
    onEnterKeyPress?: Function
    onKeyboardNavOut?: Function
    onKeyboardFullyVisible?: Function
    onTextEntered?: Function
}

export const FocusableInput: VFC<FocusableInputProps> = (findModuleChild((mod) => {
    if (typeof mod !== 'object') return undefined;
    for (let prop in mod) {
        if (typeof mod[prop] === 'function') {
            const f = mod[prop].toString();
            if (f.includes('virtualKeyboardProps') && f.includes('BIsElementValidForInput')) return mod[prop];
        }
    }
}))?.('input');