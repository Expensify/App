import appSetup from '@src/setup';
import platformSetup from '@src/setup/platformSetup';

import Onyx from 'react-native-onyx';

const mockRegisterReportActionsPagination = jest.fn();

jest.mock('@libs/registerPaginationConfig', () => {
    mockRegisterReportActionsPagination();
});
jest.mock('@libs/IntlPolyfill', () => jest.fn());
jest.mock('@userActions/Device', () => ({setDeviceID: jest.fn()}));
jest.mock('@userActions/OnyxDerived', () => jest.fn());
jest.mock('@src/setup/addUtilsToWindow', () => jest.fn());
jest.mock('@src/setup/platformSetup', () => jest.fn());
jest.mock('@src/setup/telemetry', () => jest.fn());

describe('app setup', () => {
    it('registers report action pagination after initializing Onyx and before platform setup', async () => {
        const onyxInitSpy = jest.spyOn(Onyx, 'init');

        const setupPromise = appSetup();

        expect(platformSetup).not.toHaveBeenCalled();

        await setupPromise;

        expect(mockRegisterReportActionsPagination).toHaveBeenCalledTimes(1);
        const [onyxInitOrder] = onyxInitSpy.mock.invocationCallOrder;
        const [paginationRegistrationOrder] = mockRegisterReportActionsPagination.mock.invocationCallOrder;
        const [platformSetupOrder] = jest.mocked(platformSetup).mock.invocationCallOrder;
        expect(onyxInitOrder).toBeLessThan(paginationRegistrationOrder);
        expect(paginationRegistrationOrder).toBeLessThan(platformSetupOrder);
    });
});
