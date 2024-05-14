import moize from 'moize';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

const numberFormatter = moize(Intl.NumberFormat, {
    isDeepEqual: true,
    maxSize: 10,
    profileName: 'Intl.NumberFormat',
});

function format(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): string {
    return numberFormatter(locale, options).format(number);
}

function formatToParts(locale: ValueOf<typeof CONST.LOCALES>, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return numberFormatter(locale, options).formatToParts(number);
}

export {format, formatToParts};
