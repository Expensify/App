import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import type {Policy} from '@src/types/onyx';
import type {MergeHRGroup} from '@src/types/onyx/Policy';

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

/** Returns true if the policy has a Merge HR integration connected. */
function isMergeHRConnected(policy?: OnyxEntry<Policy>): boolean {
    return !!policy?.connections?.merge_hris;
}

/** Groups the admin can choose from when picking which employees to import. */
function getAvailableMergeHRGroups(policy?: OnyxEntry<Policy>): MergeHRGroup[] {
    return policy?.connections?.merge_hris?.data?.groups ?? [];
}

/** True when the admin still needs to complete the Merge HR setup (select groups). */
function isMergeHRCompleteSetupNeeded(policy?: OnyxEntry<Policy>): boolean {
    const mergeHR = policy?.connections?.merge_hris;
    if (!mergeHR) {
        return false;
    }
    const hasGroups = (mergeHR.data?.groups?.length ?? 0) > 0;
    const setupComplete = !!mergeHR.config?.groups;
    return hasGroups && !setupComplete;
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
    if (isMergeHRConnected(policy)) {
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
    return isGustoConnected(policy) || isZenefitsConnected(policy) || isMergeHRConnected(policy);
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
    if (mergeMode === CONST.MERGE_HR.APPROVAL_MODE.BASIC || mergeMode === CONST.MERGE_HR.APPROVAL_MODE.MANAGER) {
        return true;
    }
    return false;
}

/** Returns the approval mode configured for a specific HR connection, or null if not found. */
function getHRApprovalMode(
    policy?: OnyxEntry<Policy>,
    connectionName?: HRConnectionName,
): ValueOf<typeof CONST.GUSTO.APPROVAL_MODE> | ValueOf<typeof CONST.ZENEFITS.APPROVAL_MODE> | ValueOf<typeof CONST.MERGE_HR.APPROVAL_MODE> | null {
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
        policy?.connections?.merge_hris?.config?.approvalMode === CONST.MERGE_HR.APPROVAL_MODE.MANAGER
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
    if (policy?.connections?.merge_hris?.config?.approvalMode === CONST.MERGE_HR.APPROVAL_MODE.MANAGER) {
        return policy.connections.merge_hris.config.finalApprover ?? null;
    }
    return null;
}

/** Returns the Merge HR finalApprover when the integration is in basic or advanced (manager) mode, or null otherwise. */
function getMergeHRFinalApprover(policy: OnyxEntry<Policy>): string | null {
    const mergeConfig = policy?.connections?.merge_hris?.config;
    if ((mergeConfig?.approvalMode === CONST.MERGE_HR.APPROVAL_MODE.BASIC || mergeConfig?.approvalMode === CONST.MERGE_HR.APPROVAL_MODE.MANAGER) && mergeConfig?.finalApprover) {
        return mergeConfig.finalApprover;
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
    const mergeMode = policy?.connections?.merge_hris?.config?.approvalMode;
    if ((mergeMode === CONST.MERGE_HR.APPROVAL_MODE.BASIC || mergeMode === CONST.MERGE_HR.APPROVAL_MODE.MANAGER) && policy?.connections?.merge_hris?.config?.finalApprover) {
        return policy.connections.merge_hris.config.finalApprover;
    }
    return null;
}

export {
    getConnectedHRProvider,
    getHRApprovalMode,
    getHRAdvancedModeFinalApprover,
    getHRFinalApprover,
    getMergeHRFinalApprover,
    getAvailableMergeHRGroups,
    isAnyHRConnected,
    isAnyHRReadOnlyWorkflowMode,
    isGustoConnected,
    isHRAdvancedMode,
    isMergeHRCompleteSetupNeeded,
    isMergeHRConnected,
    isZenefitsConnected,
};

export type {HRConnectionName};
