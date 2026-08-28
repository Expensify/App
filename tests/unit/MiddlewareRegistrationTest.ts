import {
    FailureTracking,
    FraudMonitoring,
    handleDeletedAccount,
    HandleUnusedOptimisticID,
    LoadPostDataForOpenOrReconnect,
    LoadTest,
    Logging,
    Pagination,
    Reauthentication,
    RecordFullReconnectTime,
    SaveResponseInOnyx,
    SentryServerTiming,
    SupportalPermission,
} from '@libs/Middleware';
import type * as RequestModule from '@libs/Request';
import {addMiddleware} from '@libs/Request';

jest.mock('@libs/Request', () => ({
    ...jest.requireActual<typeof RequestModule>('@libs/Request'),
    addMiddleware: jest.fn(),
}));

/**
 * The order of these registrations is load-bearing and documented in src/libs/Middleware/register.ts:
 * SaveResponseInOnyx must be the last middleware that writes Onyx, so RecordFullReconnectTime and
 * LoadPostDataForOpenOrReconnect have to precede it and FraudMonitoring has to follow it.
 *
 * Note this deliberately does not use jest.isolateModules: register.ts has to resolve the middleware
 * modules from the same registry this file imported them from, or the identity comparison below sees two
 * distinct copies of every function.
 */
const EXPECTED_ORDER: RequestModule.Middleware[] = [
    Logging,
    LoadTest,
    FailureTracking,
    Reauthentication,
    handleDeletedAccount,
    SupportalPermission,
    HandleUnusedOptimisticID,
    Pagination,
    SentryServerTiming,
    RecordFullReconnectTime,
    LoadPostDataForOpenOrReconnect,
    SaveResponseInOnyx,
    FraudMonitoring,
];

describe('Middleware registration', () => {
    let registered: RequestModule.Middleware[] = [];

    beforeAll(() => {
        // Imported for its side effect, which is the thing under test. require() keeps it in this file's
        // module registry so the registered functions are the same references imported above.
        require('@libs/Middleware/register');
        registered = jest.mocked(addMiddleware).mock.calls.map(([middleware]) => middleware);
    });

    it('registers every middleware exactly once, in the documented order', () => {
        expect(registered).toEqual(EXPECTED_ORDER);
    });

    it('registers all 13 middlewares with no duplicates', () => {
        expect(registered).toHaveLength(13);
        expect(new Set(registered).size).toBe(13);
    });

    it('keeps SaveResponseInOnyx after every other Onyx-writing middleware and before FraudMonitoring', () => {
        const indexOf = (middleware: RequestModule.Middleware) => registered.indexOf(middleware);

        expect(indexOf(SaveResponseInOnyx)).toBeGreaterThanOrEqual(0);
        expect(indexOf(RecordFullReconnectTime)).toBeLessThan(indexOf(SaveResponseInOnyx));
        expect(indexOf(LoadPostDataForOpenOrReconnect)).toBeLessThan(indexOf(SaveResponseInOnyx));
        expect(indexOf(FraudMonitoring)).toBeGreaterThan(indexOf(SaveResponseInOnyx));
    });
});
