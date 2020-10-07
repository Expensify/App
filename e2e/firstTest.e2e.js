/* eslint-env detox/detox */

jest.setTimeout(120000 * 10);

jest.mock('../node_modules/@react-native-community/async-storage',
    () => require('./mocks/@react-native-community/async-storage'));
jest.mock('../node_modules/@react-native-community/netinfo',
    () => require('./mocks/@react-native-community/netinfo'));
jest.mock('../node_modules/react-native-config',
    () => require('./mocks/react-native-config'));

describe('Example', () => {
    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should have Log In screen', async () => {
        await expect(element(by.text('Log In'))).toBeVisible();
    });
});
