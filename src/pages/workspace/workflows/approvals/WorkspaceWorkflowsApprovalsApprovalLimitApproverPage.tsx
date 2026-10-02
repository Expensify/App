import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import Text from '@components/Text';

import useApprovalWorkflows from '@hooks/useApprovalWorkflows';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getMemberAccountIDsForWorkspace, isExpensifyTeam, shouldFilterExpensifyTeam, shouldHideDynamicExternalWorkflowPeople} from '@libs/PolicyUtils';
import {hasApprovalLimit, isApprovalWorkflowLockedByIntegration} from '@libs/WorkflowUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import MemberRightIcon from '@pages/workspace/MemberRightIcon';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import {setApprovalLimitApprovers} from '@userActions/Workflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';

type WorkspaceWorkflowsApprovalsApprovalLimitApproverPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVAL_LIMIT_APPROVER>;

function WorkspaceWorkflowsApprovalsApprovalLimitApproverPage({policy, personalDetails, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsApprovalLimitApproverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [approvalLimitDraft, approvalLimitDraftMetadata] = useOnyx(ONYXKEYS.APPROVAL_LIMIT);
    const isApprovalLimitDraftLoading = isLoadingOnyxValue(approvalLimitDraftMetadata);
    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {enforcedApprovalWorkflows} = useApprovalWorkflows({policy, personalDetails, currentUserLogin});
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const policyID = route.params.policyID;
    const approverIndex = Number(route.params.approverIndex) || 0;
    const employeeList = policy?.employeeList;
    const approvers = approvalLimitDraft?.approvers ?? [];
    const originalApprovers = approvalLimitDraft?.originalApprovers ?? [];
    const selectedApproverEmail = approvers.at(approverIndex);
    const workflowApproverEmails = new Set(enforcedApprovalWorkflows.flatMap((workflow) => workflow.approvers.map((approver) => approver.email)));

    const shouldShowNotFoundView = isApprovalWorkflowLockedByIntegration(policy) || shouldHideDynamicExternalWorkflowPeople(policy);
    const shouldFilterOutExpensifyTeam = shouldFilterExpensifyTeam(policy?.owner, currentUserLogin);

    const allApprovers: SelectionListApprover[] = (() => {
        if (isApprovalLimitDraftLoading || !employeeList) {
            return [];
        }

        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList, employeePersonalDetails);

        return Object.values(employeeList)
            .map((employee): SelectionListApprover | null => {
                const email = employee.email;

                if (!email) {
                    return null;
                }

                if (employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return null;
                }

                if (shouldFilterOutExpensifyTeam && isExpensifyTeam(email) && selectedApproverEmail !== email) {
                    return null;
                }

                if (!workflowApproverEmails.has(email) && !originalApprovers.includes(email)) {
                    return null;
                }

                // Each approver forwards to one person only, so an approver who already has another limit can't be added to this one.
                if (hasApprovalLimit(employee) && !originalApprovers.includes(email)) {
                    return null;
                }

                // Do not allow the same email to be added twice
                if (approvers.some((approverEmail, index) => approverEmail === email && index !== approverIndex)) {
                    return null;
                }

                if (approvalLimitDraft?.overLimitForwardsTo === email) {
                    return null;
                }

                const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
                if (!accountID) {
                    return null;
                }

                const {avatar, displayName = email, login} = personalDetails?.[accountID] ?? {};

                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: selectedApproverEmail === email,
                    login: email,
                    value: email,
                    icons: [{source: avatar ?? expensifyIcons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                    rightElement: (
                        <MemberRightIcon
                            role={employee.role}
                            owner={policy?.owner}
                            login={login}
                        />
                    ),
                };
            })
            .filter((approver): approver is SelectionListApprover => !!approver);
    })();

    const shouldShowListEmptyContent = !!approvalLimitDraft && !isApprovalLimitDraftLoading;

    const goBack = () => {
        Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(policyID, originalApprovers.at(0)));
    };

    const selectApprover = (selectedApprovers: SelectionListApprover[]) => {
        if (!approvalLimitDraft) {
            return;
        }

        const selectedApprover = selectedApprovers.at(0);

        // If empty array, the same approver was tapped again to unselect
        if (selectedApprovers.length === 0) {
            setApprovalLimitApprovers(approvers.filter((_, index) => index !== approverIndex));
            goBack();
            return;
        }

        if (!selectedApprover?.login) {
            return;
        }

        const updatedApprovers = [...approvers];
        updatedApprovers[approverIndex] = selectedApprover.login;
        setApprovalLimitApprovers(updatedApprovers.filter(Boolean));
        goBack();
    };

    const headerTitle = approverIndex === 0 ? translate('workflowsPage.approver') : translate('workflowsApprovalLimitPage.additionalApproverLabel');
    const subtitle = !shouldShowListEmptyContent && <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{headerTitle}</Text>;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ApproverSelectionList
                testID={WorkspaceWorkflowsApprovalsApprovalLimitApproverPage.displayName}
                headerTitle={headerTitle}
                subtitle={subtitle}
                isLoadingReportData={isLoadingReportData}
                policy={policy}
                shouldShowNotFoundView={shouldShowNotFoundView}
                shouldShowNotFoundViewLink
                allApprovers={allApprovers}
                onBackButtonPress={goBack}
                shouldShowListEmptyContent={shouldShowListEmptyContent}
                listEmptyContentSubtitle={translate('workflowsPage.emptyContent.approverSubtitle')}
                allowMultipleSelection={false}
                onSelectApprover={selectApprover}
                shouldRequirePolicyAdmin={false}
            />
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsApprovalLimitApproverPage.displayName = 'WorkspaceWorkflowsApprovalsApprovalLimitApproverPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsApprovalLimitApproverPage);
