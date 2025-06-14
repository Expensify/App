import type {ValueOf} from 'type-fest';
import memoize from '@libs/memoize';
import CONST from '@src/CONST';
import initPolyfill from './intlPolyfill';

initPolyfill();

const MemoizedNumberFormat = memoize(Intl.NumberFormat, {maxSize: 10, monitoringName: 'NumberFormatUtils'});

function format(locale: ValueOf<typeof CONST.LOCALES> | undefined, number: number, options?: Intl.NumberFormatOptions): string {
    return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, options).format(number);
}

function formatToParts(locale: ValueOf<typeof CONST.LOCALES> | undefined, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return new MemoizedNumberFormat(locale ?? CONST.LOCALES.DEFAULT, options).formatToParts(number);
}

export {format, formatToParts};
