/* eslint-disable @lwc/lwc/no-async-await */
import wd from 'wd';

const PORT = 4723;
jest.setTimeout(60000);

const config = {
    platformName: 'Android',
    deviceName: 'Android',
    app: 'android/app/build/outputs/apk/e2eRelease/app-e2eRelease.apk',
    automationName: 'UiAutomator2', // UiAutomator2, Espresso, or UiAutomator1 for Android
    appPackage: 'com.expensify.chat',
    appActivity: 'com.expensify.chat.MainActivity',

    // pass at the start the test we want to run instead of the config endpoint
    optionalIntentArguments: '-e "hostip" "192.168.178.21"',
};

const driver = wd.promiseChainRemote('localhost', PORT);

// ANOTHER NOTE: this doesn't have to be a jest test, lol
// we can just use the wd driver to run any custom script

beforeAll(async () => {
    await driver.init(config);

    // setup app, e.g. login
});

// run this test only once, and collect results from it
// later on use these results in a script to make average and everything
it('Collect stats of app start', async () => {
    expect(await driver.hasElementByAccessibilityId('email')).toBe(true);
});
