import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {hasSynchronizationErrorMessage, isConnectionInProgress} from '@libs/actions/connections';
import getGustoSetupLink from '@libs/actions/connections/Gusto';
import getMergeHRSetupLink from '@libs/actions/connections/MergeHR';
import getZenefitsSetupLink from '@libs/actions/connections/Zenefits';
import {getAvailableMergeHRGroups, getConnectedHRProvider, getHRApprovalMode, isMergeHRSetupComplete} from '@libs/HRUtils';
import type {HRConnectionName} from '@libs/HRUtils';
import {formatList} from '@libs/Localize';
import {getDisplayNameOrDefault, getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getIntegrationLastSuccessfulDate} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type Beta from '@src/types/onyx/Beta';
import type {ConnectionName, GustoConnectionConfig, MergeHRConnectionConfig, PolicyConnectionSyncProgress, PolicyConnectionSyncStage, ZenefitsConnectionConfig} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

type HRCardConfig = MergeHRConnectionConfig | GustoConnectionConfig | ZenefitsConnectionConfig | undefined;

type HRCardDescriptor = {
    /** Unique identifier for this card. */
    key: string;

    /** The Onyx connection name that identifies this HR provider. */
    connectionName: HRConnectionName;

    /** Human-readable provider name shown in the UI (e.g. "Gusto", "Zenefits"). */
    displayName: string;

    /** Provider logo — either a remote URL string or a local icon asset. */
    icon: string | IconAsset;

    /** URL to open to start the connection flow for this HR provider. */
    setupLink?: string;

    /** Whether this provider is currently connected to the workspace. */
    isConnected: boolean;

    /** Whether a sync operation is currently running for this provider. */
    isSyncInProgress: boolean;

    /** Whether this provider's first-ever (initial) sync is currently running (Merge HR only). */
    isInitialSyncInProgress?: boolean;

    /** Navigation route to the post-connect setup RHP (group selection). Set only while the admin still needs to finish setup. */
    completeSetupRoute?: Route;

    /** Navigation route to the groups selector RHP. Set whenever the admin can edit their groups selection (Merge HR only). */
    groupsRoute?: Route;

    /** Comma-joined names of the chosen groups to sync, displayed on the Groups row (Merge HR only). */
    groupsLabel?: string;

    /** ISO date string of the last successful sync, used for "last synced" display. */
    successfulDate?: string;

    /** Whether the last sync resulted in an error. */
    hasError: boolean;

    /** Human-readable error message from the last failed sync attempt. */
    lastSyncErrorMessage?: string;

    /** Current stage of an in-progress sync, used to show step-level progress. */
    syncStageInProgress?: PolicyConnectionSyncStage;

    /** Navigation route to the approval-mode settings page for this provider. */
    approvalModeRoute?: Route;

    /** Navigation route to the final-approver selection page for this provider. */
    finalApproverRoute?: Route;

    /** Persisted configuration for the HR connection (approval mode, final approver, pending/error state). */
    config?: HRCardConfig;

    /** Translated label describing the current approval mode. */
    approvalModeLabel?: string;

    /** Display name of the assigned final approver. */
    finalApproverDisplayName?: string;
};

type GetHRCardStateParams = {
    /** The workspace policy to derive HR card state from. */
    policy: OnyxEntry<Policy>;

    /** Connection name used to look up sync progress and connection status. */
    connectionName: ConnectionName;

    /** Current sync progress entry from Onyx, if any sync is running. */
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;

    /** Locale helper that converts an ISO datetime to a localized date string. */
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'];

    /** Slug identifying a specific Merge HR sub-provider (e.g. "bamboohr", "rippling"). */
    mergeSlug?: MergeHRProviderSlug;
};

function getMergeHRSyncState(policy: OnyxEntry<Policy>) {
    const lastSync = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]?.lastSync;
    const isSyncInProgress = lastSync?.syncStatus === CONST.MERGE_HR.SYNC_STATUS.SYNCING;
    return {
        isSyncInProgress,
        isInitialSyncInProgress: isSyncInProgress && lastSync?.syncType === CONST.MERGE_HR.SYNC_TYPE.INITIAL,
        hasError: lastSync?.syncStatus === CONST.MERGE_HR.SYNC_STATUS.FAILED,
        syncStageInProgress: undefined,
        successfulDate: lastSync?.successfulDate,
    };
}

function getHRSyncState(
    policy: OnyxEntry<Policy>,
    connectionName: ConnectionName,
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>,
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'],
) {
    const connection = policy?.connections?.[connectionName];
    const syncProgress = connectionSyncProgress?.connectionName === connectionName ? connectionSyncProgress : undefined;
    const isSyncInProgress = !!syncProgress && isConnectionInProgress(syncProgress, policy);
    return {
        isSyncInProgress,
        isInitialSyncInProgress: undefined,
        hasError: hasSynchronizationErrorMessage(policy, connectionName, isSyncInProgress),
        syncStageInProgress: isSyncInProgress ? syncProgress?.stageInProgress : undefined,
        successfulDate: getIntegrationLastSuccessfulDate(getLocalDateFromDatetime, connection, syncProgress),
    };
}

/** Derives the runtime state (connected, syncing, errors, last sync date) for a single HR provider on a given policy. */
function getHRCardState({policy, connectionName, connectionSyncProgress, getLocalDateFromDatetime, mergeSlug}: GetHRCardStateParams) {
    const connectedProvider = getConnectedHRProvider(policy);
    const isConnected = connectedProvider?.connectionName === connectionName && (!mergeSlug || connectedProvider.mergeSlug === mergeSlug);

    const syncState =
        connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR ? getMergeHRSyncState(policy) : getHRSyncState(policy, connectionName, connectionSyncProgress, getLocalDateFromDatetime);

    const lastSyncErrorMessage = syncState.hasError ? policy?.connections?.[connectionName]?.lastSync?.errorMessage : undefined;

    return {
        isConnected,
        ...syncState,
        lastSyncErrorMessage,
    };
}

/** Returns a translated label for the current approval mode of the given HR connection (e.g. "Basic", "Manager", "Custom"). Falls back to "Not set". */
function getApprovalModeLabel(policy: OnyxEntry<Policy>, connectionName: HRConnectionName, translate: LocaleContextProps['translate']): string {
    const approvalMode = getHRApprovalMode(policy, connectionName);

    if (!approvalMode) {
        return translate('workspace.hr.notSet');
    }

    switch (approvalMode) {
        case CONST.GUSTO.APPROVAL_MODE.BASIC:
        case CONST.MERGE_HR.APPROVAL_MODE.BASIC:
        case CONST.ZENEFITS.APPROVAL_MODE.BASIC:
            return translate('workspace.hr.approvalModes.basic.label');
        case CONST.GUSTO.APPROVAL_MODE.MANAGER:
        case CONST.MERGE_HR.APPROVAL_MODE.MANAGER:
        case CONST.ZENEFITS.APPROVAL_MODE.MANAGER:
            return translate('workspace.hr.approvalModes.manager.label');
        case CONST.GUSTO.APPROVAL_MODE.CUSTOM:
        case CONST.MERGE_HR.APPROVAL_MODE.CUSTOM:
        case CONST.ZENEFITS.APPROVAL_MODE.CUSTOM:
            return translate('workspace.hr.approvalModes.custom.label');
        default:
            return translate('workspace.hr.notSet');
    }
}

/** Display label for the admin's chosen Merge HR groups: list of names or the localized "All" label for the 'all' value, or undefined when nothing is chosen. */
function getMergeHRGroupsSummary(policy: OnyxEntry<Policy>, translate: LocaleContextProps['translate']): string | undefined {
    const groups = policy?.connections?.merge_hris?.config?.groups;
    if (!groups) {
        return undefined;
    }
    if (groups === CONST.MERGE_HR.GROUPS_ALL) {
        return translate('common.all');
    }
    const available = getAvailableMergeHRGroups(policy);
    const names = groups.map((id) => available.find((group) => group.id === id)?.name).filter((name): name is string => !!name);
    return formatList(names);
}

/** Resolves the final approver email to a display name via personal details. Returns "Not set" when no approver is configured. */
function getFinalApproverDisplayName(finalApprover: string | undefined | null, translate: LocaleContextProps['translate']): string {
    if (!finalApprover) {
        return translate('workspace.hr.notSet');
    }
    return getDisplayNameOrDefault(getPersonalDetailByEmail(finalApprover), finalApprover, false);
}

/** Extracts the connection-specific config object (approval mode, final approver, pending/error fields) from the policy for a given HR provider. */
function getCardConfig(policy: OnyxEntry<Policy>, connectionName: HRConnectionName): MergeHRConnectionConfig | GustoConnectionConfig | ZenefitsConnectionConfig | undefined {
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO) {
        return policy?.connections?.gusto?.config;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS) {
        return policy?.connections?.zenefits?.config;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR) {
        return policy?.connections?.merge_hris?.config;
    }
    return undefined;
}

const STATIC_HR_PROVIDERS = [
    {
        key: 'gusto',
        beta: undefined,
        connectionName: CONST.POLICY.CONNECTIONS.NAME.GUSTO,
        titleKey: 'workspace.hr.gusto.title',
        iconParam: 'gustoIcon',
        approvalModeRoute: ROUTES.WORKSPACE_HR_GUSTO_APPROVAL_MODE,
        finalApproverRoute: ROUTES.WORKSPACE_HR_GUSTO_FINAL_APPROVER,
        getSetupLink: getGustoSetupLink,
    },
    {
        key: 'zenefits',
        beta: CONST.BETAS.ZENEFITS,
        connectionName: CONST.POLICY.CONNECTIONS.NAME.ZENEFITS,
        titleKey: 'workspace.hr.zenefits.title',
        iconParam: 'trinetIcon',
        approvalModeRoute: ROUTES.WORKSPACE_HR_ZENEFITS_APPROVAL_MODE,
        finalApproverRoute: ROUTES.WORKSPACE_HR_ZENEFITS_FINAL_APPROVER,
        getSetupLink: getZenefitsSetupLink,
    },
] as const;

type GetHRCardsParams = {
    /** The workspace policy used to derive connection state for each HR provider. */
    policy: OnyxEntry<Policy>;

    /** Current sync progress entry from Onyx, shared across all providers. */
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;

    /** Locale helper that converts an ISO datetime to a localized date string. */
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'];

    /** Predicate that checks whether a given beta flag is enabled for the current user. */
    isBetaEnabled: (beta: Beta) => boolean;

    /** Translation function for resolving i18n keys into display strings. */
    translate: LocaleContextProps['translate'];

    /** ID of the workspace policy, used to build navigation routes. */
    policyID: string;

    /** Local icon asset for the Gusto provider card. */
    gustoIcon: IconAsset;

    /** Local icon asset for the TriNet provider card. */
    trinetIcon: IconAsset;
};

/** Builds the full list of HR provider card descriptors for the workspace HR page, including static providers (Gusto, Zenefits) and dynamic Merge HR sub-providers gated by betas. */
function getHRCards({policy, connectionSyncProgress, isBetaEnabled, getLocalDateFromDatetime, translate, policyID, ...iconParams}: GetHRCardsParams): HRCardDescriptor[] {
    const cards: HRCardDescriptor[] = [];

    for (const provider of STATIC_HR_PROVIDERS) {
        const {connectionName} = provider;
        const state = getHRCardState({policy, connectionName, connectionSyncProgress, getLocalDateFromDatetime});
        if (provider.beta && !isBetaEnabled(provider.beta) && !state.isConnected) {
            continue;
        }
        const config = getCardConfig(policy, connectionName);
        cards.push({
            key: provider.key,
            connectionName,
            displayName: translate(provider.titleKey),
            icon: iconParams[provider.iconParam],
            setupLink: provider.getSetupLink?.(policyID),
            approvalModeRoute: provider.approvalModeRoute.getRoute(policyID),
            finalApproverRoute: provider.finalApproverRoute.getRoute(policyID),
            config,
            approvalModeLabel: getApprovalModeLabel(policy, connectionName, translate),
            finalApproverDisplayName: getFinalApproverDisplayName(config?.finalApprover, translate),
            ...state,
        });
    }

    if (isBetaEnabled(CONST.BETAS.MERGE_HR)) {
        const mergeConnectionName = CONST.POLICY.CONNECTIONS.NAME.MERGE_HR;
        const disconnectedState = {isConnected: false, isSyncInProgress: false, isInitialSyncInProgress: false, hasError: false} as const;

        for (const [slug, providerEntry] of Object.entries(MERGE_HR_PROVIDERS) as Array<[MergeHRProviderSlug, (typeof MERGE_HR_PROVIDERS)[MergeHRProviderSlug]]>) {
            const state = getHRCardState({policy, connectionName: mergeConnectionName, connectionSyncProgress, getLocalDateFromDatetime, mergeSlug: slug});
            const config = state.isConnected ? getCardConfig(policy, mergeConnectionName) : undefined;
            const needsSetup = state.isConnected && !isMergeHRSetupComplete(policy);
            const groupsRoute = state.isConnected ? ROUTES.WORKSPACE_HR_MERGE_GROUPS.getRoute(policyID) : undefined;

            cards.push({
                key: `merge_${slug}`,
                connectionName: mergeConnectionName,
                displayName: providerEntry.displayName,
                icon: providerEntry.iconUrl,
                setupLink: getMergeHRSetupLink(policyID, slug),
                ...(state.isConnected ? state : disconnectedState),
                completeSetupRoute: needsSetup ? groupsRoute : undefined,
                groupsRoute,
                groupsLabel: state.isConnected ? getMergeHRGroupsSummary(policy, translate) : undefined,
                approvalModeRoute: ROUTES.WORKSPACE_HR_MERGE_APPROVAL_MODE.getRoute(policyID),
                finalApproverRoute: ROUTES.WORKSPACE_HR_MERGE_FINAL_APPROVER.getRoute(policyID),
                config,
                approvalModeLabel: config ? getApprovalModeLabel(policy, mergeConnectionName, translate) : undefined,
                finalApproverDisplayName: config ? getFinalApproverDisplayName(config.finalApprover, translate) : undefined,
            });
        }
    }

    return cards;
}

export type {HRCardDescriptor};
export {getHRCardState, getHRCards, getApprovalModeLabel};
