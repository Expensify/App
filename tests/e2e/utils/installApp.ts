import type {ExecException} from 'child_process';
import execAsync from './execAsync';
import type {PromiseWithAbort} from './execAsync';
import * as Logger from './logger';

/**
 * Installs the app on the currently connected device for the given platform.
 * It removes the app first if it already exists, so it's a clean installation.
 */
export default function (packageName: string, path: string, platform = 'android'): PromiseWithAbort {
    if (platform !== 'android') {
        throw new Error(`installApp() missing implementation for platform: ${platform}`);
    }

    // Uninstall first, then install
    return (
        execAsync(`adb uninstall ${packageName}`)
            .catch((error: ExecException) => {
                // Ignore errors
                Logger.warn('Failed to uninstall app:', error.message);
            })
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            .finally(() => execAsync(`adb install ${path}`))
    );
}
