import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {formatList} from '@libs/Localize';

import CONST from '@src/CONST';
import MERGE_ATS_PROVIDERS from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {MergeATSProviderSlug} from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {Policy} from '@src/types/onyx';
import type {MergeATSConnectionData, MergeATSFilters, MergeApprovalMode, MergeATSApproverField} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';

import {hasMergeSyncError, isMergeConnected, isMergeSyncDone} from './MergeUtils';

type RecruitingConnectionName = TupleToUnion<typeof CONST.POLICY.CONNECTIONS.RECRUITING_CONNECTION_NAMES>;

/** One of the dimensions candidates can be filtered by when importing them from an ATS. */
type MergeATSFilterType = ValueOf<typeof CONST.MERGE.ATS_FILTER_TYPE>;

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

/** Returns true when any recruiting (ATS) provider is connected to the policy. */
function isAnyRecruitingConnected(policy: OnyxEntry<Policy>): boolean {
    return isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS);
}

/** Formats one Merge ATS filter dimension into a display label, or undefined when nothing is selected for it. */
function getFilterDimensionLabel(selectedNames: string[] | undefined): string | undefined {
    if (!selectedNames?.length) {
        return undefined;
    }
    return formatList(selectedNames);
}

/**
 * The values the ATS currently offers for one filter dimension, paired with the value that is stored in `config.filters`
 * for each of them. Tags and stages are stored by name, offices by ID.
 */
function getMergeATSFilterOptions(filterType: MergeATSFilterType, data: MergeATSConnectionData | undefined) {
    switch (filterType) {
        case CONST.MERGE.ATS_FILTER_TYPE.TAGS:
            return (data?.tags ?? []).map((tag) => ({value: tag, name: tag}));
        case CONST.MERGE.ATS_FILTER_TYPE.STAGES:
            return (data?.stages ?? []).map((stage) => ({value: stage.name, name: stage.name}));
        case CONST.MERGE.ATS_FILTER_TYPE.OFFICES:
            return (data?.offices ?? []).map((office) => ({value: office.id, name: office.name}));
        default:
            return [];
    }
}

function getMergeATSFilterValues(filterType: MergeATSFilterType, data: MergeATSConnectionData | undefined): string[] {
    switch (filterType) {
        case CONST.MERGE.ATS_FILTER_TYPE.TAGS:
            return data?.tags ?? [];
        case CONST.MERGE.ATS_FILTER_TYPE.STAGES:
            return (data?.stages ?? []).map((stage) => stage.name);
        case CONST.MERGE.ATS_FILTER_TYPE.OFFICES:
            return (data?.offices ?? []).map((office) => office.id);
        default:
            return [];
    }
}

/**
 * Display label for one dimension of the given filters, or undefined when nothing selected for it resolves to a name.
 * Offices are stored as IDs, so they are resolved against the office catalog in `data.offices`. Tags and stages are
 * stored as names and used as-is.
 */
function getMergeATSFilterLabel(
    filterType: MergeATSFilterType,
    filters: MergeATSFilters | undefined | null,
    data: MergeATSConnectionData | undefined,
    translate: LocalizedTranslate,
): string | undefined {
    const selectedValues = filters?.[filterType];
    const dataLength = data?.[filterType]?.length;
    const isAllSelected = selectedValues?.length === dataLength;

    if (dataLength && isAllSelected) {
        return translate(`workspace.recruiting.filters.${filterType}.allSelected`);
    }

    if (filterType !== CONST.MERGE.ATS_FILTER_TYPE.OFFICES) {
        return getFilterDimensionLabel(selectedValues);
    }

    const availableOffices = data?.offices ?? [];
    const officeNames = (selectedValues ?? []).map((officeID) => availableOffices.find((office) => office.id === officeID)?.name).filter((name): name is string => !!name);

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
function getMergeATSApprovalMode(policy?: OnyxEntry<Policy>): MergeApprovalMode | undefined {
    return policy?.connections?.merge_ats?.config?.approvalMode ?? undefined;
}

/** Returns the ATS field the default approver is read from (e.g. the recruiter field), or undefined when it is not set. */
function getMergeATSApproverField(policy?: OnyxEntry<Policy>): MergeATSApproverField | undefined {
    return policy?.connections?.merge_ats?.config?.approverField ?? undefined;
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
    getMergeATSFilterLabel,
    getMergeATSFilterOptions,
    getMergeATSFilterValues,
    isAnyRecruitingConnected,
    isMergeATSCompleteSetupNeeded,
    shouldShowRecruitingConnectionError,
};

export type {MergeATSFilterType, RecruitingConnectionName};
