describe('Example', () => {
    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should have Log In screen', async () => {
        await expect(element(by.id('Log In'))).toBeVisible();
    });
});
