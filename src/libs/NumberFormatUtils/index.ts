import intlPolyfill from '@libs/IntlPolyfill';
import memoize from '@libs/memoize';
import CONST from '@src/CONST';
import type Locale from '@src/types/onyx/Locale';

// Polyfill the Intl API if locale data is not as expected
intlPolyfill();

const MemoizedNumberFormat = memoize(Intl.NumberFormat, {maxSize: 10, monitoringName: 'NumberFormatUtils'});

function format(locale: Locale | undefined, number: number, options?: Intl.NumberFormatOptions): string {
    return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, options).format(number);
}

function formatToParts(locale: Locale | undefined, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, options).formatToParts(number);
}

export {format, formatToParts};
