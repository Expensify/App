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
 * Basic validation for percentage input.
 *
 * By default we keep backwards-compatible behavior and only allow whole-number percentages between 0 and 100.
 * Some callers (e.g. split-by-percentage) may temporarily allow values above 100 while the user edits; they can
 * opt into this relaxed behavior via the `allowExceedingHundred` flag.
 * The `allowDecimal` flag enables one decimal place (0.1 precision) for more granular percentage splits.
 * Accepts both period (.) and comma (,) as decimal separators to support locale-specific input (e.g., Spanish).
 */
function validatePercentage(amount: string, allowExceedingHundred = false, allowDecimal = false): boolean {
    if (allowExceedingHundred) {
        // Accept both period and comma as decimal separators for locale support (e.g., Spanish uses comma)
        const regex = allowDecimal ? /^\d*[.,]?\d?$/u : /^\d*$/u;
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
