declare module "*.svg" {
    const content: string;
    export default content;
}

declare module "*.png" {
    const content: string;
    export default content;
}

declare module "*.jpg" {
    const content: string;
    export default content;
}
declare module "*.ttf" {
    const content: string;
    export default content;
}

type ClientSettings = {
    enable_ui_sounds: boolean;
}

type SettingsStore = {
    m_ClientSettings: ClientSettings;
}

type BrowserInternal = {
    m_browserView: BrowserView;
    m_gamepadBridge: GamepadBridge;
    m_history: { index: number, entries: { url: string }[] };
    m_URLRequested: string;
    m_refKeyboard: { ShowVirtualKeyboard: () => void };
    URL: string;
    LoadURL: (url: string) => void;
    GetGameInputSupportLevel: GamepadBridge['GetGameInputSupportLevel'];
    Destroy: () => void;

}
type BrowserView = {
    on: (message: string, cb: (...args: any[]) => void) => void;
    off: (message: string, cb: (...args: any[]) => void) => void;
    GoBack: () => void;
    GoForward: () => void;
    SetFocus: (focus: boolen) => void;
}
type GamepadBridge = {
    m_eGameInputSupportLevel: { Value: BrowserInputSupport };
    GetGameInputSupportLevel: () => { Value: BrowserInputSupport };
    SetGameInputSupportLevel: (level: BrowserInputSupport, source?: string) => void;
    BClientManagesVirtualKeyboard: () => void;
}

const enum BrowserInputSupport {
    PageUnloading = 0,
    Unknown, //button callbacks still fire, and virtual keyboard is automatically handled, but browser tries to set this back to none after page load
    None, //no button input callbacks fire, except analog stick. in this mode right trackpad mouse is enabled
    Basic, //no button callbacks fire unless passed to browser container component directly (callbacks passed to higher focus ancestor dont work). virtual keyboard is not automatic
    Full    //same as basic afaik. store.steampowered gets set to this
}

type NavNode = {
    BTakeFocus: (source?: number) => boolean;
    BChildTakeFocus: (source?: number) => boolean;
}