import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList} from '@src/types/onyx';
import type ExpensifyCardSettings from '@src/types/onyx/ExpensifyCardSettings';
import type {ExpensifyCardSettingsBase} from '@src/types/onyx/ExpensifyCardSettings';
import {getLastFourDigits} from './BankAccountUtils';

/**
 * Gets the Travel Invoicing settings, handling both nested (TRAVEL_US) and root-level data.
 * Backend may return data under cardSettings.TRAVEL_US or at the root level.
 * We prioritize TRAVEL_US if it exists, otherwise fall back to root level.
 */
function getTravelSettings(cardSettings: OnyxEntry<ExpensifyCardSettings>): ExpensifyCardSettingsBase | undefined {
    if (!cardSettings) {
        return undefined;
    }
    // Prefer nested TRAVEL_US if it exists
    if (cardSettings.TRAVEL_US) {
        return cardSettings.TRAVEL_US;
    }
    // Fall back to root level (for optimistic updates and backward compat)
    return cardSettings;
}

/**
 * Checks whether Travel Invoicing is enabled based on the card settings.
 * Returns true if:
 * 1. isEnabled is explicitly true
 * 2. For backward compat: isEnabled is undefined but paymentBankAccountID exists (legacy enabled state)
 * Returns false if:
 * 1. No settings exist
 * 2. isEnabled is explicitly false
 * 3. Only loading state exists (new account opening page)
 */
function getIsTravelInvoicingEnabled(cardSettings: OnyxEntry<ExpensifyCardSettings>): boolean {
    const settings = getTravelSettings(cardSettings);
    if (!settings) {
        return false;
    }

    // If isEnabled is explicitly set, use that value
    if (settings.isEnabled !== undefined) {
        return settings.isEnabled;
    }

    // For backward compatibility: if isEnabled is undefined but we have a payment account,
    // assume it was enabled before the isEnabled field existed
    // This prevents false positives from just having loading state
    if (settings.paymentBankAccountID && settings.paymentBankAccountID !== CONST.DEFAULT_NUMBER_ID) {
        return true;
    }

    // No explicit isEnabled and no payment account - not enabled
    return false;
}

/**
 * Checks if a settlement account is configured for Travel Invoicing.
 */
function hasTravelInvoicingSettlementAccount(cardSettings: OnyxEntry<ExpensifyCardSettings>): boolean {
    const settings = getTravelSettings(cardSettings);
    if (!settings) {
        return false;
    }
    return !!settings.paymentBankAccountID && settings.paymentBankAccountID !== CONST.DEFAULT_NUMBER_ID;
}

/**
 * Gets the travel limit for Travel Invoicing.
 * Backend may return 'limit' or 'remainingLimit' - we check both.
 * Returns 0 if no settings are available.
 */
function getTravelLimit(cardSettings: OnyxEntry<ExpensifyCardSettings>): number {
    const settings = getTravelSettings(cardSettings);
    // Backend uses 'limit', some flows may use 'remainingLimit' - check both
    return settings?.limit ?? settings?.remainingLimit ?? 0;
}

/**
 * Checks if the workspace has an outstanding Travel Invoicing balance.
 * Returns true if there is unpaid travel spend, blocking disable.
 */
function hasOutstandingTravelBalance(cardSettings: OnyxEntry<ExpensifyCardSettings>): boolean {
    const settings = getTravelSettings(cardSettings);
    const currentBalance = settings?.currentBalance ?? 0;
    return currentBalance > 0;
}

/**
 * Gets the current spend for Travel Invoicing.
 * This is the sum of all posted Travel Invoicing card transactions.
 * Returns 0 if no settings are available.
 */
function getTravelSpend(cardSettings: OnyxEntry<ExpensifyCardSettings>): number {
    const settings = getTravelSettings(cardSettings);
    return settings?.currentBalance ?? 0;
}

type TravelSettlementAccountInfo = {
    displayName: string;
    last4: string;
    bankAccountID: number;
};

/**
 * Gets the settlement account information for Travel Invoicing.
 * Returns undefined if no settlement account is configured.
 */
function getTravelSettlementAccount(cardSettings: OnyxEntry<ExpensifyCardSettings>, bankAccountList: OnyxEntry<BankAccountList>): TravelSettlementAccountInfo | undefined {
    const settings = getTravelSettings(cardSettings);
    if (!settings?.paymentBankAccountID) {
        return undefined;
    }

    const bankAccountID = settings.paymentBankAccountID;
    const bankAccountIDStr = bankAccountID.toString();
    const bankAccount = bankAccountList?.[bankAccountIDStr];

    // Use paymentBankAccountAddressName if available, else fallback to bank account data
    const displayName = settings.paymentBankAccountAddressName ?? bankAccount?.accountData?.addressName ?? '';

    // Use paymentBankAccountNumber if available, else fallback to bank account data
    const accountNumber = settings.paymentBankAccountNumber ?? bankAccount?.accountData?.accountNumber ?? '';
    const last4 = getLastFourDigits(accountNumber);

    return {
        displayName,
        last4,
        bankAccountID,
    };
}

/**
 * Gets the settlement frequency for Travel Invoicing.
 * Returns 'daily' or 'monthly' based on whether a monthly settlement date is configured.
 */
function getTravelSettlementFrequency(cardSettings: OnyxEntry<ExpensifyCardSettings>): string {
    const settings = getTravelSettings(cardSettings);
    if (!settings) {
        return CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    }
    return settings.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
}

/**
 * Gets the Onyx key for Travel Invoicing card settings.
 * Uses the same key pattern as Expensify Card (no program suffix).
 */
function getTravelInvoicingCardSettingsKey(workspaceAccountID: number): `${typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${number}` {
    return `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`;
}

export {
    getIsTravelInvoicingEnabled,
    hasTravelInvoicingSettlementAccount,
    hasOutstandingTravelBalance,
    getTravelLimit,
    getTravelSpend,
    getTravelSettlementAccount,
    getTravelSettlementFrequency,
    getTravelInvoicingCardSettingsKey,
};

export type {TravelSettlementAccountInfo};
