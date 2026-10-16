/**
 * Gives the failed exports of a workspace that an admin can export again, now that the accounting connection works.
 */
import {getFailedExportReportsByPolicyID, getFailedExportsToRetry, getRetryWindow} from '@libs/FailedExportRetryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

function useFailedExportsToRetry(policy: OnyxEntry<Policy>, lookbackDays: number = CONST.POLICY.CONNECTIONS.FAILED_EXPORT_RETRY_DEFAULT_LOOKBACK_DAYS) {
    const [failedReportsByPolicyID] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: getFailedExportReportsByPolicyID});
    const retryWindow = getRetryWindow(policy, lookbackDays);
    const reports = getFailedExportsToRetry(policy?.id ? failedReportsByPolicyID?.[policy.id] : undefined, retryWindow);
    const connectionName = retryWindow?.connectionName;

    return {
        connectionName,
        integrationName: connectionName ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : undefined,
        reports,
        hasFailedExportsToRetry: reports.length > 0,
    };
}

export default useFailedExportsToRetry;
