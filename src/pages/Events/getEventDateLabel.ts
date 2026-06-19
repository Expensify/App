import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import DateUtils from '@libs/DateUtils';
import type {Event} from '@src/types/onyx';

/**
 * Formats event dates into a readable, localized label.
 * Single-day events use a full readable date; multi-day events use a localized range.
 */
function getEventDateLabel(event: Event, translate: LocalizedTranslate): string {
    if (!event.endDate || event.endDate === event.startDate) {
        return DateUtils.formatToReadableString(event.startDate);
    }

    return DateUtils.getFormattedDateRange(translate, new Date(event.startDate), new Date(event.endDate));
}

export default getEventDateLabel;
