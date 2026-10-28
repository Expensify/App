import {renderHook} from '@testing-library/react-native';

import {cancelAllSpans, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {cancelSendMessagePhases, cancelSendMessageSpansForReport, startSendMessagePhase, startSendMessageVisibleSpan} from '@libs/telemetry/sendMessageSpans';
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

const REPORT_ID = '1';
const CONCIERGE_THREAD_REPORT_ID = '2';

function startSendSpan(reportActionID: string, visibleReportID = REPORT_ID) {
    startSendMessageVisibleSpan(reportActionID, visibleReportID, {
        name: 'send-message-visible',
        op: CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE,
    });
}

function buildForeignSpanIDThatSlicesToReportActionID(reportActionID: string) {
    return `${'OtherSpanFamily_'.padEnd(CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE.length + 1, 'x')}${reportActionID}`;
}

function startSendWithOpenPropagate(reportActionID: string, visibleReportID = REPORT_ID) {
    startSendSpan(reportActionID, visibleReportID);
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

describe('cancelSendMessageSpansForReport', () => {
    it('sweeps an open phase before its parent', () => {
        // Given a send whose Propagate phase is still open
        startSendWithOpenPropagate('30');

        // When the user leaves the report it was sent in
        cancelSendMessageSpansForReport(REPORT_ID);

        // Then the phase ends first, because Sentry drops descendants that are still open when the root ends
        expect(getEndOrder()).toEqual([CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE, CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE]);
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_30`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_30`)).toBeUndefined();
    });

    it('sweeps a PostCommit phase left open by a row that never laid out', () => {
        // Given a send whose row committed but never laid out, leaving PostCommit open
        startSendWithOpenPropagate('31');
        renderHook(() => useSendMessageSpanMarks('31'));
        getEndOrder().length = 0;

        // When the user leaves the report
        cancelSendMessageSpansForReport(REPORT_ID);

        // Then PostCommit is swept with its parent so it does not leak
        expect(getEndOrder()).toEqual([CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT, CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE]);
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT}_31`)).toBeUndefined();
    });

    it('sweeps every send in flight for the report', () => {
        // Given two sends in flight in the same report
        startSendWithOpenPropagate('32');
        startSendWithOpenPropagate('33');

        // When the user leaves that report
        cancelSendMessageSpansForReport(REPORT_ID);

        // Then both sends and their phases are cancelled
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_32`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_33`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_32`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_33`)).toBeUndefined();
    });

    it('leaves spans outside the send-message family alone', () => {
        // Given a send and an unrelated open-report span
        startSendWithOpenPropagate('34');
        startSpan('ManualOpenReport_34', {name: 'open-report', op: 'ManualOpenReport'});

        // When the user leaves the report
        cancelSendMessageSpansForReport(REPORT_ID);

        // Then only the send-message spans are swept
        expect(getEndOrder()).not.toContain('ManualOpenReport');
        expect(getSpan('ManualOpenReport_34')).toBeDefined();
    });

    it('keeps a Concierge send handed off to its thread alive when the Concierge chat goes away', () => {
        // Given a respond-in-thread send typed in the Concierge chat, which renders in the new thread
        startSendWithOpenPropagate('35', CONCIERGE_THREAD_REPORT_ID);

        // When the side panel swaps the Concierge chat for the thread
        cancelSendMessageSpansForReport(REPORT_ID);

        // Then the send keeps measuring, so it can end when the message lays out in the thread
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_35`)).toBeDefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_35`)).toBeDefined();
    });

    it('cancels a handed-off send when the user leaves the thread before it renders', () => {
        // Given a respond-in-thread send that has not rendered yet
        startSendWithOpenPropagate('36', CONCIERGE_THREAD_REPORT_ID);

        // When the user leaves the thread
        cancelSendMessageSpansForReport(CONCIERGE_THREAD_REPORT_ID);

        // Then the send is cancelled instead of being orphaned
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_36`)).toBeUndefined();
        expect(getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE}_36`)).toBeUndefined();
    });
});
