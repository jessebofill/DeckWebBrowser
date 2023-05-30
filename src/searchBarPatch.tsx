import { findInReactTree, sleep } from "decky-frontend-lib"
import { tabManager } from "./classes/TabManager"
import { SearchBarInput } from "./components/SearchBarInput"
import { reactTree, routePath } from "./init"
import { log } from "./log"

export let unpatchSearchBar: () => void

export const patchSearchBar = async () => {
    log('pacthing search bar')
    let searchBarRootNode: any 
    while (!searchBarRootNode){
        log('searching for search node')
        searchBarRootNode = findInReactTree(reactTree, node => node?.type?.toString().includes('SetUniversalSearchFocused'))
        await sleep(200)
    }
    log('search root', searchBarRootNode)
    const orig = searchBarRootNode.type
    const searchBarRootWrapper = () => {
        const ret = orig()
        if (window.location.pathname === '/routes' + routePath) {
            ret.props.children[1] = <SearchBarInput tabManager={tabManager}/>
        }

        log('search ret', ret)
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