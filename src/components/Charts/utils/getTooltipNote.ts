import {formatPercentOfTotal} from '@libs/PercentageUtils';

import type Locale from '@src/types/onyx/Locale';

/** Writes what the tooltip shows in parentheses after a value: its share of the period's spend or of its expenses when the chart plots counts. */
function getTooltipNote(value: number, percentOfTotal: number | undefined, locale: Locale | undefined): string | undefined {
    return percentOfTotal === undefined ? undefined : formatPercentOfTotal(percentOfTotal, value, locale);
}

export default getTooltipNote;
