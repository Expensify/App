import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type useConfirmModal from '@hooks/useConfirmModal';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

/** Connections whose data is fetched through Merge (Merge HR and Merge ATS), and which therefore share the behaviour below. */
type MergeConnectionName = typeof CONST.POLICY.CONNECTIONS.NAME.MERGE_HR | typeof CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS;

/** Returns true when the given connection is one of the Merge-backed integrations. */
function isMergeConnectionName(connectionName: ConnectionName): connectionName is MergeConnectionName {
    return connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR || connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS;
}

/** Returns true if the policy has the given Merge integration connected. */
function isMergeConnected(policy: OnyxEntry<Policy>, connectionName: MergeConnectionName): boolean {
    return !!policy?.connections?.[connectionName];
}

/** Returns true when the last sync of the given Merge connection completed. */
function isMergeSyncDone(policy: OnyxEntry<Policy>, connectionName: MergeConnectionName): boolean {
    return policy?.connections?.[connectionName]?.lastSync?.syncStatus === CONST.MERGE.SYNC_STATUS.DONE;
}

/** Returns true when the given Merge connection needs to be reconnected because its last sync failed to authenticate. */
function hasMergeAuthenticationError(policy: OnyxEntry<Policy>, connectionName: MergeConnectionName): boolean {
    return !!policy?.connections?.[connectionName]?.lastSync?.isAuthenticationError;
}

/**
 * Returns true when the last sync of the given Merge connection ended in an error the admin has to resolve — either
 * the integration needs to be reconnected, or the sync itself failed.
 */
function hasMergeSyncError(policy: OnyxEntry<Policy>, connectionName: MergeConnectionName): boolean {
    return hasMergeAuthenticationError(policy, connectionName) || policy?.connections?.[connectionName]?.lastSync?.syncStatus === CONST.MERGE.SYNC_STATUS.FAILED;
}

/** Returns the given Merge connection's finalApprover when it is in basic or advanced (manager) approval mode, or null otherwise. */
function getMergeFinalApprover(policy: OnyxEntry<Policy>, connectionName: MergeConnectionName): string | null {
    const config = policy?.connections?.[connectionName]?.config;
    if ((config?.approvalMode === CONST.MERGE.APPROVAL_MODE.BASIC || config?.approvalMode === CONST.MERGE.APPROVAL_MODE.MANAGER) && config?.finalApprover) {
        return config.finalApprover;
    }

    return null;
}

/**
 * Returns true when the user has already manually synced ("Sync now") the given Merge connection the maximum number of
 * times within the rolling window (e.g. 2 times in the last 24 hours).
 */
function isMergeManualSyncLimitReached(policy: OnyxEntry<Policy>, connectionName: MergeConnectionName): boolean {
    const manualSyncTimestamps = policy?.connections?.[connectionName]?.lastSync?.manualSyncTimestamps;
    if (!manualSyncTimestamps?.length) {
        return false;
    }

    const windowStart = DateUtils.subtractMillisecondsFromDateTime(DateUtils.getDBTime(), CONST.MERGE.MANUAL_SYNC_WINDOW_MS);
    const syncsWithinWindow = manualSyncTimestamps.filter((timestamp) => timestamp > windowStart).length;
    return syncsWithinWindow >= CONST.MERGE.MANUAL_SYNC_LIMIT;
}

/**
 * When a Merge manual sync is blocked because the daily limit has been reached,
 * shows a confirm modal and returns `true`. Returns `false` when the sync is allowed,
 * including for connections that are not backed by Merge.
 */
function showMergeManualSyncLimitModalIfReached(
    policy: OnyxEntry<Policy>,
    connectionName: ConnectionName,
    translate: LocaleContextProps['translate'],
    showConfirmModal: ReturnType<typeof useConfirmModal>['showConfirmModal'],
): boolean {
    if (!isMergeConnectionName(connectionName) || !isMergeManualSyncLimitReached(policy, connectionName)) {
        return false;
    }

    showConfirmModal({
        title: translate('workspace.merge.syncLimitReached.title'),
        prompt: translate('workspace.merge.syncLimitReached.prompt'),
        confirmText: translate('common.buttonConfirm'),
        shouldShowCancelButton: false,
    });
    return true;
}

export {
    getMergeFinalApprover,
    hasMergeAuthenticationError,
    hasMergeSyncError,
    isMergeConnected,
    isMergeConnectionName,
    isMergeManualSyncLimitReached,
    isMergeSyncDone,
    showMergeManualSyncLimitModalIfReached,
};

export type {MergeConnectionName};
