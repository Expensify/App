import {renderHook} from '@testing-library/react-native';

import useCancelSendMessageSpanOnSkeleton from '@hooks/useCancelSendMessageSpanOnSkeleton';

import {cancelAllSpans, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {startSendMessagePhase} from '@libs/telemetry/sendMessageSpans';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

type SpanStartListener = (span: unknown) => void;

jest.mock('@sentry/react-native', () => {
    const spanStartListeners = new Set<SpanStartListener>();
    const endOrder: string[] = [];
    const client = {
        on: (hook: string, callback: SpanStartListener) => {
            if (hook !== 'spanStart') {
                return () => {};
            }
            spanStartListeners.add(callback);
            return () => spanStartListeners.delete(callback);
        },
    };
    return {
        getClient: () => client,
        startInactiveSpan: (options: {op?: string; attributes?: Record<string, unknown>}) => {
            const span = {
                op: options?.op,
                attributes: {...(options?.attributes ?? {})} as Record<string, unknown>,
                setAttribute(key: string, value: unknown) {
                    this.attributes[key] = value;
                },
                setAttributes(attrs: Record<string, unknown>) {
                    Object.assign(this.attributes, attrs);
                },
                setStatus() {},
                end() {
                    endOrder.push(this.op ?? '');
                },
            };
            // The real SDK emits spanStart synchronously during span creation, before startInactiveSpan returns.
            for (const listener of spanStartListeners) {
                listener(span);
            }
            return span;
        },
        spanToJSON: (span: {op?: string; attributes: Record<string, unknown>}) => ({op: span.op, data: span.attributes}),
        endOrder,
    };
});

function getEndOrder() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (Sentry as unknown as {endOrder: string[]}).endOrder;
}

/** Start a send-message span the way the composer does, for a given report. Returns the (typed-as-Sentry) span. */
function sendMessageWhileLoading(reportID: string) {
    const spanID = `${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${Math.random()}`;
    const span = startSpan(spanID, {
        name: 'send-message-visible',
        op: CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE,
        attributes: {[CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: reportID},
    });
    return {spanID, span};
}

/** Flush the queueMicrotask the hook schedules before cancelling. */
function flushMicrotasks() {
    return Promise.resolve();
}

afterEach(() => {
    cancelAllSpans();
    getEndOrder().length = 0;
});

describe('useCancelSendMessageSpanOnSkeleton', () => {
    it('cancels a send-message span sent while the skeleton for that report is showing', async () => {
        renderHook(() => useCancelSendMessageSpanOnSkeleton('reportA', CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_LOADING));

        const {spanID, span} = sendMessageWhileLoading('reportA');
        if (!span) {
            throw new Error('Expected a span to be started');
        }
        await flushMicrotasks();

        const {data} = Sentry.spanToJSON(span);
        expect(data[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBe(true);
        expect(data[CONST.TELEMETRY.ATTRIBUTE_CANCELED_BY_SKELETON]).toBe(CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_LOADING);
        // Truly cancelled: ended and removed from the tracking map.
        expect(getSpan(spanID)).toBeUndefined();
    });

    it('does NOT cancel a send-message span for a different report (two reports open, one loading)', async () => {
        renderHook(() => useCancelSendMessageSpanOnSkeleton('loadingReport', CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_LOADING));

        const {spanID, span} = sendMessageWhileLoading('otherReport');
        if (!span) {
            throw new Error('Expected a span to be started');
        }
        await flushMicrotasks();

        expect(Sentry.spanToJSON(span).data[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBeUndefined();
        expect(getSpan(spanID)).toBeDefined();
    });

    it('does NOT cancel spans of a different op', async () => {
        renderHook(() => useCancelSendMessageSpanOnSkeleton('reportOp', CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_LOADING));

        const spanID = `not-send-message_${Math.random()}`;
        const span = startSpan(spanID, {name: 'other', op: 'ManualOpenReport', attributes: {[CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: 'reportOp'}});
        if (!span) {
            throw new Error('Expected a span to be started');
        }
        await flushMicrotasks();

        expect(Sentry.spanToJSON(span).data[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBeUndefined();
        expect(getSpan(spanID)).toBeDefined();
    });

    it('does NOT cancel spans started after the skeleton unmounts', async () => {
        const {unmount} = renderHook(() => useCancelSendMessageSpanOnSkeleton('reportUnmount', CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_LOADING));
        unmount();

        const {spanID, span} = sendMessageWhileLoading('reportUnmount');
        if (!span) {
            throw new Error('Expected a span to be started');
        }
        await flushMicrotasks();

        expect(Sentry.spanToJSON(span).data[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBeUndefined();
        expect(getSpan(spanID)).toBeDefined();
    });

    it('cancels a phase opened before the deferred cancel runs, and cancels it before its parent', async () => {
        renderHook(() => useCancelSendMessageSpanOnSkeleton('reportPhases', CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_LOADING));

        const reportActionID = `${Math.random()}`;
        const parentSpanID = `${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`;
        startSpan(parentSpanID, {
            name: 'send-message-visible',
            op: CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE,
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: 'reportPhases'},
        });
        startSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);

        const phaseSpanID = `${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_${reportActionID}`;
        const phaseSpan = getSpan(phaseSpanID);
        if (!phaseSpan) {
            throw new Error('Expected the phase span to be started while the parent was still registered');
        }

        await flushMicrotasks();

        expect(Sentry.spanToJSON(phaseSpan).data[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBe(true);
        expect(getSpan(phaseSpanID)).toBeUndefined();
        expect(getSpan(parentSpanID)).toBeUndefined();

        // Sentry drops a child still running when its parent ends.
        expect(getEndOrder()).toEqual([CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE, CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE]);
    });

    it('does nothing without a reportID', async () => {
        renderHook(() => useCancelSendMessageSpanOnSkeleton(undefined, CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_LOADING));

        const {spanID, span} = sendMessageWhileLoading('reportNoId');
        if (!span) {
            throw new Error('Expected a span to be started');
        }
        await flushMicrotasks();

        expect(Sentry.spanToJSON(span).data[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBeUndefined();
        expect(getSpan(spanID)).toBeDefined();
    });
});
