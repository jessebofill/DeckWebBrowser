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