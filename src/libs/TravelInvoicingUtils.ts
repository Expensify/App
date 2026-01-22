import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {BankAccountList} from '@src/types/onyx';
import type ExpensifyCardSettings from '@src/types/onyx/ExpensifyCardSettings';
import {getLastFourDigits} from './BankAccountUtils';

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
 * Returns 'daily' or 'monthly' based on whether a monthly settlement date is configured.
 */
function getTravelSettlementFrequency(cardSettings: OnyxEntry<ExpensifyCardSettings>): string {
    if (!cardSettings) {
        return CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    }
    return cardSettings.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
}

export {getIsTravelInvoicingEnabled, hasTravelInvoicingSettlementAccount, getTravelLimit, getTravelSpend, getTravelSettlementAccount, getTravelSettlementFrequency};

export type {TravelSettlementAccountInfo};
