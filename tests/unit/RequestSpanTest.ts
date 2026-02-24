import * as Sentry from '@sentry/react-native';
import type {Middleware} from '@src/libs/Request';
import * as Request from '@src/libs/Request';
import type * as OnyxTypes from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type MockSpan = {
    name: string;
    op: string;
    parentSpan: unknown;
    attributes: Record<string, unknown>;
    statusCode: number | undefined;
    statusMessage: string | undefined;
    ended: boolean;
    setStatus: jest.Mock;
    end: jest.Mock;
};

jest.mock('@sentry/react-native', () => ({
    setUser: jest.fn(),
    startInactiveSpan: jest.fn((options: {name: string; op: string; parentSpan?: unknown; attributes?: Record<string, unknown>}) => {
        const span = {
            name: options.name,
            op: options.op,
            parentSpan: options.parentSpan,
            attributes: options.attributes ?? {},
            statusCode: undefined as number | undefined,
            statusMessage: undefined as string | undefined,
            ended: false,
            setStatus: jest.fn(({code, message}: {code: number; message?: string}) => {
                span.statusCode = code;
                span.statusMessage = message;
            }),
            end: jest.fn(() => {
                span.ended = true;
            }),
        };
        return span;
    }),
}));

jest.mock('@src/libs/Network/NetworkStore', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = jest.requireActual<typeof import('@src/libs/Network/NetworkStore')>('@src/libs/Network/NetworkStore');
    return {
        ...actual,
        hasReadRequiredDataFromStorage: jest.fn(() => Promise.resolve()),
    };
});

jest.mock('@src/libs/Network/SequentialQueue', () => ({
    getProcessSpan: jest.fn(() => 'mock-process-span'),
    flush: jest.fn(),
}));

beforeAll(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
});

beforeEach(() => {
    Request.clearMiddlewares();
    (Sentry.startInactiveSpan as jest.Mock).mockClear();
});

const request: OnyxTypes.AnyRequest = {
    command: 'MockCommand',
    data: {authToken: 'testToken'},
};

function getMockSpans(): MockSpan[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (Sentry.startInactiveSpan as jest.Mock).mock.results.map((r) => r.value as MockSpan);
}

function findSpan(op: string): MockSpan | undefined {
    return getMockSpans().find((s) => s.op === op);
}

describe('Request.ts Sentry spans', () => {
    test('creates outerSpan, middlewaresSpan, and xhrSpan on success and ends them with code 1', async () => {
        await waitForBatchedUpdates();
        const result = await Request.processWithMiddleware(request);

        expect(result).toBeDefined();

        const outerSpan = findSpan('ManualProcessWithMiddleware');
        const middlewaresSpan = findSpan('ManualProcessMiddlewares');
        const xhrSpan = findSpan('ManualHttpXhr');

        expect(outerSpan).toBeDefined();
        expect(middlewaresSpan).toBeDefined();
        expect(xhrSpan).toBeDefined();

        expect(outerSpan?.name).toBe('ManualProcessWithMiddleware');
        expect(middlewaresSpan?.name).toBe('ManualProcessMiddlewares');
        expect(xhrSpan?.name).toBe('ManualHttpXhr');

        expect(outerSpan?.attributes).toHaveProperty('command', 'MockCommand');
        expect(middlewaresSpan?.attributes).toHaveProperty('command', 'MockCommand');
        expect(xhrSpan?.attributes).toHaveProperty('command', 'MockCommand');

        for (const span of [outerSpan, middlewaresSpan, xhrSpan]) {
            expect(span?.statusCode).toBe(1);
            expect(span?.ended).toBe(true);
        }
    });

    test('sets all span statuses to code 2 when fetch rejects', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('network failure')));

        await waitForBatchedUpdates();
        await expect(Request.processWithMiddleware(request)).rejects.toThrow('network failure');

        const outerSpan = findSpan('ManualProcessWithMiddleware');
        const middlewaresSpan = findSpan('ManualProcessMiddlewares');
        const xhrSpan = findSpan('ManualHttpXhr');

        for (const span of [outerSpan, middlewaresSpan, xhrSpan]) {
            expect(span?.statusCode).toBe(2);
            expect(span?.ended).toBe(true);
        }

        expect(xhrSpan?.statusMessage).toBe('network failure');
    });

    test('parentSpan is undefined when not from sequential queue', async () => {
        await waitForBatchedUpdates();
        await Request.processWithMiddleware(request, false);

        const outerSpan = findSpan('ManualProcessWithMiddleware');
        expect(outerSpan).toBeDefined();
        expect(outerSpan?.parentSpan).toBeUndefined();
        expect(outerSpan?.attributes).toHaveProperty('is_from_sequential_queue', false);
    });

    test('parentSpan is set when from sequential queue', async () => {
        await waitForBatchedUpdates();
        await Request.processWithMiddleware(request, true);

        const outerSpan = findSpan('ManualProcessWithMiddleware');
        expect(outerSpan).toBeDefined();
        expect(outerSpan?.parentSpan).toBe('mock-process-span');
        expect(outerSpan?.attributes).toHaveProperty('is_from_sequential_queue', true);
    });

    test('middlewaresSpan is child of outerSpan', async () => {
        await waitForBatchedUpdates();
        await Request.processWithMiddleware(request);

        const outerSpan = findSpan('ManualProcessWithMiddleware');
        const middlewaresSpan = findSpan('ManualProcessMiddlewares');
        expect(outerSpan).toBeDefined();
        expect(middlewaresSpan).toBeDefined();
        expect(middlewaresSpan?.parentSpan).toBe(outerSpan);
    });

    test('xhrSpan is child of outerSpan', async () => {
        await waitForBatchedUpdates();
        await Request.processWithMiddleware(request);

        const xhrSpan = findSpan('ManualHttpXhr');
        const outerSpan = findSpan('ManualProcessWithMiddleware');
        expect(outerSpan).toBeDefined();
        expect(xhrSpan).toBeDefined();
        expect(xhrSpan?.parentSpan).toBe(outerSpan);
    });

    test('per-middleware child spans are created with correct parent and op', async () => {
        const mw1: Middleware = (promise) => promise;
        const mw2: Middleware = (promise) => promise;
        Request.addMiddleware(mw1, 'Alpha');
        Request.addMiddleware(mw2, 'Beta');

        await waitForBatchedUpdates();
        await Request.processWithMiddleware(request);

        const middlewaresSpan = findSpan('ManualProcessMiddlewares');
        const alphaSpan = findSpan('middleware.Alpha');
        const betaSpan = findSpan('middleware.Beta');

        expect(alphaSpan).toBeDefined();
        expect(betaSpan).toBeDefined();

        expect(alphaSpan?.name).toBe('Alpha');
        expect(alphaSpan?.op).toBe('middleware.Alpha');
        expect(alphaSpan?.parentSpan).toBe(middlewaresSpan);
        expect(alphaSpan?.attributes).toHaveProperty('command', 'MockCommand');

        expect(betaSpan?.name).toBe('Beta');
        expect(betaSpan?.op).toBe('middleware.Beta');
        expect(betaSpan?.parentSpan).toBe(middlewaresSpan);

        // 3 base spans + 2 middleware spans = 5 total
        expect(getMockSpans()).toHaveLength(5);

        for (const span of [alphaSpan, betaSpan]) {
            expect(span?.statusCode).toBe(1);
            expect(span?.ended).toBe(true);
        }
    });

    test('middleware span gets code 2 when middleware throws', async () => {
        const failingMiddleware: Middleware = () => Promise.reject(new Error('middleware broke'));
        Request.addMiddleware(failingMiddleware, 'Failing');

        await waitForBatchedUpdates();
        await expect(Request.processWithMiddleware(request)).rejects.toThrow('middleware broke');

        const failingSpan = findSpan('middleware.Failing');
        expect(failingSpan).toBeDefined();
        expect(failingSpan?.statusCode).toBe(2);
        expect(failingSpan?.statusMessage).toBe('middleware broke');
        expect(failingSpan?.ended).toBe(true);
    });
});
