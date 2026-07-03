import usePayChatReportActions from '@hooks/usePayChatReportActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const INITIAL_CHAT_REPORT_ID = '1';
const B2B_INVOICE_REPORT_ID = '2';

function buildReport(reportID: string, overrides: Partial<Report> = {}): Report {
    return {
        reportID,
        chatType: undefined,
        ...overrides,
    } as Report;
}

function buildIndividualInvoiceRoom(reportID: string): Report {
    return buildReport(reportID, {
        chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
        invoiceReceiver: {
            type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
            accountID: 99,
        },
    });
}

const initialChatReportActions = {a1: {...createRandomReportAction(1), reportActionID: 'a1'}};
const b2bInvoiceReportActions = {b1: {...createRandomReportAction(2), reportActionID: 'b1'}};

async function seedReportActions() {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${INITIAL_CHAT_REPORT_ID}`, initialChatReportActions);
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${B2B_INVOICE_REPORT_ID}`, b2bInvoiceReportActions);
}

describe('usePayChatReportActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns initial chat report actions when payAsBusiness is false', async () => {
        await seedReportActions();
        const initialChatReport = buildIndividualInvoiceRoom(INITIAL_CHAT_REPORT_ID);
        const existingB2BInvoiceReport = buildReport(B2B_INVOICE_REPORT_ID);

        const {result} = renderHook(() => usePayChatReportActions(initialChatReport, existingB2BInvoiceReport));

        await waitFor(() => {
            expect(result.current(false)).toEqual(initialChatReportActions);
        });
    });

    it('returns initial chat report actions when payAsBusiness is undefined', async () => {
        await seedReportActions();
        const initialChatReport = buildIndividualInvoiceRoom(INITIAL_CHAT_REPORT_ID);
        const existingB2BInvoiceReport = buildReport(B2B_INVOICE_REPORT_ID);

        const {result} = renderHook(() => usePayChatReportActions(initialChatReport, existingB2BInvoiceReport));

        await waitFor(() => {
            expect(result.current(undefined)).toEqual(initialChatReportActions);
        });
    });

    it('returns b2b invoice report actions when paying as business from an individual invoice room', async () => {
        await seedReportActions();
        const initialChatReport = buildIndividualInvoiceRoom(INITIAL_CHAT_REPORT_ID);
        const existingB2BInvoiceReport = buildReport(B2B_INVOICE_REPORT_ID);

        const {result} = renderHook(() => usePayChatReportActions(initialChatReport, existingB2BInvoiceReport));

        await waitFor(() => {
            expect(result.current(true)).toEqual(b2bInvoiceReportActions);
        });
    });

    it('falls back to initial chat report actions when payAsBusiness is true but no b2b invoice report exists', async () => {
        await seedReportActions();
        const initialChatReport = buildIndividualInvoiceRoom(INITIAL_CHAT_REPORT_ID);

        const {result} = renderHook(() => usePayChatReportActions(initialChatReport, undefined));

        await waitFor(() => {
            expect(result.current(true)).toEqual(initialChatReportActions);
        });
    });

    it('falls back to initial chat report actions when chat is not an individual invoice room', async () => {
        await seedReportActions();
        const initialChatReport = buildReport(INITIAL_CHAT_REPORT_ID, {chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM});
        const existingB2BInvoiceReport = buildReport(B2B_INVOICE_REPORT_ID);

        const {result} = renderHook(() => usePayChatReportActions(initialChatReport, existingB2BInvoiceReport));

        await waitFor(() => {
            expect(result.current(true)).toEqual(initialChatReportActions);
        });
    });

    it('falls back to initial chat report actions for a business invoice room (not individual)', async () => {
        await seedReportActions();
        const initialChatReport = buildReport(INITIAL_CHAT_REPORT_ID, {
            chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                policyID: 'some-policy',
            },
        });
        const existingB2BInvoiceReport = buildReport(B2B_INVOICE_REPORT_ID);

        const {result} = renderHook(() => usePayChatReportActions(initialChatReport, existingB2BInvoiceReport));

        await waitFor(() => {
            expect(result.current(true)).toEqual(initialChatReportActions);
        });
    });
});
