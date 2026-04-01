import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import usePermissions from '@hooks/usePermissions';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {findLastAccessedReport} from '@libs/ReportUtils';
import {isNumeric} from '@libs/ValidationUtils';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

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
    const archivedReportsIdSet = useArchivedReportsIdSet();

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

        const lastAccessedReportID = findLastAccessedReport(
            !isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
            'openOnAdminRoom' in route.params && !!route.params.openOnAdminRoom,
            undefined,
            archivedReportsIdSet,
        )?.reportID;

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
