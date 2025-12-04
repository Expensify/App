import CONST from '@src/CONST';

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
 * Check if percentage is between 0 and 100
 */
function validatePercentage(amount: string): boolean {
    const regexString = '^(100|[0-9]{1,2})$';
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
 * @returns The processed amount string without the '-' prefix
 */
function handleNegativeAmountFlipping(amount: string, allowFlippingAmount: boolean, toggleNegative?: () => void): string {
    if (allowFlippingAmount && amount.startsWith('-')) {
        toggleNegative?.();
        return amount.slice(1);
    }
    return amount;
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
};
