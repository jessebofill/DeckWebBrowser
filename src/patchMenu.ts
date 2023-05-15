import { afterPatch, findInReactTree } from "decky-frontend-lib"
import { llog } from "./log"
import { reactTree, routePath } from "./init"

export const patchMenu = () => {
    const menuNode = findInReactTree(reactTree, (node) => node?.memoizedProps?.navID == 'MainNavMenuContainer')
    const orig = menuNode.return.type
    let patchedInnerMenu: any
    const menuWrapper = (props: any) => {
        const ret = orig(props)
        llog('renderer ', ret)
        if (patchedInnerMenu) {
            ret.props.children.props.children[0].type = patchedInnerMenu
        } else {
            afterPatch(ret.props.children.props.children[0], 'type', (_: any, ret: any) => {
                llog('dm ', ret)
                const storeCopy = { ...ret.props.children[5] }
                storeCopy.label = 'Browser'
                storeCopy.props = {
                    ...storeCopy.props,
                    label: storeCopy.label,
                    route: routePath,
                    // routeState: {
                    //     url: defaultUrl
                    // }
                }

                ret.props.children.splice(5, 0, storeCopy)
                return ret
            })
            patchedInnerMenu = ret.props.children.props.children[0].type
        }
        return ret
    }
    menuNode.return.type = menuWrapper
    if (menuNode.return.alternate) {
        menuNode.return.alternate.type = menuNode.return.type;
    }

    return () => {
        menuNode.return.type = orig
        menuNode.return.alternate.type = menuNode.return.type;
    }
}
