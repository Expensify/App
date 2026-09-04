import {clearGlobalSpanAttributes, getGlobalSpanAttributes, setGlobalSpanAttribute} from '@libs/telemetry/globalSpanAttributes';
import attachGlobalSpanAttributes from '@libs/telemetry/middlewares/attachGlobalSpanAttributes';

import type {TransactionEvent} from '@sentry/core';

type ChildSpan = NonNullable<TransactionEvent['spans']>[number];
type SpanData = Record<string, string | number | boolean>;

function buildTransaction(data?: SpanData, spans?: ChildSpan[]): TransactionEvent {
    return {
        type: 'transaction',
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
        contexts: {trace: {span_id: 'a', trace_id: 'b', data}},
        spans,
    };
}

function buildChildSpan(data?: SpanData, parentSpanID = 'a'): ChildSpan {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
    return {span_id: 'c', trace_id: 'b', parent_span_id: parentSpanID, start_timestamp: 0, timestamp: 1, data: data ?? {}};
}

describe('attachGlobalSpanAttributes', () => {
    beforeEach(() => {
        clearGlobalSpanAttributes();
    });

    it('returns the event untouched when no global attributes are registered', async () => {
        const event = buildTransaction();
        expect(await attachGlobalSpanAttributes(event, {})).toBe(event);
    });

    it('stamps attributes onto the root trace context and every child span', async () => {
        setGlobalSpanAttribute('reportsCount', 42);
        setGlobalSpanAttribute('dbSource', 'sqlite');

        const result = await attachGlobalSpanAttributes(buildTransaction({rootOwn: 'keep'}, [buildChildSpan({childOwn: 'keep'}), buildChildSpan()]), {});

        expect(result?.contexts?.trace?.data).toEqual({rootOwn: 'keep', reportsCount: 42, dbSource: 'sqlite'});
        expect(result?.spans?.at(0)?.data).toEqual({childOwn: 'keep', reportsCount: 42, dbSource: 'sqlite'});
        expect(result?.spans?.at(1)?.data).toEqual({reportsCount: 42, dbSource: 'sqlite'});
    });

    it('stamps nested spans too, because the event lists all descendant spans in one flat array', async () => {
        setGlobalSpanAttribute('reportsCount', 42);

        const child = buildChildSpan();
        const grandchild = buildChildSpan(undefined, child.span_id);
        const result = await attachGlobalSpanAttributes(buildTransaction(undefined, [child, grandchild]), {});

        expect(result?.spans?.at(1)?.parent_span_id).toBe(child.span_id);
        expect(result?.spans?.at(1)?.data?.reportsCount).toBe(42);
    });

    it('keeps the latest registered value for an attribute', async () => {
        setGlobalSpanAttribute('reportsCount', 42);
        setGlobalSpanAttribute('reportsCount', 43);

        const result = await attachGlobalSpanAttributes(buildTransaction(), {});

        expect(result?.contexts?.trace?.data?.reportsCount).toBe(43);
    });

    it('does not overwrite an attribute a span already carries', async () => {
        setGlobalSpanAttribute('reportsCount', 42);

        const result = await attachGlobalSpanAttributes(buildTransaction({reportsCount: 7}, [buildChildSpan({reportsCount: 7})]), {});

        expect(result?.contexts?.trace?.data?.reportsCount).toBe(7);
        expect(result?.spans?.at(0)?.data?.reportsCount).toBe(7);
    });

    it('handles an event without child spans', async () => {
        setGlobalSpanAttribute('reportsCount', 42);

        const result = await attachGlobalSpanAttributes(buildTransaction(), {});

        expect(result?.contexts?.trace?.data?.reportsCount).toBe(42);
        expect(result?.spans).toBeUndefined();
    });

    it('clearGlobalSpanAttributes removes every attribute, so the event passes through untouched', async () => {
        setGlobalSpanAttribute('reportsCount', 42);
        setGlobalSpanAttribute('dbSource', 'sqlite');

        clearGlobalSpanAttributes();

        expect(getGlobalSpanAttributes()).toEqual({});
        const event = buildTransaction({rootOwn: 'keep'});
        expect(await attachGlobalSpanAttributes(event, {})).toBe(event);
    });
});
