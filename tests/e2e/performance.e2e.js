/* eslint-disable @lwc/lwc/no-async-await */
/* eslint-env detox/detox */

import dotenv from 'dotenv';
import jestExpect from 'expect';

dotenv.config();

jest.setTimeout(120000 * 10);

describe('Test login page', () => {
    beforeEach(() => device.launchApp({permissions: {notifications: 'YES'}}));

    it('Sign in and render the LHN', async () => {
        await element(by.id('LoginTextInput')).typeText(process.env.TEST_USER_LOGIN); // Add test account login
        await element(by.id('LoginContinueButton')).tap();
        expect(element(by.id('PasswordTextInput'))).toBeVisible();
        await element(by.id('PasswordTextInput')).typeText(process.env.TEST_USER_PASSWORD); // Add test account password
        await element(by.id('PasswordSubmitButton')).tap();
        expect(element(by.id('SidebarLinks'))).toBeVisible();

        // When we are ready to gather the data the metrics will be printed to the screen and we can pull the results
        // from the element's attributes. Detox is not really able to share modules between the test runner and app code
        // that runs on the device - so we use this workaround.
        const attributes = await element(by.id('TestMetrics')).getAttributes();
        const metrics = JSON.parse(attributes.text);
        const sidebarLoadTime = metrics.sidebar_loaded[0];

        // Time is in ms. Let's make sure this loads very fast
        console.debug(`[DETOX] sidebar_loaded in ${sidebarLoadTime.duration} ms`);
        jestExpect(sidebarLoadTime.duration).toBeLessThanOrEqual(100);
        await device.reloadReactNative();

        const reloadedAttributes = await element(by.id('TestMetrics')).getAttributes();
        const reloadedMetrics = JSON.parse(reloadedAttributes.text);
        const reloadedSidebarLoadTime = reloadedMetrics.sidebar_loaded[0];

        // Time is in ms. Let's make sure this loads very fast
        console.debug(`[DETOX] sidebar_loaded second time in ${reloadedSidebarLoadTime.duration} ms`);
        jestExpect(reloadedSidebarLoadTime.duration).toBeLessThanOrEqual(100);
    });
});
