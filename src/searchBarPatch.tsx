import { findInReactTree, sleep } from "decky-frontend-lib"
import { tabManager } from "./classes/TabManager"
import { SearchBarInput } from "./components/SearchBarInput"
import { reactTree, routePath } from "./init"
import { log } from "./log"

export let unpatchSearchBar: () => void
export const patchSearchBar = async () => {
    let searchBarRootNode: any
    while (!searchBarRootNode) {
        searchBarRootNode = findInReactTree(reactTree, node => node?.type?.toString().includes('SetUniversalSearchFocused') && node?.type?.toString().includes('GetForceHeaderAfterResume'))
        await sleep(200)
    }
    log('search root', searchBarRootNode)
    const orig = searchBarRootNode.type
    const searchBarRootWrapper = (props: any) => {
        const ret = orig(props)
        if (window.location.pathname === '/routes' + routePath) {
            const parent = ret.props.children.props?.children?.[1] ? ret.props.children : ret
            parent.props.children[1] = <SearchBarInput tabManager={tabManager} />
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