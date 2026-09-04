import type * as RequestModule from '@libs/Request';
import {addMiddleware} from '@libs/Request';

jest.mock('@libs/Request', () => ({
    ...jest.requireActual<typeof RequestModule>('@libs/Request'),
    addMiddleware: jest.fn(),
}));

describe('src/setup attaches the API middlewares', () => {
    it('registers all 13 middlewares at module scope when the composition root loads', () => {
        expect(jest.mocked(addMiddleware)).not.toHaveBeenCalled();

        require('@src/setup');

        expect(jest.mocked(addMiddleware)).toHaveBeenCalledTimes(13);
    });
});
