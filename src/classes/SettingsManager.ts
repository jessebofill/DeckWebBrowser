import { errorN, log } from "../log";
import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { Favorites } from "./FavoritesManager";
import { backendService } from "./BackendService";


export enum SearchEngine {
    GOOGLE,
    BING,
    YAHOO
}

interface Settings {
    homeUrl?: string
    defaultTabs: string[]
    searchEngine?: SearchEngine
    seenWarning?: boolean
}

interface History {
    [key: string]: string
}

interface BackendLoadArgs {
    manager: SaveDataSetType
}

interface BackendSaveSettingArgs {
    key: keyof Settings
    value: Settings[BackendSaveSettingArgs['key']]
}

type SaveDataSetType = 'settings' | 'favorites' | 'history'

interface BackendSaveDataArgs {
    manager: SaveDataSetType
    data: Settings | Favorites | History
}

export class SettingsManager {
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
        this.settingsLoaded = false
        this.favoritesLoaded = false
        this.historyLoaded = false
        this.settings = { defaultTabs: ['home'] }
        this.favorites = {}
        this.history = {}
    }

    init() {
        this.load()
    }

    load() {
        if (!backendService.serverApi) throw new Error('The Server API has not been initialized')
        this.settingsLoad = backendService.serverApi.callPluginMethod<BackendLoadArgs, Settings>('load', { manager: 'settings' })
        this.favoritesLoad = backendService.serverApi.callPluginMethod<BackendLoadArgs, Favorites>('load', { manager: 'favorites' })
        this.historyLoad = backendService.serverApi.callPluginMethod<BackendLoadArgs, History>('load', { manager: 'history' })
        this.settingsLoad.then(({ success, result }) => {
            if (success) {
                if (Object.keys(result).length === 0) this.saveDataSet('settings')
                else this.settings = result
                this.settingsLoaded = true
            }
            else errorN('Settings Manager', 'Failed to load settings')
        })
        this.favoritesLoad.then(({ success, result }) => {
            if (success) {
                this.favorites = result
                this.favoritesLoaded = true
            }
            else errorN('Settings Manager', 'Failed to load favorites')
        })
        this.historyLoad.then(({ success, result }) => {
            if (success) {
                this.history = result
                this.historyLoaded = true
            }
            else errorN('Settings Manager', 'Failed to load history')
        })
    }
    
    saveSetting(settingName: keyof Settings){
        backendService.serverApi!.callPluginMethod<BackendSaveSettingArgs>('save_setting', { key: settingName, value: this.settings[settingName] })
    }

    setSetting<Setting extends keyof Settings>(settingName: Setting, value: Settings[Setting]) {
        this.settings[settingName] = value
        this.saveSetting(settingName)
    }

    saveDataSet(dataSet: SaveDataSetType) {
        backendService.serverApi!.callPluginMethod<BackendSaveDataArgs>('save_data', { manager: dataSet, data: this[dataSet] })
    }
}

export const settingsManager = new SettingsManager()