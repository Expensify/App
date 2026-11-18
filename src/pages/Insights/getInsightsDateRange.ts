import {getDateRangeForPreset} from '@libs/SearchQueryUtils';

import type {InsightsFilters} from './insightsFilters';

/** Returns the first and last day the Date filter covers, as yyyy-MM-dd strings. Presets like "never" have no fixed range, so both come back empty. */
function getInsightsDateRange(date: InsightsFilters['date']): {start: string; end: string} {
    if ('preset' in date) {
        return getDateRangeForPreset(date.preset);
    }
    if ('on' in date) {
        return {start: date.on, end: date.on};
    }
    return {start: date.from, end: date.to};
}

export default getInsightsDateRange;
