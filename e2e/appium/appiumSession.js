const wd = require('wd');

const PORT = 4723;

let sessionDriver;
let sessionTestName;

function initAppiumSession(testName) {
    sessionTestName = testName;
    const config = {
        platformName: 'Android',
        deviceName: 'Android',

        app: process.env.DEVICEFARM_APP_PATH || 'android/app/build/outputs/apk/e2eRelease/app-e2eRelease.apk',

        // app: 'android/app/build/outputs/apk/debug/app-debug.apk',

        automationName: 'UiAutomator2', // UiAutomator2, Espresso, or UiAutomator1 for Android
        appPackage: 'com.expensify.chat',
        appActivity: 'com.expensify.chat.MainActivity',

        // pass at the start the test we want to run
        optionalIntentArguments: `-e "testName" "${testName}"`,

        // TODO: get documentations for these
        fullReset: false,
        noReset: true,
    };

    const driver = wd.promiseChainRemote('localhost', PORT);

    return driver.init(config).then(() => {
        sessionDriver = driver;
        return driver;
    });
}

function getAppiumSessionInstance(testName) {
    if (sessionDriver == null || sessionTestName !== testName) {
        return initAppiumSession(testName);
    }
    return new Promise(r => r(sessionDriver));
}

module.exports = getAppiumSessionInstance;
