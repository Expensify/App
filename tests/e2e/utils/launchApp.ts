import config from '../config';
import {getContext, setPage} from './browser';
import execAsync from './execAsync';

const launchApp = (platform = 'android', packageName = config.MAIN_APP_PACKAGE, activityPath = config.ACTIVITY_PATH, launchArgs: Record<string, boolean> = {}) => {
    if (platform !== 'android' && platform !== 'web') {
        throw new Error(`launchApp() missing implementation for platform: ${platform}`);
    }

    if (platform === 'web') {
        return (async () => {
            const context = getContext(packageName);

            if (!context) {
                throw new Error('Context is supposed to exist before launching the app! Did you start a browser and instantiated a new context?');
            }

            const page = await context.newPage();
            setPage(page, packageName);

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
