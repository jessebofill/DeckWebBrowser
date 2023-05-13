import { llog } from "../log"
import { FooterLegendProps, findModuleChild } from "decky-frontend-lib"
import { VFC } from "react"


export interface FocusableInputProps extends FooterLegendProps {
    ref?: any
    value?: string
    type?: string
    placeholder: string
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
export const FocusableInput = findModuleChild((mod) => {
    if (typeof mod !== 'object') return undefined
    for (let prop in mod) {
        if (prop === 'FocusableInput') {
            return mod[prop]
        }
    }
}) as VFC<FocusableInputProps>