import CollapsibleSection from '@components/CollapsibleSection';
import ConnectToHRFlow from '@components/ConnectToHRFlow';
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
import Navigation from '@libs/Navigation/Navigation';
import tokenizedSearch from '@libs/tokenizedSearch';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import type {MergeProviderCardCategory, MergeProviderCardDescriptor} from './types';

import MergeProviderCard from './MergeProviderCard';

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

type MergeConnectionsPageBaseProps = {
    /** The workspace whose connections are listed. */
    policyID: string;

    /** Which page this is. Picks the category-specific copy, feature flag, and data-fetching command. */
    category: MergeProviderCardCategory;

    /** Provider cards to list, already built by the category's `utils`. */
    cards: MergeProviderCardDescriptor[];

    /** Category-specific content rendered under the provider list while nothing is connected, e.g. what to do when the provider isn't listed. */
    footer?: React.ReactNode;

    /** Whether to block access to the page, e.g. when the category is still behind a beta. */
    shouldBeBlocked?: boolean;
};

/**
 * The shared workspace page listing every provider for one connection category, connected ones first and the rest
 * under a collapsed "Other" section. Only one provider per category may be connected at a time.
 */
function MergeConnectionsPageBase({policyID, category, cards, footer, shouldBeBlocked}: MergeConnectionsPageBaseProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const policy = usePolicy(policyID);
    const [activeSetupFlow, setActiveSetupFlow] = useState<{setupLink: string; key: number} | undefined>();
    const {showConfirmModal} = useConfirmModal();

    const {featureName, openPage, testID} = PAGE_CONFIG[category];

    useWorkspaceDocumentTitle(undefined, `workspace.common.${category}`);

    useNetwork({onReconnect: () => openPage(policyID)});

    useEffect(() => {
        openPage(policyID);
    }, [openPage, policyID]);

    const connectedCards: MergeProviderCardDescriptor[] = [];
    const disconnectedCards: MergeProviderCardDescriptor[] = [];
    for (const card of cards) {
        (card.isConnected ? connectedCards : disconnectedCards).push(card);
    }
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
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={featureName}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            shouldBeBlocked={shouldBeBlocked}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID={testID}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                {!!activeSetupFlow && (
                    <ConnectToHRFlow
                        key={activeSetupFlow.key}
                        setupLink={activeSetupFlow.setupLink}
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
        </AccessOrNotFoundWrapper>
    );
}

export default MergeConnectionsPageBase;
