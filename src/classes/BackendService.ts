import { ServerAPI } from "decky-frontend-lib"
class BackendService {
    serverApi: ServerAPI | null
    constructor() {
        this.serverApi = null
    }

    init(serverApi: ServerAPI) {
        this.serverApi = serverApi
    }

    runInTarget(id: string, fn: Function, async: boolean = false, ...args: any[]) {
        let strArgs: string[]
        if (args) {
            strArgs = args.map((arg) => {
                return JSON.stringify(arg)
            })
        }
        const code = '(' + fn.toString() + ')' + `(${strArgs! ? strArgs.join(',') : '' })`
        return this.serverApi!.callPluginMethod('execute_in_target', { code, frontendId: id, run_async: async })
    }
}

export const backendService = new BackendService()