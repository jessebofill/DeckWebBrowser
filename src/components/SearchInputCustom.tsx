import { llog } from "../log"
import { VFC, useCallback, useEffect, useRef, useState } from "react"
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
    searchBarRootNode.child.memoizedProps.children[1].type = SearchInput
}

const SearchInput: VFC<SearchInputProps> = ({ tabManager }) => {
    const url = tabManager.getActiveTabHandler().browser.m_URLRequested
    const [value, setValue] = useState(url)
    // const [defaultValue, setDefaultValue] = useState(url)
    const [isFocused, setIsFocused] = useState(false)
    const ref = useRef(null)

    // llog('search rerendered')

    useEffect(() => {
        const url = tabManager.getActiveTabHandler().browser.m_URLRequested
        // setDefaultValue(url)
        setValue(url)
    }, [isFocused])

    useEffect(() => {
        llog('search mounted')
        return () => {
            llog('search unmounted')
        }
    }, []);

    const addBackgroundClass = useCallback((isFocused: boolean) => {
        return isFocused ? ' searchbar_WhiteBackground_1l8js' : ''
    }, [])

    const submit = useCallback(() => {
        llog('enter pressed')
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
                focusable={true}
                noFocusRing={true}
                preferredFocus={false}
                value={value}
                onFocusWithin={setIsFocused}
                onFocus={(e) => {
                    llog('search bar focused ', ref)
                    // @ts-ignore
                    setTimeout(() => ref.current.select(), 50)
                    // e.target.select()
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
                onKeyboardShow={(e) => { llog('keyboard show: ', e) }}
                onEnterKeyPress={() => (submit(), 'VKClose')}
                strEnterKeyLabel='Go'
                placeholder='Enter URL or Search Term'
                onChange={(e) => setValue(e.target.value)}
            // onBlur={() => setIsFocused(false)}
            // onKeyboardNavOut={() => {}}
            />
            <SearchIcon
                className={'searchbar_SearchIconRight_1Ka4T' + addBackgroundClass(isFocused)}
                width='24px'
                height='24px'
            />
        </>
    )
}

