import {renderHook} from '@testing-library/react-native';

import {cancelAllSpans, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {cancelAllSendMessageSpans, cancelSendMessagePhases, startSendMessagePhase} from '@libs/telemetry/sendMessageSpans';
import useSendMessageSpanMarks from '@libs/telemetry/useSendMessageSpanMarks';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => {
    const endOrder: string[] = [];
    return {
        startInactiveSpan: (options: {op?: string}) => ({
            op: options?.op,
            attributes: {} as Record<string, unknown>,
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
        }),
        spanToJSON: (span: {attributes: Record<string, unknown>}) => ({data: span.attributes}),
        endOrder,
    };
});

function getEndOrder() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (Sentry as unknown as {endOrder: string[]}).endOrder;
}

function startSendSpan(reportActionID: string) {
    return startSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`, {
        name: 'send-message-visible',
        op: CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE,
    });
}

function buildForeignSpanIDThatSlicesToReportActionID(reportActionID: string) {
    return `${'OtherSpanFamily_'.padEnd(CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE.length + 1, 'x')}${reportActionID}`;
}

function startSendWithOpenPropagate(reportActionID: string) {
    startSendSpan(reportActionID);
    startSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
}

afterEach(() => {
    cancelAllSpans();
    getEndOrder().length = 0;
});

describe('useSendMessageSpanMarks', () => {
    it('closes Propagate and opens PostCommit while mounting', () => {
        startSendWithOpenPropagate('1');

        renderHook(() => useSendMessageSpanMarks('1'));

        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_1`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT}_1`)).toBeDefined();
    });

    it('ends the open phase before the parent when the returned handler runs', () => {
        startSendWithOpenPropagate('2');

        const {result} = renderHook(() => useSendMessageSpanMarks('2'));
        result.current();

        expect(getEndOrder()).toEqual([CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT, CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE]);
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_2`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT}_2`)).toBeUndefined();
    });

    it('leaves other sends alone', () => {
        startSendWithOpenPropagate('3');

        const {result} = renderHook(() => useSendMessageSpanMarks('4'));
        result.current();

        expect(getEndOrder()).toEqual([]);
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_3`)).toBeDefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_3`)).toBeDefined();
    });
});

describe('startSendMessagePhase', () => {
    it('does not start a phase when the parent send span is not active', () => {
        startSendMessagePhase('10', CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);

        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_10`)).toBeUndefined();
    });

    it('does not start a phase against a parent whose id was built from an undefined reportActionID', () => {
        startSendSpan('undefined');

        startSendMessagePhase(undefined, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);

        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_undefined`)).toBeUndefined();
    });
});

describe('cancelSendMessagePhases', () => {
    it('is a no-op for an undefined parent span id', () => {
        startSendWithOpenPropagate('20');

        expect(() => cancelSendMessagePhases(undefined)).not.toThrow();

        expect(getEndOrder()).toEqual([]);
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_20`)).toBeDefined();
    });

    it('is a no-op for a span id from another family', () => {
        startSendWithOpenPropagate('21');

        cancelSendMessagePhases(buildForeignSpanIDThatSlicesToReportActionID('21'));
        cancelSendMessagePhases('SomeOtherSpan_21');

        expect(getEndOrder()).toEqual([]);
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_21`)).toBeDefined();
    });

    it('cancels the open phases but leaves the parent to its own caller', () => {
        startSendWithOpenPropagate('22');

        cancelSendMessagePhases(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_22`);

        expect(getEndOrder()).toEqual([CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE]);
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_22`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_22`)).toBeDefined();
    });
});

describe('cancelAllSendMessageSpans', () => {
    it('sweeps an open phase before its parent', () => {
        startSendWithOpenPropagate('30');

        cancelAllSendMessageSpans();

        expect(getEndOrder()).toEqual([CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE, CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE]);
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_30`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_30`)).toBeUndefined();
    });

    it('sweeps a PostCommit phase left open by a row that never laid out', () => {
        startSendWithOpenPropagate('31');
        renderHook(() => useSendMessageSpanMarks('31'));
        getEndOrder().length = 0;

        cancelAllSendMessageSpans();

        expect(getEndOrder()).toEqual([CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT, CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE]);
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT}_31`)).toBeUndefined();
    });

    it('sweeps every send in flight', () => {
        startSendWithOpenPropagate('32');
        startSendWithOpenPropagate('33');

        cancelAllSendMessageSpans();

        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_32`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_33`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_32`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_33`)).toBeUndefined();
    });

    it('leaves spans outside the send-message family alone', () => {
        startSendWithOpenPropagate('34');
        startSpan('ManualOpenReport_34', {name: 'open-report', op: 'ManualOpenReport'});

        cancelAllSendMessageSpans();

        expect(getEndOrder()).not.toContain('ManualOpenReport');
        expect(getSpan('ManualOpenReport_34')).toBeDefined();
    });
});
