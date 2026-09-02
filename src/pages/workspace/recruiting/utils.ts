import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {PersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import {getMergeSetupLink} from '@libs/actions/connections/merge';
import {hasMergeAuthenticationError} from '@libs/merge/MergeUtils';
import {getConnectedATSProvider, getMergeATSApprovalMode, getMergeATSApproverField, isMergeATSCompleteSetupNeeded} from '@libs/merge/RecruitingUtils';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import type {MergeProviderCardDescriptor, MergeProviderConfigRow} from '@pages/workspace/merge/types';

import CONST from '@src/CONST';
import MERGE_ATS_PROVIDERS from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {MergeATSProviderSlug} from '@src/CONST/MERGE_ATS_PROVIDERS';
import ROUTES from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';
import IconAsset from '@src/types/utils/IconAsset';
import ObjectUtils from '@src/types/utils/ObjectUtils';

import type {OnyxEntry} from 'react-native-onyx';

function getApproverFieldLabel(policy: OnyxEntry<Policy>, translate: LocaleContextProps['translate']): string {
    const approverField = getMergeATSApproverField(policy);
    switch (approverField) {
        case CONST.MERGE.ATS_APPROVER_FIELD.RECRUITER:
            return translate('workspace.recruiting.approverFields.recruiter');
        case CONST.MERGE.ATS_APPROVER_FIELD.RECRUITING_COORDINATOR:
            return translate('workspace.recruiting.approverFields.recruitingCoordinator');
        default:
            return approverField ?? translate('workspace.merge.notSet');
    }
}

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

function getDefaultApproverLabel(
    policy: OnyxEntry<Policy>,
    policyEmployeePersonalDetails: PersonalDetailsByLogin,
    translate: LocaleContextProps['translate'],
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
): string {
    const config = policy?.connections?.merge_ats?.config;
    const approvalMode = getMergeATSApprovalMode(policy);

    if (approvalMode === CONST.MERGE.APPROVAL_MODE.BASIC || approvalMode === CONST.MERGE.APPROVAL_MODE.ADVANCED) {
        const approver = getFinalApproverDisplayName(config?.finalApprover, policyEmployeePersonalDetails, translate, formatPhoneNumber);

        if (approvalMode === CONST.MERGE.APPROVAL_MODE.BASIC) {
            return `${translate('workspace.merge.approvalModes.basic')} • ${approver}`;
        }

        return `${translate('workspace.merge.approvalModes.advanced')} • ${getApproverFieldLabel(policy, translate)} -> ${approver}`;
    }

    if (approvalMode === CONST.MERGE.APPROVAL_MODE.CUSTOM) {
        return translate('workspace.merge.approvalModes.custom');
    }

    return translate('workspace.merge.notSet');
}

function getRecruitingCardState(policy: OnyxEntry<Policy>, mergeSlug: MergeATSProviderSlug) {
    const connectedProvider = getConnectedATSProvider(policy);
    const isConnected = connectedProvider?.mergeSlug === mergeSlug;

    if (!isConnected) {
        return {isConnected: false, isSyncInProgress: false, isInitialSyncInProgress: false, hasError: false, needsReconnect: false} as const;
    }

    const lastSync = policy?.connections?.merge_ats?.lastSync;
    const isSyncInProgress = lastSync?.syncStatus === CONST.MERGE.SYNC_STATUS.SYNCING;
    const hasError = lastSync?.syncStatus === CONST.MERGE.SYNC_STATUS.FAILED;

    return {
        isConnected: true,
        isSyncInProgress,
        isInitialSyncInProgress: isSyncInProgress && lastSync?.syncType === CONST.MERGE.SYNC_TYPE.INITIAL,
        hasError,
        needsReconnect: hasMergeAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS),
        lastSyncErrorMessage: hasError ? lastSync?.errorMessage : undefined,
        successfulDate: lastSync?.successfulDate,
    };
}

function getConfigRows(
    policy: OnyxEntry<Policy>,
    policyID: string,
    policyEmployeePersonalDetails: PersonalDetailsByLogin,
    icons: Record<'Download', IconAsset>,
    translate: LocaleContextProps['translate'],
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
): MergeProviderConfigRow[] {
    const config = policy?.connections?.merge_ats?.config;

    const rows: MergeProviderConfigRow[] = [
        {
            field: 'filters',
            icon: icons.Download,
            title: translate('workspace.recruiting.importSettings'),
            shouldRenderAsMenuItem: true,
            route: ROUTES.WORKSPACE_RECRUITING_MERGE_IMPORT_SETTINGS.getRoute(policyID),
            pendingAction: config?.pendingFields?.filters,
            errors: config?.errorFields?.filters,
        },
        {
            field: 'approvalMode',
            description: translate('workspace.recruiting.defaultApprover'),
            title: getDefaultApproverLabel(policy, policyEmployeePersonalDetails, translate, formatPhoneNumber),
            route: ROUTES.WORKSPACE_RECRUITING_MERGE_APPROVAL_MODE.getRoute(policyID),
            pendingAction: config?.pendingFields?.approvalMode,
            errors: config?.errorFields?.approvalMode,
        },
    ];

    return rows;
}

type GetRecruitingCardsParams = {
    policy: OnyxEntry<Policy>;
    policyEmployeePersonalDetails: PersonalDetailsByLogin;
    policyID: string;
    icons: Record<'Download', IconAsset>;
    translate: LocaleContextProps['translate'];
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
};

function getRecruitingCards({policy, policyEmployeePersonalDetails, policyID, icons, translate, formatPhoneNumber}: GetRecruitingCardsParams): MergeProviderCardDescriptor[] {
    return ObjectUtils.typedKeys(MERGE_ATS_PROVIDERS).map((slug) => {
        const providerEntry = MERGE_ATS_PROVIDERS[slug];
        const state = getRecruitingCardState(policy, slug);
        const needsSetup = state.isConnected && !state.needsReconnect && isMergeATSCompleteSetupNeeded(policy);

        return {
            key: `merge_ats_${slug}`,
            category: CONST.POLICY.CONNECTIONS.CATEGORY.RECRUITING,
            connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS,
            displayName: providerEntry.displayName,
            icon: providerEntry.iconUrl,
            setupLink: getMergeSetupLink(policyID, slug),
            completeSetupRoute: needsSetup ? ROUTES.WORKSPACE_RECRUITING_MERGE_IMPORT_SETTINGS.getRoute(policyID) : undefined,
            configRows: state.isConnected && !state.needsReconnect ? getConfigRows(policy, policyID, policyEmployeePersonalDetails, icons, translate, formatPhoneNumber) : [],
            ...state,
        };
    });
}

export {getRecruitingCards};
