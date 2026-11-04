import {formatPercentOfTotal} from '@libs/PercentageUtils';

import type Locale from '@src/types/onyx/Locale';

/**
 * Picks what the tooltip writes in parentheses after a value: its share of total spend when the chart reports one.
 * A chart plotting counts has no share of spend to quote, so the parentheses name the money behind the count instead.
 */
function getTooltipNote(value: number, percentOfTotal: number | undefined, total: string | undefined, locale: Locale | undefined): string | undefined {
    return percentOfTotal === undefined ? total : formatPercentOfTotal(percentOfTotal, value, locale);
}

export default getTooltipNote;
