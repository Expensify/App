import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useInvoiceChatByParticipants from '@hooks/useInvoiceChatByParticipants';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InvoiceReceiver} from '@src/types/onyx/Report';
import {createExpenseReport, createInvoiceRoom} from '../utils/collections/reports';

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

describe('useInvoiceChatByParticipants', () => {
    describe('Individual Invoice Receiver', () => {
        beforeEach(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        afterEach(() => {
            Onyx.clear();
        });

        it('should return the invoice report when there is an active individual invoice report', async () => {
            // Given that there is an active (not archived) individual invoice room with a matching invoice receiver
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockActiveIndividualInvoiceReport?.reportID}`, mockActiveIndividualInvoiceReport);

            // When sending invoice to the same receiver from FAB flow (outside of invoice room)
            const {result, rerender} = renderHook(({receiverID, receiverType, policyID}) => useInvoiceChatByParticipants(receiverID, receiverType, policyID), {
                initialProps: {receiverID: accountID, receiverType: activeIndividualInvoiceReceiver.type, policyID: mockPolicyID},
            });

            // Then invoice should be sent in the same invoice room
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
            // Given that there is an archived individual invoice room with a matching invoice receiver
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockArchivedIndividualInvoiceReport?.reportID}`, mockArchivedIndividualInvoiceReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockArchivedIndividualInvoiceReport?.reportID}`, archivedReportNameValuePairs);

            // When sending invoice to the same receiver from FAB flow (outside of invoice room)
            const {result} = renderHook(({receiverID, receiverType, policyID}) => useInvoiceChatByParticipants(receiverID, receiverType, policyID), {
                initialProps: {receiverID: archivedIndividualReportInvoiceReceiver.accountID, receiverType: archivedIndividualReportInvoiceReceiver.type, policyID: mockPolicyID},
            });

            // Then invoice should not be sent in the archived invoice room
            expect(result.current).toBeUndefined();
        });

        it('should return undefined when the report is not an invoice report', async () => {
            const expenseReport = {...createExpenseReport(5645), invoiceReceiver: activeIndividualInvoiceReceiver, policyID: mockPolicyID};
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);

            const {result} = renderHook(({receiverID, receiverType, policyID}) => useInvoiceChatByParticipants(receiverID, receiverType, policyID), {
                initialProps: {receiverID: accountID, receiverType: activeIndividualInvoiceReceiver.type, policyID: mockPolicyID},
            });

            expect(result.current).toBeUndefined();
        });
    });

    describe('Business Invoice Receiver', () => {
        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        afterAll(() => {
            Onyx.clear();
        });

        it('should return the invoice report when there is an active business invoice report', async () => {
            // Given that there is an active (not archived) business invoice room with a matching invoice receiver
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockActiveBusinessInvoiceReport?.reportID}`, mockActiveBusinessInvoiceReport);

            // When paying invoice as a business from an individual invoice room
            const {result, rerender} = renderHook(({receiverID, receiverType, policyID}) => useInvoiceChatByParticipants(receiverID, receiverType, policyID), {
                initialProps: {receiverID: activeBusinessInvoiceReceiver.policyID, receiverType: activeBusinessInvoiceReceiver.type, policyID: activeBusinessPolicyID},
            });

            // The paid invoice should be sent in the business invoice room
            expect(result.current).toEqual(mockActiveBusinessInvoiceReport);

            // Should return undefined when business policyID does not match
            const differentBusinessPolicyID = 'different_business_policy_123';
            rerender({receiverID: differentBusinessPolicyID, receiverType: activeBusinessInvoiceReceiver.type, policyID: activeBusinessPolicyID});
            expect(result.current).toBeUndefined();
        });

        it('should return undefined when the invoice report is archived', async () => {
            // Given that there is an archived business invoice room with a matching invoice receiver
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockArchivedBusinessInvoiceReport?.reportID}`, mockArchivedBusinessInvoiceReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockArchivedBusinessInvoiceReport?.reportID}`, archivedReportNameValuePairs);

            // When paying invoice as a business from an individual invoice room
            const {result} = renderHook(({receiverID, receiverType, policyID}) => useInvoiceChatByParticipants(receiverID, receiverType, policyID), {
                initialProps: {receiverID: archivedBusinessInvoiceReceiver.policyID, receiverType: archivedBusinessInvoiceReceiver.type, policyID: archivedBusinessPolicyID},
            });

            // Then invoice should not be sent in the archived invoice room
            expect(result.current).toBeUndefined();
        });
    });
});
