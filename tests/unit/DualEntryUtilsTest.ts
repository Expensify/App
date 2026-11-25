import {
    getDualEntrySettlementStreamAccountOptions,
    isDualEntrySettlementStreamAccountSetting,
    isDualEntrySettlementStreamAvailable,
    isDualEntrySettlementStreamCurrency,
} from '@libs/DualEntryUtils';

import CONST from '@src/CONST';
import type {ExpensifyCardSettings} from '@src/types/onyx';
import type {DualEntryAccount, DualEntryConnectionData, DualEntryConnectionsConfig} from '@src/types/onyx/Policy';

import createMock from '../utils/createMock';

function buildAccount(id: string, accountType: string, currency?: string, isActive = true): DualEntryAccount {
    return {id, number: id, name: id, accountType, currency, isActive, updatedAt: ''};
}

function buildData(companyCurrency: string): DualEntryConnectionData {
    return {
        companies: [{id: 'company', name: 'Company', currency: companyCurrency, isActive: true, isElimination: false}],
        accounts: [
            buildAccount('gbpBank', CONST.DUALENTRY_ACCOUNT_TYPE.BANK, CONST.CURRENCY.GBP),
            buildAccount('gbpBank2', CONST.DUALENTRY_ACCOUNT_TYPE.BANK, CONST.CURRENCY.GBP),
            buildAccount('eurBank', CONST.DUALENTRY_ACCOUNT_TYPE.BANK, CONST.CURRENCY.EUR),
            buildAccount('inactiveGbpBank', CONST.DUALENTRY_ACCOUNT_TYPE.BANK, CONST.CURRENCY.GBP, false),
            buildAccount('bankWithoutCurrency', CONST.DUALENTRY_ACCOUNT_TYPE.BANK),
            buildAccount('creditCard', CONST.DUALENTRY_ACCOUNT_TYPE.CREDIT_CARD),
            buildAccount('expense', CONST.DUALENTRY_ACCOUNT_TYPE.EXPENSE),
        ],
    };
}

function buildConfig(stream: {bankAccountID?: string; cardAccountID?: string} = {}): DualEntryConnectionsConfig {
    return {
        subsidiaryID: 'company',
        isConfigured: true,
        enableNewCategories: false,
        sync: {
            syncReimbursedReports: true,
            billPaymentAccountID: '',
            syncExpensifyCardSettlements: false,
            settlementsBankAccountID: '',
            syncTravelInvoicingSettlements: false,
            travelInvoicingSettlementsBankAccountID: '',
            settlementStreams: {[CONST.DUALENTRY_SETTLEMENT_STREAM.GBP]: stream},
        },
    };
}

function getOptionIDs(...args: Parameters<typeof getDualEntrySettlementStreamAccountOptions>) {
    return getDualEntrySettlementStreamAccountOptions(...args).map((account) => account.id);
}

describe('DualEntryUtils', () => {
    describe('getDualEntrySettlementStreamAccountOptions', () => {
        it('offers only active bank accounts in the stream currency as the settlement account', () => {
            // Given a USD company with bank accounts in several currencies, and accounts of other types

            // When the options for the GBP settlement bank account are built
            const optionIDs = getOptionIDs(CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID, CONST.CURRENCY.GBP, buildConfig(), buildData(CONST.CURRENCY.USD));

            // Then only the active GBP bank accounts are offered, because the backend rejects any other account
            // and a settlement posted to it would be booked in the wrong currency
            expect(optionIDs).toEqual(['gbpBank', 'gbpBank2']);
        });

        it('offers a credit card account as the card account only when the company uses the stream currency', () => {
            // Given DualEntry reports no currency on credit card accounts, which are kept in the company currency

            // When the card account options are built for a GBP company and for a USD company
            const gbpCompanyOptionIDs = getOptionIDs(CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.CARD_ACCOUNT_ID, CONST.CURRENCY.GBP, buildConfig(), buildData(CONST.CURRENCY.GBP));
            const usdCompanyOptionIDs = getOptionIDs(CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.CARD_ACCOUNT_ID, CONST.CURRENCY.GBP, buildConfig(), buildData(CONST.CURRENCY.USD));

            // Then the credit card account is only offered in the GBP company, where it holds GBP.
            // A bank account that reports no currency is never offered, because its currency is unknown.
            expect(gbpCompanyOptionIDs).toEqual(['gbpBank', 'gbpBank2', 'creditCard']);
            expect(usdCompanyOptionIDs).toEqual(['gbpBank', 'gbpBank2']);
        });

        it('leaves out the account already used for the other side of the stream', () => {
            // Given a GBP stream that already pays from gbpBank
            const config = buildConfig({bankAccountID: 'gbpBank'});

            // When the card account options are built
            const optionIDs = getOptionIDs(CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.CARD_ACCOUNT_ID, CONST.CURRENCY.GBP, config, buildData(CONST.CURRENCY.USD));

            // Then gbpBank is not offered, because a settlement is a transfer between two different accounts
            expect(optionIDs).toEqual(['gbpBank2']);
        });
    });

    describe('getDualEntrySettlementStreamAccountOptions with accounts in another letter case', () => {
        it('matches account types and currencies the way the backend does', () => {
            // Given DualEntry returns an account type and a currency in a different letter case
            const data = buildData(CONST.CURRENCY.USD);
            data.accounts = [buildAccount('mixedCaseBank', 'Bank', 'gbp')];

            // When the options for the GBP settlement bank account are built
            const optionIDs = getOptionIDs(CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID, CONST.CURRENCY.GBP, buildConfig(), data);

            // Then the account is offered, because the backend accepts it and hiding it would leave the admin unable to pick a valid account
            expect(optionIDs).toEqual(['mixedCaseBank']);
        });
    });

    describe('isDualEntrySettlementStreamAvailable', () => {
        function buildCardSettings(settings: Partial<ExpensifyCardSettings>) {
            return {feed: createMock<ExpensifyCardSettings>(settings)};
        }

        it('offers only the stream of the currency the UK/EU card program settles in', () => {
            // Given a UK/EU card program that settles in GBP
            const cardSettings = buildCardSettings({[CONST.COUNTRY.GB]: {paymentBankAccountID: 123, currency: CONST.CURRENCY.GBP}});

            // When each stream is checked
            // Then only GBP is available, because the program never produces EUR settlements
            expect(isDualEntrySettlementStreamAvailable(cardSettings, undefined, CONST.CURRENCY.GBP)).toBe(true);
            expect(isDualEntrySettlementStreamAvailable(cardSettings, undefined, CONST.CURRENCY.EUR)).toBe(false);
        });

        it('offers both streams when an older UK/EU feed has no currency saved', () => {
            // Given a UK/EU card program set up before the currency was saved on the feed
            const cardSettings = buildCardSettings({[CONST.COUNTRY.GB]: {paymentBankAccountID: 123}});

            // When each stream is checked
            // Then both are available, otherwise these workspaces could never set up settlement sync
            expect(isDualEntrySettlementStreamAvailable(cardSettings, undefined, CONST.CURRENCY.GBP)).toBe(true);
            expect(isDualEntrySettlementStreamAvailable(cardSettings, undefined, CONST.CURRENCY.EUR)).toBe(true);
        });

        it('ignores a settlement account that belongs to the US program', () => {
            // Given a feed whose settlement account sits at the root, where the US program keeps it, and a UK/EU block without one
            const cardSettings = buildCardSettings({paymentBankAccountID: 111, [CONST.COUNTRY.GB]: {currency: CONST.CURRENCY.GBP}});

            // When the GBP stream is checked
            // Then it is not available, because the UK/EU program has no settlement account and produces no settlements
            expect(isDualEntrySettlementStreamAvailable(cardSettings, undefined, CONST.CURRENCY.GBP)).toBe(false);
        });

        it('keeps a stream that is on available without a UK/EU card program', () => {
            // Given a workspace with no card settings and a GBP stream that is still on

            // When the GBP stream is checked
            // Then it is available, so the admin can still turn it off
            expect(isDualEntrySettlementStreamAvailable({}, {enabled: true}, CONST.CURRENCY.GBP)).toBe(true);
            expect(isDualEntrySettlementStreamAvailable({}, {enabled: false}, CONST.CURRENCY.GBP)).toBe(false);
        });
    });

    describe('route parameter guards', () => {
        it('accepts only the UK/EU stream currencies and the two account settings', () => {
            // Given the currency and the setting come from the URL of the account picker

            // When they are checked
            // Then only GBP and EUR, and only the two account settings, are accepted, so an edited link shows the not found page
            expect(isDualEntrySettlementStreamCurrency(CONST.CURRENCY.GBP)).toBe(true);
            expect(isDualEntrySettlementStreamCurrency(CONST.CURRENCY.EUR)).toBe(true);
            expect(isDualEntrySettlementStreamCurrency(CONST.CURRENCY.USD)).toBe(false);
            expect(isDualEntrySettlementStreamCurrency(undefined)).toBe(false);

            // Names every object inherits must not pass as a currency
            expect(isDualEntrySettlementStreamCurrency('toString')).toBe(false);
            expect(isDualEntrySettlementStreamCurrency('constructor')).toBe(false);
            expect(isDualEntrySettlementStreamAccountSetting(CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID)).toBe(true);
            expect(isDualEntrySettlementStreamAccountSetting(CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.CARD_ACCOUNT_ID)).toBe(true);
            expect(isDualEntrySettlementStreamAccountSetting(CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.ENABLED)).toBe(false);
        });
    });
});
