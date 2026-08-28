import type * as RequestModule from '@libs/Request';
import {addMiddleware} from '@libs/Request';

jest.mock('@libs/Request', () => ({
    ...jest.requireActual<typeof RequestModule>('@libs/Request'),
    addMiddleware: jest.fn(),
}));

/**
 * Guards the wiring the API <-> Middleware cycle fix depends on: loading the app's composition root must
 * attach the API middlewares. index.js reaches src/setup at module scope (index.js:11) and tests reach it
 * through tests/utils/TestHelper.ts, so if this holds, every entry point that loads src/setup is covered.
 *
 * Without this, a dropped `import '@libs/Middleware/register'` in src/setup fails silently:
 * processWithMiddleware would run the XHR and return the raw response with nothing applied to Onyx.
 */
describe('src/setup attaches the API middlewares', () => {
    it('registers all 13 middlewares at module scope when the composition root loads', () => {
        expect(jest.mocked(addMiddleware)).not.toHaveBeenCalled();

        require('@src/setup');

        // Module scope, so they are attached by the import alone, before additionalAppSetup() is invoked.
        expect(jest.mocked(addMiddleware)).toHaveBeenCalledTimes(13);
    });
});
