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

const mockActiveIndividualInvoiceReport = {...createInvoiceRoom(activeReportID), invoiceReceiver: activeIndividualInvoiceReceiver, policyID: mockPolicyID};
const mockArchivedIndividualInvoiceReport = {...createInvoiceRoom(archivedReportID), invoiceReceiver: archivedIndividualReportInvoiceReceiver, policyID: mockPolicyID};

describe('useInvoiceChatByParticipants', () => {
    describe('Individual Invoice Reciever', () => {
        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        afterAll(() => {
            Onyx.clear();
        });

        it('should return the invoice report when there is an active individual invoice report', async () => {
            // Given that there is an active (not archived) individual invoice room with an invoice receiver
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockActiveIndividualInvoiceReport?.reportID}`, mockActiveIndividualInvoiceReport);

            // When sending invoice to the same receiver from FAB flow (outside of invoice room)
            const {result} = renderHook(({receiverID, receiverType, policyID}) => useInvoiceChatByParticipants(receiverID, receiverType, policyID), {
                initialProps: {receiverID: accountID, receiverType: activeIndividualInvoiceReceiver.type, policyID: mockPolicyID},
            });

            // Then invoice should be sent in the same invoice room
            expect(result.current).toEqual(mockActiveIndividualInvoiceReport);
        });

        it('should return undefined when the invoice report is archived', async () => {
            // Given that there is an archived individual invoice room with an invoice receiver
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockArchivedIndividualInvoiceReport?.reportID}`, mockArchivedIndividualInvoiceReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockArchivedIndividualInvoiceReport?.reportID}`, archivedReportNameValuePairs);

            // When sending invoice to the same receiver from FAB flow (outside of invoice room)
            const {result} = renderHook(({receiverID, receiverType, policyID}) => useInvoiceChatByParticipants(receiverID, receiverType, policyID), {
                initialProps: {receiverID: archivedIndividualReportInvoiceReceiver.accountID, receiverType: archivedIndividualReportInvoiceReceiver.type, policyID: mockPolicyID},
            });

            // Then invoice should not be sent in the archived invoice room
            expect(result.current).toBeUndefined();
        });
    });
});
