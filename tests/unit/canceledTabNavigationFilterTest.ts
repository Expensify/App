import canceledTabNavigationFilter from '@libs/telemetry/middlewares/canceledTabNavigationFilter';

import CONST from '@src/CONST';

import type {TransactionEvent} from '@sentry/core';

jest.mock('@libs/telemetry/activeSpans', () => ({
    cancelSpan: jest.fn(),
}));

const INBOX_OP = CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB;
const REPORTS_OP = CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS;
const CANCELED = CONST.TELEMETRY.ATTRIBUTE_CANCELED;

type ChildSpan = NonNullable<TransactionEvent['spans']>[number];
type SpanData = Record<string, string | number | boolean>;

function buildTransaction(op: string, data?: SpanData, spans?: ChildSpan[]): TransactionEvent {
    return {
        type: 'transaction',
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
        contexts: {trace: {span_id: 'a', trace_id: 'b', op, data}},
        spans,
    };
}

function buildChildSpan(op: string, data?: SpanData): ChildSpan {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
    return {span_id: 'c', trace_id: 'b', start_timestamp: 0, timestamp: 1, data: data ?? {}, op};
}

describe('canceledTabNavigationFilter', () => {
    it('drops a canceled inbox tab navigation transaction', async () => {
        expect(await canceledTabNavigationFilter(buildTransaction(INBOX_OP, {[CANCELED]: true}), {})).toBeNull();
    });

    it('drops a canceled reports tab navigation transaction', async () => {
        expect(await canceledTabNavigationFilter(buildTransaction(REPORTS_OP, {[CANCELED]: true}), {})).toBeNull();
    });

    it('drops a canceled tab navigation transaction when the attribute arrives stringified', async () => {
        expect(await canceledTabNavigationFilter(buildTransaction(INBOX_OP, {[CANCELED]: 'true'}), {})).toBeNull();
    });

    it('keeps a completed tab navigation transaction without the canceled attribute', async () => {
        const event = buildTransaction(INBOX_OP);
        expect(await canceledTabNavigationFilter(event, {})).toBe(event);
    });

    it('keeps a canceled transaction with an unrelated op', async () => {
        const event = buildTransaction('ManualAppStartup', {[CANCELED]: true});
        expect(await canceledTabNavigationFilter(event, {})).toBe(event);
    });

    it('strips canceled tab navigation child spans but keeps the rest', async () => {
        const event = buildTransaction('pageload', undefined, [buildChildSpan(INBOX_OP, {[CANCELED]: true}), buildChildSpan('http.client')]);
        const result = await canceledTabNavigationFilter(event, {});
        expect(result?.spans).toHaveLength(1);
        expect(result?.spans?.at(0)?.op).toBe('http.client');
    });
});
