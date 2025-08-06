import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useInvoiceChatByParticipants from '@hooks/useInvoiceChatByParticipants';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InvoiceReceiver} from '@src/types/onyx/Report';
import {createInvoiceRoom} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Initailize Onyx

/* Test 1 Given that there is an active (not archived) individual invoice room, 
When I call useInvoiceChatByParticipants, 
Then it should return the invoice room. */

/* Test 2 Given that there is an archived individual invoice room,
 When I call  useInvoiceChatByParticipants, 
 Then it shouldn't return the invoice room
*/

const accountID = 12345;
const mockPolicyID = '123';
const invoiceReceiver: InvoiceReceiver = {
    accountID,
    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
};

const mockInvoiceReport = {...createInvoiceRoom(1), invoiceReceiver, policyID: mockPolicyID};

describe('useInvoiceChatByParticipants', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockInvoiceReport?.reportID}`, mockInvoiceReport);
        return waitForBatchedUpdates();
    });

    afterAll(() => {
        Onyx.clear();
    });

    it('should return the invoice report when there is an active individual invoice report', () => {
        const {result} = renderHook(({receiverID, receiverType, policyID}) => useInvoiceChatByParticipants(receiverID, receiverType, policyID), {
            initialProps: {receiverID: accountID, receiverType: invoiceReceiver.type, policyID: mockPolicyID},
        });

        const invoiceReport = result.current;
        expect(invoiceReport).toEqual(mockInvoiceReport);
    });
});
