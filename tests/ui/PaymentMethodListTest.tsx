import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, BankAccountList, Card, CardList} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

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

// Renders the bank accounts list the same way the Wallet page does
const renderBankAccountsList = (shouldShowGlobalReimbursementsEnabled: boolean) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <PaymentMethodList
                    shouldShowConnectionStatus
                    shouldShowGlobalReimbursementsEnabled={shouldShowGlobalReimbursementsEnabled}
                    shouldShowAddBankAccount={false}
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

    it('shows the globe on a bank account set up for global reimbursements', async () => {
        // Given a business account the backend marks as set up for global reimbursements
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, createBankAccountList(createBusinessBankAccount(1, 'Chase Checking', true)));
        });

        // When the Wallet's bank accounts list renders with the globe turned on
        renderBankAccountsList(true);
        await waitForBatchedUpdatesWithAct();

        // Then the row shows the globe, so the admin can tell this account pays worldwide
        expect(screen.getByText('Chase Checking')).toBeOnTheScreen();
        expect(screen.getByLabelText('Global reimbursements enabled')).toBeOnTheScreen();
    });

    it.each([
        ['the account is not set up for global reimbursements', false, true],
        ['the list does not ask for it, like the invoices or the connect-existing-account picker', true, false],
    ])('hides the globe when %s', async (_label, isGlobalReimbursementEnabled, shouldShowGlobalReimbursementsEnabled) => {
        // Given a business account
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, createBankAccountList(createBusinessBankAccount(1, 'Chase Checking', isGlobalReimbursementEnabled)));
        });

        // When the bank accounts list renders
        renderBankAccountsList(shouldShowGlobalReimbursementsEnabled);
        await waitForBatchedUpdatesWithAct();

        // Then no globe shows, because the account can't pay worldwide or the surface is out of scope for now
        expect(screen.getByText('Chase Checking')).toBeOnTheScreen();
        expect(screen.queryByLabelText('Global reimbursements enabled')).not.toBeOnTheScreen();
    });
});
