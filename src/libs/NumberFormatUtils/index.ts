import intlPolyfill from '@libs/IntlPolyfill';
import Log from '@libs/Log';
import memoize from '@libs/memoize';
import CONST from '@src/CONST';
import type Locale from '@src/types/onyx/Locale';

// Polyfill the Intl API if locale data is not as expected
intlPolyfill();

const MemoizedNumberFormat = memoize(Intl.NumberFormat, {maxSize: 10, monitoringName: 'NumberFormatUtils'});

/**
 * Build an Intl.NumberFormat with a USD fallback for malformed currency codes.
 * Intl throws RangeError for empty/malformed currency values; check presence of the option (not truthiness)
 * so we still recover when currency is '' rather than rethrowing and crashing the screen.
 */
function createFormatter(locale: Locale | undefined, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    try {
        return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, options);
    } catch (e) {
        if (e instanceof RangeError && options && 'currency' in options) {
            Log.warn('NumberFormatUtils: malformed currency code, falling back to USD', {currency: options.currency});
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

export {format, formatToParts};
