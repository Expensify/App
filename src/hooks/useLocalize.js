import {useContext} from 'react';
import {LocaleContext} from '@components/LocaleContextProvider';

/**
 * @typedef {Object} LocalizationContext
 * @property {(phrase: string, variables?: object) => string} translate Translates a provided phrase using the preferred locale and optional variables.
 * @property {(number: number, options: Intl.NumberFormatOptions) => string} numberFormat Formats a provided number using the preferred locale and optional format options.
 * @property {(datetime: string) => string} datetimeToRelative Converts an ISO-formatted datetime to a relative time string in the preferred locale.
 * @property {(datetime: string, includeTimezone? boolean, isLowercase: boolean) => string} datetimeToCalendarTime Converts an ISO-formatted datetime to a calendar time string in the preferred locale. Optional includeTimezone and isLowercase.
 * @property {() => void} updateLocale Updates internal date-fns locale to the user's preferred locale.
 * @property {(phoneNumber: string) => string} formatPhoneNumber Formats given phoneNumber.
 * @property {(digit: string) => string} toLocaleDigit Converts the provided digit to the locale digit.
 * @property {(localeDigit: string) => string} fromLocaleDigit Reverses the operation of `toLocaleDigit`, taking a locale-specific digit and returning the equivalent in the standard number system.
 * @property {string} preferredLocale The preferred locale value.
 */

/**
 * Hook to access the localization context which provides multiple utility functions and locale.
 *
 * @returns {LocalizationContext} The localization context
 */
export default function useLocalize() {
    return useContext(LocaleContext);
}
