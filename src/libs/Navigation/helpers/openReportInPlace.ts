import Navigation from '@libs/Navigation/Navigation';
import {startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import {startTransition} from 'react';

/**
 * Shows another report on the report screen that is already open, the way the report prev/next arrows page through a
 * list, instead of pushing a new screen. Pass `routeKey` to update a report screen that is not the focused one, and
 * `navigatorKey` when that screen is in a navigator other than the focused one.
 */
function openReportInPlace(reportID: string, routeKey?: string, navigatorKey?: string) {
    startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`, {name: 'ReportNavigation', op: CONST.TELEMETRY.SPAN_OPEN_REPORT});
    startTransition(() => {
        Navigation.setParams({reportID, reportActionID: undefined, referrer: undefined}, routeKey, navigatorKey);
    });
}

export default openReportInPlace;
