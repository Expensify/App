import {ValueOf} from 'type-fest';
import CONST from '../CONST';

/**
 * Strip comma from the amount
 */
function stripCommaFromAmount(amount: string): string {
    return amount.replace(/,/g, '');
}

/**
 * Strip spaces from the amount
 */
function stripSpacesFromAmount(amount: string): string {
    return amount.replace(/\s+/g, '');
}

/**
 * Adds a leading zero to the amount if user entered just the decimal separator
 *
 * @param amount - Changed amount from user input
 */
function addLeadingZero(amount: string): string {
    return amount === '.' ? '0.' : amount;
}

/**
 * Calculate the length of the amount with leading zeroes
 */
function calculateAmountLength(amount: string): number {
    const leadingZeroes = amount.match(/^0+/);
    const leadingZeroesLength = leadingZeroes?.[0]?.length ?? 0;
    const absAmount = parseFloat((Number(stripCommaFromAmount(amount)) * 100).toFixed(2)).toString();

    if (/\D/.test(absAmount)) {
        return CONST.IOU.AMOUNT_MAX_LENGTH + 1;
    }

    return leadingZeroesLength + (absAmount === '0' ? 2 : absAmount.length);
}

/**
 * Check if amount is a decimal up to 3 digits
 */
function validateAmount(amount: string): boolean {
    const decimalNumberRegex = new RegExp(/^\d+(,\d+)*(\.\d{0,2})?$/, 'i');
    return amount === '' || (decimalNumberRegex.test(amount) && calculateAmountLength(amount) <= CONST.IOU.AMOUNT_MAX_LENGTH);
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
 * Check if distance request or not
 */
function isDistanceRequest(iouType: ValueOf<typeof CONST.IOU.MONEY_REQUEST_TYPE>, selectedTab: ValueOf<typeof CONST.TAB>): boolean {
    return iouType === CONST.IOU.MONEY_REQUEST_TYPE.REQUEST && selectedTab === CONST.TAB.DISTANCE;
}

/**
 * Check if scan request or not
 */
function isScanRequest(selectedTab: ValueOf<typeof CONST.TAB>): boolean {
    return selectedTab === CONST.TAB.SCAN;
}

export {stripCommaFromAmount, stripSpacesFromAmount, addLeadingZero, validateAmount, replaceAllDigits, isDistanceRequest, isScanRequest};
