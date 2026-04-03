import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import {getBankAccountIDAsNumber, getRouteForCurrentStep, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '../../src/libs/ReimbursementAccountUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import type {ACHDataReimbursementAccount} from '../../src/types/onyx/ReimbursementAccount';

Onyx.init({keys: ONYXKEYS});

describe('ReimbursementAccountUtils', () => {
    describe('getRouteForCurrentStep', () => {
        it("should return 'new' step if 'BankAccountStep' or '' is provided", () => {
            expect(getRouteForCurrentStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)).toEqual(REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW);
            expect(getRouteForCurrentStep('')).toEqual(REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW);
        });
    });

    describe('getBankAccountIDAsNumber', () => {
        it('should return DEFAULT_NUMBER_ID when achData is undefined', () => {
            // Given no ACH data
            // When resolving the numeric bank account id
            const result = getBankAccountIDAsNumber(undefined);
            // Then we default to CONST.DEFAULT_NUMBER_ID
            expect(result).toBe(CONST.DEFAULT_NUMBER_ID);
        });

        it('should return DEFAULT_NUMBER_ID when bankAccountID is undefined on achData', () => {
            // Given achData without bank account id
            // When resolving the numeric bank account id
            const result = getBankAccountIDAsNumber({} as ACHDataReimbursementAccount);
            // Then we default to CONST.DEFAULT_NUMBER_ID
            expect(result).toBe(CONST.DEFAULT_NUMBER_ID);
        });

        it('should return the existing bankAccountID when present', () => {
            // Given achData with a bank account id
            // When resolving the numeric bank account id
            const result = getBankAccountIDAsNumber({bankAccountID: 42} as ACHDataReimbursementAccount);
            // Then we return that id (not the default)
            expect(result).toBe(42);
        });
    });
});
