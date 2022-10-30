/* eslint-disable @lwc/lwc/no-async-await,no-await-in-loop */
const wd = require('wd');

const PORT = 4723;

const config = {
    platformName: 'Android',
    deviceName: 'Android',

    // app: process.env.DEVICEFARM_APP_PATH || 'android/app/build/outputs/apk/e2eRelease/app-e2eRelease.apk',

    app: 'android/app/build/outputs/apk/debug/app-debug.apk',

    automationName: 'UiAutomator2', // UiAutomator2, Espresso, or UiAutomator1 for Android
    appPackage: 'com.expensify.chat',
    appActivity: 'com.expensify.chat.MainActivity',

    // pass at the start the test we want to run instead of the config endpoint
    optionalIntentArguments: '-e "hostip" "192.168.178.21"',
};

const test = async () => {
    const driver = wd.promiseChainRemote('localhost', PORT);
    require('node:child_process').execSync('adb reverse tcp:8089 tcp:8089');

    console.debug('Connecting to Appium server and setting up app...');
    await driver.init(config);
    console.debug('Setup completed!');

    console.debug('Waiting for results…');
    await driver.waitForElementsByAndroidUIAutomator('new UiSelector().text("RESULTS_ALERT")', wd.asserters.isDisplayed, 60000, 500);

    await driver.elementByAndroidUIAutomator('new UiSelector().textStartsWith("RESULTS_STR")', async (err, element) => {
        if (err) {
            console.error('Error getting results', err);
            throw err;
        }
        await element.text((error, text) => {
            if (error) {
                console.error('Error getting results', error);
                throw error;
            }

            const jsonRaw = text.replace('RESULTS_STR:', '');
            const json = JSON.parse(jsonRaw);

            console.debug('Results:', json);
        });
    });
};

test();

