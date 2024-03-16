import { findModuleChild } from "decky-frontend-lib"
import { VFC } from "react"

interface BrowserContainerProps {
    browser: any
    className?: string
    visible?: boolean
    hideForModals?: boolean
    external?: boolean
    displayURLBar?: boolean
    autoFocus?: boolean
}

export const BrowserContainer: VFC<BrowserContainerProps> = findModuleChild((mod) => {
    if (typeof mod !== 'object') return undefined;
    for (let prop in mod) {
        if (mod[prop]?.toString().includes('displayURLBar') && mod[prop]?.toString().includes('BExternalTriggeredLoad()')) return mod[prop];
    }
})

