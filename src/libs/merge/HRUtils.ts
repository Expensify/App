import {hasSynchronizationErrorMessage} from '@libs/actions/connections';

import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';

import {getMergeFinalApprover, hasMergeSyncError, isMergeConnected, isMergeSyncDone} from './MergeUtils';

type HRConnectionName = TupleToUnion<typeof CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES>;

/** Display info for an HR provider connected to a policy. */
type HRProviderInfo = {
    /** The internal connection name used as the key on `policy.connections` (e.g. `'gusto'`, `'zenefits'`, `'merge_hris'`). */
    connectionName: HRConnectionName;

    /** Human-readable label shown in the UI (e.g. `'Gusto'`, `'TriNet'`, or a Merge HR provider brand like `'Workday'`). */
    displayName: string;

    /** Optional logo URL. Populated only for Merge HR providers when their slug resolves in `MERGE_HR_PROVIDERS`. */
    iconUrl?: string;

    /** Merge HR integration slug (e.g. `'bamboohr'`, `'workday'`). Only set when `connectionName` is Merge HR. */
    mergeSlug?: MergeHRProviderSlug;
};

function isGustoConnected(policy?: OnyxEntry<Policy>) {
    return !!policy?.connections?.gusto;
}

function isZenefitsConnected(policy?: OnyxEntry<Policy>) {
    return !!policy?.connections?.zenefits;
}

/** True when the admin still needs to complete the Merge HR setup (select groups). */
function isMergeHRCompleteSetupNeeded(policy?: OnyxEntry<Policy>): boolean {
    const mergeHR = policy?.connections?.merge_hris;
    if (!mergeHR) {
        return false;
    }
    const syncDone = isMergeSyncDone(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR);
    const hasGroups = (mergeHR.data?.groups?.length ?? 0) > 0;
    const setupComplete = !!mergeHR.config?.groups;
    return syncDone && hasGroups && !setupComplete;
}

/**
 * True when a selected group ID is missing from the cached group list, meaning it no longer exists upstream.
 * Returns false if the cache has never synced, since there's nothing to compare against.
 */
function hasStaleMergeHRGroups(policy?: OnyxEntry<Policy>): boolean {
    const mergeHR = policy?.connections?.merge_hris;
    const selectedGroupIDs = mergeHR?.config?.groups;
    // allGroupIDs (not the display-filtered groups) is what the backend prunes against, so a group
    // missing a name/type isn't wrongly flagged as deleted here.
    const availableGroupIDs = mergeHR?.data?.allGroupIDs;
    // allGroupIDs is explicitly [] once a sync has actually run and found zero groups, so only
    // undefined (never synced) means there's nothing to compare against yet.
    if (!selectedGroupIDs?.length || !availableGroupIDs) {
        return false;
    }
    return selectedGroupIDs.some((groupID) => !availableGroupIDs.includes(groupID));
}

/**
 * The admin's group selection, minus any group the cached list no longer has. Those have no row to uncheck and the API
 * rejects them, so keeping them would leave the selector unable to save. A cache that has never synced is left untouched.
 */
function getSelectableMergeHRGroupIDs(policy?: OnyxEntry<Policy>): string[] {
    const mergeHR = policy?.connections?.merge_hris;
    const selectedGroupIDs = mergeHR?.config?.groups ?? [];
    const availableGroups = mergeHR?.data?.groups;
    // data.groups is explicitly [] once a sync has actually run and found zero renderable groups, so
    // only undefined (cache never loaded) means the selection should be left untouched.
    if (!availableGroups) {
        return [...selectedGroupIDs];
    }
    return selectedGroupIDs.filter((groupID) => availableGroups.some((group) => group.id === groupID));
}

/** Returns display info for the HR provider currently connected to the policy (Gusto, Zenefits, or Merge HR), or null if none are connected. */
function getConnectedHRProvider(policy?: OnyxEntry<Policy>): HRProviderInfo | null {
    if (isGustoConnected(policy)) {
        return {
            connectionName: CONST.POLICY.CONNECTIONS.NAME.GUSTO,
            displayName: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.gusto,
        };
    }
    if (isZenefitsConnected(policy)) {
        return {
            connectionName: CONST.POLICY.CONNECTIONS.NAME.ZENEFITS,
            displayName: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.zenefits,
        };
    }
    if (isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR)) {
        const slug = policy?.connections?.merge_hris?.config?.integration;
        const providerInfo = slug ? MERGE_HR_PROVIDERS[slug] : undefined;
        return {
            connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_HR,
            displayName: providerInfo?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_hris,
            iconUrl: providerInfo?.iconUrl ?? undefined,
            mergeSlug: slug,
        };
    }
    return null;
}

/** Returns true if the policy has any HR integration connected (Gusto, Zenefits, or Merge HR). */
function isAnyHRConnected(policy?: OnyxEntry<Policy>): boolean {
    return isGustoConnected(policy) || isZenefitsConnected(policy) || isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR);
}

/** Returns true if any connected HR integration uses a read-only approval mode (basic or advanced (manager)), which blocks manual workflow editing. */
function isAnyHRReadOnlyWorkflowMode(policy?: OnyxEntry<Policy>): boolean {
    const gustoMode = policy?.connections?.gusto?.config?.approvalMode;
    if (gustoMode === CONST.GUSTO.APPROVAL_MODE.BASIC || gustoMode === CONST.GUSTO.APPROVAL_MODE.MANAGER) {
        return true;
    }
    const zenefitsMode = policy?.connections?.zenefits?.config?.approvalMode;
    if (zenefitsMode === CONST.ZENEFITS.APPROVAL_MODE.BASIC || zenefitsMode === CONST.ZENEFITS.APPROVAL_MODE.MANAGER) {
        return true;
    }
    const mergeMode = policy?.connections?.merge_hris?.config?.approvalMode;
    if (mergeMode === CONST.MERGE.APPROVAL_MODE.BASIC || mergeMode === CONST.MERGE.APPROVAL_MODE.MANAGER) {
        return true;
    }
    return false;
}

/** Returns the approval mode configured for a specific HR connection, or null if not found. */
function getHRApprovalMode(
    policy?: OnyxEntry<Policy>,
    connectionName?: HRConnectionName,
): ValueOf<typeof CONST.GUSTO.APPROVAL_MODE> | ValueOf<typeof CONST.ZENEFITS.APPROVAL_MODE> | ValueOf<typeof CONST.MERGE.APPROVAL_MODE> | null {
    if (!connectionName || !policy?.connections) {
        return null;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO) {
        return policy.connections.gusto?.config?.approvalMode ?? null;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS) {
        return policy.connections.zenefits?.config?.approvalMode ?? null;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR) {
        return policy.connections.merge_hris?.config?.approvalMode ?? null;
    }
    return null;
}

/** Returns true if any connected HR integration (Gusto, Zenefits, or Merge HR) is configured in advanced (manager) approval mode. */
function isHRAdvancedMode(policy?: OnyxEntry<Policy>): boolean {
    return (
        policy?.connections?.gusto?.config?.approvalMode === CONST.GUSTO.APPROVAL_MODE.MANAGER ||
        policy?.connections?.zenefits?.config?.approvalMode === CONST.ZENEFITS.APPROVAL_MODE.MANAGER ||
        policy?.connections?.merge_hris?.config?.approvalMode === CONST.MERGE.APPROVAL_MODE.MANAGER
    );
}

/** Returns the finalApprover from whichever HR provider (Gusto, Zenefits, or Merge HR) is currently in advanced (manager) approval mode, or null if none are. */
function getHRAdvancedModeFinalApprover(policy?: OnyxEntry<Policy>): string | null {
    if (policy?.connections?.gusto?.config?.approvalMode === CONST.GUSTO.APPROVAL_MODE.MANAGER) {
        return policy.connections.gusto.config.finalApprover ?? null;
    }
    if (policy?.connections?.zenefits?.config?.approvalMode === CONST.ZENEFITS.APPROVAL_MODE.MANAGER) {
        return policy.connections.zenefits.config.finalApprover ?? null;
    }
    if (policy?.connections?.merge_hris?.config?.approvalMode === CONST.MERGE.APPROVAL_MODE.MANAGER) {
        return policy.connections.merge_hris.config.finalApprover ?? null;
    }
    return null;
}

/** Returns the finalApprover from whichever HR provider (Gusto, Zenefits, or Merge HR) is configured in basic or advanced (manager) approval mode, or null if none are. */
function getHRFinalApprover(policy?: OnyxEntry<Policy>): string | null {
    const gustoMode = policy?.connections?.gusto?.config?.approvalMode;
    if ((gustoMode === CONST.GUSTO.APPROVAL_MODE.BASIC || gustoMode === CONST.GUSTO.APPROVAL_MODE.MANAGER) && policy?.connections?.gusto?.config?.finalApprover) {
        return policy.connections.gusto.config.finalApprover;
    }
    const zenefitsMode = policy?.connections?.zenefits?.config?.approvalMode;
    if ((zenefitsMode === CONST.ZENEFITS.APPROVAL_MODE.BASIC || zenefitsMode === CONST.ZENEFITS.APPROVAL_MODE.MANAGER) && policy?.connections?.zenefits?.config?.finalApprover) {
        return policy.connections.zenefits.config.finalApprover;
    }
    return getMergeFinalApprover(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR);
}

/** Checks if any HR connection on the policy is in an error state. */
function shouldShowHRConnectionError(policy: OnyxEntry<Policy>, isSyncInProgress: boolean, isAdmin: boolean): boolean {
    if (!isAdmin) {
        return false;
    }
    const connectedProvider = getConnectedHRProvider(policy);
    if (!connectedProvider) {
        return false;
    }
    const lastSync = policy?.connections?.[connectedProvider.connectionName]?.lastSync;
    if (lastSync?.isAuthenticationError) {
        return true;
    }
    if (connectedProvider.connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR) {
        return hasMergeSyncError(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR) || hasStaleMergeHRGroups(policy);
    }
    return hasSynchronizationErrorMessage(policy, connectedProvider.connectionName, isSyncInProgress);
}

export {
    getConnectedHRProvider,
    getHRApprovalMode,
    getHRAdvancedModeFinalApprover,
    getHRFinalApprover,
    getSelectableMergeHRGroupIDs,
    hasStaleMergeHRGroups,
    isAnyHRConnected,
    isAnyHRReadOnlyWorkflowMode,
    isGustoConnected,
    isHRAdvancedMode,
    isMergeHRCompleteSetupNeeded,
    isZenefitsConnected,
    shouldShowHRConnectionError,
};

export type {HRConnectionName};
