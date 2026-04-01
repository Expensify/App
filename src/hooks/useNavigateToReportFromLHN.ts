import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Navigate from an LHN row to the report screen, with guards for duplicate taps,
 * active-row no-ops, and inbox route on narrow layout.
 */
function useNavigateToReportFromLHN(isActiveReport: (reportID: string) => boolean) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (option: Report & Pick<OptionData, 'actionTargetReportActionID'>) => {
        const reportActionID = Navigation.getTopmostReportActionId();
        const shouldBlockReportNavigation = Navigation.getActiveRoute() !== `/${ROUTES.INBOX}` && shouldUseNarrowLayout;

        if (
            (option.reportID === Navigation.getTopmostReportId() && !reportActionID) ||
            (shouldUseNarrowLayout && isActiveReport(option.reportID) && !reportActionID) ||
            shouldBlockReportNavigation
        ) {
            cancelSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${option.reportID}`);
            return;
        }
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(option.reportID));
    };
}

export default useNavigateToReportFromLHN;
