import type {ValueOf} from 'type-fest';
import intlPolyfill from '@libs/IntlPolyfill';
import memoize from '@libs/memoize';
import type CONST from '@src/CONST';

// On iOS, polyfills from `additionalSetup` are applied after memoization, which results in incorrect cache entry of `Intl.NumberFormat` (e.g. lacking `formatToParts` method).
// To fix this, we need to apply the polyfill manually before memoization.
// For further information, see: https://github.com/Expensify/App/pull/43868#issuecomment-2217637217
intlPolyfill();

const MemoizedNumberFormat = memoize(Intl.NumberFormat, {maxSize: 10});

function format(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): string {
    return new MemoizedNumberFormat(locale, options).format(number);
}

function formatToParts(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return new MemoizedNumberFormat(locale, options).formatToParts(number);
}

export {format, formatToParts};
