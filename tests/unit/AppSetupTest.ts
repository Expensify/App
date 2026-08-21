import appSetup from '@src/setup';
import platformSetup from '@src/setup/platformSetup';

import Onyx from 'react-native-onyx';

jest.mock('@libs/IntlPolyfill', () => jest.fn());
jest.mock('@userActions/Device', () => ({setDeviceID: jest.fn()}));
jest.mock('@userActions/OnyxDerived', () => jest.fn());
jest.mock('@src/setup/addUtilsToWindow', () => jest.fn());
jest.mock('@src/setup/platformSetup', () => jest.fn());
jest.mock('@src/setup/telemetry', () => jest.fn());

describe('app setup', () => {
    it('completes platform setup synchronously after initializing Onyx', () => {
        const onyxInitSpy = jest.spyOn(Onyx, 'init');

        const setupResult = appSetup();

        expect(setupResult).toBeUndefined();
        expect(platformSetup).toHaveBeenCalledTimes(1);
        const [onyxInitOrder] = onyxInitSpy.mock.invocationCallOrder;
        const [platformSetupOrder] = jest.mocked(platformSetup).mock.invocationCallOrder;
        expect(onyxInitOrder).toBeLessThan(platformSetupOrder);
    });
});
