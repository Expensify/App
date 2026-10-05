/**
 * The single place where a workspace browses, connects, and manages all of its integrations: accounting, HR,
 * receipt partners, and AI assistants.
 */
import ConnectToMergeFlow from '@components/ConnectToMergeFlow';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import Header from '@components/Header';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SidePanelButton from '@components/SidePanel/SidePanelButton';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';

import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOpenConciergeAnywhere from '@hooks/useOpenConciergeAnywhere';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {openPolicyHRPage, openPolicyRecruitingPage} from '@libs/actions/PolicyConnections';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {AccountingContextProvider, useAccountingActions} from '@pages/workspace/accounting/AccountingContext';
import MergeInitialSyncingModalListener from '@pages/workspace/merge/MergeInitialSyncingModalListener';
import MergeSyncResultsListener from '@pages/workspace/merge/MergeSyncResultsListener';
import type {MergeProviderCardCategory} from '@pages/workspace/merge/types';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {openPolicyReceiptPartnersPage} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionName} from '@src/types/onyx/Policy';

import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {ConnectionListing, ConnectionsTab} from './types';

import ConnectionsGrid from './ConnectionsGrid';
import useAccountingConnectionListings from './useAccountingConnectionListings';
import useMCPConnectionListings from './useMCPConnectionListings';
import useMergeConnectionListings from './useMergeConnectionListings';
import useReceiptPartnerConnectionListings from './useReceiptPartnerConnectionListings';
import {getListingsForTab} from './utils';

type RouteParams = {
    newConnectionName?: ConnectionName;
    integrationToDisconnect?: ConnectionName;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    isIntuitEnterpriseSuite?: string;
};

type MergeSetupFlow = {
    setupLink: string;
    category: MergeProviderCardCategory;
    key: number;
};

/** HR and recruiting providers are Control-only, so their data is only requested for Control workspaces */
function fetchConnectionsData(policyID: string | undefined, canUseMergeConnections: boolean, isRecruitingBetaEnabled: boolean) {
    if (!policyID) {
        return;
    }
    openPolicyReceiptPartnersPage(policyID);
    if (!canUseMergeConnections) {
        return;
    }
    openPolicyHRPage(policyID);
    if (isRecruitingBetaEnabled) {
        openPolicyRecruitingPage(policyID);
    }
}

function WorkspaceConnectionsPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseSingleColumn = shouldUseNarrowLayout || isMediumScreenWidth;
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const {isBetaEnabled} = usePermissions();
    const {openConciergeAnywhere} = useOpenConciergeAnywhere();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const {startIntegrationFlow} = useAccountingActions();
    const {canWrite: canWriteAccounting} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.ACCOUNTING);
    const [lastSelectedTab, setLastSelectedTab] = useState<ConnectionsTab>(CONST.TAB.CONNECTIONS.ALL);
    const [mergeSetupFlow, setMergeSetupFlow] = useState<MergeSetupFlow | undefined>();
    const route = useRoute();
    const params = route.params as RouteParams | undefined;
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.connections');

    const isRecruitingBetaEnabled = isBetaEnabled(CONST.BETAS.MERGE_ATS);
    const canUseMergeConnections = isControlPolicy(policy);

    useNetwork({onReconnect: () => fetchConnectionsData(policyID, canUseMergeConnections, isRecruitingBetaEnabled)});

    useEffect(() => {
        fetchConnectionsData(policyID, canUseMergeConnections, isRecruitingBetaEnabled);
    }, [policyID, canUseMergeConnections, isRecruitingBetaEnabled]);

    const accountingListings = useAccountingConnectionListings(policy);
    const mergeListings = useMergeConnectionListings(policy, (setupLink, category) => {
        // A random key forces a remount on every press, even for the same provider
        setMergeSetupFlow({setupLink, category, key: Math.random()});
    });
    const receiptPartnerListings = useReceiptPartnerConnectionListings(policy);
    const mcpListings = useMCPConnectionListings(policy);
    const listings: ConnectionListing[] = [...accountingListings, ...mergeListings, ...receiptPartnerListings, ...mcpListings];
    const connectedListings = listings.filter((listing) => !!listing.status);
    const availableListings = listings.filter((listing) => !listing.status);

    // Recruiting providers are behind a beta, so the tab only shows once there is something to list in it
    const hasRecruitingListings = listings.some((listing) => listing.category === CONST.TAB.CONNECTIONS.RECRUITING);
    const visibleTabs = Object.values(CONST.TAB.CONNECTIONS).filter((tab) => tab !== CONST.TAB.CONNECTIONS.RECRUITING || hasRecruitingListings);
    const activeTab = visibleTabs.includes(lastSelectedTab) ? lastSelectedTab : CONST.TAB.CONNECTIONS.ALL;

    const [searchValue, setSearchValue, searchResults, appliedSearchValue] = useSearchResults(
        availableListings,
        (listing, searchInput) => tokenizedSearch([listing], searchInput, (item) => [item.title]).length > 0,
    );
    // The results only switch once the debounced search has run, so the tab's full list doesn't flash while typing
    const isSearching = !!searchValue.trim() && !!appliedSearchValue.trim();
    const visibleListings = isSearching ? searchResults : getListingsForTab(availableListings, activeTab);
    // Search results span every tab, so no tab is highlighted. Clearing the search returns to the last tab.
    const selectedTab = isSearching ? undefined : activeTab;
    const noResultsMessage = translate('common.noResultsFoundMatching', searchValue);
    const shouldShowNoResults = isSearching && !searchResults.length;
    useDebouncedAccessibilityAnnouncement(noResultsMessage, shouldShowNoResults, searchValue);
    // A tab also ends up empty once everything in it is connected
    const shouldShowEmptyState = !visibleListings.length;

    // Suggestions go to the person who looks after this workspace, like the old Accounting page did
    const openSuggestIntegration = () => {
        if (policy?.chatReportIDAdmins) {
            openConciergeAnywhere({reportID: String(policy.chatReportIDAdmins)});
            return;
        }
        if (account?.accountManagerAccountID && account.accountManagerReportID) {
            openConciergeAnywhere({reportID: account.accountManagerReportID});
            return;
        }
        openConciergeAnywhere({forceConcierge: true});
    };

    // Upgrade and setup flows that leave the app come back here with the integration to connect in the route params.
    // `startIntegrationFlow` changes identity whenever `policy` does, and the params are only cleared in a later render,
    // so the guard is keyed on the value to start each flow once.
    const startedIntegrationFlowForRef = useRef<ConnectionName | undefined>(undefined);
    const newConnectionName = params?.newConnectionName;
    const integrationToDisconnect = params?.integrationToDisconnect;
    const shouldDisconnectIntegrationBeforeConnecting = params?.shouldDisconnectIntegrationBeforeConnecting;
    const shouldConnectToIntuitEnterpriseSuite = params?.isIntuitEnterpriseSuite === 'true';

    useFocusEffect(() => {
        if (!newConnectionName || !isControlPolicy(policy) || !canWriteAccounting) {
            if (!newConnectionName) {
                startedIntegrationFlowForRef.current = undefined;
            }
            return;
        }
        if (startedIntegrationFlowForRef.current === newConnectionName) {
            return;
        }
        startedIntegrationFlowForRef.current = newConnectionName;

        startIntegrationFlow({
            name: newConnectionName,
            isIntuitEnterpriseSuite: shouldConnectToIntuitEnterpriseSuite,
            integrationToDisconnect,
            shouldDisconnectIntegrationBeforeConnecting,
        });
        Navigation.setParams({
            newConnectionName: undefined,
            isIntuitEnterpriseSuite: undefined,
            integrationToDisconnect: undefined,
            shouldDisconnectIntegrationBeforeConnecting: undefined,
        });
    });

    const connectedHRConnectionName = CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES.find((name) => !!policy?.connections?.[name]);
    const connectedRecruitingConnectionName = isRecruitingBetaEnabled ? CONST.POLICY.CONNECTIONS.RECRUITING_CONNECTION_NAMES.find((name) => !!policy?.connections?.[name]) : undefined;

    const tabs: Array<TabSelectorBaseItem<ConnectionsTab>> = visibleTabs.map((tab) => ({
        key: tab,
        title: translate(`workspace.connections.tabs.${tab}`),
    }));

    const searchLabel = translate('workspace.connections.findConnections');
    const searchBar = (
        <TextInput
            hideFocusedState
            multiline={false}
            spellCheck={false}
            autoCorrect={false}
            placeholder={searchLabel}
            value={searchValue}
            role={CONST.ROLE.SEARCHBOX}
            inputMode={CONST.INPUT_MODE.TEXT}
            placeholderTextColor={theme.textSupporting}
            inputStyle={styles.textLabel}
            containerStyles={shouldUseSingleColumn && styles.flex1}
            textInputContainerStyles={[styles.border, styles.borderRadiusComponentNormal, styles.appBG, styles.p2, isSearchFocused && styles.borderColorFocus]}
            touchableInputWrapperStyle={[styles.mnw200, shouldUseSingleColumn ? styles.h11 : styles.h8]}
            accessibilityLabel={searchLabel}
            shouldHideClearButton={!searchValue}
            clearButtonStyle={shouldUseSingleColumn ? undefined : styles.mr0}
            clearButtonIconSize={shouldUseSingleColumn ? undefined : variables.iconSizeSmall}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChangeText={setSearchValue}
        />
    );

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            style={styles.defaultModalContainer}
            testID="WorkspaceConnectionsPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            {!!policyID && !!connectedHRConnectionName && (
                <MergeSyncResultsListener
                    policyID={policyID}
                    connectionName={connectedHRConnectionName}
                />
            )}
            {!!policyID && connectedHRConnectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR && (
                <MergeInitialSyncingModalListener
                    policyID={policyID}
                    connectionName={connectedHRConnectionName}
                />
            )}
            {!!policyID && !!connectedRecruitingConnectionName && (
                <>
                    <MergeSyncResultsListener
                        policyID={policyID}
                        connectionName={connectedRecruitingConnectionName}
                    />
                    <MergeInitialSyncingModalListener
                        policyID={policyID}
                        connectionName={connectedRecruitingConnectionName}
                    />
                </>
            )}
            {!!mergeSetupFlow && (
                <ConnectToMergeFlow
                    key={mergeSetupFlow.key}
                    setupLink={mergeSetupFlow.setupLink}
                    title={translate(`workspace.common.${mergeSetupFlow.category}`)}
                    onDone={() => setMergeSetupFlow(undefined)}
                />
            )}
            <Header>
                {shouldUseNarrowLayout && <Header.BackButton onPress={() => Navigation.goBack()} />}
                <Header.Title
                    title={translate('workspace.common.connections')}
                    titleStyles={styles.textHeadlineH2}
                />
                <Header.Right>
                    <SidePanelButton />
                </Header.Right>
            </Header>
            <ScrollView
                contentContainerStyle={[styles.flexGrow1, styles.pb5, styles.ph5]}
                addBottomSafeAreaPadding
                keyboardShouldPersistTaps="handled"
            >
                {connectedListings.length > 0 && (
                    <View style={styles.mb4}>
                        <ConnectionsGrid listings={connectedListings} />
                    </View>
                )}
                <View style={[connectedListings.length > 0 ? styles.mt6 : styles.mt3, !shouldUseSingleColumn && [styles.flexRow, styles.alignItemsCenter, styles.gap5]]}>
                    <View style={[styles.flex1, styles.flexRow, shouldUseNarrowLayout && styles.mhn5]}>
                        <TabSelectorContextProvider activeTabKey={selectedTab}>
                            <TabSelectorBase
                                tabs={tabs}
                                activeTabKey={selectedTab}
                                onTabPress={(tab) => {
                                    setSearchValue('');
                                    setLastSelectedTab(tab);
                                }}
                                onActiveTabPress={() => setSearchValue('')}
                                // On mobile the tabs scroll edge to edge, so the page gutter moves inside the scroll content
                                contentContainerStyles={shouldUseNarrowLayout ? styles.pb0 : [styles.ph0, styles.pb0]}
                                tabButtonStyles={styles.connectionsTabButton}
                                // On mobile a hard edge shows more clearly that the tabs scroll
                                shouldShowScrollFade={!shouldUseNarrowLayout}
                            />
                        </TabSelectorContextProvider>
                    </View>
                    <View style={shouldUseSingleColumn && [styles.flexRow, styles.mt5]}>{searchBar}</View>
                </View>
                {shouldShowEmptyState ? (
                    <GenericEmptyStateComponent
                        headerMedia={illustrations.EmptyShelves}
                        headerContentStyles={styles.emptyShelvesIllustration}
                        headerStyles={styles.emptyStateCardIllustrationContainer}
                        title={isSearching ? translate('common.noResultsFound') : translate('workspace.connections.allConnectedTitle')}
                        subtitleText={
                            <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>
                                {isSearching ? translate('workspace.connections.noResultsPrompt') : translate('workspace.connections.allConnectedPrompt')}{' '}
                                <TextLink onPress={openSuggestIntegration}>{translate('workspace.connections.suggestAnIntegration')}</TextLink>
                                {translate('workspace.connections.noResultsPromptEnd')}
                            </Text>
                        }
                    />
                ) : (
                    <View style={styles.mt4}>
                        <ConnectionsGrid listings={visibleListings} />
                    </View>
                )}
                {!shouldShowEmptyState && (
                    <PressableWithFeedback
                        onPress={openSuggestIntegration}
                        accessibilityLabel={translate('workspace.connections.suggestIntegration')}
                        role={CONST.ROLE.LINK}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CONNECTIONS.SUGGEST_INTEGRATION}
                        style={[styles.mt4, styles.flexRow, styles.alignItemsCenter, styles.alignSelfStart, styles.gap1]}
                    >
                        <Text style={[styles.textLabelSupporting, styles.flexShrink1]}>{translate('workspace.connections.suggestIntegration')}</Text>
                        <Icon
                            src={icons.ArrowRight}
                            width={variables.iconSizeExtraSmall}
                            height={variables.iconSizeExtraSmall}
                            fill={theme.icon}
                        />
                    </PressableWithFeedback>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

function WorkspaceConnectionsPageWrapper(props: WithPolicyConnectionsProps) {
    const {isBetaEnabled} = usePermissions();

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={props.policy?.id}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.UNIFIED_CONNECTIONS)}
        >
            <AccountingContextProvider policy={props.policy}>
                <WorkspaceConnectionsPage {...props} />
            </AccountingContextProvider>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyConnections(WorkspaceConnectionsPageWrapper);
