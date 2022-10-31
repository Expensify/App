const wd = require('wd');
const getAppiumSessionInstance = require('./appiumSession');
const killApp = require('../utils/killApp');
const launchApp = require('../utils/launchApp');

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

    return getAppiumSessionInstance(testName).then((driver) => {
        return driver.launchApp().then(() => {
            // https://github.com/admc/wd/blob/master/doc/jsonwire-mobile.md#-android-uiautomator-locator-strategy
            const uiSelector = 'new UiSelector().textStartsWith("RESULTS_STR:")';

            console.debug('Waiting for results…');
            return driver.waitForElementsByAndroidUIAutomator(uiSelector, wd.asserters.isDisplayed, 60000, 2000)
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

                            driver.closeApp().then(() => {
                                resolve(json);
                            });
                        });
                    });
                }));
        });
    });
}

module.exports = runTestAndGetResults;

