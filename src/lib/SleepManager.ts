import { findModuleChild } from 'decky-frontend-lib';

interface SleepManager {
  RegisterForNotifyResumeFromSuspend: (cb: () => void) => { unregister: () => void };
}

export const sleepManager = findModuleChild((mod) => {
    if (typeof mod !== 'object') return undefined
    for (const prop in mod) {
        if (mod[prop]?.RegisterForNotifyResumeFromSuspend) return mod[prop];
    }
}) as SleepManager | undefined;

export function registerForOnResumeFromSuspend(callback: () => void): { unregister: () => void } {
    const register = SteamClient.System.RegisterForOnResumeFromSuspend?.bind(SteamClient.System) ?? sleepManager?.RegisterForNotifyResumeFromSuspend;
    if (!register)  return { unregister: () => {} };
    return register(callback);
  }
