import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

function format(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(locale, options).format(number);
}

function formatToParts(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return new Intl.NumberFormat(locale, options).formatToParts(number);
}

export {format, formatToParts};
