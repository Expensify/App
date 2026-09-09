import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {downloadMembersCSV} from '@libs/actions/Policy/Member';
import {openPolicyWorkflowsPage} from '@libs/actions/Policy/Policy';
import Tab from '@libs/actions/Tab';
import {isAnyHRReadOnlyWorkflowMode} from '@libs/merge/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {canMemberRead, isGroupPolicy as isGroupPolicyUtil, isSubmitPolicy, shouldHideDynamicExternalWorkflowPeople} from '@libs/PolicyUtils';

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

/**
 * The SELECTED_TAB Onyx collection is typed as SelectedTabRequest (the IOU request tabs), so a persisted Workflows tab
 * comes back as a disjoint union and can't be narrowed by a type guard. Looking the value up here returns
 * `WorkflowsTab | undefined` without an assertion.
 */
const WORKFLOWS_TABS_BY_KEY = new Map<string, WorkflowsTab>(Object.values(WORKFLOWS_TAB).map((tab) => [tab, tab]));

type WorkspaceWorkflowsPageRevampProps = WithPolicyProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

function WorkspaceWorkflowsPageRevamp({policy, route}: WorkspaceWorkflowsPageRevampProps) {
    const {policyID} = route.params;
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.workflows');
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Table', 'Download', 'Send', 'ThumbsUp', 'MoneyBag', 'Wrench']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showConfirmModal} = useConfirmModal();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const isSubmitPolicyWorkspace = isSubmitPolicy(policy);

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

    const canAccessSubmissions = canWriteWorkflows || !canWriteApprovals;
    const canReadPayments = canMemberRead(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS);

    // The read-only modal says the role can view but not edit, which isn't true here — a disabled tab can't be opened at
    // all — so these tabs get their own "no access" explanation.
    const showNoAccessModal = useCallback(() => {
        showConfirmModal({
            title: translate('workspace.common.readOnlyActionTitle'),
            prompt: translate('workspace.common.noAccessActionPrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [showConfirmModal, translate]);

    const [lastSelectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.WORKFLOWS_TAB_TYPE}`);
    // A `?tab=` deep link wins over the persisted tab until it has been handed over to Onyx by the effect below.
    const routeTab = route.params?.tab;
    const persistedTab = WORKFLOWS_TABS_BY_KEY.get(lastSelectedTab ?? '') ?? WORKFLOWS_TAB.SUBMISSIONS;
    const requestedTab = routeTab ?? persistedTab;

    useEffect(() => {
        if (!routeTab) {
            return;
        }

        // Persist the deep-linked tab first so reopening this page lands on it again.
        if (persistedTab !== routeTab) {
            Tab.setSelectedTab(CONST.TAB.WORKFLOWS_TAB_TYPE, routeTab);
            return;
        }

        // Onyx now holds the tab, so drop the param — `goBack` compares params, and a leftover one stops child flows returning here with the plain route from popping.
        Navigation.setParams({tab: undefined});
    }, [routeTab, persistedTab]);

    // Each tab reuses its section's existing title so the tab label and the card heading can never drift apart.
    // A tab this member can't open is disabled rather than hidden, so they stay aware the feature exists and can ask an
    // admin to change their role instead of the tab bar silently differing between roles.
    const tabs: Array<TabSelectorBaseItem<WorkflowsTab>> = [
        {
            key: WORKFLOWS_TAB.SUBMISSIONS,
            title: translate('workflowsPage.submissionFrequency'),
            icon: expensifyIcons.Send,
            isDisabled: !canAccessSubmissions,
            disabledAction: showNoAccessModal,
        },
        {
            key: WORKFLOWS_TAB.APPROVALS,
            title: translate('workflowsPage.addApprovalsTitle'),
            icon: expensifyIcons.ThumbsUp,
        },
        {
            key: WORKFLOWS_TAB.PAYMENTS,
            title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
            icon: expensifyIcons.MoneyBag,
            isDisabled: !canReadPayments,
            disabledAction: showNoAccessModal,
        },
        {
            key: WORKFLOWS_TAB.ADVANCED,
            title: translate('workspace.rules.expenseReportRules.title'),
            icon: expensifyIcons.Wrench,
        },
    ];

    // A persisted or deep-linked tab can point at one this member can't open, so fall back to the first they can.
    const selectableTabs = tabs.filter((tab) => !tab.isDisabled);
    const activeTab: WorkflowsTab = selectableTabs.some((tab) => tab.key === requestedTab) ? requestedTab : (selectableTabs.at(0)?.key ?? WORKFLOWS_TAB.APPROVALS);

    const handleTabPress = (key: string) => {
        const tab = WORKFLOWS_TABS_BY_KEY.get(key);
        if (!tab) {
            return;
        }

        Tab.setSelectedTab(CONST.TAB.WORKFLOWS_TAB_TYPE, tab);

        // Drop the deep-linked tab so the persisted tab drives the page from here on. Without this, a press landing
        // before the effect above cleared the param would be overwritten by it on the next render.
        if (routeTab) {
            Navigation.setParams({tab: undefined});
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
        if (isSubmitPolicyWorkspace) {
            navigateToSubmitWorkspaceApprovalsUpgrade();
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_IMPORT.getRoute(policyID));
    }, [isAccountLocked, showLockedAccountModal, isOffline, showConfirmModal, translate, policyID, isSubmitPolicyWorkspace, navigateToSubmitWorkspaceApprovalsUpgrade]);

    // The Workflows CSV export reuses the Members export command so the downloaded file is identical to Members > Download CSV.
    const downloadWorkflowsAction = useCallback(() => {
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
        downloadMembersCSV(
            policyID,
            () => {
                showConfirmModal({
                    title: translate('common.downloadFailedTitle'),
                    prompt: translate('common.downloadFailedDescription'),
                    confirmText: translate('common.buttonConfirm'),
                    shouldShowCancelButton: false,
                });
            },
            translate,
        );
    }, [isOffline, showConfirmModal, translate, policyID]);

    // A Dynamic External Workflow with "Hide People Table Columns" keeps the approval workflows out of the customer's
    // hands entirely, so the importer that would edit them is blocked too.
    const shouldHideApprovalWorkflows = shouldHideDynamicExternalWorkflowPeople(policy);
    const shouldBlockApprovalWorkflowEditing = isAnyHRReadOnlyWorkflowMode(policy) || shouldHideApprovalWorkflows;

    const approvalSecondaryActions: Array<DropdownOption<ValueOf<typeof CONST.POLICY.SECONDARY_ACTIONS>>> = [];
    // Importing modifies the workflows, so only offer it when editing is allowed.
    if (!shouldBlockApprovalWorkflowEditing) {
        approvalSecondaryActions.push({
            icon: expensifyIcons.Table,
            text: translate('spreadsheet.importWorkflows'),
            onSelected: importWorkflowsAction,
            value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
        });
    }
    // Downloading is read-only, so the read-only HR modes keep it. Hiding the workflow drops it too, because the
    // exported CSV is that workflow written out per member.
    if (!shouldHideApprovalWorkflows) {
        approvalSecondaryActions.push({
            icon: expensifyIcons.Download,
            text: translate('spreadsheet.downloadWorkflows'),
            onSelected: downloadWorkflowsAction,
            value: CONST.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
        });
    }

    const isGroupPolicy = isGroupPolicyUtil(policy);
    const isLoading = !!(policy?.isLoading && policy?.reimbursementChoice === undefined);

    // Show the More dropdown whenever the user can manage workflows and at least one action survives the filters above.
    // Hiding the workflow removes both actions, so the dropdown itself goes with them rather than opening empty.
    const headerButtons =
        canWriteApprovals && approvalSecondaryActions.length > 0 ? (
            <View style={[styles.flexRow, styles.gap2]}>
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
                route={route}
                headerContent={headerButtons}
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
                            tabs={tabs}
                            activeTabKey={activeTab}
                            onTabPress={handleTabPress}
                        />
                    </TabSelectorContextProvider>
                </View>
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
