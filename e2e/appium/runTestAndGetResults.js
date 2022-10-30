const wd = require('wd');

const PORT = 4723;

/**
 * Executes a test using appium. It will start the app and forward the `testName`
 * as launch argument to the app.
 * The app will then run the test accordingly and once there are results it will
 * open an alert which shows the results as JSON. This is catched by appium and
 * returned.
 *
 * @param {String} testName
 * @returns {Promise<Object>}
 */
function runTestAndGetResults(testName) {
    if (testName == null) {
        throw new Error('Test name is required as first argument!');
    }

    const config = {
        platformName: 'Android',
        deviceName: 'Android',

        // app: process.env.DEVICEFARM_APP_PATH || 'android/app/build/outputs/apk/e2eRelease/app-e2eRelease.apk',

        app: 'android/app/build/outputs/apk/debug/app-debug.apk',

        automationName: 'UiAutomator2', // UiAutomator2, Espresso, or UiAutomator1 for Android
        appPackage: 'com.expensify.chat',
        appActivity: 'com.expensify.chat.MainActivity',

        // pass at the start the test we want to run
        optionalIntentArguments: `-e "testname" "${testName}"`,
    };

    const driver = wd.promiseChainRemote('localhost', PORT);
    require('node:child_process').execSync('adb reverse tcp:8089 tcp:8089');

    console.debug('Connecting to Appium server and setting up app...');
    return driver.init(config).then(() => {
        console.debug('Setup completed!');

        // https://github.com/admc/wd/blob/master/doc/jsonwire-mobile.md#-android-uiautomator-locator-strategy
        const uiSelector = 'new UiSelector().textStartsWith("RESULTS_STR")';

        console.debug('Waiting for results…');
        return driver.waitForElementsByAndroidUIAutomator(uiSelector, wd.asserters.isDisplayed, 60000, 500)
            .then(() => new Promise((resolve, reject) => {
                // we got the results, parsing the text from the element
                driver.elementByAndroidUIAutomator(uiSelector, (err, element) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    element.text((error, text) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        const jsonRaw = text.replace('RESULTS_STR:', '');
                        const json = JSON.parse(jsonRaw);

                        console.debug('Results:', json);

                        resolve(json);
                    });
                });
            }));
    });
}

module.exports = runTestAndGetResults;

