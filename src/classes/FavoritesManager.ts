import { llog } from "../log"
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

    doesExist(name: string, pathArray: string[], isFolder: boolean) {
        if (!isFolder) name += '_P'
        const path = pathArray.slice(1)
        path.push(name)
        return this.doesLineageExist(path)
    }

    getFavorite(name: string, pathArray: string[]) {
        return this.traverseAndGetMember(pathArray.slice(1))[name + '_P']
    }

    addFolder(folderName: string, pathArray: string[]) {
        this.addComplexChildMember(folderName, pathArray.slice(1))
        this.save()
    }

    addFavorite(favoriteName: string, url: string, pathArray: string[]) {
        this.addPrimitiveChildMember(favoriteName + '_P', url, pathArray.slice(1))
        this.save()
    }

    save() {
        settingsManager.saveDataSet('favorites')
    }
}

export const favoritesManager = new FavoritesManager()
