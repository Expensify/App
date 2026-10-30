import payBill from '@libs/actions/BillPay';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

jest.mock('@libs/API');

describe('Bill Pay actions', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('marks a bill as paid with MarkReimbursed', () => {
        // Given a bill the payer marked as paid outside Expensify
        const bill = {reportID: '123', stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};

        // When the bulk payment flow marks the bill as paid
        payBill(bill, CONST.IOU.PAYMENT_TYPE.ELSEWHERE);

        // Then the bill uses MarkReimbursed instead of PayMoneyRequest
        expect(write).toHaveBeenCalledWith(WRITE_COMMANDS.MARK_REIMBURSED, {reportID: '123', comment: ''}, expect.anything());
    });
});
