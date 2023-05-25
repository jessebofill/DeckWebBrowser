import { ServerAPI } from "decky-frontend-lib"

class BackendService {
    serverApi: ServerAPI | null
    constructor() {
        this.serverApi = null 
    }

    init(serverApi: ServerAPI) {
        this.serverApi = serverApi
    }
}

export const backendService = new BackendService()