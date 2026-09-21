import onyxDerivedComputeDurationFilter, {MIN_ONYX_DERIVED_COMPUTE_DURATION_MS} from '@libs/telemetry/middlewares/onyxDerivedComputeDurationFilter';

import CONST from '@src/CONST';

import type {TransactionEvent} from '@sentry/core';

const COMPUTE_OP = CONST.TELEMETRY.SPAN_ONYX_DERIVED_COMPUTE;

type ChildSpan = NonNullable<TransactionEvent['spans']>[number];

function buildChildSpan(op: string, durationMs: number | undefined, derivedKey?: string): ChildSpan {
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
        span_id: 'c',
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
        trace_id: 'b',
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
        start_timestamp: 100,
        // Sentry timestamps are in seconds, so a millisecond duration is a fraction of a second.
        timestamp: durationMs === undefined ? undefined : 100 + durationMs / 1000,
        data: derivedKey ? {derivedKey} : {},
        op,
    };
}

function buildTransaction(spans?: ChildSpan[]): TransactionEvent {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
    return {type: 'transaction', contexts: {trace: {span_id: 'a', trace_id: 'b', op: 'ManualAppStartup'}}, spans};
}

describe('onyxDerivedComputeDurationFilter', () => {
    it('drops a recompute that finished faster than the threshold', async () => {
        // Given a transaction with a recompute span that took less than the threshold
        const event = buildTransaction([buildChildSpan(COMPUTE_OP, MIN_ONYX_DERIVED_COMPUTE_DURATION_MS - 1)]);

        // When the filter processes it
        const result = await onyxDerivedComputeDurationFilter(event, {});

        // Then the span is gone, because a recompute that costs less than a frame is not worth reporting
        expect(result?.spans).toHaveLength(0);
    });

    it('keeps a recompute that reached the threshold', async () => {
        // Given a transaction with a recompute span at exactly the threshold
        const event = buildTransaction([buildChildSpan(COMPUTE_OP, MIN_ONYX_DERIVED_COMPUTE_DURATION_MS, 'derivedKey')]);

        // When the filter processes it
        const result = await onyxDerivedComputeDurationFilter(event, {});

        // Then it survives, because these are the recomputes that can drop a frame
        expect(result?.spans).toHaveLength(1);
        expect(result?.spans?.at(0)?.data?.derivedKey).toBe('derivedKey');
    });

    it('keeps fast spans with a different op', async () => {
        // Given a transaction with a fast span that is not a recompute
        const event = buildTransaction([buildChildSpan('http.client', 1)]);

        // When the filter processes it
        const result = await onyxDerivedComputeDurationFilter(event, {});

        // Then it is untouched, because the threshold only applies to recomputes
        expect(result?.spans).toHaveLength(1);
        expect(result?.spans?.at(0)?.op).toBe('http.client');
    });

    it('keeps a recompute span that never ended', async () => {
        // Given a recompute span with no end timestamp
        const event = buildTransaction([buildChildSpan(COMPUTE_OP, undefined)]);

        // When the filter processes it
        const result = await onyxDerivedComputeDurationFilter(event, {});

        // Then it survives, because there is no duration to compare against the threshold
        expect(result?.spans).toHaveLength(1);
    });

    it('returns a transaction without spans unchanged', async () => {
        // Given a transaction that carries no child spans
        const event = buildTransaction();

        // When the filter processes it
        const result = await onyxDerivedComputeDurationFilter(event, {});

        // Then the event passes straight through
        expect(result).toBe(event);
    });
});
