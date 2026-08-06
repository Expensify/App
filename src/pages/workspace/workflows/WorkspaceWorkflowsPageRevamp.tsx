import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {openPolicyWorkflowsPage} from '@libs/actions/Policy/Policy';
import Tab from '@libs/actions/Tab';
import {isAnyHRReadOnlyWorkflowMode} from '@libs/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {canAccessSubmitWorkspaceFeatures, canMemberRead, isGroupPolicy as isGroupPolicyUtil} from '@libs/PolicyUtils';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ExpenseReportRulesSection from '@pages/workspace/rules/ExpenseReportRulesSection';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';

import {getPaymentMethods} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import WorkflowsApprovalsTab from './tabs/WorkflowsApprovalsTab';
import WorkflowsPaymentsTab from './tabs/WorkflowsPaymentsTab';
import WorkflowsSubmissionsTab from './tabs/WorkflowsSubmissionsTab';

const WORKFLOWS_TAB = CONST.TAB.WORKFLOWS;

type WorkflowsTab = ValueOf<typeof WORKFLOWS_TAB>;

const WORKFLOWS_TAB_VALUES = new Set<string>(Object.values(WORKFLOWS_TAB));

function isWorkflowsTab(key: string): key is WorkflowsTab {
    return WORKFLOWS_TAB_VALUES.has(key);
}

type WorkspaceWorkflowsPageRevampProps = WithPolicyProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

function WorkspaceWorkflowsPageRevamp({policy, route, navigation}: WorkspaceWorkflowsPageRevampProps) {
    const {policyID} = route.params;
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.workflows');
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Workflows']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Table', 'Send', 'ThumbsUp', 'MoneyBag', 'Gear']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();
    const isSubmit2026BetaEnabled = isBetaEnabled(CONST.BETAS.SUBMIT_2026);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const canAccessSubmit2026Features = canAccessSubmitWorkspaceFeatures(policy, isSubmit2026BetaEnabled);

    const fetchData = useCallback(() => {
        openPolicyWorkflowsPage(policyID, true);
        getPaymentMethods();
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchData});
    const canReadWorkflows = canMemberRead(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS);
    const {canWrite: canWriteWorkflows} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.WORKFLOWS);
    const {canWrite: canWriteApprovals, withReadOnlyFallback: withApprovalsReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS);
    const {canWrite: canWritePayments, withReadOnlyFallback: withPaymentsReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS);

    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const shouldShowSubmissions = canWriteWorkflows || !canWriteApprovals;
    const shouldShowPayments = canMemberRead(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS);

    const [lastSelectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.WORKFLOWS_TAB_TYPE}`);
    const lastSelectedTabStr = lastSelectedTab as string | undefined;
    // A `?tab=` deep link wins over the persisted tab until the user picks a tab themselves, at which point the param is cleared below.
    const routeTab = route.params?.tab;
    const persistedTab: WorkflowsTab = lastSelectedTabStr && isWorkflowsTab(lastSelectedTabStr) ? lastSelectedTabStr : WORKFLOWS_TAB.SUBMISSIONS;
    const requestedTab: WorkflowsTab = routeTab && isWorkflowsTab(routeTab) ? routeTab : persistedTab;

    useEffect(() => {
        // Persist a deep-linked tab so returning here later — including via a `backTo` that intentionally carries no
        // tab, since `goBack` compares route params and a tab param would stop it matching the mounted page — reopens it.
        if (!routeTab || !isWorkflowsTab(routeTab)) {
            return;
        }

        Tab.setSelectedTab(CONST.TAB.WORKFLOWS_TAB_TYPE, routeTab);
    }, [routeTab]);

    // Each tab reuses its section's existing title so the tab label and the card heading can never drift apart.
    const visibleTabs: TabSelectorBaseItem[] = [
        ...(shouldShowSubmissions
            ? [
                  {
                      key: WORKFLOWS_TAB.SUBMISSIONS,
                      title: translate('workflowsPage.submissionFrequency'),
                      icon: expensifyIcons.Send,
                  },
              ]
            : []),
        {
            key: WORKFLOWS_TAB.APPROVALS,
            title: translate('workflowsPage.addApprovalsTitle'),
            icon: expensifyIcons.ThumbsUp,
        },
        ...(shouldShowPayments
            ? [
                  {
                      key: WORKFLOWS_TAB.PAYMENTS,
                      title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
                      icon: expensifyIcons.MoneyBag,
                  },
              ]
            : []),
        {
            key: WORKFLOWS_TAB.ADVANCED,
            title: translate('workspace.rules.expenseReportRules.title'),
            icon: expensifyIcons.Gear,
        },
    ];

    // Submissions and Payments can be hidden for members without the matching access, so never leave a hidden tab active.
    const activeTab: WorkflowsTab = visibleTabs.some((tab) => tab.key === requestedTab) ? requestedTab : ((visibleTabs.at(0)?.key ?? WORKFLOWS_TAB.APPROVALS) as WorkflowsTab);

    const handleTabPress = (key: string) => {
        if (!isWorkflowsTab(key)) {
            return;
        }

        Tab.setSelectedTab(CONST.TAB.WORKFLOWS_TAB_TYPE, key);

        // Drop the deep-linked tab so the persisted tab drives the page from here on.
        if (routeTab) {
            Navigation.setParams({tab: undefined}, route.key, navigation.getState()?.key);
        }
    };

    const navigateToSubmitWorkspaceApprovalsUpgrade = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvalSubmit.alias, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)));
    }, [policyID]);

    // Reuses the Members spreadsheet importer (it already maps the `submitsTo` / `approvesTo` columns) so approval
    // workflows can be bulk-imported directly from the Workflows page.
    const importWorkflowsAction = useCallback(() => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (isOffline) {
            showConfirmModal({
                title: translate('common.youAppearToBeOffline'),
                prompt: translate('common.thisFeatureRequiresInternet'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
                shouldHandleNavigationBack: true,
            });
            return;
        }
        // Submit 2026 workspaces gate approvals behind the Submit approvals upgrade, so route them there instead of the importer.
        if (canAccessSubmit2026Features) {
            navigateToSubmitWorkspaceApprovalsUpgrade();
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_IMPORT.getRoute(policyID));
    }, [isAccountLocked, showLockedAccountModal, isOffline, showConfirmModal, translate, policyID, canAccessSubmit2026Features, navigateToSubmitWorkspaceApprovalsUpgrade]);

    const approvalSecondaryActions: Array<DropdownOption<ValueOf<typeof CONST.POLICY.SECONDARY_ACTIONS>>> = [
        {
            icon: expensifyIcons.Table,
            text: translate('spreadsheet.importWorkflows'),
            onSelected: importWorkflowsAction,
            value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
        },
    ];

    const shouldBlockApprovalWorkflowEditing = isAnyHRReadOnlyWorkflowMode(policy);
    const isGroupPolicy = isGroupPolicyUtil(policy);
    const isLoading = !!(policy?.isLoading && policy?.reimbursementChoice === undefined);

    const headerButtons =
        !shouldBlockApprovalWorkflowEditing && canWriteApprovals ? (
            <View style={[styles.flexRow, styles.gap2, shouldDisplayButtonsInSeparateLine && styles.w100]}>
                <ButtonWithDropdownMenu
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.MORE_DROPDOWN}
                    options={approvalSecondaryActions}
                    isSplitButton={false}
                    wrapperStyle={styles.flexGrow0}
                />
            </View>
        ) : undefined;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.WORKFLOWS}
        >
            <WorkspacePageWithSections
                headerText={translate('workspace.common.workflows')}
                icon={illustrations.Workflows}
                route={route}
                headerContent={!shouldDisplayButtonsInSeparateLine && headerButtons}
                shouldShowOfflineIndicatorInWideScreen
                shouldShowNotFoundPage={!isGroupPolicy || !canReadWorkflows}
                policyFeature={CONST.POLICY.POLICY_FEATURE.WORKFLOWS}
                isLoading={isLoading}
                shouldShowLoading={isLoading}
                shouldUseHeadlineHeader
                shouldUseScrollView
                addBottomSafeAreaPadding
            >
                <View style={[styles.flexRow, styles.mb1, styles.w100]}>
                    <TabSelectorContextProvider activeTabKey={activeTab}>
                        <TabSelectorBase
                            tabs={visibleTabs}
                            activeTabKey={activeTab}
                            onTabPress={handleTabPress}
                        />
                    </TabSelectorContextProvider>
                </View>
                {shouldDisplayButtonsInSeparateLine && !!headerButtons && <View style={[styles.pl5, styles.pr5, styles.pb5, styles.w100]}>{headerButtons}</View>}
                <View style={[shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {activeTab === WORKFLOWS_TAB.SUBMISSIONS && <WorkflowsSubmissionsTab policyID={policyID} />}
                    {activeTab === WORKFLOWS_TAB.APPROVALS && <WorkflowsApprovalsTab policyID={policyID} />}
                    {activeTab === WORKFLOWS_TAB.PAYMENTS && <WorkflowsPaymentsTab policyID={policyID} />}
                    {activeTab === WORKFLOWS_TAB.ADVANCED && (
                        <ExpenseReportRulesSection
                            policyID={policyID}
                            canWriteApprovals={canWriteApprovals}
                            canWritePayments={canWritePayments}
                            withApprovalsReadOnlyFallback={withApprovalsReadOnlyFallback}
                            withPaymentsReadOnlyFallback={withPaymentsReadOnlyFallback}
                        />
                    )}
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceWorkflowsPageRevamp;
