import maxDurationFilter from '@libs/telemetry/middlewares/maxDurationFilter';

import CONST from '@src/CONST';

import type {TransactionEvent} from '@sentry/core';

jest.mock('@libs/telemetry/activeSpans', () => ({
    cancelSpan: jest.fn(),
}));

const INBOX_OP = CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB;
const REPORTS_OP = CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS;
const SUBMIT_OP = CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE;

const OVER_CAP_SECONDS = 61;
const UNDER_CAP_SECONDS = 59;

type ChildSpan = NonNullable<TransactionEvent['spans']>[number];

function buildTransaction(op: string, durationSeconds: number, spans?: ChildSpan[]): TransactionEvent {
    return {
        type: 'transaction',
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
        contexts: {trace: {span_id: 'a', trace_id: 'b', op}},
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
        start_timestamp: 1000,
        timestamp: 1000 + durationSeconds,
        spans,
    };
}

function buildChildSpan(op: string, durationSeconds: number): ChildSpan {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
    return {span_id: 'c', trace_id: 'b', start_timestamp: 1000, timestamp: 1000 + durationSeconds, data: {}, op};
}

describe('maxDurationFilter', () => {
    it('drops an inbox tab navigation transaction over the duration cap', async () => {
        expect(await maxDurationFilter(buildTransaction(INBOX_OP, OVER_CAP_SECONDS), {})).toBeNull();
    });

    it('drops a reports tab navigation transaction over the duration cap', async () => {
        expect(await maxDurationFilter(buildTransaction(REPORTS_OP, OVER_CAP_SECONDS), {})).toBeNull();
    });

    it('drops a submit expense transaction over the duration cap', async () => {
        expect(await maxDurationFilter(buildTransaction(SUBMIT_OP, OVER_CAP_SECONDS), {})).toBeNull();
    });

    it('keeps a tab navigation transaction under the duration cap', async () => {
        const event = buildTransaction(INBOX_OP, UNDER_CAP_SECONDS);
        expect(await maxDurationFilter(event, {})).toBe(event);
    });

    it('keeps a transaction with an unrelated op over the duration cap', async () => {
        const event = buildTransaction('ManualAppStartup', OVER_CAP_SECONDS);
        const result = await maxDurationFilter(event, {});
        expect(result).not.toBeNull();
    });

    it('keeps a transaction without timestamps', async () => {
        const event: TransactionEvent = {
            type: 'transaction',
            // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
            contexts: {trace: {span_id: 'a', trace_id: 'b', op: INBOX_OP}},
        };
        expect(await maxDurationFilter(event, {})).toBe(event);
    });

    it('strips over-cap tab navigation child spans but keeps the rest', async () => {
        const event = buildTransaction('pageload', UNDER_CAP_SECONDS, [buildChildSpan(INBOX_OP, OVER_CAP_SECONDS), buildChildSpan('http.client', OVER_CAP_SECONDS)]);
        const result = await maxDurationFilter(event, {});
        expect(result?.spans).toHaveLength(1);
        expect(result?.spans?.at(0)?.op).toBe('http.client');
    });
});
