import {useEffect} from 'react';
import {OnyxCollection, OnyxEntry, withOnyx} from 'react-native-onyx';
import usePermissions from '@hooks/usePermissions';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as App from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {ReportScreenWrapperProps} from './types';

type ReportScreenIDSetterComponentProps = {
    /** Available reports that would be displayed in this navigator */
    reports: OnyxCollection<Report>;

    /** The policies which the user has access to */
    policies: OnyxCollection<Policy>;

    /** Whether user is a new user */
    isFirstTimeNewExpensifyUser: OnyxEntry<boolean>;
};

type ReportScreenIDSetterProps = ReportScreenIDSetterComponentProps & ReportScreenWrapperProps;

/**
 * Get the most recently accessed report for the user
 */
const getLastAccessedReportID = (
    reports: OnyxCollection<Report>,
    ignoreDefaultRooms: boolean,
    policies: OnyxCollection<Policy>,
    isFirstTimeNewExpensifyUser: OnyxEntry<boolean>,
    openOnAdminRoom: boolean,
): number | string => {
    // If deeplink url contains reportID params, we should show the report that has this reportID.
    const currentRoute = Navigation.getActiveRoute();
    // TODO: get rid of assertion when ReportUtils is migrated to TS
    const {reportID} = ReportUtils.parseReportRouteParams(currentRoute) as {reportID: string};
    if (reportID) {
        return reportID;
    }

    // TODO: get rid of ignore when ReportUtils is migrated to TS
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore till ReportUtils file is migrated
    const lastReport = ReportUtils.findLastAccessedReport(reports, ignoreDefaultRooms, policies, isFirstTimeNewExpensifyUser, openOnAdminRoom) as Report;
    return lastReport?.reportID;
};

// This wrapper is reponsible for opening the last accessed report if there is no reportID specified in the route params
function ReportScreenIDSetter({route, reports, policies, isFirstTimeNewExpensifyUser, navigation}: ReportScreenIDSetterProps): null {
    const {canUseDefaultRooms} = usePermissions();

    useEffect(() => {
        // Don't update if there is a reportID in the params already
        if (route?.params?.reportID ?? null) {
            App.confirmReadyToOpenApp();
            return;
        }

        // If there is no reportID in route, try to find last accessed and use it for setParams
        const reportID = getLastAccessedReportID(reports, !canUseDefaultRooms, policies, isFirstTimeNewExpensifyUser, reports?.params?.openOnAdminRoom ?? false);

        // It's possible that reports aren't fully loaded yet
        // in that case the reportID is undefined
        if (reportID) {
            navigation.setParams({reportID: String(reportID)});
        } else {
            App.confirmReadyToOpenApp();
        }
    }, [route, navigation, reports, canUseDefaultRooms, policies, isFirstTimeNewExpensifyUser]);

    // The ReportScreen without the reportID set will display a skeleton
    // until the reportID is loaded and set in the route param
    return null;
}

ReportScreenIDSetter.displayName = 'ReportScreenIDSetter';

export default withOnyx<ReportScreenIDSetterProps, ReportScreenIDSetterComponentProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
        allowStaleData: true,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
        allowStaleData: true,
    },
    isFirstTimeNewExpensifyUser: {
        key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
        initialValue: false,
    },
})(ReportScreenIDSetter);
