import { ServerAPI } from "decky-frontend-lib"
import { v4 as uuidv4 } from "uuid"
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
        const code = '(' + fn.toString() + ')' + `(${strArgs! ? strArgs.join(',') : ''})`
        return this.serverApi!.callPluginMethod('execute_in_target', { code, frontendId: id, run_async: async })
    }

    async setMainTab() {
        const id = uuidv4();
        const res = await this.serverApi!.callPluginMethod<{ frontend_id: string }, string>('set_main_tab', { frontend_id: id });
        if (!res.success) throw new Error(res.result);
        return { id, key: res.result };
    }
}

export const backendService = new BackendService()