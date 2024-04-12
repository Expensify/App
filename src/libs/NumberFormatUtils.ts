import stableStringify from 'fast-json-stable-stringify';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

const cache = new Map<string, Intl.NumberFormat>();

function getNumberFormat(locale: ValueOf<typeof CONST.LOCALES>, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = `${locale}-${stableStringify(options)}`;
    let numberFormat = cache.get(key);
    if (!numberFormat) {
        numberFormat = new Intl.NumberFormat(locale, options);
        cache.set(key, numberFormat);
    }
    return numberFormat;
}

function format(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): string {
    return getNumberFormat(locale, options).format(number);
}

function formatToParts(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return getNumberFormat(locale, options).formatToParts(number);
}

export {format, formatToParts};
