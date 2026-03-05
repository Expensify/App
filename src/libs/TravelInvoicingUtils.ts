import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Card, WorkspaceCardsList} from '@src/types/onyx';
import type {ExpensifyCardSettingsBase} from '@src/types/onyx/ExpensifyCardSettings';
import {getLastFourDigits} from './BankAccountUtils';
import {isDevelopment, isInternalTestBuild, isStaging} from './Environment/Environment';

/**
 * Feature flag to enable Travel CVV testing on Dev and Staging environments.
 * When enabled, it allows using any card for CVV reveal testing if no specific Travel Card is found.
 *
 * TODO: Remove this function and associated logic when Travel Invoicing is fully released
 */
function isTravelCVVTestingEnabled(): boolean {
    return isDevelopment() || isStaging() || isInternalTestBuild();
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
function getIsTravelInvoicingEnabled(cardSettings: ExpensifyCardSettingsBase | undefined): boolean {
    if (!cardSettings) {
        return false;
    }

    // If isEnabled is explicitly set, use that value
    if (cardSettings.isEnabled !== undefined) {
        return cardSettings.isEnabled;
    }

    // For backward compatibility: if isEnabled is undefined but we have a payment account,
    // assume it was enabled before the isEnabled field existed
    // This prevents false positives from just having loading state
    if (cardSettings.paymentBankAccountID && cardSettings.paymentBankAccountID !== CONST.DEFAULT_NUMBER_ID) {
        return true;
    }

    // No explicit isEnabled and no payment account - not enabled
    return false;
}

/**
 * Checks if a settlement account is configured for Travel Invoicing.
 */
function hasTravelInvoicingSettlementAccount(cardSettings: ExpensifyCardSettingsBase | undefined): boolean {
    if (!cardSettings) {
        return false;
    }
    return !!cardSettings.paymentBankAccountID && cardSettings.paymentBankAccountID !== CONST.DEFAULT_NUMBER_ID;
}

/**
 * Gets the travel limit for Travel Invoicing.
 * Backend may return 'limit' or 'remainingLimit' - we check both.
 * Returns 0 if no settings are available.
 */
function getTravelLimit(cardSettings: ExpensifyCardSettingsBase | undefined): number {
    // Backend uses 'limit', some flows may use 'remainingLimit' - check both
    return cardSettings?.limit ?? cardSettings?.remainingLimit ?? 0;
}

/**
 * Checks if the workspace has an outstanding Travel Invoicing balance.
 * Returns true if there is unpaid travel spend, blocking disable.
 */
function hasOutstandingTravelBalance(cardSettings: ExpensifyCardSettingsBase | undefined): boolean {
    const currentBalance = cardSettings?.currentBalance ?? 0;
    return currentBalance > 0;
}

/**
 * Gets the current spend for Travel Invoicing.
 * This is the sum of all posted Travel Invoicing card transactions.
 * Returns 0 if no settings are available.
 */
function getTravelSpend(cardSettings: ExpensifyCardSettingsBase | undefined): number {
    return cardSettings?.currentBalance ?? 0;
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
function getTravelSettlementAccount(cardSettings: ExpensifyCardSettingsBase | undefined, bankAccountList: OnyxEntry<BankAccountList>): TravelSettlementAccountInfo | undefined {
    if (!cardSettings?.paymentBankAccountID) {
        return undefined;
    }

    const bankAccountID = cardSettings.paymentBankAccountID;
    const bankAccountIDStr = bankAccountID.toString();
    const bankAccount = bankAccountList?.[bankAccountIDStr];

    // Use paymentBankAccountAddressName if available, else fallback to bank account data
    const displayName = cardSettings.paymentBankAccountAddressName ?? bankAccount?.accountData?.addressName ?? '';

    // Use paymentBankAccountNumber if available, else fallback to bank account data
    const accountNumber = cardSettings.paymentBankAccountNumber ?? bankAccount?.accountData?.accountNumber ?? '';
    const last4 = getLastFourDigits(accountNumber);

    return {
        displayName,
        last4,
        bankAccountID,
    };
}

/**
 * Gets the settlement frequency for Travel Invoicing.
 * - If monthlySettlementDate is truthy (a Date), frequency is Monthly.
 * - If monthlySettlementDate is falsy (null/undefined), frequency is Daily.
 * - If cardSettings is missing, default to Monthly per design doc.
 */
function getTravelSettlementFrequency(cardSettings: ExpensifyCardSettingsBase | undefined): string {
    // Default to monthly per design doc when no settings exist
    if (!cardSettings) {
        return CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY;
    }
    return cardSettings.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
}

/**
 * Gets the Onyx key for Travel Invoicing card settings.
 * Uses the same key pattern as Expensify Card (no program suffix).
 */
function getTravelInvoicingCardSettingsKey(workspaceAccountID: number): `${typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${number}` {
    return `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`;
}

/**
 * Gets the user's Travel Invoicing card from the card list.
 * Returns the first card with feedCountry set to PROGRAM_TRAVEL_US.
 */
function getTravelInvoicingCard(cardList: Record<string, WorkspaceCardsList | undefined> | undefined) {
    if (!cardList) {
        return undefined;
    }

    // Flatten all WorkspaceCardsList into a single array of Cards
    // Filter out cardList entries (which are string values) to only get actual Card objects
    const allCards = Object.values(cardList)
        .filter((workspaceCards): workspaceCards is WorkspaceCardsList => !!workspaceCards)
        .flatMap((workspaceCards) => Object.values(workspaceCards))
        .filter((card): card is Card => typeof card !== 'string' && typeof card?.cardID === 'number');
    const travelCard = allCards.find((card) => card.nameValuePairs?.feedCountry === CONST.TRAVEL.PROGRAM_TRAVEL_US);
    // If no travel card is found and testing is enabled, return the first available card
    if (!travelCard && isTravelCVVTestingEnabled()) {
        return allCards.find((card) => card.bank === CONST.EXPENSIFY_CARD.BANK);
    }

    return travelCard;
}

/**
 * Checks if user is eligible to see Travel CVV in Wallet.
 * Requires: TRAVEL_INVOICING beta AND having a travel card.
 */
function isTravelCVVEligible(isTravelInvoicingBetaEnabled: boolean, cardList: Record<string, WorkspaceCardsList | undefined> | undefined): boolean {
    const hasTravelCard = !!getTravelInvoicingCard(cardList);
    return isTravelInvoicingBetaEnabled && hasTravelCard;
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
    getTravelInvoicingCard,
    isTravelCVVEligible,
    isTravelCVVTestingEnabled,
};

export type {TravelSettlementAccountInfo};
