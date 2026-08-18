import appSetup from '@src/setup';

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
    it('starts report action pagination registration after initializing Onyx', async () => {
        const onyxInitSpy = jest.spyOn(Onyx, 'init');

        appSetup();
        await Promise.resolve();

        expect(mockRegisterReportActionsPagination).toHaveBeenCalledTimes(1);
        const [onyxInitOrder] = onyxInitSpy.mock.invocationCallOrder;
        const [paginationRegistrationOrder] = mockRegisterReportActionsPagination.mock.invocationCallOrder;
        expect(onyxInitOrder).toBeLessThan(paginationRegistrationOrder);
    });
});
