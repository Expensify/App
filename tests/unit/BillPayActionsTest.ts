import {createBill} from '@libs/actions/BillPay';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

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
});
