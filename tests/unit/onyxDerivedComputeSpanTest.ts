import {cancelAllSpans, startSpan} from '@libs/telemetry/activeSpans';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {StartSpanOptions} from '@sentry/core';

import * as Sentry from '@sentry/react-native';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@sentry/react-native', () => {
    const startInactiveSpanCalls: unknown[] = [];
    return {
        startInactiveSpan: (options: {op?: string}) => {
            startInactiveSpanCalls.push(options);
            return {
                op: options?.op,
                attributes: {} as Record<string, unknown>,
                setAttribute(key: string, value: unknown) {
                    this.attributes[key] = value;
                },
                setAttributes(attrs: Record<string, unknown>) {
                    Object.assign(this.attributes, attrs);
                },
                setStatus() {},
                end() {},
            };
        },
        spanToJSON: (span: {attributes: Record<string, unknown>}) => ({data: span.attributes}),
        captureMessage: () => {},
        captureException: () => {},
        addBreadcrumb: () => {},
        getClient: () => undefined,
        getActiveSpan: () => undefined,
        startInactiveSpanCalls,
    };
});

const DERIVED_KEY = ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS;

function getStartInactiveSpanCalls() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (Sentry as unknown as {startInactiveSpanCalls: StartSpanOptions[]}).startInactiveSpanCalls;
}

function getComputeCallForDerivedKey(derivedKey: string) {
    return getStartInactiveSpanCalls().find((options) => options.op === CONST.TELEMETRY.SPAN_ONYX_DERIVED_COMPUTE && options.attributes?.derivedKey === derivedKey);
}

function startSendSpan(reportActionID: string) {
    return startSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`, {
        name: CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE,
        op: CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE,
    });
}

async function mergeTransactionToRecomputeDerivedKey(transactionID: string) {
    const transaction: Transaction = {...createRandomTransaction(1), transactionID, reportID: 'r1', amount: 100};
    await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
    await waitForBatchedUpdates();
}

describe('OnyxDerived compute span parenting', () => {
    beforeAll(async () => {
        jest.spyOn(console, 'debug').mockImplementation(() => {});
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        cancelAllSpans();
        getStartInactiveSpanCalls().length = 0;
    });

    it('nests a recompute under the only send span in flight and stamps the firing dependency', async () => {
        const sendSpan = startSendSpan('a1');
        getStartInactiveSpanCalls().length = 0;

        await mergeTransactionToRecomputeDerivedKey('A');

        const call = getComputeCallForDerivedKey(DERIVED_KEY);
        expect(call).toBeDefined();
        expect(call?.parentSpan).toBe(sendSpan);
        expect(call?.onlyIfParent).toBe(true);
        expect(call?.attributes?.triggeredKeys).toBe(ONYXKEYS.COLLECTION.TRANSACTION);
        expect(call?.attributes?.[CONST.TELEMETRY.ATTRIBUTE_IS_STARTUP]).toBe(false);
    });

    it('picks no parent when several sends are in flight', async () => {
        startSendSpan('a1');
        startSendSpan('a2');
        getStartInactiveSpanCalls().length = 0;

        await mergeTransactionToRecomputeDerivedKey('B');

        const call = getComputeCallForDerivedKey(DERIVED_KEY);
        expect(call).toBeDefined();
        expect(call?.parentSpan).toBeUndefined();
        expect(call?.onlyIfParent).toBe(true);
    });

    it('prefers the startup span over a send span', async () => {
        const startupSpan = startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {name: CONST.TELEMETRY.SPAN_APP_STARTUP});
        startSendSpan('a1');
        getStartInactiveSpanCalls().length = 0;

        await mergeTransactionToRecomputeDerivedKey('C');

        const call = getComputeCallForDerivedKey(DERIVED_KEY);
        expect(call?.parentSpan).toBe(startupSpan);
        expect(call?.attributes?.[CONST.TELEMETRY.ATTRIBUTE_IS_STARTUP]).toBe(true);
    });

    it('picks no parent when nothing is in flight', async () => {
        await mergeTransactionToRecomputeDerivedKey('D');

        const call = getComputeCallForDerivedKey(DERIVED_KEY);
        expect(call).toBeDefined();
        expect(call?.parentSpan).toBeUndefined();
    });
});
