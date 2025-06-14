import memoize from '@libs/memoize';
import type {Locale} from '@src/CONST/LOCALES';
import initPolyfill from './intlPolyfill';

initPolyfill();

const MemoizedNumberFormat = memoize(Intl.NumberFormat, {maxSize: 10, monitoringName: 'NumberFormatUtils'});

function format(locale: Locale, number: number, options?: Intl.NumberFormatOptions): string {
    return new MemoizedNumberFormat(locale, options).format(number);
}

function formatToParts(locale: Locale, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return new MemoizedNumberFormat(locale, options).formatToParts(number);
}

export {format, formatToParts};
