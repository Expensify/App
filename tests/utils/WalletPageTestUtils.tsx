import {act, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import KYCWallContextProvider from '@components/KYCWall/KYCWallContext';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import LockedAccountModalProvider from '@components/LockedAccountModalProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, BankAccountList, Card, CardList, Policy, Report, Transaction} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from './collections/policies';
import {createRandomReport} from './collections/reports';
import createRandomTransaction from './collections/transaction';
import * as TestHelper from './TestHelper';
import waitForBatchedUpdates from './waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from './wrapOnyxWithWaitForBatchedUpdates';

/**
 * Shared fixtures and harness for tests that mount the whole WalletPage (perf and render-count tests).
 * Test files still have to declare the navigation / ScreenWrapper / RenderHTML jest.mocks themselves because
 * jest.mock calls are hoisted per test file.
 */

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'wallet-perf@test.com';
const BANK_ACCOUNT_COUNT = 6;
const CARD_COUNT = 6;
const POLICY_COUNT = 3;
const TRANSACTION_COUNT = 200;
const REPORT_COUNT = 40;
const CARD_DOMAIN = 'expensify-policy1.exfy';
const FIRST_BANK_ACCOUNT_ID = 1000;
const FIRST_BANK_ACCOUNT_TITLE = 'Bank account 0';
// PaymentMethodList strips the trailing " - 1001" from the card name when rendering the title.
const FIRST_CARD_TITLE = 'Company card 1';

const screenWrapperStatusValue = {didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: false, isSafeAreaBottomPaddingApplied: false};

function createBankAccount(index: number): BankAccount {
    const bankAccountID = FIRST_BANK_ACCOUNT_ID + index;
    const isBusiness = index % 2 === 0;
    return {
        accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        methodID: bankAccountID,
        title: `Bank account ${index}`,
        description: '',
        isDefault: index === 0,
        key: `bankAccount-${bankAccountID}`,
        bankCurrency: CONST.CURRENCY.USD,
        bankCountry: CONST.COUNTRY.US,
        accountData: {
            bankAccountID,
            accountNumber: `12345678${index}`,
            addressName: `Bank account ${index}`,
            allowDebit: isBusiness,
            created: `2024-01-0${(index % 9) + 1} 10:00:00`,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            type: isBusiness ? CONST.BANK_ACCOUNT.TYPE.BUSINESS : CONST.BANK_ACCOUNT.TYPE.PERSONAL,
            additionalData: {
                bankName: CONST.BANK_NAMES.CHASE,
                currency: CONST.CURRENCY.USD,
                country: CONST.COUNTRY.US,
            },
        },
    };
}

function createCompanyCard(index: number): Card {
    return {
        cardID: index,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
        domainName: CARD_DOMAIN,
        // A fundID marks the card as a company card; without one it is treated as a personal card.
        fundID: '1234',
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
        accountID: TEST_USER_ACCOUNT_ID,
        cardName: `Company card ${index} - ${1000 + index}`,
        lastFourPAN: `${1000 + index}`,
        lastUpdated: '2026-08-01 10:00:00',
        lastScrape: '2026-08-01 10:00:00',
        availableSpend: 0,
        unapprovedSpend: 0,
        totalSpend: 0,
        isLoading: false,
        isLoadingLastUpdated: false,
    };
}

function createAdminPolicy(index: number): Policy {
    return {
        ...createRandomPolicy(index, CONST.POLICY.TYPE.TEAM, `Workspace ${index}`),
        role: CONST.POLICY.ROLE.ADMIN,
        owner: TEST_USER_LOGIN,
        pendingAction: undefined,
    };
}

const bankAccountList: BankAccountList = Object.fromEntries(Array.from({length: BANK_ACCOUNT_COUNT}, (_, index) => [String(FIRST_BANK_ACCOUNT_ID + index), createBankAccount(index)]));
const cardList: CardList = Object.fromEntries(Array.from({length: CARD_COUNT}, (_, index) => [String(index + 1), createCompanyCard(index + 1)]));
const policies = Object.fromEntries(Array.from({length: POLICY_COUNT}, (_, index) => [`${ONYXKEYS.COLLECTION.POLICY}${index + 1}`, createAdminPolicy(index + 1)]));
const reports: Record<string, Report> = Object.fromEntries(Array.from({length: REPORT_COUNT}, (_, index) => [`${ONYXKEYS.COLLECTION.REPORT}${index + 1}`, createRandomReport(index + 1)]));
const transactions: Record<string, Transaction> = Object.fromEntries(
    Array.from({length: TRANSACTION_COUNT}, (_, index) => [
        `${ONYXKEYS.COLLECTION.TRANSACTION}${index + 1}`,
        {...createRandomTransaction(index + 1), reportID: String((index % REPORT_COUNT) + 1), cardID: (index % CARD_COUNT) + 1},
    ]),
);

/**
 * Signs in and seeds a wallet with bank accounts, company cards, admin workspaces, and a gold wallet, plus a
 * pool of unrelated reports and transactions so collection subscriptions have realistic data to churn through.
 */
async function seedWalletPageOnyx() {
    global.fetch = TestHelper.getGlobalFetchMock();
    setHasRadio(true);
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    await act(async () => {
        TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
        await Onyx.multiSet({
            [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT,
            [ONYXKEYS.IS_LOADING_PAYMENT_METHODS]: false,
            [ONYXKEYS.BANK_ACCOUNT_LIST]: bankAccountList,
            [ONYXKEYS.CARD_LIST]: cardList,
            [ONYXKEYS.USER_WALLET]: {
                tierName: CONST.WALLET.TIER_NAME.GOLD,
                currentBalance: 12345,
                walletLinkedAccountID: FIRST_BANK_ACCOUNT_ID,
                isPendingOnfidoResult: false,
                hasFailedOnfido: false,
            },
            [ONYXKEYS.COUNTRY]: CONST.COUNTRY.US,
            ...policies,
            ...reports,
            ...transactions,
        });
        await waitForBatchedUpdates();
    });
}

function WalletPageProviders({children}: {children: ReactNode}) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, ModalProvider, LockedAccountModalProvider, KYCWallContextProvider]}>
            <ScreenWrapperStatusContext value={screenWrapperStatusValue}>{children}</ScreenWrapperStatusContext>
        </ComposeProviders>
    );
}

async function waitForWalletPageContent() {
    await screen.findByText(FIRST_BANK_ACCOUNT_TITLE);
    await screen.findByText(FIRST_CARD_TITLE);
}

export {seedWalletPageOnyx, WalletPageProviders, waitForWalletPageContent, BANK_ACCOUNT_COUNT, CARD_COUNT, FIRST_BANK_ACCOUNT_ID, FIRST_BANK_ACCOUNT_TITLE, FIRST_CARD_TITLE};
