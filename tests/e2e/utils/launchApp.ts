import {chromium} from 'playwright';
import config from '../config';
import {setBrowser} from './browser';
import execAsync from './execAsync';

const launchApp = (platform = 'android', packageName = config.MAIN_APP_PACKAGE, activityPath = config.ACTIVITY_PATH, launchArgs: Record<string, boolean> = {}) => {
    if (platform !== 'android' && platform !== 'web') {
        throw new Error(`launchApp() missing implementation for platform: ${platform}`);
    }

    if (platform === 'web') {
        return (async () => {
            // providing additional config we can use firefox or webkit (safari)
            const browser = await chromium.launch({headless: false});
            setBrowser(browser);

            const page = await browser.newPage();

            // Execute JavaScript before navigating to your page
            await page.addInitScript((args) => {
                // @ts-expect-error yes, the property doesn't exist because we define it here
                window.launchArgs = args;
            }, launchArgs);
            // TODO: use URL dynamically?
            await page.goto('https://dev.new.expensify.com:8082/');
        })();
    }

    // Use adb to start the app
    const launchArgsString = Object.keys(launchArgs)
        .map((key) => `${typeof launchArgs[key] === 'boolean' ? '--ez' : '--es'} ${key} ${launchArgs[key]}`)
        .join(' ');
    return execAsync(`adb shell am start -n ${packageName}/${activityPath} ${launchArgsString}`);
};

export default launchApp;
