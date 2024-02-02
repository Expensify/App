import {useEffect} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import usePermissions from '@hooks/usePermissions';
import {getPolicyMembersByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as App from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyMembers, Report} from '@src/types/onyx';
import type {ReportScreenWrapperProps} from './ReportScreenWrapper';

type ReportScreenIDSetterComponentProps = {
    /** Available reports that would be displayed in this navigator */
    reports: OnyxCollection<Report>;

    /** The policies which the user has access to */
    policies: OnyxCollection<Policy>;

    /** Members of all the workspaces the user is member of */
    policyMembers: OnyxCollection<PolicyMembers>;

    /** Whether user is a new user */
    isFirstTimeNewExpensifyUser: OnyxEntry<boolean>;

    /** The accountID of the current user */
    accountID?: number;
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
    policyID?: string,
    policyMemberAccountIDs?: number[],
): string | undefined => {
    const lastReport = ReportUtils.findLastAccessedReport(reports, ignoreDefaultRooms, policies, !!isFirstTimeNewExpensifyUser, openOnAdminRoom, policyID, policyMemberAccountIDs);
    return lastReport?.reportID;
};

// This wrapper is reponsible for opening the last accessed report if there is no reportID specified in the route params
function ReportScreenIDSetter({route, reports, policies, policyMembers = {}, navigation, isFirstTimeNewExpensifyUser = false, accountID}: ReportScreenIDSetterProps) {
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    useEffect(() => {
        // Don't update if there is a reportID in the params already
        if (route?.params?.reportID) {
            const reportActionID = route?.params?.reportActionID;
            const regexValidReportActionID = new RegExp(/^\d*$/);
            if (reportActionID && !regexValidReportActionID.test(reportActionID)) {
                navigation.setParams({reportActionID: ''});
            }
            App.confirmReadyToOpenApp();
            return;
        }

        const policyMemberAccountIDs = getPolicyMembersByIdWithoutCurrentUser(policyMembers, activeWorkspaceID, accountID);

        // If there is no reportID in route, try to find last accessed and use it for setParams
        const reportID = getLastAccessedReportID(
            reports,
            !canUseDefaultRooms,
            policies,
            isFirstTimeNewExpensifyUser,
            !!reports?.params?.openOnAdminRoom,
            activeWorkspaceID,
            policyMemberAccountIDs,
        );

        // It's possible that reports aren't fully loaded yet
        // in that case the reportID is undefined
        if (reportID) {
            navigation.setParams({reportID: String(reportID)});
        } else {
            App.confirmReadyToOpenApp();
        }
    }, [route, navigation, reports, canUseDefaultRooms, policies, isFirstTimeNewExpensifyUser, activeWorkspaceID, policyMembers, accountID]);

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
    policyMembers: {
        key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
        allowStaleData: true,
    },
    isFirstTimeNewExpensifyUser: {
        key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
        initialValue: false,
    },
    accountID: {
        key: ONYXKEYS.SESSION,
        selector: (session) => session?.accountID,
    },
})(ReportScreenIDSetter);
