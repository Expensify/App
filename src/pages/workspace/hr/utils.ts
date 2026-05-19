import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {hasSynchronizationErrorMessage, isConnectionInProgress} from '@libs/actions/connections';
import {getDisplayNameOrDefault, getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import type {HRConnectionName} from '@libs/PolicyUtils';
import {getHRApprovalMode, getIntegrationLastSuccessfulDate, isGustoConnected, isMergeHRConnected, isZenefitsConnected} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type Beta from '@src/types/onyx/Beta';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {ConnectionName, PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

type ConnectFlowType = 'gusto' | 'zenefits' | 'none';

type HRCardConfig = {
    approvalMode?: string;
    finalApprover?: string;
    pendingFields?: Record<string, PendingAction>;
    errorFields?: Record<string, unknown>;
};

type HRCardDescriptor = {
    key: string;
    connectionName: HRConnectionName;
    displayName: string;
    icon: string | IconAsset;
    iconType: typeof CONST.ICON_TYPE_AVATAR;
    isConnected: boolean;
    isSyncInProgress: boolean;
    successfulDate?: string;
    hasError: boolean;
    mergeSlug?: MergeHRProviderSlug;
    connectFlowType: ConnectFlowType;
    approvalModeRoute?: Route;
    finalApproverRoute?: Route;
    config?: HRCardConfig;
    approvalModeLabel?: string;
    finalApproverDisplayName?: string;
};

type GetHRCardStateParams = {
    policy: OnyxEntry<Policy>;
    connectionName: ConnectionName;
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'];
    mergeSlug?: MergeHRProviderSlug;
};

function getHRCardState({policy, connectionName, connectionSyncProgress, getLocalDateFromDatetime, mergeSlug}: GetHRCardStateParams) {
    const isSyncInProgress = connectionSyncProgress?.connectionName === connectionName && isConnectionInProgress(connectionSyncProgress, policy);

    let isConnected = false;
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO) {
        isConnected = isGustoConnected(policy);
    } else if (connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS) {
        isConnected = isZenefitsConnected(policy);
    } else if (connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR) {
        const mergeConnection = policy?.connections?.merge_hris;
        isConnected = isMergeHRConnected(policy) && (!mergeSlug || mergeConnection?.config?.integration === mergeSlug);
    }

    const connection = policy?.connections?.[connectionName];
    const syncProgress = connectionSyncProgress?.connectionName === connectionName ? connectionSyncProgress : undefined;
    const successfulDate = getIntegrationLastSuccessfulDate(getLocalDateFromDatetime, connection, syncProgress);

    const hasError = hasSynchronizationErrorMessage(policy, connectionName, !!isSyncInProgress);

    return {
        isConnected,
        isSyncInProgress: !!isSyncInProgress,
        successfulDate,
        hasError,
    };
}

function getApprovalModeLabel(policy: OnyxEntry<Policy>, connectionName: HRConnectionName, translate: LocaleContextProps['translate']): string {
    const approvalMode = getHRApprovalMode(policy, connectionName);

    if (!approvalMode) {
        return translate('workspace.hr.notSet');
    }

    switch (approvalMode) {
        case CONST.GUSTO.APPROVAL_MODE.BASIC:
        case CONST.MERGE_HR.APPROVAL_MODE.BASIC:
            return translate('workspace.hr.approvalModes.basic.label');
        case CONST.GUSTO.APPROVAL_MODE.MANAGER:
        case CONST.MERGE_HR.APPROVAL_MODE.MANAGER:
            return translate('workspace.hr.approvalModes.manager.label');
        case CONST.GUSTO.APPROVAL_MODE.CUSTOM:
        case CONST.MERGE_HR.APPROVAL_MODE.CUSTOM:
            return translate('workspace.hr.approvalModes.custom.label');
        default:
            return translate('workspace.hr.notSet');
    }
}

function getFinalApproverDisplayName(finalApprover: string | undefined | null, translate: LocaleContextProps['translate']): string {
    if (!finalApprover) {
        return translate('workspace.hr.notSet');
    }
    return getDisplayNameOrDefault(getPersonalDetailByEmail(finalApprover), finalApprover, false);
}

function getCardConfig(policy: OnyxEntry<Policy>, connectionName: HRConnectionName): HRCardConfig | undefined {
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO) {
        return policy?.connections?.gusto?.config as HRCardConfig | undefined;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS) {
        return policy?.connections?.zenefits?.config as HRCardConfig | undefined;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR) {
        return policy?.connections?.merge_hris?.config as HRCardConfig | undefined;
    }
    return undefined;
}

function getApprovalModeRoute(connectionName: HRConnectionName, policyID: string): Route | undefined {
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO) {
        return ROUTES.WORKSPACE_HR_GUSTO_APPROVAL_MODE.getRoute(policyID);
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS) {
        return ROUTES.WORKSPACE_HR_ZENEFITS_APPROVAL_MODE.getRoute(policyID);
    }
    return undefined;
}

function getFinalApproverRoute(connectionName: HRConnectionName, policyID: string): Route | undefined {
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO) {
        return ROUTES.WORKSPACE_HR_GUSTO_FINAL_APPROVER.getRoute(policyID);
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS) {
        return ROUTES.WORKSPACE_HR_ZENEFITS_FINAL_APPROVER.getRoute(policyID);
    }
    return undefined;
}

function getConnectFlowType(connectionName: HRConnectionName): ConnectFlowType {
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO) {
        return 'gusto';
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS) {
        return 'zenefits';
    }
    return 'none';
}

type GetHRCardsParams = {
    policy: OnyxEntry<Policy>;
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'];
    isBetaEnabled: (beta: Beta) => boolean;
    translate: LocaleContextProps['translate'];
    policyID: string;
    gustoIcon: IconAsset;
    zenefitsIcon: IconAsset;
};

function getHRCards({policy, connectionSyncProgress, isBetaEnabled, getLocalDateFromDatetime, translate, policyID, gustoIcon, zenefitsIcon}: GetHRCardsParams): HRCardDescriptor[] {
    const cards: HRCardDescriptor[] = [];

    if (isBetaEnabled(CONST.BETAS.GUSTO)) {
        const connectionName = CONST.POLICY.CONNECTIONS.NAME.GUSTO;
        const state = getHRCardState({policy, connectionName, connectionSyncProgress, getLocalDateFromDatetime});
        const config = getCardConfig(policy, connectionName);
        cards.push({
            key: 'gusto',
            connectionName,
            displayName: translate('workspace.hr.gusto.title'),
            icon: gustoIcon,
            iconType: CONST.ICON_TYPE_AVATAR,
            connectFlowType: getConnectFlowType(connectionName),
            approvalModeRoute: getApprovalModeRoute(connectionName, policyID),
            finalApproverRoute: getFinalApproverRoute(connectionName, policyID),
            config,
            approvalModeLabel: getApprovalModeLabel(policy, connectionName, translate),
            finalApproverDisplayName: getFinalApproverDisplayName(config?.finalApprover, translate),
            ...state,
        });
    }

    if (isBetaEnabled(CONST.BETAS.ZENEFITS)) {
        const connectionName = CONST.POLICY.CONNECTIONS.NAME.ZENEFITS;
        const state = getHRCardState({policy, connectionName, connectionSyncProgress, getLocalDateFromDatetime});
        const config = getCardConfig(policy, connectionName);
        cards.push({
            key: 'zenefits',
            connectionName,
            displayName: translate('workspace.hr.zenefits.title'),
            icon: zenefitsIcon,
            iconType: CONST.ICON_TYPE_AVATAR,
            connectFlowType: getConnectFlowType(connectionName),
            approvalModeRoute: getApprovalModeRoute(connectionName, policyID),
            finalApproverRoute: getFinalApproverRoute(connectionName, policyID),
            config,
            approvalModeLabel: getApprovalModeLabel(policy, connectionName, translate),
            finalApproverDisplayName: getFinalApproverDisplayName(config?.finalApprover, translate),
            ...state,
        });
    }

    if (isBetaEnabled(CONST.BETAS.MERGE_HR)) {
        const mergeConnectionName = CONST.POLICY.CONNECTIONS.NAME.MERGE_HR;
        const mergeConnectedSlug = policy?.connections?.merge_hris?.config?.integration;

        for (const [slug, providerEntry] of Object.entries(MERGE_HR_PROVIDERS) as Array<[MergeHRProviderSlug, (typeof MERGE_HR_PROVIDERS)[MergeHRProviderSlug]]>) {
            const state = getHRCardState({policy, connectionName: mergeConnectionName, connectionSyncProgress, getLocalDateFromDatetime, mergeSlug: slug});
            const isThisSlugConnected = !!mergeConnectedSlug && mergeConnectedSlug === slug;
            const config = isThisSlugConnected ? getCardConfig(policy, mergeConnectionName) : undefined;

            cards.push({
                key: `merge_${slug}`,
                connectionName: mergeConnectionName,
                displayName: providerEntry.displayName,
                icon: providerEntry.iconUrl,
                iconType: CONST.ICON_TYPE_AVATAR,
                isConnected: isThisSlugConnected,
                isSyncInProgress: isThisSlugConnected ? state.isSyncInProgress : false,
                successfulDate: isThisSlugConnected ? state.successfulDate : undefined,
                hasError: isThisSlugConnected ? state.hasError : false,
                mergeSlug: slug,
                connectFlowType: getConnectFlowType(mergeConnectionName),
                approvalModeRoute: undefined,
                finalApproverRoute: undefined,
                config,
                approvalModeLabel: config ? getApprovalModeLabel(policy, mergeConnectionName, translate) : undefined,
                finalApproverDisplayName: config ? getFinalApproverDisplayName(config.finalApprover, translate) : undefined,
            });
        }
    }

    return cards;
}

export type {HRCardDescriptor, ConnectFlowType};
export {getHRCardState, getHRCards, getApprovalModeLabel};
