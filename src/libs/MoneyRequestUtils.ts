import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';
import {isIOUReport} from './ReportUtils';
import StringUtils from './StringUtils';
import {isExpenseUnreported} from './TransactionUtils';
import {isInvalidMerchantValue} from './ValidationUtils';

/**
 * Strip comma from the amount
 */
function stripCommaFromAmount(amount: string): string {
    return amount.replaceAll(',', '');
}

/**
 * Strip spaces from the amount
 */
function stripSpacesFromAmount(amount: string): string {
    return amount.replaceAll(/\s+/g, '');
}

function replaceCommasWithPeriod(amount: string): string {
    return amount.replaceAll(/,+/g, '.');
}

/**
 * Strip decimals from the amount
 */
function stripDecimalsFromAmount(amount: string): string {
    return amount.replaceAll(/\.\d*$/g, '');
}

/**
 * Adds a leading zero to the amount if user entered just the decimal separator
 *
 * @param amount - Changed amount from user input
 * @param shouldAllowNegative - Should allow negative numbers
 */
function addLeadingZero(amount: string, shouldAllowNegative = false): string {
    if (shouldAllowNegative && amount.startsWith('-.')) {
        return `-0${amount}`;
    }
    return amount.startsWith('.') ? `0${amount}` : amount;
}

/**
 * Check if amount is a decimal up to 3 digits
 */
function validateAmount(amount: string, decimals: number, amountMaxLength: number = CONST.IOU.AMOUNT_MAX_LENGTH, shouldAllowNegative = false): boolean {
    const regexString =
        decimals === 0
            ? `^${shouldAllowNegative ? '-?' : ''}\\d{1,${amountMaxLength}}$` // Don't allow decimal point if decimals === 0
            : `^${shouldAllowNegative ? '-?' : ''}\\d{1,${amountMaxLength}}(\\.\\d{0,${decimals}})?$`; // Allow the decimal point and the desired number of digits after the point
    const decimalNumberRegex = new RegExp(regexString, 'i');
    if (shouldAllowNegative) {
        return amount === '' || amount === '-' || decimalNumberRegex.test(amount);
    }
    return amount === '' || decimalNumberRegex.test(amount);
}

/**
 * Basic validation for percentage input.
 *
 * By default we keep backwards-compatible behavior and only allow whole-number percentages between 0 and 100.
 * Some callers (e.g. split-by-percentage) may temporarily allow values above 100 while the user edits; they can
 * opt into this relaxed behavior via the `allowExceedingHundred` flag.
 * The `allowDecimal` flag enables one decimal place (0.1 precision) for more granular percentage splits.
 * The `shouldAllowNegative` flag enables negative percentages (e.g. for split expenses with negative amounts).
 * Accepts both period (.) and comma (,) as decimal separators to support locale-specific input (e.g., Spanish).
 */
function validatePercentage(amount: string, allowExceedingHundred = false, allowDecimal = false, shouldAllowNegative = false): boolean {
    if (allowExceedingHundred) {
        // Build regex pattern conditionally based on flags
        const negativePattern = shouldAllowNegative ? '-?' : '';
        const decimalPattern = allowDecimal ? '[.,]?\\d?' : '';
        const regex = new RegExp(`^${negativePattern}\\d*${decimalPattern}$`, 'u');

        if (shouldAllowNegative) {
            return amount === '' || amount === '-' || regex.test(amount);
        }
        return amount === '' || regex.test(amount);
    }

    // Accept both period and comma as decimal separators
    const regexString = allowDecimal ? '^(100([.,]0)?|[0-9]{1,2}([.,]\\d)?)$' : '^(100|[0-9]{1,2})$';
    const percentageRegex = new RegExp(regexString, 'i');
    return amount === '' || percentageRegex.test(amount);
}

/**
 * Replaces each character by calling `convertFn`. If `convertFn` throws an error, then
 * the original character will be preserved.
 */
function replaceAllDigits(text: string, convertFn: (char: string) => string): string {
    return text
        .split('')
        .map((char) => {
            try {
                return convertFn(char);
            } catch {
                return char;
            }
        })
        .join('');
}

/**
 * Handles negative amount flipping by toggling the negative state and removing the '-' prefix
 * @param amount - The amount string to process
 * @param allowFlippingAmount - Whether flipping amount is allowed
 * @param toggleNegative - Function to toggle negative state
 * @returns The processed amount string without the '-' prefix if flipping is enabled and toggle function is provided,
 *          otherwise returns the original amount (keeping the minus sign for direct negative input)
 */
function handleNegativeAmountFlipping(amount: string, allowFlippingAmount: boolean, toggleNegative?: () => void): string {
    // Only strip the minus and toggle if both conditions are met:
    // 1. Flipping is allowed
    // 2. A toggle function is provided (indicating the component uses the toggle mechanism)
    // If no toggle function is provided, keep the minus sign for direct negative value input
    if (allowFlippingAmount && amount.startsWith('-') && toggleNegative) {
        toggleNegative();
        return amount.slice(1);
    }
    return amount;
}

const nonZeroMoneyRequestTypes = new Set<ValueOf<typeof CONST.IOU.TYPE>>([CONST.IOU.TYPE.PAY, CONST.IOU.TYPE.INVOICE, CONST.IOU.TYPE.SPLIT]);

/**
 * Validates a money request amount according to business rules.
 *
 * @param amount - Amount in backend format (cents as integer)
 * @param iouType - Type of IOU (PAY, INVOICE, SPLIT, REQUEST, SUBMIT, etc.)
 * @param allowNegative - Whether negative amounts are allowed
 * @param isIOUReport - Whether this is an IOU report (zero amounts not allowed)
 * @param isP2P - Whether this is a peer-to-peer transaction
 */
function isValidMoneyRequestAmount(amount: number | undefined, iouType: ValueOf<typeof CONST.IOU.TYPE>, allowNegative = true, isP2P = false): boolean {
    if (amount === undefined || amount === null || Number.isNaN(amount)) {
        return false;
    }

    if (amount < 0 && !allowNegative) {
        return false;
    }

    const absoluteAmount = Math.abs(amount);

    if ((iouType === CONST.IOU.TYPE.REQUEST || iouType === CONST.IOU.TYPE.SUBMIT) && isP2P) {
        return absoluteAmount >= 1;
    }

    if (nonZeroMoneyRequestTypes.has(iouType)) {
        return absoluteAmount >= 1;
    }

    return true;
}

/**
 * Validates a merchant value according to business rules.
 *
 * @param merchant - The merchant name to validate
 * @param transaction - The transaction to validate merchant for (used to determine if clearing is allowed)
 * @param report - The parent report for the transaction (used to determine if IOU clearing is allowed)
 * @returns Whether the merchant value is valid
 */
function isValidMerchant(merchant: string | undefined, transaction?: OnyxEntry<Transaction>, report?: OnyxEntry<Report>): boolean {
    const trimmedMerchant = merchant?.trim() ?? '';
    const isEmpty = !trimmedMerchant;

    // Unreported expenses and IOU requests can have empty merchants (allows clearing)
    const isUnreported = transaction ? isExpenseUnreported(transaction) : false;
    const isIOU = !!report && isIOUReport(report);
    if (isEmpty && (isUnreported || isIOU)) {
        return true;
    }

    // Reported transactions or non-empty merchants must pass validation
    if (isEmpty) {
        return false;
    }

    // Check if it's an invalid merchant value (PARTIAL or DEFAULT constants)
    if (isInvalidMerchantValue(trimmedMerchant)) {
        return false;
    }

    const valueByteLength = StringUtils.getUTF8ByteLength(trimmedMerchant);
    return valueByteLength <= CONST.MERCHANT_NAME_MAX_BYTES;
}

export {
    addLeadingZero,
    replaceAllDigits,
    stripCommaFromAmount,
    stripDecimalsFromAmount,
    stripSpacesFromAmount,
    replaceCommasWithPeriod,
    validateAmount,
    validatePercentage,
    handleNegativeAmountFlipping,
    isValidMoneyRequestAmount,
    isValidMerchant,
};
