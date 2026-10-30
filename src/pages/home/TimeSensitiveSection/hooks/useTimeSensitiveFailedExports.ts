/**
 * Finds the admin workspaces that have failed exports to offer again, for the Home "Time sensitive" section.
 */
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {getFailedExportReportsByPolicyID, getFailedExportsToRetry, getRetryWindow} from '@libs/FailedExportRetryUtils';
import type {RetryWindow} from '@libs/FailedExportRetryUtils';
import {getActiveAdminWorkspaces} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

type AdminPolicyRetryWindow = RetryWindow & {
    policyID: string;
    policyName: string;
};

type FailedExportsToRetry = {
    policyID: string;
    policyName: string;
    integrationName: string;
    count: number;
};

const createAdminPolicyRetryWindowsSelector =
    (currentUserLogin: string | undefined) =>
    (policies: OnyxCollection<Policy>): AdminPolicyRetryWindow[] => {
        const retryWindows: AdminPolicyRetryWindow[] = [];
        for (const policy of getActiveAdminWorkspaces(policies, currentUserLogin)) {
            const retryWindow = getRetryWindow(policy, CONST.POLICY.CONNECTIONS.FAILED_EXPORT_RETRY_DEFAULT_LOOKBACK_DAYS);
            if (retryWindow) {
                retryWindows.push({...retryWindow, policyID: policy.id, policyName: policy.name});
            }
        }
        return retryWindows;
    };

function useTimeSensitiveFailedExports(): FailedExportsToRetry[] {
    const {login} = useCurrentUserPersonalDetails();
    const [retryWindows] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createAdminPolicyRetryWindowsSelector(login)});
    const [failedReportsByPolicyID] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: getFailedExportReportsByPolicyID});

    const failedExportsToRetry: FailedExportsToRetry[] = [];
    for (const retryWindow of retryWindows ?? []) {
        const count = getFailedExportsToRetry(failedReportsByPolicyID?.[retryWindow.policyID], retryWindow).length;
        if (count > 0) {
            failedExportsToRetry.push({
                policyID: retryWindow.policyID,
                policyName: retryWindow.policyName,
                integrationName: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[retryWindow.connectionName],
                count,
            });
        }
    }
    return failedExportsToRetry;
}

export default useTimeSensitiveFailedExports;
