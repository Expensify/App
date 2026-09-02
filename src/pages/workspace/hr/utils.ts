import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {PersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import {hasSynchronizationErrorMessage, isConnectionInProgress} from '@libs/actions/connections';
import getGustoSetupLink from '@libs/actions/connections/Gusto';
import {getMergeSetupLink} from '@libs/actions/connections/merge';
import getZenefitsSetupLink from '@libs/actions/connections/Zenefits';
import {formatList} from '@libs/Localize';
import {getConnectedHRProvider, getHRApprovalMode, isMergeHRCompleteSetupNeeded} from '@libs/merge/HRUtils';
import type {HRConnectionName} from '@libs/merge/HRUtils';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getIntegrationLastSuccessfulDate} from '@libs/PolicyUtils';

import type {MergeProviderCardDescriptor, MergeProviderConfigRow} from '@pages/workspace/merge/types';

import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import ROUTES from '@src/ROUTES';
import type {ConnectionName, GustoConnectionConfig, MergeHRConnectionConfig, PolicyConnectionSyncProgress, ZenefitsConnectionConfig} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

import type {OnyxEntry} from 'react-native-onyx';

type GetHRCardStateParams = {
    /** The workspace policy to derive HR card state from. */
    policy: OnyxEntry<Policy>;

    /** Connection name used to look up sync progress and connection status. */
    connectionName: ConnectionName;

    /** Current sync progress entry from Onyx, if any sync is running. */
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;

    /** Locale helper that converts an ISO datetime to a localized date string. */
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'];

    /** Slug identifying a specific Merge HR sub-provider (e.g. "bamboohr", "workday"). */
    mergeSlug?: MergeHRProviderSlug;
};

function getMergeHRSyncState(policy: OnyxEntry<Policy>) {
    const lastSync = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]?.lastSync;
    const isSyncInProgress = lastSync?.syncStatus === CONST.MERGE.SYNC_STATUS.SYNCING;
    return {
        isSyncInProgress,
        isInitialSyncInProgress: isSyncInProgress && lastSync?.syncType === CONST.MERGE.SYNC_TYPE.INITIAL,
        hasError: lastSync?.syncStatus === CONST.MERGE.SYNC_STATUS.FAILED,
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

    const lastSync = policy?.connections?.[connectionName]?.lastSync;
    const lastSyncErrorMessage = syncState.hasError ? lastSync?.errorMessage : undefined;
    const needsReconnect = !!lastSync?.isAuthenticationError;

    return {
        isConnected,
        ...syncState,
        lastSyncErrorMessage,
        needsReconnect,
    };
}

/** Returns a translated label for the current approval mode of the given HR connection (e.g. "Basic", "Manager", "Custom"). Falls back to "Not set". */
function getApprovalModeLabel(policy: OnyxEntry<Policy>, connectionName: HRConnectionName, translate: LocaleContextProps['translate']): string {
    const approvalMode = getHRApprovalMode(policy, connectionName);

    if (!approvalMode) {
        return translate('workspace.merge.notSet');
    }

    switch (approvalMode) {
        case CONST.GUSTO.APPROVAL_MODE.BASIC:
        case CONST.MERGE.APPROVAL_MODE.BASIC:
        case CONST.ZENEFITS.APPROVAL_MODE.BASIC:
            return translate('workspace.merge.approvalModes.basic');
        case CONST.GUSTO.APPROVAL_MODE.MANAGER:
        case CONST.MERGE.APPROVAL_MODE.MANAGER:
        case CONST.ZENEFITS.APPROVAL_MODE.MANAGER:
            return translate('workspace.merge.approvalModes.manager');
        case CONST.GUSTO.APPROVAL_MODE.CUSTOM:
        case CONST.MERGE.APPROVAL_MODE.CUSTOM:
        case CONST.ZENEFITS.APPROVAL_MODE.CUSTOM:
            return translate('workspace.merge.approvalModes.custom');
        default:
            return translate('workspace.merge.notSet');
    }
}

/** Display label for the admin's chosen Merge HR groups: list of names, or undefined when no specific groups have been chosen yet. */
function getMergeHRGroupsLabel(policy: OnyxEntry<Policy>): string | undefined {
    const groups = policy?.connections?.merge_hris?.config?.groups;
    if (!groups?.length) {
        return undefined;
    }
    const available = policy?.connections?.merge_hris?.data?.groups ?? [];
    const names = groups.map((id) => available.find((group) => group.id === id)?.name).filter((name): name is string => !!name);
    return formatList(names);
}

/** Resolves the final approver email to a display name via personal details. Returns "Not set" when no approver is configured. */
function getFinalApproverDisplayName(
    finalApprover: string | undefined | null,
    policyEmployeePersonalDetails: PersonalDetailsByLogin,
    translate: LocaleContextProps['translate'],
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
): string {
    if (!finalApprover) {
        return translate('workspace.merge.notSet');
    }
    return temporaryGetDisplayNameOrDefault({
        passedPersonalDetails: policyEmployeePersonalDetails[finalApprover],
        defaultValue: finalApprover,
        shouldFallbackToHidden: false,
        translate,
        formatPhoneNumber,
    });
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
        connectionName: CONST.POLICY.CONNECTIONS.NAME.GUSTO,
        titleKey: 'workspace.hr.gusto.title',
        iconParam: 'gustoIcon',
        approvalModeRoute: ROUTES.WORKSPACE_HR_GUSTO_APPROVAL_MODE,
        finalApproverRoute: ROUTES.WORKSPACE_HR_GUSTO_FINAL_APPROVER,
        getSetupLink: getGustoSetupLink,
    },
    {
        key: 'zenefits',
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

    /** The policy employee's personal details keyed by login */
    policyEmployeePersonalDetails: PersonalDetailsByLogin;

    /** Current sync progress entry from Onyx, shared across all providers. */
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;

    /** Locale helper that converts an ISO datetime to a localized date string. */
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'];

    /** Translation function for resolving i18n keys into display strings. */
    translate: LocaleContextProps['translate'];

    /** Formats a phone-number login for display in the current locale. */
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];

    /** ID of the workspace policy, used to build navigation routes. */
    policyID: string;

    /** Local icon asset for the Gusto provider card. */
    gustoIcon: IconAsset;

    /** Local icon asset for the TriNet provider card. */
    trinetIcon: IconAsset;
};

/** Builds the full list of HR provider card descriptors for the workspace HR page, including static providers (Gusto, Zenefits) and dynamic Merge HR sub-providers. */
function getHRCards({
    policy,
    policyEmployeePersonalDetails,
    connectionSyncProgress,
    getLocalDateFromDatetime,
    translate,
    formatPhoneNumber,
    policyID,
    ...iconParams
}: GetHRCardsParams): MergeProviderCardDescriptor[] {
    const cards: MergeProviderCardDescriptor[] = [];

    for (const provider of STATIC_HR_PROVIDERS) {
        const {connectionName} = provider;
        const state = getHRCardState({policy, connectionName, connectionSyncProgress, getLocalDateFromDatetime});
        const config = getCardConfig(policy, connectionName);
        cards.push({
            key: provider.key,
            category: CONST.POLICY.CONNECTIONS.CATEGORY.HR,
            connectionName,
            displayName: translate(provider.titleKey),
            icon: iconParams[provider.iconParam],
            setupLink: provider.getSetupLink?.(policyID),
            configRows:
                state.isConnected && !state.needsReconnect
                    ? [
                          {
                              field: 'approvalMode',
                              description: translate('workspace.merge.approvalMode'),
                              title: getApprovalModeLabel(policy, connectionName, translate),
                              route: provider.approvalModeRoute.getRoute(policyID),
                              pendingAction: config?.pendingFields?.approvalMode,
                              errors: config?.errorFields?.approvalMode,
                          },
                          {
                              field: 'finalApprover',
                              description: translate('workspace.merge.finalApprover'),
                              title: getFinalApproverDisplayName(config?.finalApprover, policyEmployeePersonalDetails, translate, formatPhoneNumber),
                              route: provider.finalApproverRoute.getRoute(policyID),
                              pendingAction: config?.pendingFields?.finalApprover,
                              errors: config?.errorFields?.finalApprover,
                          },
                      ]
                    : [],
            ...state,
        });
    }

    const mergeConnectionName = CONST.POLICY.CONNECTIONS.NAME.MERGE_HR;
    const disconnectedState = {isConnected: false, isSyncInProgress: false, isInitialSyncInProgress: false, hasError: false, needsReconnect: false} as const;

    for (const [slug, providerEntry] of Object.entries(MERGE_HR_PROVIDERS) as Array<[MergeHRProviderSlug, (typeof MERGE_HR_PROVIDERS)[MergeHRProviderSlug]]>) {
        const state = getHRCardState({policy, connectionName: mergeConnectionName, connectionSyncProgress, getLocalDateFromDatetime, mergeSlug: slug});
        const mergeConfig = state.isConnected ? policy?.connections?.merge_hris?.config : undefined;
        const needsSetup = state.isConnected && !state.needsReconnect && isMergeHRCompleteSetupNeeded(policy);
        const groupsRoute = ROUTES.WORKSPACE_HR_MERGE_GROUPS.getRoute(policyID);

        const configRows: MergeProviderConfigRow[] =
            state.isConnected && !state.needsReconnect
                ? [
                      {
                          field: 'groups',
                          description: translate('workspace.hr.mergeHR.groups.title'),
                          title: getMergeHRGroupsLabel(policy),
                          route: groupsRoute,
                          pendingAction: mergeConfig?.pendingFields?.groups,
                          errors: mergeConfig?.errorFields?.groups,
                      },
                      {
                          field: 'approvalMode',
                          description: translate('workspace.merge.approvalMode'),
                          title: getApprovalModeLabel(policy, mergeConnectionName, translate),
                          route: ROUTES.WORKSPACE_HR_MERGE_APPROVAL_MODE.getRoute(policyID),
                          pendingAction: mergeConfig?.pendingFields?.approvalMode,
                          errors: mergeConfig?.errorFields?.approvalMode,
                      },
                      {
                          field: 'finalApprover',
                          description: translate('workspace.merge.finalApprover'),
                          title: getFinalApproverDisplayName(mergeConfig?.finalApprover, policyEmployeePersonalDetails, translate, formatPhoneNumber),
                          route: ROUTES.WORKSPACE_HR_MERGE_FINAL_APPROVER.getRoute(policyID),
                          pendingAction: mergeConfig?.pendingFields?.finalApprover,
                          errors: mergeConfig?.errorFields?.finalApprover,
                      },
                  ]
                : [];

        cards.push({
            key: `merge_${slug}`,
            category: CONST.POLICY.CONNECTIONS.CATEGORY.HR,
            connectionName: mergeConnectionName,
            displayName: providerEntry.displayName,
            icon: providerEntry.iconUrl,
            setupLink: getMergeSetupLink(policyID, slug),
            ...(state.isConnected ? state : disconnectedState),
            completeSetupRoute: needsSetup ? groupsRoute : undefined,
            configRows,
        });
    }

    return cards;
}

export {getHRCardState, getHRCards, getApprovalModeLabel};
