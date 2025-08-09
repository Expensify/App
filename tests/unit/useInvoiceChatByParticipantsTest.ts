import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useInvoiceChatByParticipants from '@hooks/useInvoiceChatByParticipants';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InvoiceReceiver} from '@src/types/onyx/Report';
import {createInvoiceRoom} from '../utils/collections/reports';

const accountID = 12345;
const mockPolicyID = '123';
const activeReportID = 12;
const archivedReportID = 233;
const invoiceReceiver: InvoiceReceiver = {
    accountID,
    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
};
const archivedReportInvoiceReceiver: InvoiceReceiver = {
    accountID: 67890,
    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
};

const archivedReportNameValuePairs = {
    private_isArchived: '12-3-2024',
};

const mockInvoiceReport = {...createInvoiceRoom(activeReportID), invoiceReceiver, policyID: mockPolicyID};
const mockArchivedInvoiceReport = {...createInvoiceRoom(archivedReportID), invoiceReceiver: archivedReportInvoiceReceiver, policyID: mockPolicyID};

describe('useInvoiceChatByParticipants', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterAll(() => {
        Onyx.clear();
    });

    it('should return the invoice report when there is an active individual invoice report', async () => {
        // Given that there is an active (not archived) individual invoice room with an invoice receiver
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockInvoiceReport?.reportID}`, mockInvoiceReport);

        // When sending invoice to the same receiver from FAB flow (outside of invoice room)
        const {result} = renderHook(({receiverID, receiverType, policyID}) => useInvoiceChatByParticipants(receiverID, receiverType, policyID), {
            initialProps: {receiverID: accountID, receiverType: invoiceReceiver.type, policyID: mockPolicyID},
        });

        // Then invoice should be sent in the same invoice room
        expect(result.current).toEqual(mockInvoiceReport);
    });

    it('should return undefined when the invoice report is archived', async () => {
        // Given that there is an archived individual invoice room with an invoice receiver
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockArchivedInvoiceReport?.reportID}`, mockArchivedInvoiceReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockArchivedInvoiceReport?.reportID}`, archivedReportNameValuePairs);

        // When sending invoice to the same receiver from FAB flow (outside of invoice room)
        const {result} = renderHook(({receiverID, receiverType, policyID}) => useInvoiceChatByParticipants(receiverID, receiverType, policyID), {
            initialProps: {receiverID: archivedReportInvoiceReceiver.accountID, receiverType: archivedReportInvoiceReceiver.type, policyID: mockPolicyID},
        });

        // Then invoice should not be sent in the archived invoice room
        expect(result.current).toBeUndefined();
    });
});
