import ONYXKEYS from '@src/ONYXKEYS';
import appSetup from '@src/setup';
import platformSetup from '@src/setup/platformSetup';

import Onyx from 'react-native-onyx';

const mockRegisterReportActionsPagination = jest.fn(() => Promise.resolve());

jest.mock('@libs/registerReportActionsPagination', () => ({
    __esModule: true,
    default: () => mockRegisterReportActionsPagination(),
}));
jest.mock('@libs/IntlPolyfill', () => jest.fn());
jest.mock('@userActions/Device', () => ({setDeviceID: jest.fn()}));
jest.mock('@userActions/OnyxDerived', () => jest.fn());
jest.mock('@src/setup/addUtilsToWindow', () => jest.fn());
jest.mock('@src/setup/platformSetup', () => jest.fn());
jest.mock('@src/setup/telemetry', () => jest.fn());

describe('app setup', () => {
    it('initializes evictable caches before registering pagination synchronously', () => {
        // Given disposable caches must not prevent Onyx from recovering when storage fills up.
        const onyxInitSpy = jest.spyOn(Onyx, 'init');

        // When app setup initializes Onyx before registering pagination.
        const setupResult = appSetup();

        // Then explanation caches are safe to evict and pagination can use the initialized store immediately.
        expect(onyxInitSpy).toHaveBeenCalledWith(expect.objectContaining({evictableKeys: expect.arrayContaining([ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION])}));
        expect(setupResult).toBeUndefined();
        expect(platformSetup).toHaveBeenCalledTimes(1);
        const [onyxInitOrder] = onyxInitSpy.mock.invocationCallOrder;
        const [paginationRegistrationOrder] = mockRegisterReportActionsPagination.mock.invocationCallOrder;
        const [platformSetupOrder] = jest.mocked(platformSetup).mock.invocationCallOrder;
        expect(onyxInitOrder).toBeLessThan(paginationRegistrationOrder);
        expect(paginationRegistrationOrder).toBeLessThan(platformSetupOrder);
    });
});
