import { StructureController } from "./StructureController"
import { llog } from "../log"

export const favorites = {
    folder1: {
        i1f1: 'dfsd',
        i2f1: 'sdfsdf'
    },
    folder2: {
        f1f2:
        {
            i1f1f2: 'erjrh',
            i2f1f2: 'ffsdf'
        },
        i1f2: 'dsfsd'
    },
    i1: 'dfdsfk',
    i2: 'dfsdf',
    none: {}
}

class FavoritesManager extends StructureController {
    serverApi: any
    constructor(serverApi: any) {
        super({})
        this.serverApi = serverApi
        this.dataStructure = {
            folder1: {
                i1f1: 'dfsd',
                i2f1: 'sdfsdf'
            },
            folder2: {
                f1f2:
                {
                    i1f1f2: 'erjrh',
                    i2f1f2: 'ffsdf'
                },
                i1f2: 'dsfsd'
            },
            i1: 'dfdsfk',
            i2: 'dfsdf',
            none: {}
        }
    }
    pathToString(pathArray: string[], separator: string, removeTrailingSeparator?: boolean) {
        return StructureController.lineageArrayToString(pathArray, separator, removeTrailingSeparator)
    }

    doesExist(name: string, pathArray: string[], isFolder: boolean) {
        if (!isFolder) name += '_P'
        // pathArray.push(name)
        const path = pathArray.slice(1)
        path.push(name)
        const a = this.doesLineageExist(path)
        llog('does exist ', a, pathArray, name)
        return a
    }

    getFavorite(name: string, pathArray: string[]) {
        return this.traverseAndGetMember(pathArray.slice(1))[name + '_P']
    }

    addFolder(folderName: string, pathArray: string[]) {
        this.addComplexChildMember(folderName, pathArray.slice(1))
    }

    addFavorite(favoriteName: string, url: string, pathArray: string[]) {
        this.addPrimitiveChildMember(favoriteName + '_P', url, pathArray.slice(1))
    }

    loadFavorites() {
        //call backend to get data
        // this.dataStructure = data
    }
    saveFavorites() {
        //call backend to write data
    }
}

export const favoritesManager = new FavoritesManager(null)

llog('data', favoritesManager.dataStructure)