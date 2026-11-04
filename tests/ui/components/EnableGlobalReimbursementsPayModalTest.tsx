import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import EnableGlobalReimbursementsPayModal from '@components/EnableGlobalReimbursementsPayModal';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import LockedAccountModalProvider from '@components/LockedAccountModalProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount} from '@src/types/onyx';
import type {BankAccountAdditionalData} from '@src/types/onyx/BankAccount';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => 'r/123'),
}));

// The confirm modal is UI the global modal host renders, so the test only checks what it was asked to show
const mockShowConfirmModal = jest.fn(() => Promise.resolve({action: 'CLOSE'}));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: mockShowConfirmModal})));

const BANK_ACCOUNT_ID = 9053192;
const INTRO_ROUTE = `r/123/global-reimbursements/${BANK_ACCOUNT_ID}`;

function createBusinessBankAccount(globalReimbursementProvider: ValueOf<typeof CONST.GLOBAL_REIMBURSEMENT_PROVIDER> | undefined, wise: BankAccountAdditionalData['wise']): BankAccount {
    return {
        bankCurrency: CONST.CURRENCY.USD,
        bankCountry: CONST.COUNTRY.US,
        accountData: {
            bankAccountID: BANK_ACCOUNT_ID,
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            additionalData: {currency: CONST.CURRENCY.USD, isGlobalReimbursementEnabled: false, globalReimbursementProvider, wise},
        },
    };
}

// Renders the prompt the way the app mounts it, then blocks a Pay from the bank account
async function blockPay({betas = [CONST.BETAS.WISE_REIMBURSEMENTS], isAccountLocked = false, bankAccount = createBusinessBankAccount(undefined, undefined)} = {}) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.BETAS, betas);
        await Onyx.set(ONYXKEYS.NVP_PRIVATE_LOCK_ACCOUNT_DETAILS, {isLocked: isAccountLocked});
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: bankAccount});
    });
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, LockedAccountModalProvider]}>
            <EnableGlobalReimbursementsPayModal />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();

    await act(async () => {
        await Onyx.set(ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL, {bankAccountID: BANK_ACCOUNT_ID, bankCountry: CONST.COUNTRY.US, bankCurrency: CONST.CURRENCY.USD});
    });
    await waitForBatchedUpdatesWithAct();
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
        ['continues the onboarding the admin left before Submit', CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, undefined, 'business-onboarding'],
        ['opens the more info page when Wise needs more info', CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED}, 'more-info-needed'],
        ['opens the intro for an account that has not started', undefined, undefined, undefined],
        [
            'opens the intro while Wise reviews the business, which leaves nothing to continue',
            CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE,
            {status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW},
            undefined,
        ],
    ])('%s when Pay is blocked', async (_label, globalReimbursementProvider, wise, pageToContinue) => {
        // Given an admin on the Wise beta with a USD business account that is not set up for global reimbursements
        // When paying a report from that account is blocked
        await blockPay({bankAccount: createBusinessBankAccount(globalReimbursementProvider, wise)});

        // Then the intro opens over the report, or the page that picks up the onboarding with the intro beneath it when the admin has something to do
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        if (pageToContinue) {
            expect(Navigation.navigate).toHaveBeenCalledWith(`${INTRO_ROUTE}/${pageToContinue}`, expect.objectContaining({skipMatchingFullScreenRoute: true, dynamicRouteBase: INTRO_ROUTE}));
        } else {
            expect(Navigation.navigate).toHaveBeenCalledWith(INTRO_ROUTE, expect.objectContaining({skipMatchingFullScreenRoute: true}));
        }
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('asks to enable global reimbursements through Corpay without the Wise beta', async () => {
        // Given an admin who is not on the Wise beta, with an onboarding they could otherwise continue
        // When paying a report from that account is blocked
        await blockPay({betas: [], bankAccount: createBusinessBankAccount(CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, undefined)});

        // Then the Corpay prompt shows and nothing opens the Wise flow, since Wise is not released to that admin
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({id: 'corpayPayModal'}));
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('tells a locked account it is locked instead of opening the Wise flow', async () => {
        // Given an admin on the Wise beta whose account is locked, with an onboarding they could otherwise continue
        // When paying a report from that account is blocked
        await blockPay({isAccountLocked: true, bankAccount: createBusinessBankAccount(CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, undefined)});

        // Then the locked account message shows and nothing opens, since a locked account cannot set up global reimbursements
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.not.objectContaining({id: 'corpayPayModal'}));
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
