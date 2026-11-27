/**
 * Helpers for the UK/EU Expensify Card settlement streams of the DualEntry connection.
 */
import CONST from '@src/CONST';
import type {ExpensifyCardSettings} from '@src/types/onyx';
import type {
    DualEntryAccount,
    DualEntryConnectionData,
    DualEntryConnectionsConfig,
    DualEntrySettlementStream,
    DualEntrySettlementStreamAccountSetting,
    DualEntrySettlementStreamCurrency,
    DualEntrySettlementStreamKey,
    DualEntrySettlementStreamOfflineFeedbackKey,
} from '@src/types/onyx/Policy';

import type {OnyxCollection} from 'react-native-onyx';

function isDualEntrySettlementStreamCurrency(currency: string | undefined): currency is DualEntrySettlementStreamCurrency {
    return currency === CONST.CURRENCY.GBP || currency === CONST.CURRENCY.EUR;
}

function isDualEntrySettlementStreamAccountSetting(setting: string | undefined): setting is DualEntrySettlementStreamAccountSetting {
    return setting === CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID || setting === CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.CARD_ACCOUNT_ID;
}

function getDualEntrySettlementStreamKey(currency: DualEntrySettlementStreamCurrency): DualEntrySettlementStreamKey {
    return CONST.DUALENTRY_SETTLEMENT_STREAM[currency];
}

/**
 * Returns the key that one setting of a settlement stream uses in the connection's pendingFields and errorFields.
 */
function getDualEntrySettlementStreamFeedbackKey(streamKey: DualEntrySettlementStreamKey, settingName: keyof DualEntrySettlementStream): DualEntrySettlementStreamOfflineFeedbackKey {
    return `${CONST.DUALENTRY_CONFIG.SETTLEMENT_STREAM_PREFIX}${streamKey}_${settingName}`;
}

/**
 * Returns whether a workspace can set up the settlement stream of a currency. A stream that is on is always available,
 * so an admin can still turn it off after the card program stops settling in its currency.
 */
function isDualEntrySettlementStreamAvailable(
    allCardSettings: OnyxCollection<ExpensifyCardSettings>,
    stream: DualEntrySettlementStream | undefined,
    currency: DualEntrySettlementStreamCurrency,
): boolean {
    if (stream?.enabled) {
        return true;
    }

    return Object.values(allCardSettings ?? {}).some((cardSettings) => {
        // The UK/EU program is read on its own, because settings at the root of the feed belong to the US program
        const ukEuCardSettings = cardSettings?.[CONST.COUNTRY.GB];
        if (!ukEuCardSettings?.paymentBankAccountID) {
            return false;
        }

        // Older UK/EU feeds have no currency saved. Both streams are offered then, and the admin sets up the one that applies.
        return !ukEuCardSettings.currency || ukEuCardSettings.currency === currency;
    });
}

/**
 * Returns the accounts an admin can pick for one side of a settlement stream. The backend rejects any other account, because
 * a settlement is posted as a transfer between two different accounts in the stream's currency.
 */
function getDualEntrySettlementStreamAccountOptions(
    setting: DualEntrySettlementStreamAccountSetting,
    currency: DualEntrySettlementStreamCurrency,
    config: DualEntryConnectionsConfig | undefined,
    data: DualEntryConnectionData | undefined,
): DualEntryAccount[] {
    const stream = config?.sync?.settlementStreams?.[getDualEntrySettlementStreamKey(currency)];
    const isBankAccountSetting = setting === CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID;
    const otherAccountID = isBankAccountSetting ? stream?.cardAccountID : stream?.bankAccountID;
    const companyCurrency = data?.companies?.find((company) => company.id === config?.subsidiaryID)?.currency;

    return (data?.accounts ?? []).filter((account) => {
        if (!account.isActive || account.id === otherAccountID) {
            return false;
        }

        // The backend compares account types and currencies without regard to case, so the picker does the same
        const accountType = account.accountType.toLowerCase();
        const isBankAccount = accountType === CONST.DUALENTRY_ACCOUNT_TYPE.BANK;
        const isCreditCardAccount = accountType === CONST.DUALENTRY_ACCOUNT_TYPE.CREDIT_CARD;

        // The backend accepts only a bank account as the settlement account, and a bank or credit card account as the Expensify Card account
        const isAllowedAccountType = isBankAccountSetting ? isBankAccount : isBankAccount || isCreditCardAccount;
        if (!isAllowedAccountType) {
            return false;
        }

        // DualEntry only reports a currency on bank accounts. Every other account is kept in the currency of the connected company.
        const accountCurrency = account.currency || (isBankAccount ? undefined : companyCurrency);
        return accountCurrency?.toUpperCase() === currency;
    });
}

export {
    getDualEntrySettlementStreamAccountOptions,
    getDualEntrySettlementStreamFeedbackKey,
    getDualEntrySettlementStreamKey,
    isDualEntrySettlementStreamAccountSetting,
    isDualEntrySettlementStreamAvailable,
    isDualEntrySettlementStreamCurrency,
};
