import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SearchChartCountDimension} from '@components/Search/types';

import CONST from '@src/CONST';

/** An average or a change between periods falls between whole items, so a count rounds rather than writing out every digit of the division */
const MAX_COUNT_FRACTION_DIGITS = 2;

const COUNT_TRANSLATION_KEYS = {
    [CONST.SEARCH.CHART_COUNT_DIMENSION.EXPENSE]: 'iou.expenseCount',
    [CONST.SEARCH.CHART_COUNT_DIMENSION.REPORT]: 'iou.reportCount',
} as const satisfies Record<SearchChartCountDimension, string>;

/**
 * Names a count of expenses or reports in the viewer's locale, e.g. "1,234.5 expenses".
 * The number is formatted here and passed to the translation rather than left to it, because locales whose `one` plural category also covers 0 and fractions
 * would otherwise print a literal "1" for them.
 */
function formatChartCount(count: number, countDimension: SearchChartCountDimension, translate: LocaleContextProps['translate'], numberFormat: LocaleContextProps['numberFormat']): string {
    const rounded = Number(count.toFixed(MAX_COUNT_FRACTION_DIGITS));
    return translate(COUNT_TRANSLATION_KEYS[countDimension], {count: rounded, formattedCount: numberFormat(rounded, {maximumFractionDigits: MAX_COUNT_FRACTION_DIGITS})});
}

export default formatChartCount;
export {MAX_COUNT_FRACTION_DIGITS};
