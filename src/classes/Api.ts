import { openUrl } from '../lib/utils';

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
    Object.defineProperty(window, 'WebBrowserPlugin', {
        value: api,
        writable: false,
        configurable: false,
    });
}