import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import memoize from './memoize';

const numberFormatter = memoize(Intl.NumberFormat, {maxSize: 10});

function format(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): string {
    return numberFormatter(locale, options).format(number);
}

function formatToParts(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return numberFormatter(locale, options).formatToParts(number);
}

export {format, formatToParts};
