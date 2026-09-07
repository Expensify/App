import type * as RequestModule from '@libs/Request';
import {addMiddleware} from '@libs/Request';

import appSetup from '@src/setup';

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
    it('registers all 14 middlewares when the composition root runs', () => {
        expect(jest.mocked(addMiddleware)).not.toHaveBeenCalled();

        appSetup();

        expect(jest.mocked(addMiddleware)).toHaveBeenCalledTimes(14);
    });
});
