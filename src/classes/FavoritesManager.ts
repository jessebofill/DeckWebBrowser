import { log } from "../log"
import { StructureController } from "./StructureController"
import { settingsManager } from "./SettingsManager"

export interface Favorites {
    [key: string]: Object | string
}
class FavoritesManager extends StructureController {
    favorites: Favorites
    loaded: boolean
    constructor() {
        const data = {}
        super(data)
        this.loaded = false
        this.favorites = data
    }

    //make sure to init settings manager before this
    async init(){
        await settingsManager.favoritesLoad
        this.loaded = true
        this.favorites = settingsManager.favorites
        this.dataStructure = this.favorites
    }

    pathToString(pathArray: string[], separator: string, removeTrailingSeparator?: boolean) {
        return StructureController.lineageArrayToString(pathArray, separator, removeTrailingSeparator)
    }

    doesExist(pathArray: string[], isFolder: boolean) {
        const lastIndex = pathArray.length - 1
        const name = pathArray[lastIndex]
        const path = pathArray.slice(1, -1)
        path.push(isFolder ? name : name + '_P')
        log('fm path', path)
        return this.doesLineageExist(path)
    }

    getFavorite(pathArray: string[]) {
        const path = pathArray.slice(1)
        path[path.length - 1] = pathArray[pathArray.length - 1] + '_P'
        return this.traverseAndGetMember(path) as string
    }

    addFolder(folderName: string, parentPathArray: string[]) {
        this.addComplexChildMember(folderName, parentPathArray.slice(1))
        this.save()
    }

    addFavorite(favoriteName: string, url: string, parentPathArray: string[]) {
        this.addPrimitiveChildMember(favoriteName + '_P', url, parentPathArray.slice(1))
        this.save()
    }

    delete(pathArray: string[]) {
        this.removeMember(pathArray.slice(1))
        this.save()
    }

    save() {
        settingsManager.saveDataSet('favorites')
    }
}

export const favoritesManager = new FavoritesManager()
