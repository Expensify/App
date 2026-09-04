import {renderHook} from '@testing-library/react-native';

import {getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {startSendMessagePhase} from '@libs/telemetry/sendMessageSpans';
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

function startSendWithOpenPropagate(reportActionID: string) {
    startSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`, {
        name: 'send-message-visible',
        op: CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE,
    });
    startSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
}

afterEach(() => {
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
