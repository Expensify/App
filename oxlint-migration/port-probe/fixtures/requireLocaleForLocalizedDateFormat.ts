// rulesdir/require-locale-for-localized-date-format: MMMM renders differently in each language and no
// `locale` is passed, so the formatted month cannot re-render when the user switches language.
import {format} from 'date-fns';

export default function formatMonthDay(date: Date) {
    return format(date, 'MMMM d');
}
