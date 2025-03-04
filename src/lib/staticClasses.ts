import { findClassModule } from 'decky-frontend-lib'

export const classes = {
    tabbedBrowserContainer: 'tabbedBrowserContainer',
    destructiveModal: 'destructiveModal',
};

type SteamSpinnerClasses = Record<
    'BackgroundAnimation'
    | 'Black'
    | 'Container'
    | 'ContainerBackground'
    | 'ExtraSpace'
    | 'ItemFocusAnim-darkGrey'
    | 'ItemFocusAnim-darkerGrey'
    | 'ItemFocusAnim-darkerGrey-nocolor'
    | 'ItemFocusAnim-green'
    | 'ItemFocusAnim-grey'
    | 'ItemFocusAnim-translucent-white-10'
    | 'ItemFocusAnim-translucent-white-20'
    | 'ItemFocusAnimBorder - darkGrey'
    | 'LoadingStatus'
    | 'Medium'
    | 'Small'
    | 'Spacer'
    | 'SpinnerLoaderContainer'
    | 'focusAnimation'
    | 'hoverAnimation',
    string
>;

type SearchBarClasses = Record<
    'duration-app-launch'
    | 'SearchAndTitleContainer'
    | 'ShowingSearch'
    | 'VR'
    | 'ShowingTitle'
    | 'SearchIconLeft'
    | 'WhiteBackground'
    | 'SearchIconRight'
    | 'ForceExpanded'
    | 'IconMovesOnHover'
    | 'SearchFieldBackground'
    | 'SearchBox'
    | 'Visible'
    | 'BackgroundAnimation'
    | 'ItemFocusAnim-darkerGrey-nocolor'
    | 'ItemFocusAnim-darkerGrey'
    | 'ItemFocusAnim-darkGrey'
    | 'ItemFocusAnim-grey'
    | 'ItemFocusAnim-translucent-white-10'
    | 'ItemFocusAnim-translucent-white-20'
    | 'ItemFocusAnimBorder-darkGrey'
    | 'ItemFocusAnim-green',
    string
>;

type BrowserClasses = Record<
    'duration-app-launch'
    | 'MainBrowserContainer'
    | 'ExternalBrowserContainer'
    | 'MicroTxnContainer'
    | 'Visible'
    | 'BrowserNavRoot'
    | 'MainBrowser'
    | 'URLBar'
    | 'StatusIcon'
    | 'NavigationButton'
    | 'Disabled'
    | 'Toggled'
    | 'URL'
    | 'URLInput'
    | 'InputSupportLevel'
    | 'showSupportLevel'
    | 'RequireTouchscreenLabel'
    | 'BrowserContainer'
    | 'Browser',
    string
>;

export const spinnerClasses = findClassModule(m => !!m['SpinnerLoaderContainer']) as SteamSpinnerClasses;
export const searchBarClasses = findClassModule(m => !!m['SearchAndTitleContainer']) as SearchBarClasses;
export const browserClasses = findClassModule(m => !!m['MainBrowserContainer']) as BrowserClasses;
