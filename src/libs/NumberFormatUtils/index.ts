import intlPolyfill from '@libs/IntlPolyfill';
import Log from '@libs/Log';
import memoize from '@libs/memoize';
import CONST from '@src/CONST';
import type Locale from '@src/types/onyx/Locale';

// Polyfill the Intl API if locale data is not as expected
intlPolyfill();

const MemoizedNumberFormat = memoize(Intl.NumberFormat, {maxSize: 10, monitoringName: 'NumberFormatUtils'});

function format(locale: Locale | undefined, number: number, options?: Intl.NumberFormatOptions): string {
    try {
        return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, options).format(number);
    } catch (e) {
        if (e instanceof RangeError && options?.currency) {
            Log.warn('NumberFormatUtils: malformed currency code, falling back to USD', {currency: options.currency});
            return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, {...options, currency: CONST.CURRENCY.USD}).format(number);
        }
        throw e;
    }
}

function formatToParts(locale: Locale | undefined, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    try {
        return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, options).formatToParts(number);
    } catch (e) {
        if (e instanceof RangeError && options?.currency) {
            Log.warn('NumberFormatUtils: malformed currency code, falling back to USD', {currency: options.currency});
            return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, {...options, currency: CONST.CURRENCY.USD}).formatToParts(number);
        }
        throw e;
    }
}

export {format, formatToParts};
