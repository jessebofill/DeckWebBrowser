import { findModuleChild } from "decky-frontend-lib"
import { FC } from "react"


export interface SimpleModalProps{
    active?: boolean
}

export const ModalPosition = findModuleChild((mod) => {
    if (typeof mod !== 'object') return undefined
    for (let prop in mod) {
        if (prop === 'ModalPosition') {
            return mod[prop]
        }
    }
}) as FC<SimpleModalProps>

export const SimpleModal = findModuleChild((mod) => {
    if (typeof mod !== 'object') return undefined
    for (let prop in mod) {
        if (prop === 'SimpleModal') {
            return mod[prop]
        }
    }
}) as FC<SimpleModalProps>