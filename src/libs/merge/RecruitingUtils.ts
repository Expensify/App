import {formatList} from '@libs/Localize';

import CONST from '@src/CONST';
import MERGE_ATS_PROVIDERS from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {MergeATSProviderSlug} from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';

import {hasMergeSyncError, isMergeConnected, isMergeSyncDone} from './MergeUtils';

type RecruitingConnectionName = TupleToUnion<typeof CONST.POLICY.CONNECTIONS.RECRUITING_CONNECTION_NAMES>;

/** Display info for a recruiting (ATS) provider connected to a policy. */
type RecruitingProviderInfo = {
    /** The internal connection name used as the key on `policy.connections` (e.g. `'merge_ats'`). */
    connectionName: RecruitingConnectionName;

    /** Human-readable label shown in the UI (e.g. a Merge ATS provider brand like `'Greenhouse'`). */
    displayName: string;

    /** Optional logo URL. Populated only when the provider slug resolves in `MERGE_ATS_PROVIDERS`. */
    iconUrl?: string;

    /** Merge ATS integration slug (e.g. `'greenhouse'`). Only set when `connectionName` is Merge ATS. */
    mergeSlug?: MergeATSProviderSlug;
};

/** Returns display info for the recruiting provider currently connected to the policy, or null if none is connected. */
function getConnectedATSProvider(policy: OnyxEntry<Policy>): RecruitingProviderInfo | null {
    if (isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS)) {
        const slug = policy?.connections?.merge_ats?.config?.integration;
        const providerInfo = slug ? MERGE_ATS_PROVIDERS[slug] : undefined;
        return {
            connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS,
            displayName: providerInfo?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_ats,
            iconUrl: providerInfo?.iconUrl ?? undefined,
            mergeSlug: slug,
        };
    }
    return null;
}

/** Formats one Merge ATS filter dimension into a display label, or undefined when nothing is selected for it. */
function getFilterDimensionLabel(selectedNames: string[] | undefined): string | undefined {
    if (!selectedNames?.length) {
        return undefined;
    }
    return formatList(selectedNames);
}

/** Display label for the tags the admin chose to filter candidates by, or undefined when no tag is selected. Tags are stored as names, so they are used as-is. */
function getMergeATSTagsLabel(policy: OnyxEntry<Policy>): string | undefined {
    return getFilterDimensionLabel(policy?.connections?.merge_ats?.config?.filters?.tags);
}

/** Display label for the stages the admin chose to filter candidates by, or undefined when no stage is selected. Stages are stored as names, so they are used as-is. */
function getMergeATSStagesLabel(policy: OnyxEntry<Policy>): string | undefined {
    return getFilterDimensionLabel(policy?.connections?.merge_ats?.config?.filters?.stages);
}

/**
 * Display label for the offices the admin chose to filter candidates by, or undefined when no office is selected.
 * Offices are stored as IDs, so they are resolved against the office catalog in `data.offices`.
 */
function getMergeATSOfficesLabel(policy: OnyxEntry<Policy>): string | undefined {
    const mergeATS = policy?.connections?.merge_ats;
    const availableOffices = mergeATS?.data?.offices ?? [];
    const officeNames = (mergeATS?.config?.filters?.offices ?? [])
        .map((officeID) => availableOffices.find((office) => office.id === officeID)?.name)
        .filter((name): name is string => !!name);

    return getFilterDimensionLabel(officeNames);
}

/** True when the admin still needs to complete the Merge ATS setup (choose the candidate filters). */
function isMergeATSCompleteSetupNeeded(policy?: OnyxEntry<Policy>): boolean {
    const mergeATS = policy?.connections?.merge_ats;
    if (!mergeATS) {
        return false;
    }
    const syncDone = isMergeSyncDone(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS);
    const hasFilters = (mergeATS.data?.offices?.length ?? 0) > 0 || (mergeATS.data?.stages?.length ?? 0) > 0 || (mergeATS.data?.tags?.length ?? 0) > 0;
    const setupComplete = !!mergeATS.config?.filters;
    return syncDone && hasFilters && !setupComplete;
}

/** Returns the approval mode configured for the Merge ATS connection, or null when it is not set. */
function getMergeATSApprovalMode(policy?: OnyxEntry<Policy>): ValueOf<typeof CONST.MERGE.APPROVAL_MODE> | null {
    return policy?.connections?.merge_ats?.config?.approvalMode ?? null;
}

/** Returns the ATS field the default approver is read from (e.g. the recruiter field), or null when it is not set. */
function getMergeATSApproverField(policy?: OnyxEntry<Policy>): string | null {
    return policy?.connections?.merge_ats?.config?.approverField ?? null;
}

/** Checks if the recruiting connection on the policy is in an error state the admin needs to resolve. */
function shouldShowRecruitingConnectionError(policy: OnyxEntry<Policy>, isAdmin: boolean): boolean {
    if (!isAdmin || !isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS)) {
        return false;
    }
    return hasMergeSyncError(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS);
}

export {
    getConnectedATSProvider,
    getMergeATSApprovalMode,
    getMergeATSApproverField,
    getMergeATSOfficesLabel,
    getMergeATSStagesLabel,
    getMergeATSTagsLabel,
    isMergeATSCompleteSetupNeeded,
    shouldShowRecruitingConnectionError,
};

export type {RecruitingConnectionName};
