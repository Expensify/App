import Onyx from 'react-native-onyx';
import getPrimaryAction from '@libs/ReportPrimaryActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'tester@mail.com';

const SESSION = {
    email: CURRENT_USER_EMAIL,
    accountID: CURRENT_USER_ACCOUNT_ID,
};

const REPORT_ID = 1;

describe('getPrimaryAction', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        await Onyx.merge(ONYXKEYS.SESSION, SESSION);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return SUBMIT for expense report', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        expect(getPrimaryAction(report, {} as Policy, [], [])).toBe(CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
    });
});
