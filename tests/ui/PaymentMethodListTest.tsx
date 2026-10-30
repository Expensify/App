import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, Card, CardList} from '@src/types/onyx';
import type {BankAccountAdditionalData} from '@src/types/onyx/BankAccount';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

jest.mock('@libs/Navigation/Navigation', () => ({
    // Runs the callback right away, as if the screen had finished opening
    navigate: jest.fn((_route: string, options?: {afterTransition?: () => void}) => options?.afterTransition?.()),
    getActiveRoute: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

// Continue builds the intro on top of the screen it is pressed on, the Wallet
jest.mock('@libs/Navigation/helpers/getActiveRoute', () => ({
    __esModule: true,
    default: jest.fn(() => 'settings/wallet'),
}));

const DOMAIN_NAME = 'expensify.com';

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

function createCardList(...cards: Card[]): CardList {
    return Object.fromEntries(cards.map((card) => [String(card.cardID), card]));
}

// Renders the assigned cards list the same way the Wallet page does, with connection statuses on
const renderAssignedCardsList = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
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

const BANK_ACCOUNT_ID = 9053192;

function createBusinessBankAccount(wise: BankAccountAdditionalData['wise']): BankAccount {
    return {
        methodID: BANK_ACCOUNT_ID,
        bankCurrency: CONST.CURRENCY.USD,
        bankCountry: CONST.COUNTRY.US,
        title: 'Chase Checking',
        description: 'Account ending in 1234',
        accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        accountData: {
            bankAccountID: BANK_ACCOUNT_ID,
            accountNumber: 'XXXXXX1234',
            addressName: 'Chase Checking',
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            additionalData: {currency: CONST.CURRENCY.USD, wise},
        },
    };
}

// Renders the bank accounts list the same way the Wallet page does with the Wise beta on
const renderBankAccountsList = (shouldShowWiseSetupInProgress = true) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <PaymentMethodList
                    shouldShowConnectionStatus
                    shouldShowBankAccountSections
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

    it('continues a Wise onboarding the admin left before Submit', async () => {
        // Given a business bank account whose Wise onboarding the admin opened on this device and did not submit
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: createBusinessBankAccount(undefined)});
            await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, {bankAccountID: String(BANK_ACCOUNT_ID)});
        });

        // When the Wallet's bank accounts list renders and the admin presses Continue
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Continue.'), {preventDefault: jest.fn()});

        // Then the row shows the setup is in progress, and Continue opens the intro and the onboarding on top of it, which takes the bank account from the intro
        expect(screen.getByText('Global reimbursements setup in progress.', {exact: false})).toBeOnTheScreen();
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, `settings/wallet/global-reimbursements/${BANK_ACCOUNT_ID}`, expect.anything());
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, `settings/wallet/global-reimbursements/${BANK_ACCOUNT_ID}/business-onboarding`);
    });

    it('shows a submitted Wise onboarding as in progress without Continue', async () => {
        // Given a business bank account whose Wise onboarding is in review, with its draft still on this device
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: createBusinessBankAccount({status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW})});
            await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, {bankAccountID: String(BANK_ACCOUNT_ID)});
        });

        // When the Wallet's bank accounts list renders
        renderBankAccountsList();
        await waitForBatchedUpdatesWithAct();

        // Then the row shows the setup is in progress, with nothing to continue, since the answers are already with Wise
        expect(screen.getByText('Global reimbursements setup in progress.', {exact: false})).toBeOnTheScreen();
        expect(screen.queryByText('Continue.')).not.toBeOnTheScreen();
    });

    it('hides the Wise onboarding row without the Wise beta', async () => {
        // Given a business bank account whose Wise onboarding the admin opened and did not submit
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: createBusinessBankAccount(undefined)});
            await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, {bankAccountID: String(BANK_ACCOUNT_ID)});
        });

        // When the list renders the way it does for a user without the Wise beta
        renderBankAccountsList(false);
        await waitForBatchedUpdatesWithAct();

        // Then no Wise row shows, since that user goes through the Corpay flow
        expect(screen.getByText('Chase Checking')).toBeOnTheScreen();
        expect(screen.queryByText('Global reimbursements setup in progress.', {exact: false})).not.toBeOnTheScreen();
    });
});
