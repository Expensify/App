import type * as RequestModule from '@libs/Request';
import {addMiddleware} from '@libs/Request';

import appSetup from '@src/setup';

jest.mock('@expensify/react-native-hybrid-app', () => ({isHybridApp: () => false}));

jest.mock('@libs/Request', () => ({
    ...jest.requireActual<typeof RequestModule>('@libs/Request'),
    addMiddleware: jest.fn(),
}));

jest.mock('@libs/registerReportActionsPagination', () => jest.fn());
jest.mock('@libs/IntlPolyfill', () => jest.fn());
jest.mock('@userActions/Device', () => ({setDeviceID: jest.fn()}));
jest.mock('@userActions/OnyxDerived', () => jest.fn());
jest.mock('@src/setup/addUtilsToWindow', () => jest.fn());
jest.mock('@src/setup/platformSetup', () => jest.fn());
jest.mock('@src/setup/telemetry', () => jest.fn());

describe('src/setup attaches the API middlewares', () => {
    it('registers all 22 middlewares when the composition root runs', () => {
        // Given the composition root has not run yet
        expect(jest.mocked(addMiddleware)).not.toHaveBeenCalled();

        // When app setup runs
        appSetup();

        // Then it registers the full middleware chain
        expect(jest.mocked(addMiddleware)).toHaveBeenCalledTimes(22);
    });
});
