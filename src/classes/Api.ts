import { openUrl } from '../lib/utils';

const apiName = 'WebBrowserPlugin';
export class PluginApi {
    openInBrowser(url: string) {
        try {
            openUrl(url, true);
        } catch (e: any) {
            throw new Error(`Encountered error trying to open in Web Browser plugin${e?.message ? ': ' + e.message : ''}`)
        }
    }
}

export function initApi() {
    const api = new PluginApi();
    Object.freeze(api);
    Object.defineProperty(window, apiName, {
        value: api,
        writable: false,
        configurable: true,
    });
}
export function removeApi() {
    delete window[apiName];
}