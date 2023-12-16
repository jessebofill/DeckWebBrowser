import { ChangeEvent, VFC, useCallback, useEffect, useRef, useState } from "react"
import { SearchIcon } from "../native-components/SearchIcon"
import { TabManager } from "../classes/TabManager"
import { FocusableInput } from "../native-components/FocusableInput"
import { afterPatch } from 'decky-frontend-lib'

interface SearchInputProps {
    tabManager: TabManager
}

export let searchBarNavFocusable: any;

export const SearchBarInput: VFC<SearchInputProps> = ({ tabManager }) => {
    const url = ""
    const [value, setValue] = useState(url)
    const [isFocused, setIsFocused] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const url = tabManager.getActiveTabUrlRequested()
        setValue(url)
    }, [isFocused])

    const addBackgroundClass = useCallback((isFocused: boolean) => {
        return isFocused ? ' searchbar_WhiteBackground_1l8js' : ''
    }, [])

    const submit = useCallback(() => {
        tabManager.browserRequest(value)
        tabManager.focusActiveBrowser()
    }, [value])

    const inputElt = <FocusableInput
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
            // @ts-ignore
            setTimeout(() => ref.current.select(), 50)
        }}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => setValue(evt.target.value)}
        onKeyDown={(evt: KeyboardEvent) => { if (evt.key === 'Enter') submit() }}
        onEnterKeyPress={() => (submit(), 'VKClose')}
    />

    useEffect(() => {
        afterPatch(inputElt.type, 'render', (_: any, ret: any) => {
            searchBarNavFocusable = ret?.props?.value
            return ret;
          }, { singleShot: true });
    }, [])
    

    return (
        <>
            <div className={'searchbar_SearchFieldBackground_3F4YR' + addBackgroundClass(isFocused)} />
            <SearchIcon
                className={'searchbar_SearchIconLeft_2Ya83' + addBackgroundClass(isFocused)}
                width='24px'
                height='24px'
            />
            {inputElt}
            <SearchIcon
                className={'searchbar_SearchIconRight_1Ka4T' + addBackgroundClass(isFocused)}
                width='24px'
                height='24px'
            />
        </>
    )
}

