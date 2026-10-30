import {act, render} from '@testing-library/react-native';

import EnableGlobalReimbursementsPayModal from '@components/EnableGlobalReimbursementsPayModal';
import {LocaleContextProvider} from '@components/LocaleContextProvider';

import navigateToWiseGlobalReimbursements from '@libs/Navigation/helpers/navigateToWiseGlobalReimbursements';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount} from '@src/types/onyx';
import type {BankAccountAdditionalData} from '@src/types/onyx/BankAccount';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/helpers/navigateToWiseGlobalReimbursements', () => jest.fn());

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => 'r/123'),
}));

jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true, isBetaEnabledOrUnknown: () => true})));

jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn()})));

jest.mock('@components/LockedAccountModalProvider', () => ({
    useLockedAccountState: () => ({isAccountLocked: false}),
    useLockedAccountActions: () => ({showLockedAccountModal: jest.fn()}),
}));

const BANK_ACCOUNT_ID = 9053192;

function createBusinessBankAccount(wise: BankAccountAdditionalData['wise']): BankAccount {
    return {
        bankCurrency: CONST.CURRENCY.USD,
        bankCountry: CONST.COUNTRY.US,
        accountData: {
            bankAccountID: BANK_ACCOUNT_ID,
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            additionalData: {currency: CONST.CURRENCY.USD, isGlobalReimbursementEnabled: false, wise},
        },
    };
}

describe('EnableGlobalReimbursementsPayModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it.each([
        ['continues the onboarding the admin left before Submit', undefined, String(BANK_ACCOUNT_ID), true],
        ['opens the intro for an account that has not started', undefined, undefined, false],
        ['opens the intro for a submitted onboarding, which has nothing to continue', {status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW}, String(BANK_ACCOUNT_ID), false],
    ])('%s when Pay is blocked', async (_label, wise, onboardingDraftBankAccountID, shouldContinueOnboarding) => {
        // Given an admin with the Wise beta and a USD business account that is not set up for global reimbursements, and the onboarding draft on this device
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: createBusinessBankAccount(wise)});
            await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, onboardingDraftBankAccountID ? {bankAccountID: onboardingDraftBankAccountID} : null);
        });
        render(
            <LocaleContextProvider>
                <EnableGlobalReimbursementsPayModal />
            </LocaleContextProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When paying a report from that account is blocked
        await act(async () => {
            await Onyx.set(ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL, {bankAccountID: BANK_ACCOUNT_ID, bankCountry: CONST.COUNTRY.US, bankCurrency: CONST.CURRENCY.USD});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the intro opens over the report, with the onboarding on top of it only when the admin can pick it up where they left
        expect(navigateToWiseGlobalReimbursements).toHaveBeenCalledWith(`r/123/global-reimbursements/${BANK_ACCOUNT_ID}`, shouldContinueOnboarding, {skipMatchingFullScreenRoute: true});
    });
});
