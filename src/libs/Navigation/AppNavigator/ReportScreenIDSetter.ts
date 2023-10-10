import {useEffect} from 'react';
import {OnyxCollection, OnyxEntry, withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import * as ReportUtils from '../../ReportUtils';
import * as App from '../../actions/App';
import usePermissions from '../../../hooks/usePermissions';
import CONST from '../../../CONST';
import Navigation from '../Navigation';
import {Policy, Report} from '../../../types/onyx';
import {ReportScreenWrapperProps} from './types';

type ReportScreenIDSetterComponentProps = {
    /** Available reports that would be displayed in this navigator */
    reports: OnyxCollection<Report>;

    /** The policies which the user has access to */
    policies: OnyxCollection<Policy>;

    isFirstTimeNewExpensifyUser: OnyxEntry<boolean>;
};

type ReportScreenIDSetterProps = ReportScreenIDSetterComponentProps & ReportScreenWrapperProps;

/**
 * Get the most recently accessed report for the user
 */
const getLastAccessedReportID = (
    reports: OnyxCollection<Report> | Report[],
    ignoreDefaultRooms: boolean,
    policies: OnyxCollection<Policy>,
    isFirstTimeNewExpensifyUser: OnyxEntry<boolean>,
    openOnAdminRoom: boolean,
): number | string => {
    // If deeplink url is of an attachment, we should show the report that the attachment comes from.
    const currentRoute = Navigation.getActiveRoute();
    const matches = CONST.REGEX.ATTACHMENT_ROUTE.exec(currentRoute);
    const reportID = matches?.[1] ?? null;
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
    // TODO: remove  type assertion when usePermissions is migrated
    const {canUseDefaultRooms} = usePermissions() as {canUseDefaultRooms: boolean};

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
        // TODO: I think we need to update onyx mapping types to include allowStaleData/initialValue keys
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        allowStaleData: true,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        allowStaleData: true,
    },
    isFirstTimeNewExpensifyUser: {
        key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        initialValue: false,
    },
})(ReportScreenIDSetter);
