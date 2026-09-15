/**
 * A per diem merchant is persisted in English as `<destination>, <MMM d, yyyy> - <MMM d, yyyy>`. The writer and parser live together because the parser's pattern is the writer's format.
 */
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type Locale from '@src/types/onyx/Locale';

import type {OnyxEntry} from 'react-native-onyx';

import DateUtils from './DateUtils';

/** Every English month abbreviates to its first three letters. */
function formatStoredDate(date: Date): string {
    return `${CONST.DATE.ENGLISH_MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Both dates must be valid. */
function getPerDiemMerchant(locationName: string, start: Date, end: Date): string {
    return `${locationName}, ${formatStoredDate(start)} - ${formatStoredDate(end)}`;
}

/** Both parts or neither, so no caller renders half a rebuild. Only the day and year are matched, because older clients wrote the month in their own language. */
function getPerDiemDisplayParts(transaction: OnyxEntry<Transaction>, merchant: string, locale: Locale): {destination: string; dates: string} | undefined {
    const {start, end} = transaction?.comment?.customUnit?.attributes?.dates ?? {start: '', end: ''};
    if (!start || !end) {
        return undefined;
    }
    const startDate = DateUtils.toLocalDate(start);
    const endDate = DateUtils.toLocalDate(end);
    const generatedRange = new RegExp(`^(.+), [^,]+ ${startDate.getDate()}, ${startDate.getFullYear()} - [^,]+ ${endDate.getDate()}, ${endDate.getFullYear()}$`, 'u');
    const destination = generatedRange.exec(merchant)?.[1];
    if (!destination) {
        return undefined;
    }
    const startLabel = DateUtils.formatToMediumDate(startDate, locale);
    const endLabel = DateUtils.formatToMediumDate(endDate, locale);
    return startLabel && endLabel ? {destination, dates: `${startLabel} - ${endLabel}`} : undefined;
}

/** The reader's copy, never to be persisted. Anything that does not end in the transaction's own range comes back as stored. */
function getDisplayMerchant(transaction: OnyxEntry<Transaction>, merchant: string, locale: Locale): string {
    const parts = getPerDiemDisplayParts(transaction, merchant, locale);
    return parts ? `${parts.destination}, ${parts.dates}` : merchant;
}

export {getDisplayMerchant, getPerDiemDisplayParts, getPerDiemMerchant};
