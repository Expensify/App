import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InvoiceReceiver} from '@src/types/onyx/Report';
import {createExpenseReport, createInvoiceRoom} from '../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const accountID = 12345;
const mockPolicyID = '123';
const activeReportID = 12;
const archivedReportID = 233;
const activeBusinessReportID = 456;
const archivedBusinessReportID = 789;
const activeBusinessPolicyID = 'active_policy_123';
const archivedBusinessPolicyID = 'archived_policy_456';
const activeIndividualInvoiceReceiver: InvoiceReceiver = {
    accountID,
    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
};

const archivedIndividualReportInvoiceReceiver: InvoiceReceiver = {
    accountID: 67890,
    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
};

const archivedReportNameValuePairs = {
    private_isArchived: '12-3-2024',
};

const activeBusinessInvoiceReceiver: InvoiceReceiver = {
    policyID: activeBusinessPolicyID,
    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
};

const archivedBusinessInvoiceReceiver: InvoiceReceiver = {
    policyID: archivedBusinessPolicyID,
    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
};

const mockActiveIndividualInvoiceReport = {...createInvoiceRoom(activeReportID), invoiceReceiver: activeIndividualInvoiceReceiver, policyID: mockPolicyID};
const mockArchivedIndividualInvoiceReport = {...createInvoiceRoom(archivedReportID), invoiceReceiver: archivedIndividualReportInvoiceReceiver, policyID: mockPolicyID};
const mockActiveBusinessInvoiceReport = {...createInvoiceRoom(activeBusinessReportID), invoiceReceiver: activeBusinessInvoiceReceiver, policyID: activeBusinessPolicyID};
const mockArchivedBusinessInvoiceReport = {...createInvoiceRoom(archivedBusinessReportID), invoiceReceiver: archivedBusinessInvoiceReceiver, policyID: archivedBusinessPolicyID};

describe('useParticipantsInvoiceReport', () => {
    describe('Individual Invoice Receiver', () => {
        beforeEach(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        afterEach(async () => {
            await act(async () => {
                await Onyx.clear();
            });
            await waitForBatchedUpdatesWithAct();
        });

        it('should return the invoice report when there is an active individual invoice report', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockActiveIndividualInvoiceReport?.reportID}`, mockActiveIndividualInvoiceReport);
            });

            const {result, rerender} = renderHook(({receiverID, receiverType, policyID}) => useParticipantsInvoiceReport(receiverID, receiverType, policyID), {
                initialProps: {receiverID: accountID, receiverType: activeIndividualInvoiceReceiver.type, policyID: mockPolicyID},
            });

            // Should return the active individual invoice report when receiverID, receiverType, and policyID match
            expect(result.current).toEqual(mockActiveIndividualInvoiceReport);

            // Should return undefined when the receiverID does not match
            const differentReceiverID = 99999;
            rerender({receiverID: differentReceiverID, receiverType: activeIndividualInvoiceReceiver.type, policyID: mockPolicyID});
            expect(result.current).toBeUndefined();

            // Should return undefined when when policyID does not match
            const differentPolicyID = 'different_policyID_999807';
            rerender({receiverID: accountID, receiverType: activeIndividualInvoiceReceiver.type, policyID: differentPolicyID});
            expect(result.current).toBeUndefined();
        });

        it('should return undefined when the invoice report is archived', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockArchivedIndividualInvoiceReport?.reportID}`, mockArchivedIndividualInvoiceReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockArchivedIndividualInvoiceReport?.reportID}`, archivedReportNameValuePairs);
            });

            const {result} = renderHook(({receiverID, receiverType, policyID}) => useParticipantsInvoiceReport(receiverID, receiverType, policyID), {
                initialProps: {receiverID: archivedIndividualReportInvoiceReceiver.accountID, receiverType: archivedIndividualReportInvoiceReceiver.type, policyID: mockPolicyID},
            });

            // Should return undefined when the invoice report is archived
            expect(result.current).toBeUndefined();
        });

        it('should return undefined when the report is not an invoice report', async () => {
            const expenseReport = {...createExpenseReport(5645), invoiceReceiver: activeIndividualInvoiceReceiver, policyID: mockPolicyID};
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            });

            const {result} = renderHook(({receiverID, receiverType, policyID}) => useParticipantsInvoiceReport(receiverID, receiverType, policyID), {
                initialProps: {receiverID: accountID, receiverType: activeIndividualInvoiceReceiver.type, policyID: mockPolicyID},
            });

            expect(result.current).toBeUndefined();
        });
    });

    describe('Business Invoice Receiver', () => {
        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        afterAll(async () => {
            await act(async () => {
                await Onyx.clear();
            });
            await waitForBatchedUpdatesWithAct();
        });

        it('should return the invoice report when there is an active business invoice report', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockActiveBusinessInvoiceReport?.reportID}`, mockActiveBusinessInvoiceReport);
            });

            const {result, rerender} = renderHook(({receiverID, receiverType, policyID}) => useParticipantsInvoiceReport(receiverID, receiverType, policyID), {
                initialProps: {receiverID: activeBusinessInvoiceReceiver.policyID, receiverType: activeBusinessInvoiceReceiver.type, policyID: activeBusinessPolicyID},
            });

            // Should return the active business invoice report when receiverID, receiverType, and policyID match
            expect(result.current).toEqual(mockActiveBusinessInvoiceReport);

            // Should return undefined when business policyID does not match
            const differentBusinessPolicyID = 'different_business_policy_123';
            rerender({receiverID: differentBusinessPolicyID, receiverType: activeBusinessInvoiceReceiver.type, policyID: activeBusinessPolicyID});
            expect(result.current).toBeUndefined();
        });

        it('should return undefined when the invoice report is archived', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockArchivedBusinessInvoiceReport?.reportID}`, mockArchivedBusinessInvoiceReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockArchivedBusinessInvoiceReport?.reportID}`, archivedReportNameValuePairs);
            });

            const {result} = renderHook(({receiverID, receiverType, policyID}) => useParticipantsInvoiceReport(receiverID, receiverType, policyID), {
                initialProps: {receiverID: archivedBusinessInvoiceReceiver.policyID, receiverType: archivedBusinessInvoiceReceiver.type, policyID: archivedBusinessPolicyID},
            });

            // Should return undefined when the business invoice report is archived
            expect(result.current).toBeUndefined();
        });
    });
});
