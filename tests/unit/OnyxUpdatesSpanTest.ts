/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxKey} from 'react-native-onyx';
import type {OnyxUpdateEvent, OnyxUpdatesFromServer} from '@src/types/onyx';
import type Response from '@src/types/onyx/Response';

type MockSpan = {
    name: string;
    op: string;
    attributes: Record<string, unknown>;
    statusCode: number | undefined;
    statusMessage: string | undefined;
    ended: boolean;
    setStatus: jest.Mock;
    end: jest.Mock;
};

const mockSpans: MockSpan[] = [];

jest.mock('@sentry/react-native', () => ({
    startInactiveSpan: jest.fn((options: {name: string; op: string; parentSpan?: unknown; attributes?: Record<string, unknown>}) => {
        const span: MockSpan = {
            name: options.name,
            op: options.op,
            attributes: options.attributes ?? {},
            statusCode: undefined,
            statusMessage: undefined,
            ended: false,
            setStatus: jest.fn(({code, message}: {code: number; message?: string}) => {
                span.statusCode = code;
                span.statusMessage = message;
            }),
            end: jest.fn(() => {
                span.ended = true;
            }),
        };
        mockSpans.push(span);
        return span;
    }),
}));

jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {
        update: jest.fn(() => Promise.resolve()),
        merge: jest.fn(),
        connectWithoutView: jest.fn(),
    },
}));

jest.mock('@libs/PusherUtils', () => ({
    __esModule: true,
    default: {
        triggerMultiEventHandler: jest.fn(() => Promise.resolve()),
    },
}));

jest.mock('@libs/Performance', () => ({
    __esModule: true,
    default: {
        markStart: jest.fn(),
        markEnd: jest.fn(),
    },
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
    },
}));

jest.mock('@libs/telemetry/trackExpenseCreationError', () => ({
    trackExpenseApiError: jest.fn(),
}));

jest.mock('@src/libs/actions/QueuedOnyxUpdates', () => ({
    queueOnyxUpdates: jest.fn(() => Promise.resolve()),
}));

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const Onyx = jest.requireMock<{default: {update: jest.Mock; merge: jest.Mock; connectWithoutView: jest.Mock}}>('react-native-onyx').default;
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const PusherUtils = jest.requireMock<{default: {triggerMultiEventHandler: jest.Mock}}>('@libs/PusherUtils').default;

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const {apply} = require<typeof import('@src/libs/actions/OnyxUpdates')>('@src/libs/actions/OnyxUpdates');

function findSpan(op: string): MockSpan | undefined {
    return mockSpans.find((s) => s.op === op);
}

beforeEach(() => {
    mockSpans.length = 0;
    jest.clearAllMocks();
    Onyx.update.mockImplementation(() => Promise.resolve());
    PusherUtils.triggerMultiEventHandler.mockImplementation(() => Promise.resolve());
});

describe('OnyxUpdates.ts Sentry spans', () => {
    describe('applyHTTPSOnyxUpdates', () => {
        const httpsRequest = {command: 'TestCommand', data: {}};
        const httpsResponse: Response<OnyxKey> = {jsonCode: 200, onyxData: [{key: 'test', value: 'data', onyxMethod: 'merge'}]} as unknown as Response<OnyxKey>;

        function callHTTPS(overrides?: Partial<OnyxUpdatesFromServer<OnyxKey>>) {
            return apply({
                type: 'https',
                lastUpdateID: 1,
                request: httpsRequest,
                response: httpsResponse,
                ...overrides,
            } as OnyxUpdatesFromServer<OnyxKey>);
        }

        test('creates span with correct attributes and ends with code 1 on success', async () => {
            await callHTTPS();

            const span = findSpan('ManualApplyOnyxUpdates.https');
            expect(span).toBeDefined();
            expect(span?.name).toBe('ManualApplyOnyxUpdates');
            expect(span?.attributes).toHaveProperty('command', 'TestCommand');
            expect(span?.attributes).toHaveProperty('onyx_updates_count', 1);
            expect(span?.statusCode).toBe(1);
            expect(span?.ended).toBe(true);
        });

        test('ends span with code 2 when Onyx.update rejects', async () => {
            Onyx.update.mockRejectedValueOnce(new Error('update failed'));

            await expect(callHTTPS()).rejects.toThrow('update failed');

            const span = findSpan('ManualApplyOnyxUpdates.https');
            expect(span?.statusCode).toBe(2);
            expect(span?.statusMessage).toBe('update failed');
            expect(span?.ended).toBe(true);
        });
    });

    describe('applyPusherOnyxUpdates', () => {
        const pusherUpdates: Array<OnyxUpdateEvent<OnyxKey>> = [{eventType: 'testEvent', data: []}];

        function callPusher() {
            return apply({
                type: 'pusher',
                lastUpdateID: 2,
                updates: pusherUpdates,
            } as OnyxUpdatesFromServer<OnyxKey>);
        }

        test('creates span with correct attributes and ends with code 1 on success', async () => {
            await callPusher();

            const span = findSpan('ManualApplyOnyxUpdates.pusher');
            expect(span).toBeDefined();
            expect(span?.name).toBe('ManualApplyOnyxUpdates');
            expect(span?.attributes).toHaveProperty('onyx_updates_count', 1);
            expect(span?.statusCode).toBe(1);
            expect(span?.ended).toBe(true);
        });

        test('ends span with code 2 when PusherUtils rejects', async () => {
            PusherUtils.triggerMultiEventHandler.mockRejectedValueOnce(new Error('pusher failed'));

            await expect(callPusher()).rejects.toThrow('pusher failed');

            const span = findSpan('ManualApplyOnyxUpdates.pusher');
            expect(span?.statusCode).toBe(2);
            expect(span?.statusMessage).toBe('pusher failed');
            expect(span?.ended).toBe(true);
        });
    });

    describe('applyAirshipOnyxUpdates', () => {
        const airshipUpdates: Array<OnyxUpdateEvent<OnyxKey>> = [{eventType: 'airshipEvent', data: []}];

        function callAirship() {
            return apply({
                type: 'airship',
                lastUpdateID: 3,
                updates: airshipUpdates,
            } as OnyxUpdatesFromServer<OnyxKey>);
        }

        test('creates span with correct attributes and ends with code 1 on success', async () => {
            await callAirship();

            const span = findSpan('ManualApplyOnyxUpdates.airship');
            expect(span).toBeDefined();
            expect(span?.name).toBe('ManualApplyOnyxUpdates');
            expect(span?.attributes).toHaveProperty('onyx_updates_count', 1);
            expect(span?.statusCode).toBe(1);
            expect(span?.ended).toBe(true);
        });

        test('ends span with code 2 when Onyx.update rejects', async () => {
            Onyx.update.mockRejectedValueOnce(new Error('airship update failed'));

            await expect(callAirship()).rejects.toThrow('airship update failed');

            const span = findSpan('ManualApplyOnyxUpdates.airship');
            expect(span?.statusCode).toBe(2);
            expect(span?.statusMessage).toBe('airship update failed');
            expect(span?.ended).toBe(true);
        });
    });
});
