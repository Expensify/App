import {useEffect} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import usePermissions from '@hooks/usePermissions';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportMetadata} from '@src/types/onyx';
import type {ReportScreenWrapperProps} from './ReportScreenWrapper';

type ReportScreenIDSetterProps = ReportScreenWrapperProps;

/**
 * Get the most recently accessed report for the user
 */
const getLastAccessedReportID = (
    reports: OnyxCollection<Report>,
    ignoreDefaultRooms: boolean,
    policies: OnyxCollection<Policy>,
    isFirstTimeNewExpensifyUser: OnyxEntry<boolean>,
    openOnAdminRoom: boolean,
    reportMetadata: OnyxCollection<ReportMetadata>,
    policyID?: string,
    policyMemberAccountIDs?: number[],
): string | undefined => {
    const lastReport = ReportUtils.findLastAccessedReport(
        reports,
        ignoreDefaultRooms,
        policies,
        !!isFirstTimeNewExpensifyUser,
        openOnAdminRoom,
        reportMetadata,
        policyID,
        policyMemberAccountIDs,
    );
    return lastReport?.reportID;
};

// This wrapper is responsible for opening the last accessed report if there is no reportID specified in the route params
function ReportScreenIDSetter({route, navigation}: ReportScreenIDSetterProps) {
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {allowStaleData: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [isFirstTimeNewExpensifyUser] = useOnyx(ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER, {initialValue: false});
    const [reportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA, {allowStaleData: true});
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});

    useEffect(() => {
        // Don't update if there is a reportID in the params already
        if (route?.params?.reportID) {
            const reportActionID = route?.params?.reportActionID;
            const regexValidReportActionID = new RegExp(/^\d*$/);
            if (reportActionID && !regexValidReportActionID.test(reportActionID)) {
                navigation.setParams({reportActionID: ''});
            }
            return;
        }

        const policyMemberAccountIDs = getPolicyEmployeeListByIdWithoutCurrentUser(policies, activeWorkspaceID, accountID);

        // If there is no reportID in route, try to find last accessed and use it for setParams
        const reportID = getLastAccessedReportID(
            reports,
            !canUseDefaultRooms,
            policies,
            isFirstTimeNewExpensifyUser,
            !!reports?.params?.openOnAdminRoom,
            reportMetadata,
            activeWorkspaceID,
            policyMemberAccountIDs,
        );

        // It's possible that reports aren't fully loaded yet
        // in that case the reportID is undefined
        if (reportID) {
            navigation.setParams({reportID: String(reportID)});
        }
    }, [route, navigation, reports, canUseDefaultRooms, policies, isFirstTimeNewExpensifyUser, reportMetadata, activeWorkspaceID, personalDetails, accountID]);

    // The ReportScreen without the reportID set will display a skeleton
    // until the reportID is loaded and set in the route param
    return null;
}

ReportScreenIDSetter.displayName = 'ReportScreenIDSetter';

export default ReportScreenIDSetter;
