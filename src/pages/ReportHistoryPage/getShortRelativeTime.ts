import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';

import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import {differenceInMinutes} from 'date-fns';

/**
 * Formats a datetime as a compact relative time, e.g. "5m ago", "3h ago" or "7d ago".
 */
function getShortRelativeTime(translate: LocalizedTranslate, datetime: string, currentSelectedTimezone: SelectedTimezone): string {
    const date = DateUtils.getLocalDateFromDatetime(undefined, currentSelectedTimezone, datetime);
    const now = DateUtils.getLocalDateFromDatetime(undefined, currentSelectedTimezone);
    const minutes = Math.max(differenceInMinutes(now, date), 1);
    if (minutes < 60) {
        return translate('reportHistoryPage.minutesAgo', minutes);
    }
    if (minutes < 60 * 24) {
        return translate('reportHistoryPage.hoursAgo', Math.floor(minutes / 60));
    }
    return translate('reportHistoryPage.daysAgo', Math.floor(minutes / (60 * 24)));
}

export default getShortRelativeTime;
