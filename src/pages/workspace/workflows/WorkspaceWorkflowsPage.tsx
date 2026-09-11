import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {downloadMembersCSV} from '@libs/actions/Policy/Member';
import {openPolicyWorkflowsPage} from '@libs/actions/Policy/Policy';
import {isAnyHRReadOnlyWorkflowMode} from '@libs/merge/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {canMemberRead, isGroupPolicy as isGroupPolicyUtil, isSubmitPolicy, shouldHideDynamicExternalWorkflowPeople} from '@libs/PolicyUtils';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ExpenseReportRulesSection from '@pages/workspace/rules/ExpenseReportRulesSection';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';

import {getPaymentMethods} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import WorkflowsApprovalsTab from './tabs/WorkflowsApprovalsTab';
import WorkflowsPaymentsTab from './tabs/WorkflowsPaymentsTab';
import WorkflowsSubmissionsTab from './tabs/WorkflowsSubmissionsTab';
import WorkspaceWorkflowsPageRevamp from './WorkspaceWorkflowsPageRevamp';

type WorkspaceWorkflowsPageProps = WithPolicyProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

function WorkspaceWorkflowsPage(props: WorkspaceWorkflowsPageProps) {
    const {policy, route} = props;
    const {policyID} = route.params;
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.workflows');
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Table', 'Download']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const isSubmitPolicyWorkspace = isSubmitPolicy(policy);

    const fetchData = useCallback(() => {
        // This component still mounts (and keeps its hooks running) when the revamp renders below, so let the revamp
        // page own fetching to avoid a duplicate OpenPolicyWorkflowsPage on mount and on every reconnect.
        if (isRulesRevampEnabled) {
            return;
        }
        openPolicyWorkflowsPage(policyID, true);
        getPaymentMethods();
    }, [policyID, isRulesRevampEnabled]);

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

    if (isRulesRevampEnabled) {
        return <WorkspaceWorkflowsPageRevamp {...props} />;
    }

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

    const shouldShowSubmissionFrequency = canWriteWorkflows || !canWriteApprovals;
    const shouldShowPayments = canMemberRead(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS);

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
                shouldUseScrollView
                addBottomSafeAreaPadding
            >
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {shouldShowSubmissionFrequency && <WorkflowsSubmissionsTab policyID={policyID} />}
                    <WorkflowsApprovalsTab policyID={policyID} />
                    {shouldShowPayments && <WorkflowsPaymentsTab policyID={policyID} />}
                    <ExpenseReportRulesSection
                        policyID={policyID}
                        canWriteApprovals={canWriteApprovals}
                        canWritePayments={canWritePayments}
                        withApprovalsReadOnlyFallback={withApprovalsReadOnlyFallback}
                        withPaymentsReadOnlyFallback={withPaymentsReadOnlyFallback}
                    />
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceWorkflowsPage);
