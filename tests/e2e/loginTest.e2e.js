/* eslint-env detox/detox */

jest.setTimeout(120000 * 10);

describe('Test login page', () => {
    beforeEach(() => device.reloadReactNative());

    it('should have a Log In button visible', () => expect(element(by.text('Next'))).toBeVisible());
});
