/* eslint-env detox/detox */

jest.setTimeout(120000 * 10);

describe('Test login page', () => {
    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should have a Log In button visible', async () => {
        await expect(element(by.text('Log In'))).toBeVisible();
    });
});
