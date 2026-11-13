/** Note on Violations over time saying the day violations started being recorded, since the chart leaves out the days before it. */
import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import {format, parseISO} from 'date-fns';
import React from 'react';

import InsightsChartNote from './InsightsChartNote';

type InsightsTrackedFromNoteProps = {
    /** First day the chart has data for, as a yyyy-MM-dd string */
    trackedFrom: string;
};

function InsightsTrackedFromNote({trackedFrom}: InsightsTrackedFromNoteProps) {
    const {translate, dateFnsLocale} = useLocalize();

    return (
        <InsightsChartNote>
            {translate('insightsPage.violationsTrackedFrom', format(parseISO(trackedFrom), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, {locale: dateFnsLocale}))}
        </InsightsChartNote>
    );
}

export default InsightsTrackedFromNote;
