import { ChangeEvent, VFC, useCallback, useEffect, useRef, useState } from "react"
import { SearchIcon } from "../native-components/SearchIcon"
import { TabManager } from "../classes/TabManager"
import { FocusableInput } from "../native-components/FocusableInput"
import { afterPatch } from 'decky-frontend-lib'
import { addClasses } from '../utils'
import { browserClasses, searchBarClasses } from '../staticClasses'

interface SearchInputProps {
    tabManager: TabManager
}

export let searchBarNavFocusable: any;

export const SearchBarInput: VFC<SearchInputProps> = ({ tabManager }) => {
    const url = ""
    const [value, setValue] = useState(url)
    const [isFocused, setIsFocused] = useState(false)
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        try {
            const url = tabManager.getActiveTabUrlRequested()
            setValue(url)
        } catch {}
    }, [isFocused])

    const addBackgroundClass = useCallback((isFocused: boolean) => {
        return isFocused ? searchBarClasses.WhiteBackground : ''
    }, [])

    const submit = useCallback(() => {
        tabManager.browserRequest(value)
        tabManager.focusActiveBrowser()
    }, [value])

    const inputElt = <FocusableInput
        ref={ref}
        className={addClasses(searchBarClasses.SearchBox, searchBarClasses.Visible, addBackgroundClass(isFocused))}
        type='search'
        placeholder='Enter URL or Search Term'
        strEnterKeyLabel='Go'
        value={value}
        focusable={true}
        noFocusRing={true}
        preferredFocus={false}
        onFocusWithin={setIsFocused}
        onFocus={() => setTimeout(() => ref.current?.select(), 50)}
        onChange={(evt) => setValue(evt.target.value)}
        onKeyDown={(evt) => { if (evt.key === 'Enter') submit() }}
        onEnterKeyPress={() => (submit(), 'VKClose')}
        spellCheck={false}
    />

    useEffect(() => {
        afterPatch(inputElt.type, 'render', (_: any, ret: any) => {
            searchBarNavFocusable = ret?.props?.value
            return ret;
        }, { singleShot: true });
    }, [])


    return (
        <>
            <style>{`
                .${browserClasses.InputSupportLevel} {
                    display: none !important;
                }
                .${searchBarClasses.SearchBox} {
                    transition-timing-function: ease-in;
                }
                .${searchBarClasses.SearchBox}:focus-within {
                    color: #0e141b;
                    opacity: 1;
                    caret-color: #000;
                }
            `}</style>
            <div className={addClasses(searchBarClasses.SearchFieldBackground, addBackgroundClass(isFocused))} />
            <SearchIcon
                className={addClasses(searchBarClasses.SearchIconLeft, addBackgroundClass(isFocused))}
                width='24px'
                height='24px'
            />
            {inputElt}
            <SearchIcon
                className={addClasses(searchBarClasses.SearchIconRight, addBackgroundClass(isFocused))}
                width='24px'
                height='24px'
            />
        </>
    )
}

