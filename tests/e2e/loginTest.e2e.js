/* eslint-env detox/detox */

jest.setTimeout(120000 * 10);

describe('Test login page', () => {
    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should have Log In screen', async () => {
        await expect(element(by.text('Log In'))).toBeVisible();
    });
});
