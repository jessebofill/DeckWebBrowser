import { findInReactTree, sleep } from "decky-frontend-lib"
import { tabManager } from "./classes/TabManager"
import { SearchBarInput } from "./components/SearchBarInput"
import { reactTree, routePath } from "./init"
import { logN } from './log'
import { browserClasses } from './staticClasses'

export const searchBarPatchState = { isPatched: false }

export let unpatchSearchBar: () => void = () => { }
export const patchSearchBar = async () => {
    let searchBarRootNode: any
    let t = 0
    while (!searchBarRootNode) {
        searchBarRootNode = findInReactTree(reactTree, node => node?.type?.toString().includes('SetUniversalSearchFocused') && node?.type?.toString().includes('GetForceHeaderAfterResume'))
        if (searchBarRootNode) continue
        if (t >= 20000) {
            logN('Search Bar Patch', `Failed to find search bar root node after ${t / 1000} sec.`)
            searchBarPatchState.isPatched = false
            return
        }
        t += 200
        await sleep(200)
    }
    const orig = searchBarRootNode.type
    const searchBarRootWrapper = (props: any) => {
        const ret = orig(props)
        if (window.location.pathname === '/routes' + routePath) {
            const res = findLocation(ret, node => {
                if (!node.type) return false
                const fnString = node.type.toString?.()
                return fnString?.includes('GamepadUI.Search.Root') && fnString?.includes('SearchBox')
            })
            if (res) {
                const [parent, key] = res
                parent[key] = <SearchBarInput tabManager={tabManager} />
                searchBarPatchState.isPatched = true
            } else {
                logN("Search Bar Patch", 'Failed to find search bar element to patch.')
                searchBarPatchState.isPatched = false
            }
        }
        return ret
    }
    searchBarRootNode.type = searchBarRootWrapper
    if (searchBarRootNode.alternate) {
        searchBarRootNode.alternate.type = searchBarRootNode.type;
    }

    unpatchSearchBar = () => {
        searchBarRootNode.type = orig
        searchBarRootNode.alternate.type = searchBarRootNode.type;
    }
}

const findLocation = (parent, filter) => {
    const walkable = ['props', 'children']
    if (!parent || typeof parent !== 'object') return
    if (Array.isArray(parent)) {
        for (let i = 0; i < parent.length; i++) {
            if (!parent[i]) continue
            if (filter(parent[i])) return [parent, i]
        }
        for (let i = 0; i < parent.length; i++) {
            if (!parent[i]) continue
            const next = findLocation(parent[i], filter)
            if (next) return next
        }
    } else {
        for (const prop of walkable) {
            if (!parent[prop]) continue
            if (filter(parent[prop])) return [parent, prop]
        }

        for (const prop of walkable) {
            if (!parent[prop]) continue
            const next = findLocation(parent[prop], filter)
            if (next) return next
        }
    }
} 