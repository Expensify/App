import CollapsibleSection from '@components/CollapsibleSection';
import ConnectToMergeFlow from '@components/ConnectToMergeFlow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import CompactSearchBar from '@components/SearchBar/CompactSearchBar';
import Section from '@components/Section';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {openPolicyHRPage, openPolicyRecruitingPage} from '@libs/actions/PolicyConnections';
import {isMergeConnectionName} from '@libs/merge/MergeUtils';
import Navigation from '@libs/Navigation/Navigation';
import tokenizedSearch from '@libs/tokenizedSearch';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

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

    /** Provider cards to list, already built by the category's `utils`. */
    cards: MergeProviderCardDescriptor[];

    /** Category-specific content rendered under the provider list while nothing is connected, e.g. what to do when the provider isn't listed. */
    footer?: React.ReactNode;
};

type MergeConnectionsPageBaseProps = MergeConnectionsPageBaseContentProps & {
    /** Whether to block access to the page, e.g. when the category is still behind a beta. */
    shouldBeBlocked?: boolean;
};

function MergeConnectionsPageBaseContent({policyID, category, cards, footer}: MergeConnectionsPageBaseContentProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const policy = usePolicy(policyID);
    const [activeSetupFlow, setActiveSetupFlow] = useState<{setupLink: string; key: number} | undefined>();
    const {showConfirmModal} = useConfirmModal();

    const {testID} = PAGE_CONFIG[category];

    const connectedCards: MergeProviderCardDescriptor[] = [];
    const disconnectedCards: MergeProviderCardDescriptor[] = [];
    for (const card of cards) {
        (card.isConnected ? connectedCards : disconnectedCards).push(card);
    }
    // At most one provider of a category can be connected to a workspace at a time.
    const connectedConnectionName = connectedCards.at(0)?.connectionName;
    const byName = (a: MergeProviderCardDescriptor, b: MergeProviderCardDescriptor) => localeCompare(a.displayName, b.displayName);
    connectedCards.sort(byName);
    disconnectedCards.sort(byName);

    const filterCard = (card: MergeProviderCardDescriptor, searchInput: string) => {
        return tokenizedSearch([card], searchInput, (c) => [c.displayName]).length > 0;
    };
    const [inputValue, setInputValue, filteredDisconnectedCards] = useSearchResults(disconnectedCards, filterCard);

    const {canWrite: canWriteMoreFeatures, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);

    const handleConnect = (card: MergeProviderCardDescriptor) => {
        if (!card.setupLink) {
            return;
        }

        if (!canWriteMoreFeatures) {
            showReadOnlyModal();
            return;
        }

        if (!card.isConnected && connectedCards.length > 0) {
            showConfirmModal({
                title: translate(`workspace.${category}.alreadyConnectedTitle`),
                prompt: translate(`workspace.${category}.alreadyConnectedPrompt`),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
                innerContainerStyle: shouldUseNarrowLayout ? undefined : StyleUtils.getWidthStyle(variables.wideConfirmModalWidth),
            });
            return;
        }

        // eslint-disable-next-line react-hooks/purity -- random key forces remount on every press, even for the same provider
        setActiveSetupFlow({setupLink: card.setupLink, key: Math.random()});
    };

    const maybeSearchBar = disconnectedCards.length >= CONST.STANDARD_LIST_ITEM_LIMIT && (
        <CompactSearchBar
            label={translate('workspace.merge.findIntegration')}
            inputValue={inputValue}
            onChangeText={setInputValue}
            shouldShowEmptyState={!filteredDisconnectedCards.length}
            style={styles.ml0}
        />
    );
    const disconnectedProviderCards = filteredDisconnectedCards.map((card) => (
        <MergeProviderCard
            key={card.key}
            card={card}
            policy={policy}
            handleConnect={() => handleConnect(card)}
            canWriteMoreFeatures={canWriteMoreFeatures}
            showReadOnlyModal={showReadOnlyModal}
        />
    ));

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            style={styles.defaultModalContainer}
            testID={testID}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            {!!connectedConnectionName && (
                <MergeSyncResultsListener
                    policyID={policyID}
                    connectionName={connectedConnectionName}
                />
            )}
            {!!connectedConnectionName && isMergeConnectionName(connectedConnectionName) && (
                <MergeInitialSyncingModalListener
                    policyID={policyID}
                    connectionName={connectedConnectionName}
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
            <HeaderWithBackButton
                title={translate(`workspace.${category}.title`)}
                shouldDisplayHelpButton
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldUseHeadlineHeader
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView
                contentContainerStyle={styles.pt3}
                addBottomSafeAreaPadding
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('workspace.merge.connections')}
                        subtitle={translate(`workspace.${category}.connectionsSubtitle`)}
                        isCentralPane
                        subtitleMuted
                        titleStyles={styles.accountSettingsSectionTitle}
                        childrenStyles={styles.pt5}
                    >
                        {connectedCards.map((card) => (
                            <MergeProviderCard
                                key={card.key}
                                card={card}
                                policy={policy}
                                handleConnect={() => handleConnect(card)}
                                canWriteMoreFeatures={canWriteMoreFeatures}
                                showReadOnlyModal={showReadOnlyModal}
                            />
                        ))}
                        {connectedCards.length === 0 && (
                            <>
                                {maybeSearchBar}
                                {disconnectedProviderCards}
                                {footer}
                            </>
                        )}

                        {connectedCards.length > 0 && disconnectedCards.length > 0 && !connectedCards.some((c) => c.isInitialSyncInProgress) && (
                            <CollapsibleSection
                                title={translate('workspace.accounting.other')}
                                wrapperStyle={[styles.pr3, styles.mt5, styles.pv3]}
                                titleStyle={[styles.textNormal, styles.colorMuted]}
                                textStyle={[styles.flex1, styles.userSelectNone, styles.textNormal, styles.colorMuted]}
                            >
                                {maybeSearchBar}
                                {disconnectedProviderCards}
                            </CollapsibleSection>
                        )}
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

function MergeConnectionsPageBase({policyID, category, cards, footer, shouldBeBlocked}: MergeConnectionsPageBaseProps) {
    const {featureName, openPage} = PAGE_CONFIG[category];

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
            shouldBeBlocked={shouldBeBlocked}
        >
            <MergeConnectionsPageBaseContent
                policyID={policyID}
                category={category}
                cards={cards}
                footer={footer}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default MergeConnectionsPageBase;
