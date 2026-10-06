import {createBill} from '@libs/actions/BillPay';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/API');
jest.mock('@libs/Navigation/Navigation');

describe('Bill Pay actions', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sends the vendor email using the field accepted by Bill_Create', () => {
        // Given a manually entered bill whose vendor email must pass the same request filter as Classic.
        const vendorEmail = 'sender@example.com';

        // When the plus menu creates the bill with client report IDs.
        createBill({domain: 'receiver.com', vendorEmail, merchant: 'Gardening supplies', amount: 1250, currency: CONST.CURRENCY.USD, date: '2026-10-05'}, 170);

        // Then Bill_Create receives submitterEmail instead of the vendorEmail field that Web removes.
        expect(write).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_BILL, expect.objectContaining({submitterEmail: vendorEmail}), expect.anything());
        const request = jest.mocked(write).mock.calls.at(-1)?.[1];
        expect(request).toHaveProperty('reportID', expect.any(String));
        expect(request).toHaveProperty('invoiceReportID', expect.any(String));
        expect(request).not.toHaveProperty('vendorEmail');
    });

    it('stores the optimistic invoice link as a report name value pair', () => {
        // Given a bill created from the plus menu, whose link to its invoice is a standard rNVP on the backend.
        createBill({domain: 'receiver.com', vendorEmail: 'sender@example.com', merchant: 'Gardening supplies', amount: 1250, currency: CONST.CURRENCY.USD, date: '2026-10-05'}, 170);

        // When the request queues its optimistic data.
        const [, request, onyxData] = jest.mocked(write).mock.calls.at(-1) ?? [];
        const reportID = request && 'reportID' in request ? String(request.reportID) : '';
        const invoiceReportID = request && 'invoiceReportID' in request ? request.invoiceReportID : undefined;

        // Then the link goes to reportNameValuePairs, where the backend sends it, and not onto the report.
        expect(onyxData?.optimisticData).toEqual(
            expect.arrayContaining([expect.objectContaining({key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, value: {invoiceID: invoiceReportID}})]),
        );
        expect(onyxData?.optimisticData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.REPORT}${reportID}`)?.value).not.toHaveProperty('invoiceID');
    });
});
