import useConfirmModal from '@hooks/useConfirmModal';
/**
 * Builds the People listings (HR and, behind the Merge ATS beta, recruiting providers) for the Connections page.
 */
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';

import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy} from '@libs/PolicyUtils';

import {getHRCards} from '@pages/workspace/hr/utils';
import type {MergeProviderCardCategory, MergeProviderCardDescriptor} from '@pages/workspace/merge/types';
import {getRecruitingCards} from '@pages/workspace/recruiting/utils';

import {enablePolicyHR, enablePolicyRecruiting} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {ConnectionListing, ConnectionStatus} from './types';

import {getSyncStatusMessage} from './utils';

const CATEGORY_CONFIG = {
    [CONST.POLICY.CONNECTIONS.CATEGORY.HR]: {
        featureName: CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED,
        upgradeAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.hr.alias,
        enableFeature: enablePolicyHR,
        getConfigureRoute: ROUTES.WORKSPACE_HR.getRoute,
    },
    [CONST.POLICY.CONNECTIONS.CATEGORY.RECRUITING]: {
        featureName: CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED,
        upgradeAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.recruiting.alias,
        enableFeature: enablePolicyRecruiting,
        getConfigureRoute: ROUTES.WORKSPACE_RECRUITING.getRoute,
    },
} as const;

function useMergeConnectionListings(policy: OnyxEntry<Policy>, onStartSetup: (setupLink: string, category: MergeProviderCardCategory) => void): ConnectionListing[] {
    const policyID = policy?.id;
    const {translate, getLocalDateFromDatetime, datetimeToCalendarTime, formatPhoneNumber} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const policyEmployeePersonalDetails = usePersonalDetailsByLogins([...Object.keys(policy?.employeeList ?? {})]);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const icons = useMemoizedLazyExpensifyIcons(['GustoSquare', 'TriNetSquare', 'Download']);

    if (!policyID) {
        return [];
    }

    const isRecruitingBetaEnabled = isBetaEnabled(CONST.BETAS.MERGE_ATS);
    const hrCards = getHRCards({
        policy,
        policyEmployeePersonalDetails,
        connectionSyncProgress,
        getLocalDateFromDatetime,
        translate,
        formatPhoneNumber,
        policyID,
        gustoIcon: icons.GustoSquare,
        trinetIcon: icons.TriNetSquare,
    });
    const recruitingCards = isRecruitingBetaEnabled ? getRecruitingCards({policy, policyEmployeePersonalDetails, policyID, icons, translate, formatPhoneNumber}) : [];

    const connect = (card: MergeProviderCardDescriptor, categoryCards: MergeProviderCardDescriptor[]) => {
        if (!card.setupLink) {
            return;
        }
        if (!canWrite) {
            showReadOnlyModal();
            return;
        }

        const config = CATEGORY_CONFIG[card.category];
        if (!isControlPolicy(policy)) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, config.upgradeAlias, ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID)));
            return;
        }

        // At most one provider of a category can be connected to a workspace at a time
        if (categoryCards.some((categoryCard) => categoryCard.isConnected)) {
            showConfirmModal({
                title: translate(`workspace.${card.category}.alreadyConnectedTitle`),
                prompt: translate(`workspace.${card.category}.alreadyConnectedPrompt`),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            return;
        }

        if (!policy?.[config.featureName]) {
            config.enableFeature(policyID, true);
        }
        onStartSetup(card.setupLink, card.category);
    };

    const getConnectedStatus = (card: MergeProviderCardDescriptor): ConnectionStatus => {
        if (card.needsReconnect || card.hasError) {
            return {isBroken: true, message: translate('workspace.connections.brokenConnection')};
        }
        if (card.completeSetupRoute) {
            return {isBroken: false, message: translate('workspace.merge.completeSetup')};
        }
        let syncingMessage;
        if (card.isSyncInProgress) {
            syncingMessage = card.syncStageInProgress ? translate('workspace.hr.syncStageName', card.syncStageInProgress) : translate(`workspace.${card.category}.syncing`);
        }
        return {isBroken: false, message: getSyncStatusMessage({syncingMessage, successfulDate: card.successfulDate, translate, datetimeToCalendarTime})};
    };

    const getTitle = (card: MergeProviderCardDescriptor) => {
        // Some providers offer both an HR and an ATS integration, so both listings get a suffix to tell them apart
        if (!isRecruitingBetaEnabled) {
            return card.displayName;
        }
        return translate(card.category === CONST.POLICY.CONNECTIONS.CATEGORY.HR ? 'workspace.connections.hrisListing' : 'workspace.connections.atsListing', card.displayName);
    };

    const toListings = (categoryCards: MergeProviderCardDescriptor[]): ConnectionListing[] =>
        categoryCards.map((card) => ({
            key: card.key,
            category: CONST.TAB.CONNECTIONS.PEOPLE,
            title: getTitle(card),
            icon: card.icon,
            status: card.isConnected ? getConnectedStatus(card) : undefined,
            onConnect: () => connect(card, categoryCards),
            onConfigure: () => Navigation.navigate(CATEGORY_CONFIG[card.category].getConfigureRoute(policyID)),
        }));

    return [...toListings(hrCards), ...toListings(recruitingCards)];
}

export default useMergeConnectionListings;
