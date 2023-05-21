import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { Favorites } from "./FavoritesManager";
import { llog } from "../log";


interface Settings {
    homeUrl?: string
    defaultTabs?: string[]
}

interface History {
    [key: string]: string
}

interface BackendLoadArgs {
    manager: 'settings' | SaveDataSetType
}

interface BackendSaveSettingArgs {
    key: keyof Settings
    value: Settings[BackendSaveSettingArgs['key']]
}

type SaveDataSetType = 'favorites' | 'history'

interface BackendSaveDataArgs {
    manager: SaveDataSetType
    data: Favorites | History
}

export class SettingsManager {
    serverApi: ServerAPI | null
    settings: Settings
    favorites: Favorites
    history: History
    settingsLoaded: boolean
    favoritesLoaded: boolean
    historyLoaded: boolean
    settingsLoad: Promise<ServerResponse<Settings>> | undefined
    historyLoad: Promise<ServerResponse<History>> | undefined
    favoritesLoad: Promise<ServerResponse<Favorites>> | undefined

    constructor() {
        this.serverApi = null
        this.settingsLoaded = false
        this.favoritesLoaded = false
        this.historyLoaded = false
        this.settings = {}
        this.favorites = {}
        this.history = {}
    }

    init(serverApi: ServerAPI) {
        this.serverApi = serverApi
        this.load()
    }

    load() {
        if (!this.serverApi) throw new Error('The Server API has not been initialized')
        this.settingsLoad = this.serverApi.callPluginMethod<BackendLoadArgs, Settings>('load', { manager: 'settings' })
        this.favoritesLoad = this.serverApi.callPluginMethod<BackendLoadArgs, Favorites>('load', { manager: 'favorites' })
        this.historyLoad = this.serverApi.callPluginMethod<BackendLoadArgs, History>('load', { manager: 'history' })
        this.settingsLoad.then(({ success, result }) => {
            if (success) {
                this.settings = result
                this.settingsLoaded = true
            }
            else console.warn('Web Browser: Failed to load settings')
        })
        this.favoritesLoad.then(({ success, result }) => {
            if (success) {
                this.favorites = result
                this.favoritesLoaded = true
            }
            else console.warn('Web Browser: Failed to load favorites')
        })
        this.historyLoad.then(({ success, result }) => {
            if (success) {
                this.history = result
                this.historyLoaded = true
            }
            else console.warn('Web Browser: Failed to load history')
        })   
    }

    saveSetting<Setting extends keyof Settings>(settingName: Setting, value: Settings[Setting]) {
        this.settings[settingName] = value
        this.serverApi?.callPluginMethod<BackendSaveSettingArgs>('save_setting', { key: settingName, value: value })
    }

    saveDataSet(dataSet: SaveDataSetType) {
        this.serverApi?.callPluginMethod<BackendSaveDataArgs>('save_data', { manager: dataSet, data: this[dataSet] })
    }
}

export const settingsManager = new SettingsManager()