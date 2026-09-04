import {
    FailureTracking,
    FraudMonitoring,
    handleDeletedAccount,
    HandleMovedScanFailedExpenses,
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
import registerMiddlewares from '@libs/Middleware/register';
import type * as RequestModule from '@libs/Request';
import {addMiddleware} from '@libs/Request';

jest.mock('@libs/Request', () => ({
    ...jest.requireActual<typeof RequestModule>('@libs/Request'),
    addMiddleware: jest.fn(),
}));

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
    HandleMovedScanFailedExpenses,
    SaveResponseInOnyx,
    FraudMonitoring,
];

describe('Middleware registration', () => {
    let registered: RequestModule.Middleware[] = [];

    beforeAll(() => {
        registerMiddlewares();
        registered = jest.mocked(addMiddleware).mock.calls.map(([middleware]) => middleware);
    });

    it('registers every middleware exactly once, in the documented order', () => {
        expect(registered).toEqual(EXPECTED_ORDER);
    });

    it('registers all 14 middlewares with no duplicates', () => {
        expect(registered).toHaveLength(14);
        expect(new Set(registered).size).toBe(14);
    });

    it('keeps SaveResponseInOnyx after every other Onyx-writing middleware and before FraudMonitoring', () => {
        const indexOf = (middleware: RequestModule.Middleware) => registered.indexOf(middleware);

        expect(indexOf(SaveResponseInOnyx)).toBeGreaterThanOrEqual(0);
        expect(indexOf(RecordFullReconnectTime)).toBeLessThan(indexOf(SaveResponseInOnyx));
        expect(indexOf(LoadPostDataForOpenOrReconnect)).toBeLessThan(indexOf(SaveResponseInOnyx));
        expect(indexOf(HandleMovedScanFailedExpenses)).toBeLessThan(indexOf(SaveResponseInOnyx));
        expect(indexOf(FraudMonitoring)).toBeGreaterThan(indexOf(SaveResponseInOnyx));
    });
});
