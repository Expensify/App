/**
 * The single place where a workspace browses, connects, and manages all of its integrations: accounting, HR,
 * receipt partners, and AI assistants.
 */
import ConnectToMergeFlow from '@components/ConnectToMergeFlow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import CompactSearchBar from '@components/SearchBar/CompactSearchBar';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOpenConciergeAnywhere from '@hooks/useOpenConciergeAnywhere';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
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

import {openPolicyReceiptPartnersPage} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
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

const TABS: ConnectionsTab[] = Object.values(CONST.TAB.CONNECTIONS);

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
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const {openConciergeAnywhere} = useOpenConciergeAnywhere();
    const {startIntegrationFlow} = useAccountingActions();
    const {canWrite: canWriteAccounting} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.ACCOUNTING);
    const [activeTab, setActiveTab] = useState<ConnectionsTab>(CONST.TAB.CONNECTIONS.POPULAR);
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

    const [searchValue, setSearchValue, searchResults] = useSearchResults(
        availableListings,
        (listing, searchInput) => tokenizedSearch([listing], searchInput, (item) => [item.title]).length > 0,
    );
    const visibleListings = searchValue.trim() ? searchResults : getListingsForTab(availableListings, activeTab);

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

    const tabs: Array<TabSelectorBaseItem<ConnectionsTab>> = TABS.map((tab) => ({
        key: tab,
        title: translate(`workspace.connections.tabs.${tab}`),
    }));

    const searchBar = (
        <CompactSearchBar
            label={translate('workspace.connections.findConnections')}
            inputValue={searchValue}
            onChangeText={setSearchValue}
            shouldShowEmptyState={!searchResults.length}
            style={[styles.ml0, !shouldUseNarrowLayout && styles.flexShrink0]}
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
            <HeaderWithBackButton
                title={translate('workspace.common.connections')}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldUseHeadlineHeader
                shouldDisplayHelpButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView
                contentContainerStyle={[styles.pb5, styles.ph5]}
                addBottomSafeAreaPadding
                keyboardShouldPersistTaps="handled"
            >
                {connectedListings.length > 0 && (
                    <View style={styles.mb5}>
                        <ConnectionsGrid listings={connectedListings} />
                    </View>
                )}
                <View style={[styles.mt3, !shouldUseNarrowLayout && [styles.flexRow, styles.alignItemsCenter, styles.gap3]]}>
                    <View style={[styles.flex1, styles.flexRow]}>
                        <TabSelectorContextProvider activeTabKey={activeTab}>
                            <TabSelectorBase
                                tabs={tabs}
                                activeTabKey={activeTab}
                                onTabPress={setActiveTab}
                                contentContainerStyles={styles.ph0}
                            />
                        </TabSelectorContextProvider>
                    </View>
                    <View style={shouldUseNarrowLayout && styles.mt3}>{searchBar}</View>
                </View>
                <ConnectionsGrid listings={visibleListings} />
                <View style={[styles.mt5, styles.flexRow]}>
                    <TextLink
                        style={styles.textLabelSupporting}
                        onPress={() => openConciergeAnywhere({forceConcierge: true})}
                    >
                        {translate('workspace.connections.suggestIntegration')}
                    </TextLink>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

function WorkspaceConnectionsPageWrapper(props: WithPolicyConnectionsProps) {
    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={props.policy?.id}
        >
            <AccountingContextProvider policy={props.policy}>
                <WorkspaceConnectionsPage {...props} />
            </AccountingContextProvider>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyConnections(WorkspaceConnectionsPageWrapper);
