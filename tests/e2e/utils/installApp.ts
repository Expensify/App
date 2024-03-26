import type {ExecException} from 'child_process';
import {chromium} from 'playwright';
import {getBrowser, setBrowser, setContext} from './browser';
import execAsync from './execAsync';
import type {PromiseWithAbort} from './execAsync';
import * as Logger from './logger';

/**
 * Installs the app on the currently connected device for the given platform.
 * It removes the app first if it already exists, so it's a clean installation.
 */
export default function (packageName: string, path: string, platform = 'android'): PromiseWithAbort {
    if (platform !== 'android' && platform !== 'web') {
        throw new Error(`installApp() missing implementation for platform: ${platform}`);
    }

    if (platform === 'web') {
        return (async () => {
            // close browser first
            await getBrowser(packageName)?.close();
            // launch browser to persist cookies across page sessions
            // providing additional config we can use firefox or webkit (safari)
            const browser = await chromium.launch({
                headless: false,
                args: [
                    // disable CORS policy, since anyway it's tests (no security concerns) and managing
                    // CORS on DNS level could e a nightmare for everyone who attempts to run tests
                    '--disable-web-security',
                ],
            });
            setBrowser(browser, packageName);
            const context = await browser.newContext();
            setContext(context, packageName);

            await context.newPage();
        })();
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
