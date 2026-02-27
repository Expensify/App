import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import {getRouteForCurrentStep, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '../../src/libs/ReimbursementAccountUtils';
import ONYXKEYS from '../../src/ONYXKEYS';

Onyx.init({keys: ONYXKEYS});

describe('ReimbursementAccountUtils', () => {
    describe('getRouteForCurrentStep', () => {
        it("should return 'new' step if 'BankAccountStep' or '' is provided", () => {
            expect(getRouteForCurrentStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)).toEqual(REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW);
            expect(getRouteForCurrentStep('')).toEqual(REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW);
        });
    });
});
