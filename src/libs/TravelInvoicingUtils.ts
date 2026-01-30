import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Card, WorkspaceCardsList} from '@src/types/onyx';
import type ExpensifyCardSettings from '@src/types/onyx/ExpensifyCardSettings';
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
 * Travel Invoicing is considered enabled if the PROGRAM_TRAVEL_US feed has a valid paymentBankAccountID.
 */
function getIsTravelInvoicingEnabled(cardSettings: OnyxEntry<ExpensifyCardSettings>): boolean {
    if (!cardSettings) {
        return false;
    }
    return !!cardSettings.paymentBankAccountID;
}

/**
 * Checks if a settlement account is configured for Travel Invoicing.
 */
function hasTravelInvoicingSettlementAccount(cardSettings: OnyxEntry<ExpensifyCardSettings>): boolean {
    if (!cardSettings) {
        return false;
    }
    return !!cardSettings.paymentBankAccountID && cardSettings.paymentBankAccountID !== CONST.DEFAULT_NUMBER_ID;
}

/**
 * Gets the remaining limit for Travel Invoicing.
 * Returns 0 if no settings are available.
 */
function getTravelLimit(cardSettings: OnyxEntry<ExpensifyCardSettings>): number {
    return cardSettings?.remainingLimit ?? 0;
}

/**
 * Gets the current spend for Travel Invoicing.
 * This is the sum of all posted Travel Invoicing card transactions.
 * Returns 0 if no settings are available.
 */
function getTravelSpend(cardSettings: OnyxEntry<ExpensifyCardSettings>): number {
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
function getTravelSettlementAccount(cardSettings: OnyxEntry<ExpensifyCardSettings>, bankAccountList: OnyxEntry<BankAccountList>): TravelSettlementAccountInfo | undefined {
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
function getTravelSettlementFrequency(cardSettings: OnyxEntry<ExpensifyCardSettings>): string {
    // Default to monthly per design doc when no settings exist
    if (!cardSettings) {
        return CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY;
    }
    // If monthlySettlementDate is set, it's monthly; otherwise it's daily
    return cardSettings.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
}

/**
 * Gets the Onyx key for Travel Invoicing card settings.
 * This function returns a properly typed key without requiring type assertions.
 */
function getTravelInvoicingCardSettingsKey(workspaceAccountID: number): `${typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${number}_${typeof CONST.TRAVEL.PROGRAM_TRAVEL_US}` {
    return `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${CONST.TRAVEL.PROGRAM_TRAVEL_US}`;
}

/**
 * Gets the user's Travel Invoicing card from the card list.
 * Returns the first card with isTravelCard NVP set to true.
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
    const travelCard = allCards.find((card) => card.nameValuePairs?.isTravelCard);
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
