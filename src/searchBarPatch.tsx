import { findInReactTree, sleep } from "decky-frontend-lib"
import { tabManager } from "./classes/TabManager"
import { SearchBarInput } from "./components/SearchBarInput"
import { reactTree, routePath } from "./init"

export let unpatchSearchBar: () => void

export const patchSearchBar = async () => {
    let searchBarRootNode: any
    while (!searchBarRootNode) {
        searchBarRootNode = findInReactTree(reactTree, node => node?.type?.toString().includes('SetUniversalSearchFocused'))
        await sleep(200)
    }
    const orig = searchBarRootNode.type
    const searchBarRootWrapper = () => {
        const ret = orig()
        if (window.location.pathname === '/routes' + routePath) {
            ret.props.children[1] = <SearchBarInput tabManager={tabManager} />
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