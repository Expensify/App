import type {OnyxEntry} from 'react-native-onyx';
import type Report from '@src/types/onyx/Report';
import type ReimbursementAccount from '@src/types/onyx/ReimbursementAccount';
import type Transaction from '@src/types/onyx/Transaction';
import ONYXKEYS from '@src/ONYXKEYS';
import * as PolicyUtils from './PolicyUtils';

type PaymentSource = {
    type: 'reimbursement_account' | 'personal_bank_account' | 'credit_card' | 'external';
    accountID?: string;
    isExpensifyManaged: boolean;
    lastFourDigits?: string;
};

type PaymentTrackingResult = {
    paymentSource: PaymentSource;
    isPaidThroughExpensify: boolean;
    shouldShowExternalPaymentWarning: boolean;
};

/**
 * Determines the payment source for a given transaction and whether it was processed through Expensify
 */
function getPaymentSourceInfo(transaction: OnyxEntry<Transaction>, report: OnyxEntry<Report>): PaymentTrackingResult {
    if (!transaction || !report) {
        return {
            paymentSource: {
                type: 'external',
                isExpensifyManaged: false,
            },
            isPaidThroughExpensify: false,
            shouldShowExternalPaymentWarning: false,
        };
    }

    const policyID = report.policyID;
    const policy = PolicyUtils.getPolicy(policyID);

    // Check if payment was made through reimbursement account
    const reimbursementAccountID = transaction.reimbursementAccountID;
    if (reimbursementAccountID) {
        const isExpensifyReimbursementAccount = PolicyUtils.isPolicyReimbursementAccount(policy, reimbursementAccountID);

        return {
            paymentSource: {
                type: 'reimbursement_account',
                accountID: reimbursementAccountID,
                isExpensifyManaged: isExpensifyReimbursementAccount,
                lastFourDigits: transaction.bankAccountLastFour,
            },
            isPaidThroughExpensify: isExpensifyReimbursementAccount,
            shouldShowExternalPaymentWarning: !isExpensifyReimbursementAccount && transaction.isMarkedAsPaidOutsideExpensify === true,
        };
    }

    // Check for personal bank account payments
    if (transaction.bankAccountID) {
        return {
            paymentSource: {
                type: 'personal_bank_account',
                accountID: transaction.bankAccountID,
                isExpensifyManaged: true,
                lastFourDigits: transaction.bankAccountLastFour,
            },
            isPaidThroughExpensify: true,
            shouldShowExternalPaymentWarning: false,
        };
    }

    // Check for credit card payments
    if (transaction.cardID) {
        return {
            paymentSource: {
                type: 'credit_card',
                accountID: transaction.cardID,
                isExpensifyManaged: true,
                lastFourDigits: transaction.cardLastFour,
            },
            isPaidThroughExpensify: true,
            shouldShowExternalPaymentWarning: false,
        };
    }

    // Default to external payment
    const wasMarkedPaidOutside = transaction.isMarkedAsPaidOutsideExpensify === true;
    return {
        paymentSource: {
            type: 'external',
            isExpensifyManaged: false,
        },
        isPaidThroughExpensify: false,
        shouldShowExternalPaymentWarning: wasMarkedPaidOutside,
    };
}

/**
 * Checks if an invoice should be automatically marked as paid through Expensify
 */
function shouldAutoMarkAsPaidThroughExpensify(transaction: OnyxEntry<Transaction>, report: OnyxEntry<Report>): boolean {
    const paymentInfo = getPaymentSourceInfo(transaction, report);
    return paymentInfo.isPaidThroughExpensify && !paymentInfo.shouldShowExternalPaymentWarning;
}

/**
 * Gets a human-readable description of the payment source
 */
function getPaymentSourceDescription(paymentSource: PaymentSource): string {
    switch (paymentSource.type) {
        case 'reimbursement_account':
            return `Reimbursement Account${paymentSource.lastFourDigits ? ` ending in ${paymentSource.lastFourDigits}` : ''}`;
        case 'personal_bank_account':
            return `Bank Account${paymentSource.lastFourDigits ? ` ending in ${paymentSource.lastFourDigits}` : ''}`;
        case 'credit_card':
            return `Credit Card${paymentSource.lastFourDigits ? ` ending in ${paymentSource.lastFourDigits}` : ''}`;
        case 'external':
        default:
            return 'External Payment Source';
    }
}

/**
 * Validates that a reimbursement account payment is properly tracked
 */
function validateReimbursementPayment(transaction: OnyxEntry<Transaction>, report: OnyxEntry<Report>): {isValid: boolean; errorMessage?: string} {
    if (!transaction || !report) {
        return {isValid: false, errorMessage: 'Missing transaction or report data'};
    }

    const paymentInfo = getPaymentSourceInfo(transaction, report);

    // If marked as paid outside but actually paid through Expensify reimbursement account
    if (paymentInfo.paymentSource.type === 'reimbursement_account' &&
        paymentInfo.paymentSource.isExpensifyManaged &&
        transaction.isMarkedAsPaidOutsideExpensify === true) {
        return {
            isValid: false,
            errorMessage: 'Invoice incorrectly marked as paid outside Expensify despite payment from reimbursement account',
        };
    }

    return {isValid: true};
}

export default {
    getPaymentSourceInfo,
    shouldAutoMarkAsPaidThroughExpensify,
    getPaymentSourceDescription,
    validateReimbursementPayment,
};

export type {PaymentSource, PaymentTrackingResult};
