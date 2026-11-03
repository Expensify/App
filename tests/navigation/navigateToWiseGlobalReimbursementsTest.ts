import navigateToWiseGlobalReimbursements, {getWiseOnboardingPageToContinue} from '@libs/Navigation/helpers/navigateToWiseGlobalReimbursements';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {BankAccount} from '@src/types/onyx';
import type {BankAccountAdditionalData} from '@src/types/onyx/BankAccount';

// Runs the callback right away, as if the intro had finished opening
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn((_route: string, options?: {afterTransition?: () => void}) => options?.afterTransition?.()),
}));

const INTRO_ROUTE = 'r/123/global-reimbursements/456' as Route;

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

describe('navigateToWiseGlobalReimbursements', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('opens only the intro when there is no onboarding to continue', () => {
        // Given a bank account whose onboarding has not started
        // When an entry point opens global reimbursements over a report
        navigateToWiseGlobalReimbursements(INTRO_ROUTE, undefined, {skipMatchingFullScreenRoute: true});

        // Then the intro opens, so the admin starts with Get started
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(INTRO_ROUTE, {skipMatchingFullScreenRoute: true});
    });

    it('opens the page that continues the onboarding on top of the intro', () => {
        // Given a bank account whose onboarding the admin left before Submit
        // When an entry point opens global reimbursements over a report
        navigateToWiseGlobalReimbursements(INTRO_ROUTE, DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute(), {skipMatchingFullScreenRoute: true});

        // Then the intro opens first, since the page on top takes its bank account and back path from the intro, and once it is open the onboarding
        // opens without a page, so it reopens on the first one left unanswered
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, INTRO_ROUTE, expect.objectContaining({skipMatchingFullScreenRoute: true}));
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, 'r/123/global-reimbursements/456/business-onboarding');
    });
});

describe('getWiseOnboardingPageToContinue', () => {
    it.each([
        ['the onboarding, for one left before Submit', createBusinessBankAccount(CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, undefined), DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute()],
        [
            'the more info page, when Wise needs more info',
            createBusinessBankAccount(CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED}),
            DYNAMIC_ROUTES.WISE_MORE_INFO_NEEDED.path,
        ],
        ['nothing, while Wise reviews the business', createBusinessBankAccount(CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, {status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW}), undefined],
        ['nothing, for an onboarding that has not started', createBusinessBankAccount(undefined, undefined), undefined],
    ])('picks %s', (_label, bankAccount, expectedPage) => {
        // Given a bank account at some point of its Wise onboarding
        // When an entry point decides what to open on top of the intro
        // Then it opens the page where the admin has something to do, and only the intro when there is nothing
        expect(getWiseOnboardingPageToContinue(bankAccount)).toBe(expectedPage);
    });
});
