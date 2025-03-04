import { pluginName } from "../init";

export const log = (...args) => {
    console.log(`%c ${pluginName} %c`, 'background: #7627D3; color: #E5E1EA;', 'background: transparent;', ...args);
};
export const warn = (...args) => {
    console.warn(`%c ${pluginName} %c`, 'background: #7627D3; color: #E5E1EA;', 'background: transparent;', ...args);
};
export const error = (...args) => {
    console.error(`%c ${pluginName} %c`, 'background: #7627D3; color: #E5E1EA;', 'background: transparent;', ...args);
};
export const debug = (...args) => {
    console.debug(`%c ${pluginName} %c`, 'background: #7627D3; color: #E5E1EA;', 'background: transparent;', ...args);
};

export const logN = (name, ...args) => {
    console.log(`%c ${pluginName} %c ${name} %c`, 'background: #7627D3; color: #E5E1EA;', 'background: #AF70F9; color: black;', 'background: transparent;', ...args);
}
export const warnN = (name, ...args) => {
    console.warn(`%c ${pluginName} %c ${name} %c`, 'background: #7627D3; color: #E5E1EA;', 'background: #AF70F9; color: black;', 'background: transparent;', ...args);
}
export const errorN = (name, ...args) => {
    console.error(`%c ${pluginName} %c ${name} %c`, 'background: #7627D3; color: #E5E1EA;', 'background: #AF70F9; color: black;', 'background: transparent;', ...args);
}
export const debugN = (name, ...args) => {
    console.debug(`%c ${pluginName} %c ${name} %c`, 'background: #7627D3; color: #E5E1EA;', 'background: #AF70F9; color: black;', 'background: transparent;', ...args);
}
export const throwN = (name, ...args: any[]) => {
    throw new Error([`%c ${pluginName} %c ${name} %c`, 'background: #7627D3; color: #E5E1EA;', 'background: #AF70F9; color: black;', 'background: transparent;', ...args].join(' '));
}

export class Logger {
    constructor(private name: string) {
        this.name = name;
    }
    log(...args: any[]) {
        logN(this.name, ...args);
    }

    debug(...args: any[]) {
        debugN(this.name, ...args);
    }

    warn(...args: any[]) {
        warnN(this.name, ...args);
    }

    error(...args: any[]) {
        errorN(this.name, ...args);
    }
    throw(...args: any[]) {
        throwN(this.name, ...args);
    }
}