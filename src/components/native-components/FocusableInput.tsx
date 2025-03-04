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
        if (mod[prop]?.toString?.().includes('virtualKeyboardProps') && mod[prop]?.toString?.().includes('BIsElementValidForInput')) return mod[prop];
    }
}))?.('input');