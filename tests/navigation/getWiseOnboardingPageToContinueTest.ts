import getWiseOnboardingPageToContinue from '@libs/Navigation/helpers/getWiseOnboardingPageToContinue';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {BankAccount} from '@src/types/onyx';
import type {BankAccountAdditionalData} from '@src/types/onyx/BankAccount';

function createBusinessBankAccount(globalReimbursementProvider: BankAccountAdditionalData['globalReimbursementProvider'], wise: BankAccountAdditionalData['wise']): BankAccount {
    return {
        bankCurrency: CONST.CURRENCY.USD,
        bankCountry: CONST.COUNTRY.US,
        accountData: {
            bankAccountID: 456,
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            additionalData: {currency: CONST.CURRENCY.USD, isGlobalReimbursementEnabled: false, globalReimbursementProvider, wise},
        },
    };
}

describe('getWiseOnboardingPageToContinue', () => {
    it.each([
        ['the onboarding, for one left before Submit', createBusinessBankAccount(CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, undefined), DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute()],
        [
            'the status page, when Wise needs more info',
            createBusinessBankAccount(CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED}),
            DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path,
        ],
        ['nothing, while Wise reviews the business', createBusinessBankAccount(CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, {status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW}), undefined],
        ['nothing, for an onboarding that has not started', createBusinessBankAccount(undefined, undefined), undefined],
    ])('picks %s', (_label, bankAccount, expectedPage) => {
        // Given a bank account at some point of its Wise onboarding
        // When the intro decides where its button leads
        // Then it continues on the page where the admin has something to do, and leaves the admin to start over when there is nothing
        expect(getWiseOnboardingPageToContinue(bankAccount)).toBe(expectedPage);
    });
});
