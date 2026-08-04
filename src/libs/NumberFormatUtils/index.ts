import intlPolyfill from '@libs/IntlPolyfill';
import Log from '@libs/Log';
import memoize from '@libs/memoize';

import CONST from '@src/CONST';
import type Locale from '@src/types/onyx/Locale';

// Polyfill the Intl API if locale data is not as expected
intlPolyfill();

const MemoizedNumberFormat = memoize(Intl.NumberFormat, {maxSize: 10, monitoringName: 'NumberFormatUtils'});

// Tracks malformed currency codes that have already produced a warning in this module, so the
// safety-net log doesn't fire on every render for the same bad value.
const warnedMalformedCurrencies = new Set<string>();

/**
 * Build an Intl.NumberFormat. If construction throws a RangeError due to a malformed currency
 * code (Intl rejects empty strings and non-ISO-4217 codes), fall back to USD instead of letting
 * the error crash the screen. We check `'currency' in options` rather than `options.currency`
 * truthiness so an empty-string currency still triggers the fallback.
 */
function createFormatter(locale: Locale | undefined, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    try {
        return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, options);
    } catch (e) {
        if (e instanceof RangeError && options && 'currency' in options) {
            const currency = String(options.currency ?? '');
            if (!warnedMalformedCurrencies.has(currency)) {
                warnedMalformedCurrencies.add(currency);
                Log.warn('NumberFormatUtils: malformed currency code, falling back to USD', {currency: options.currency});
            }
            return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, {...options, currency: CONST.CURRENCY.USD});
        }
        throw e;
    }
}

function format(locale: Locale | undefined, number: number, options?: Intl.NumberFormatOptions): string {
    return createFormatter(locale, options).format(number);
}

function formatToParts(locale: Locale | undefined, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return createFormatter(locale, options).formatToParts(number);
}

/**
 * Test-only: clears the malformed-currency deduplication so warn-assertion tests don't pollute each other.
 */
function resetMalformedCurrenciesForTesting() {
    warnedMalformedCurrencies.clear();
}

export {format, formatToParts, resetMalformedCurrenciesForTesting};
