import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import intlPolyfill from './IntlPolyfill';
import memoize from './memoize';

intlPolyfill();

const MemoizedNumberFormat = memoize(Intl.NumberFormat, {maxSize: 10});

function format(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): string {
    return new MemoizedNumberFormat(locale, options).format(number);
}

function formatToParts(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return new MemoizedNumberFormat(locale, options).formatToParts(number);
}

export {format, formatToParts};
