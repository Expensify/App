import moize from 'moize';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

moize.collectStats();

const numberFormatter = moize(Intl.NumberFormat, {
    isDeepEqual: true,
    maxSize: Infinity,
    profileName: 'Intl.NumberFormat',
});

function format(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): string {
    return numberFormatter(locale, options).format(number);
}

function formatToParts(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return numberFormatter(locale, options).formatToParts(number);
}

export {format, formatToParts};
