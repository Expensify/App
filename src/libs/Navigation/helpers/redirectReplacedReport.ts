import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isRecord} from '@libs/ObjectUtils';

import SCREENS from '@src/SCREENS';

/** Redirect a focused report before reconciliation deletes its optimistic counterpart. */
function redirectReplacedReport(fromReportID: string, toReportID: string) {
    if (!navigationRef.isReady() || fromReportID === toReportID) {
        return;
    }

    // getCurrentRoute returns nested screens at runtime, not just the root navigator's screen names.
    const route: {name: string; params?: unknown} | undefined = navigationRef.getCurrentRoute();
    const isReportScreen = route?.name === SCREENS.REPORT || route?.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT || route?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT;
    if (!route || !isReportScreen || !isRecord(route.params) || route.params.reportID !== fromReportID) {
        return;
    }

    Navigation.setParams({reportID: toReportID});
}

export default redirectReplacedReport;
