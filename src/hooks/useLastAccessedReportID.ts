import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useActiveWorkspace from './useActiveWorkspace';
import usePermissions from './usePermissions';

/**
 * Get the last accessed reportID.
 */
export default function useLastAccessedReportID(shouldOpenOnAdminRoom: boolean) {
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {allowStaleData: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true});
    const [isFirstTimeNewExpensifyUser = false] = useOnyx(ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER);
    const [reportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA, {allowStaleData: true});
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});

    const policyMemberAccountIDs = useMemo(() => getPolicyEmployeeListByIdWithoutCurrentUser(policies, activeWorkspaceID, accountID), [accountID, activeWorkspaceID, policies]);

    return useMemo(
        () =>
            ReportUtils.findLastAccessedReport(
                reports,
                !canUseDefaultRooms,
                policies,
                isFirstTimeNewExpensifyUser,
                shouldOpenOnAdminRoom,
                reportMetadata,
                activeWorkspaceID,
                policyMemberAccountIDs,
            )?.reportID,
        [activeWorkspaceID, canUseDefaultRooms, isFirstTimeNewExpensifyUser, policies, policyMemberAccountIDs, reportMetadata, reports, shouldOpenOnAdminRoom],
    );
}
