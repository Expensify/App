import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, BankAccountList, Card, CardList} from '@src/types/onyx';
import type {BankAccountAdditionalData} from '@src/types/onyx/BankAccount';

import type {ValueOf} from 'type-fest';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

// Continue builds the intro on top of the screen it is pressed on, the Wallet
jest.mock('@libs/Navigation/helpers/getActiveRoute', () => ({
    __esModule: true,
    default: jest.fn(() => 'settings/wallet'),
}));

const DOMAIN_NAME = 'expensify.com';
const WISE_BANK_ACCOUNT_ID = 9053192;
const WISE_MORE_INFO_NEEDED_MESSAGE = 'More information needed to enable global reimbursements';

function createExpensifyCard(cardID: number, domainName: string, nameValuePairs: Partial<Card['nameValuePairs']> = {}): Card {
    return createMock<Card>({
        cardID,
        bank: CONST.EXPENSIFY_CARD.BANK,
        cardName: '',
        domainName,
        fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        lastFourPAN: String(cardID).padStart(4, '0'),
        availableSpend: 10000,
        nameValuePairs: createMock<Card['nameValuePairs']>({
            isVirtual: false,
            limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            unapprovedExpenseLimit: 10000,
            ...nameValuePairs,
        }),
    });
}

function createWiseBankAccountList(status: ValueOf<typeof CONST.WISE.ONBOARDING_STATUS>): BankAccountList {
    return {
        [WISE_BANK_ACCOUNT_ID]: createMock<BankAccount>({
            methodID: WISE_BANK_ACCOUNT_ID,
            bankCurrency: CONST.CURRENCY.USD,
            accountData: {
                bankAccountID: WISE_BANK_ACCOUNT_ID,
                accountNumber: 'XXXXXX1234',
                type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
                additionalData: {currency: CONST.CURRENCY.USD, wise: {status}},
            },
        }),
    };
}

function createCardList(...cards: Card[]): CardList {
    return Object.fromEntries(cards.map((card) => [String(card.cardID), card]));
}

// Renders the assigned cards list the same way the Wallet page does, with connection statuses on
const renderAssignedCardsList = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <PortalProvider>
                <PaymentMethodList
                    shouldShowAssignedCards
                    shouldShowConnectionStatus
                    shouldShowAddBankAccount={false}
                    onPress={() => {}}
                />
            </PortalProvider>
        </ComposeProviders>,
    );

function createBusinessBankAccount(bankAccountID: number, addressName: string, isGlobalReimbursementEnabled?: boolean): BankAccount {
    return createMock<BankAccount>({
        methodID: bankAccountID,
        title: addressName,
        bankCurrency: CONST.CURRENCY.USD,
        bankCountry: CONST.COUNTRY.US,
        accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        accountData: {
            bankAccountID,
            addressName,
            accountNumber: '1234',
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            additionalData: {currency: CONST.CURRENCY.USD, isGlobalReimbursementEnabled},
        },
    });
}

function createBankAccountList(...bankAccounts: BankAccount[]): BankAccountList {
    return Object.fromEntries(bankAccounts.map((bankAccount) => [String(bankAccount.methodID), bankAccount]));
}

function createWiseBusinessBankAccount(wise: BankAccountAdditionalData['wise']): BankAccount {
    const bankAccount = createBusinessBankAccount(WISE_BANK_ACCOUNT_ID, 'Chase Checking');
    return {
        ...bankAccount,
        accountData: {
            ...bankAccount.accountData,
            additionalData: {...bankAccount.accountData?.additionalData, globalReimbursementProvider: CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, wise},
        },
    };
}

// Renders the bank accounts list the same way the Wallet page does with the Wise beta on
const renderBankAccountsList = (shouldShowWiseSetupInProgress = true) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <PortalProvider>
                <PaymentMethodList
                    shouldShowConnectionStatus
                    shouldShowBankAccountSections
                    shouldShowAddBankAccount={false}
                    shouldShowWiseSetupInProgress={shouldShowWiseSetupInProgress}
                    onPress={() => {}}
                />
            </PortalProvider>
        </ComposeProviders>,
    );

describe('PaymentMethodList', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('shows the physical and virtual halves of a legacy combo card as one row', async () => {
        // Given a legacy combo card: a physical and a virtual Expensify Card on the same domain, with no custom title
        await act(async () => {
            await Onyx.set(ONYXKEYS.CARD_LIST, createCardList(createExpensifyCard(1, DOMAIN_NAME), createExpensifyCard(2, DOMAIN_NAME, {isVirtual: true})));
        });

        // When the Wallet's assigned cards list renders with connection statuses on
        renderAssignedCardsList();
        await waitForBatchedUpdatesWithAct();

        // Then both halves collapse into a single row, because they are the same card to the user
        expect(screen.getAllByText(CONST.EXPENSIFY_CARD.BANK)).toHaveLength(1);
        expect(screen.getAllByText(DOMAIN_NAME)).toHaveLength(1);
    });

    it('keeps an admin-issued virtual card on its own row', async () => {
        // Given a physical card and a separate virtual card an admin issued on the same domain
        await act(async () => {
            await Onyx.set(
                ONYXKEYS.CARD_LIST,
                createCardList(createExpensifyCard(1, DOMAIN_NAME), createExpensifyCard(2, DOMAIN_NAME, {isVirtual: true, issuedBy: 123, cardTitle: 'Admin virtual card'})),
            );
        });

        // When the Wallet's assigned cards list renders
        renderAssignedCardsList();
        await waitForBatchedUpdatesWithAct();

        // Then each card gets its own row, because an admin-issued virtual card is a distinct card
        expect(screen.getByText(CONST.EXPENSIFY_CARD.BANK)).toBeOnTheScreen();
        expect(screen.getByText('Admin virtual card')).toBeOnTheScreen();
    });

    it('asks the admin to review a bank account Wise needs more info on', async () => {
        // Given a business bank account Wise asked for more info on, with global reimbursements in beta
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.BETAS]: [CONST.BETAS.WISE_REIMBURSEMENTS],
                [ONYXKEYS.BANK_ACCOUNT_LIST]: createWiseBankAccountList(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED),
            });
        });

        // When the Wallet's bank account list renders
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();

        // Then the row asks for the info with a Review button, so the admin can send it and finish enabling global reimbursements
        expect(screen.getByText(WISE_MORE_INFO_NEEDED_MESSAGE)).toBeOnTheScreen();
        expect(screen.getByText('Review')).toBeOnTheScreen();

        // And the setup in progress line stays hidden, since the more info prompt already says what Wise waits on
        expect(screen.queryByText('Global reimbursements setup in progress.', {exact: false})).not.toBeOnTheScreen();
    });

    it('marks a bank account Wise needs more info on with the green dot', async () => {
        // Given a business bank account Wise asked for more info on, with global reimbursements in beta
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.BETAS]: [CONST.BETAS.WISE_REIMBURSEMENTS],
                [ONYXKEYS.BANK_ACCOUNT_LIST]: createWiseBankAccountList(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED),
            });
        });

        // When the Wallet's bank account list renders
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();

        // Then the row carries the brick road indicator, matching the green dot on Account > Wallet that led the admin here
        expect(screen.getByLabelText(/Your review is required/)).toBeOnTheScreen();
    });

    it('does not ask for more info once the admin sent it', async () => {
        // Given a business bank account whose Wise onboarding is back in review
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.BETAS]: [CONST.BETAS.WISE_REIMBURSEMENTS],
                [ONYXKEYS.BANK_ACCOUNT_LIST]: createWiseBankAccountList(CONST.WISE.ONBOARDING_STATUS.IN_REVIEW),
            });
        });

        // When the Wallet's bank account list renders
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();

        // Then there is no prompt, because Wise has what it needs
        expect(screen.queryByText(WISE_MORE_INFO_NEEDED_MESSAGE)).not.toBeOnTheScreen();
    });

    it('does not ask for more info without the global reimbursements beta', async () => {
        // Given a business bank account Wise asked for more info on, without the beta
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, createWiseBankAccountList(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED));
        });

        // When the Wallet's bank account list renders
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();

        // Then there is no prompt, since global reimbursements are not available to the user yet
        expect(screen.queryByText(WISE_MORE_INFO_NEEDED_MESSAGE)).not.toBeOnTheScreen();
    });

    it('shows the globe on a bank account set up for global reimbursements', async () => {
        // Given a business account the backend marks as set up for global reimbursements, for a user on the Wise beta
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, createBankAccountList(createBusinessBankAccount(1, 'Chase Checking', true)));
        });

        // When the bank accounts list renders
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();

        // Then the row shows the globe, so the admin can tell this account pays worldwide
        expect(screen.getByText('Chase Checking')).toBeOnTheScreen();
        expect(screen.getByLabelText('Global reimbursements enabled')).toBeOnTheScreen();

        // And the row's label says so too, because a screen reader can't reach the globe inside the row's button
        expect(screen.getByLabelText(/^Chase Checking, .*Global reimbursements enabled$/)).toBeOnTheScreen();
    });

    it.each([
        ['the account is not set up for global reimbursements', false, true],
        ['the user is not on the Wise beta', true, false],
    ])('hides the globe when %s', async (_label, isGlobalReimbursementEnabled, isOnWiseBeta) => {
        // Given a business account
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, isOnWiseBeta ? [CONST.BETAS.WISE_REIMBURSEMENTS] : []);
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, createBankAccountList(createBusinessBankAccount(1, 'Chase Checking', isGlobalReimbursementEnabled)));
        });

        // When the bank accounts list renders
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();

        // Then no globe shows, because the account can't pay worldwide or global reimbursements are not released to the user yet
        expect(screen.getByText('Chase Checking')).toBeOnTheScreen();
        expect(screen.queryByLabelText('Global reimbursements enabled')).not.toBeOnTheScreen();
    });

    it('continues a Wise onboarding the admin left before Submit', async () => {
        // Given a business bank account whose Wise onboarding the admin saved a page of and did not submit
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[WISE_BANK_ACCOUNT_ID]: createWiseBusinessBankAccount(undefined)});
        });

        // When the Wallet's bank accounts list renders and the admin presses Continue
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Continue.'), {preventDefault: jest.fn()});

        // Then the row shows the setup is in progress, and Continue opens the intro, which picks the onboarding up where the admin left it
        expect(screen.getByText('Global reimbursements setup in progress.', {exact: false})).toBeOnTheScreen();
        expect(Navigation.navigate).toHaveBeenCalledWith(`settings/wallet/global-reimbursements/${WISE_BANK_ACCOUNT_ID}`);
    });

    it('offers Continue when Wise needs more info', async () => {
        // Given a business bank account whose submitted Wise onboarding Wise sent back for more info
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[WISE_BANK_ACCOUNT_ID]: createWiseBusinessBankAccount({status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED})});
        });

        // When the Wallet's bank accounts list renders and the admin presses Continue
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Continue.'), {preventDefault: jest.fn()});

        // Then Continue opens the status page, since the onboarding is already with Wise and only waits on the admin's answers
        expect(Navigation.navigate).toHaveBeenCalledWith(`settings/wallet/global-reimbursements/${WISE_BANK_ACCOUNT_ID}/status`);
    });

    it('shows a submitted Wise onboarding as in progress without Continue', async () => {
        // Given a business bank account whose Wise onboarding is in review
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[WISE_BANK_ACCOUNT_ID]: createWiseBusinessBankAccount({status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW})});
        });

        // When the Wallet's bank accounts list renders
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();

        // Then the row shows the setup is in progress, with nothing to continue, since the answers are already with Wise
        expect(screen.getByText('Global reimbursements setup in progress.', {exact: false})).toBeOnTheScreen();
        expect(screen.queryByText('Continue.')).not.toBeOnTheScreen();
    });

    it('hides the Wise onboarding row without the Wise beta', async () => {
        // Given a business bank account whose Wise onboarding the admin saved a page of and did not submit
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[WISE_BANK_ACCOUNT_ID]: createWiseBusinessBankAccount(undefined)});
        });

        // When the list renders the way it does for a user without the Wise beta
        renderBankAccountsList(false);
        await waitForBatchedUpdatesWithAct();

        // Then no Wise row shows, since that user goes through the Corpay flow
        expect(screen.getByText('Chase Checking')).toBeOnTheScreen();
        expect(screen.queryByText('Global reimbursements setup in progress.', {exact: false})).not.toBeOnTheScreen();
    });
});
