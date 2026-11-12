/** Uses the selected date option rather than expanding presets into their current dates. */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {InsightsDashboardID} from '@src/types/onyx';

import {format} from 'date-fns';

import type {InsightsFilters} from './insightsFilters';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';

function getInsightsExportFileName(dashboardID: InsightsDashboardID, date: InsightsFilters['date'], translate: LocalizedTranslate, today = new Date()): string {
    let dateOption: string;
    if ('preset' in date) {
        dateOption = translate(`search.filters.date.presets.${date.preset}`);
    } else if ('on' in date) {
        dateOption = date.on;
    } else {
        dateOption = `${date.from} to ${date.to}`;
    }
    const name = `${translate('common.insights')} - ${translate(INSIGHTS_DASHBOARD_SPECS[dashboardID].labelKey)} - ${dateOption} - ${format(today, CONST.DATE.FNS_FORMAT_STRING)}`;
    return `${name.replaceAll(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_')}.png`;
}

export default getInsightsExportFileName;
