import type {OnyxEntry} from 'react-native-onyx';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {SelectedTabRequest} from '@src/types/onyx';

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

function replaceCommasWithPeriod(amount: string): string {
    return amount.replace(/,+/g, '.');
}

/**
 * Strip decimals from the amount
 */
function stripDecimalsFromAmount(amount: string): string {
    return amount.replace(/\.\d*$/, '');
}

/**
 * Adds a leading zero to the amount if user entered just the decimal separator
 *
 * @param amount - Changed amount from user input
 */
function addLeadingZero(amount: string): string {
    return amount.startsWith('.') ? `0${amount}` : amount;
}

/**
 * Get amount regex string
 */
function amountRegex(decimals: number, amountMaxLength: number = CONST.IOU.AMOUNT_MAX_LENGTH): string {
    return decimals === 0
        ? `^\\d{0,${amountMaxLength}}$` // Don't allow decimal point if decimals === 0
        : `^\\d{0,${amountMaxLength}}(\\.\\d{0,${decimals}})?$`; // Allow the decimal point and the desired number of digits after the point
}

/**
 * Check if string is a valid amount
 */
function validateAmount(amount: string, decimals: number, amountMaxLength: number = CONST.IOU.AMOUNT_MAX_LENGTH): boolean {
    const regexString = amountRegex(decimals, amountMaxLength);
    const decimalNumberRegex = new RegExp(regexString);
    return decimalNumberRegex.test(amount);
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
 * Check if distance expense or not
 */
function isDistanceRequest(iouType: IOUType, selectedTab: OnyxEntry<SelectedTabRequest>): boolean {
    return (iouType === CONST.IOU.TYPE.REQUEST || iouType === CONST.IOU.TYPE.SUBMIT) && selectedTab === CONST.TAB_REQUEST.DISTANCE;
}

/**
 * Check if scan expense or not
 */
function isScanRequest(selectedTab: SelectedTabRequest): boolean {
    return selectedTab === CONST.TAB_REQUEST.SCAN;
}

export {
    addLeadingZero,
    isDistanceRequest,
    isScanRequest,
    replaceAllDigits,
    stripCommaFromAmount,
    stripDecimalsFromAmount,
    stripSpacesFromAmount,
    replaceCommasWithPeriod,
    amountRegex,
    validateAmount,
    validatePercentage,
};
