import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {findLastAccessedReport} from '@libs/ReportUtils';
import {isNumeric} from '@libs/ValidationUtils';

import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';

type ReportScreenRoute =
    | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

/**
 * Component that does not render anything. Resolves the reportID route param when missing,
 * and validates the reportActionID param.
 */
function ReportRouteParamHandler() {
    const route = useRoute<ReportScreenRoute>();
    const navigation = useNavigation();
    const {isBetaEnabled} = usePermissions();
    const [reportNameValuePairs, reportNameValuePairsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const shouldResolveReportID = !route.params.reportID;
    const ignoreDomainRooms = !isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS);
    const shouldOpenOnAdminRoom = 'openOnAdminRoom' in route.params && !!route.params.openOnAdminRoom;
    const [guideAccountIDs] = useOnyx(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);

    // Subscribing to the reports collection (instead of relying on the module-scoped copy inside ReportUtils)
    // makes this handler re-run once the reports finish loading, so a route that was created without a reportID
    // recovers instead of staying stuck on the loading skeleton. Resolving inside the selector keeps that cheap:
    // the route only re-renders when the resolved ID changes, and once one is set nothing is computed at all.
    const [lastAccessedReportID, reportsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) =>
            shouldResolveReportID ? findLastAccessedReport(ignoreDomainRooms, guideAccountIDs, shouldOpenOnAdminRoom, undefined, reportNameValuePairs, reports)?.reportID : undefined,
    });

    useFocusEffect(() => {
        // Don't update if there is a reportID in the params already
        if (route.params.reportID) {
            const reportActionID = route?.params?.reportActionID;
            const isValidReportActionID = reportActionID && isNumeric(reportActionID);
            if (reportActionID && !isValidReportActionID) {
                Navigation.isNavigationReady().then(() => navigation.setParams({reportActionID: ''}));
            }
            return;
        }

        // Wait for both collections. Archived status lives in the name-value pairs and a missing entry reads as
        // "not archived", and picking from a partially loaded reports collection can pin a report that isn't
        // really the last accessed one. Neither can be corrected later, because the effect returns early
        // once a reportID is set.
        if (isLoadingOnyxValue(reportNameValuePairsMetadata, reportsMetadata)) {
            return;
        }

        // It's possible that reports aren't fully loaded yet
        // in that case the reportID is undefined
        if (!lastAccessedReportID) {
            return;
        }
        Navigation.isNavigationReady().then(() => {
            Log.info(`[ReportScreen] no reportID found in params, setting it to lastAccessedReportID: ${lastAccessedReportID}`);
            navigation.setParams({reportID: lastAccessedReportID});
        });
    });

    return null;
}

ReportRouteParamHandler.displayName = 'ReportRouteParamHandler';

export default ReportRouteParamHandler;
