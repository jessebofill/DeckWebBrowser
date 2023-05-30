import { log } from "./log"
import { afterPatch, findInReactTree } from "decky-frontend-lib"
import { reactTree, routePath } from "./init"
import { FC } from "react"
import { PluginIcon } from "./native-components/PluginIcon"

interface MainMenuItemProps {
    route: string
    label: string
    onFocus: () => void
    onActivate?: () => void
}

export const patchMenu = () => {
    const menuNode = findInReactTree(reactTree, (node) => node?.memoizedProps?.navID == 'MainNavMenuContainer')
    const orig = menuNode.return.type
    let patchedInnerMenu: any
    const menuWrapper = (props: any) => {
        const ret = orig(props)
        if (patchedInnerMenu) {
            ret.props.children.props.children[0].type = patchedInnerMenu
        } else {
            afterPatch(ret.props.children.props.children[0], 'type', (_: any, ret: any) => {
                const menuItemElement = findInReactTree(ret.props.children, (x) =>
                    x?.type?.toString()?.includes('exactRouteMatch:'),
                );
                const MenuItemComponent: FC<MainMenuItemProps> = menuItemElement.type
                const onFocus = menuItemElement.props.onFocus

                const newItem =
                        <MenuItemComponent
                            route={routePath}
                            label='Browser'
                            onFocus={onFocus}
                        >
                            <PluginIcon />
                        </MenuItemComponent>

                ret.props.children.splice(5, 0, newItem)
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
