import ConnectToMergeFlow from '@components/ConnectToMergeFlow';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {openPolicyHRPage, openPolicyRecruitingPage} from '@libs/actions/PolicyConnections';
import {isMergeConnectionName} from '@libs/merge/MergeUtils';
import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import useRedirectUnconnectedPanelToConnections from '@pages/workspace/connections/useRedirectUnconnectedPanelToConnections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useEffect, useState} from 'react';

import type {MergeProviderCardCategory, MergeProviderCardDescriptor} from './types';

import MergeInitialSyncingModalListener from './MergeInitialSyncingModalListener';
import MergeProviderCard from './MergeProviderCard';
import MergeSyncResultsListener from './MergeSyncResultsListener';

/** The handful of things that differ between the HR page and the Recruiting page. Everything else is shared. */
const PAGE_CONFIG = {
    [CONST.POLICY.CONNECTIONS.CATEGORY.HR]: {
        featureName: CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED,
        openPage: openPolicyHRPage,
        testID: 'WorkspaceHRPage',
    },
    [CONST.POLICY.CONNECTIONS.CATEGORY.RECRUITING]: {
        featureName: CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED,
        openPage: openPolicyRecruitingPage,
        testID: 'WorkspaceRecruitingPage',
    },
} as const;

type MergeConnectionsPageBaseContentProps = {
    /** The workspace whose connections are listed. */
    policyID: string;

    /** Which page this is. Picks the category-specific copy, feature flag, and data-fetching command. */
    category: MergeProviderCardCategory;

    /** Provider cards built by the category's `utils`. Only the connected one is shown. */
    cards: MergeProviderCardDescriptor[];
};

type MergeConnectionsPageBaseProps = MergeConnectionsPageBaseContentProps & {
    /** Whether to block access to the page, e.g. when the category is still behind a beta. */
    shouldBeBlocked?: boolean;
};

function MergeConnectionsPageBaseContent({policyID, category, cards}: MergeConnectionsPageBaseContentProps) {
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const [activeSetupFlow, setActiveSetupFlow] = useState<{setupLink: string; key: number} | undefined>();

    const {testID} = PAGE_CONFIG[category];

    // At most one provider of a category can be connected to a workspace at a time.
    const connectedCard = cards.find((card) => card.isConnected);

    const {canWrite: canWriteMoreFeatures, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);

    const handleReconnect = (card: MergeProviderCardDescriptor) => {
        if (!card.setupLink) {
            return;
        }

        if (!canWriteMoreFeatures) {
            showReadOnlyModal();
            return;
        }

        // A random key forces a remount on every press, even for the same provider
        setActiveSetupFlow({setupLink: card.setupLink, key: Math.random()});
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID={testID}
        >
            {!!connectedCard && (
                <MergeSyncResultsListener
                    policyID={policyID}
                    connectionName={connectedCard.connectionName}
                />
            )}
            {!!connectedCard && isMergeConnectionName(connectedCard.connectionName) && (
                <MergeInitialSyncingModalListener
                    policyID={policyID}
                    connectionName={connectedCard.connectionName}
                />
            )}
            {!!activeSetupFlow && (
                <ConnectToMergeFlow
                    key={activeSetupFlow.key}
                    setupLink={activeSetupFlow.setupLink}
                    title={translate(`workspace.common.${category}`)}
                    onDone={() => setActiveSetupFlow(undefined)}
                />
            )}
            {!!connectedCard && (
                <MergeProviderCard
                    card={connectedCard}
                    policy={policy}
                    handleConnect={() => handleReconnect(connectedCard)}
                    onDisconnect={() => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID))}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID))}
                    canWriteMoreFeatures={canWriteMoreFeatures}
                    showReadOnlyModal={showReadOnlyModal}
                />
            )}
        </ScreenWrapper>
    );
}

function MergeConnectionsPageBase({policyID, category, cards, shouldBeBlocked}: MergeConnectionsPageBaseProps) {
    const {featureName, openPage} = PAGE_CONFIG[category];
    const [hasConnectionsDataBeenFetched] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${policyID}`);
    useRedirectUnconnectedPanelToConnections(
        policyID,
        !!hasConnectionsDataBeenFetched,
        cards.some((card) => card.isConnected),
    );

    useWorkspaceDocumentTitle(undefined, `workspace.common.${category}`);

    useNetwork({onReconnect: () => openPage(policyID)});

    useEffect(() => {
        openPage(policyID);
    }, [openPage, policyID]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={featureName}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            shouldBeBlocked={(shouldBeBlocked ?? false) || !cards.some((card) => card.isConnected)}
        >
            <MergeConnectionsPageBaseContent
                policyID={policyID}
                category={category}
                cards={cards}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default MergeConnectionsPageBase;
