import { log } from "../log"
import { ChangeEvent, VFC, useCallback, useEffect, useRef, useState } from "react"
import { findInReactTree } from "decky-frontend-lib"
import { reactTree } from "../init"
import { SearchIcon } from "../native-components/SearchIcon"
import { TabManager } from "../classes/TabManager"
import { FocusableInput } from "../native-components/FocusableInput"

interface SearchInputProps {
    tabManager: TabManager
}

const searchBarRootNode = findInReactTree(reactTree, node => node?.type?.toString().includes('SetUniversalSearchFocused'))

export const patchSearchRootMemo = (props: SearchInputProps) => {
    searchBarRootNode.child.memoizedProps.children[1].props = props
    searchBarRootNode.child.memoizedProps.children[1].type = SearchBarInput
}

const SearchBarInput: VFC<SearchInputProps> = ({ tabManager }) => {
    const url = tabManager.getActiveTabUrlRequested()
    const [value, setValue] = useState(url)
    const [isFocused, setIsFocused] = useState(false)
    const ref = useRef(null)

    // llog('search rerendered')

    useEffect(() => {
        const url = tabManager.getActiveTabUrlRequested()
        setValue(url)
    }, [isFocused])

    // useEffect(() => {
    //     llog('search mounted')
    //     return () => {
    //         llog('search unmounted')
    //     }
    // }, []);

    const addBackgroundClass = useCallback((isFocused: boolean) => {
        return isFocused ? ' searchbar_WhiteBackground_1l8js' : ''
    }, [])

    const submit = useCallback(() => {
        tabManager.browserRequest(value)
        tabManager.focusActiveBrowser()
    }, [value])

    return (
        <>
            <div className={'searchbar_SearchFieldBackground_3F4YR' + addBackgroundClass(isFocused)} />
            <SearchIcon
                className={'searchbar_SearchIconLeft_2Ya83' + addBackgroundClass(isFocused)}
                width='24px'
                height='24px'
            />
            <FocusableInput
                ref={ref}
                className={'searchbar_SearchBox_2a1-s searchbar_Visible_1bLfc' + addBackgroundClass(isFocused)}
                type='search'
                placeholder='Enter URL or Search Term'
                strEnterKeyLabel='Go'
                value={value}
                focusable={true}
                noFocusRing={true}
                preferredFocus={false}
                onFocusWithin={setIsFocused}
                onFocus={() => {
                    log('search bar focused ', ref)
                    // @ts-ignore
                    setTimeout(() => ref.current.select(), 50)
                    // e.target.select()
                }}
                onChange={(evt: ChangeEvent<HTMLInputElement>) => setValue(evt.target.value)}
                onKeyDown={(evt: KeyboardEvent) => { if (evt.key === 'Enter') submit() }}
                onEnterKeyPress={() => (submit(), 'VKClose')}
                // onKeyboardShow={(e) => { llog('keyboard show: ', e) }}
                // onBlur={() => setIsFocused(false)}
                // onKeyboardNavOut={() => { }}
            />
            <SearchIcon
                className={'searchbar_SearchIconRight_1Ka4T' + addBackgroundClass(isFocused)}
                width='24px'
                height='24px'
            />
        </>
    )
}

