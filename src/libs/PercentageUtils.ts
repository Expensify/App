import type Locale from '@src/types/onyx/Locale';

import {format} from './NumberFormatUtils';

/** A share smaller than this has nothing left once it is rounded to the one decimal place we display. */
const APPROXIMATELY_ZERO_PERCENT_THRESHOLD = 0.05;

/** Formats a group's share of total spend for display, to at most one decimal place. */
function formatPercentOfTotal(percent: number, groupTotal: number, locale: Locale | undefined): string {
    const options: Intl.NumberFormatOptions = {style: 'percent', maximumFractionDigits: 1};

    if (Math.abs(percent) < APPROXIMATELY_ZERO_PERCENT_THRESHOLD && groupTotal !== 0) {
        return `~${format(locale, 0, options)}`;
    }

    return format(locale, percent / 100, options);
}

/** Whether a share is big enough to be worth drawing as its own pie chart slice. */
function isShareWorthDrawing(percent: number | undefined): boolean {
    return percent === undefined || Math.abs(percent) >= APPROXIMATELY_ZERO_PERCENT_THRESHOLD;
}

export {formatPercentOfTotal, isShareWorthDrawing};
