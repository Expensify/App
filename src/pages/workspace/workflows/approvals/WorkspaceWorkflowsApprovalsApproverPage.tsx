import {useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearApprovalWorkflowApprover, clearApprovalWorkflowApprovers, setApprovalWorkflowApprover} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getDefaultApprover, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import MemberRightIcon from '@pages/workspace/MemberRightIcon';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceWorkflowsApprovalsApproverPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER>;

function WorkspaceWorkflowsApprovalsApproverPage({policy, personalDetails, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsApproverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [approvalWorkflow, approvalWorkflowMetadata] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const isApprovalWorkflowLoading = isLoadingOnyxValue(approvalWorkflowMetadata);
    const [currentApprovalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const [selectedApproverEmail, setSelectedApproverEmail] = useState<string | undefined>(undefined);

    const approverIndex = Number(route.params.approverIndex) ?? 0;
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !route.params.backTo;
    const defaultApprover = getDefaultApprover(policy);
    const firstApprover = approvalWorkflow?.approvers?.[0]?.email ?? '';
    const rhpRoutes = useNavigationState((state) => state.routes);

    useEffect(() => {
        const currentApprover = approvalWorkflow?.approvers[approverIndex];
        if (!currentApprover) {
            return;
        }

        setSelectedApproverEmail(currentApprover.email);
    }, [approvalWorkflow?.approvers, approverIndex]);

    const employeeList = policy?.employeeList;
    const approversFromWorkflow = approvalWorkflow?.approvers;
    const isDefault = approvalWorkflow?.isDefault;
    const membersEmail = useMemo(() => approvalWorkflow?.members.map((member) => member.email), [approvalWorkflow?.members]);
    const allApprovers: SelectionListApprover[] = useMemo(() => {
        if (isApprovalWorkflowLoading || !employeeList) {
            return [];
        }

        return Object.values(employeeList)
            .map((employee): SelectionListApprover | null => {
                const email = employee.email;

                if (!email) {
                    return null;
                }

                if (!isDefault && policy?.preventSelfApproval && membersEmail?.includes(email)) {
                    return null;
                }

                // Do not allow the same email to be added twice
                const isEmailAlreadyInApprovers = approversFromWorkflow?.some((approver, index) => approver?.email === email && index !== approverIndex);
                if (isEmailAlreadyInApprovers && selectedApproverEmail !== email) {
                    return null;
                }

                // Do not allow the default approver to be added as the first approver
                if (!isDefault && approverIndex === 0 && defaultApprover === email) {
                    return null;
                }

                const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList);
                const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
                const {avatar, displayName = email, login} = personalDetails?.[accountID] ?? {};

                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: selectedApproverEmail === email,
                    login: email,
                    icons: [{source: avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
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
    }, [
        isApprovalWorkflowLoading,
        employeeList,
        policy?.preventSelfApproval,
        policy?.owner,
        membersEmail,
        approversFromWorkflow,
        selectedApproverEmail,
        isDefault,
        approverIndex,
        defaultApprover,
        personalDetails,
    ]);

    const shouldShowListEmptyContent = !!approvalWorkflow && !isApprovalWorkflowLoading;

    const goBack = useCallback(() => {
        let backTo;
        if (isInitialCreationFlow) {
            backTo = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID);
            clearApprovalWorkflowApprovers();
        } else if (approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT) {
            backTo = rhpRoutes.length > 1 ? undefined : ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover);
        } else {
            backTo = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID);
        }
        Navigation.goBack(backTo);
    }, [isInitialCreationFlow, approvalWorkflow?.action, route.params.policyID, rhpRoutes.length, firstApprover]);

    const toggleApprover = useCallback(
        (approvers: SelectionListApprover[]) => {
            const approver = approvers.at(0);
            if (selectedApproverEmail === approver?.login) {
                clearApprovalWorkflowApprover({approverIndex, currentApprovalWorkflow});
            } else {
                const newSelectedEmail = approver?.login ?? '';
                const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList);
                const accountID = Number(newSelectedEmail ? policyMemberEmailsToAccountIDs[newSelectedEmail] : '');
                const {avatar, displayName = newSelectedEmail} = personalDetails?.[accountID] ?? {};
                setApprovalWorkflowApprover({
                    approver: {
                        email: newSelectedEmail,
                        avatar,
                        displayName,
                    },
                    approverIndex,
                    currentApprovalWorkflow,
                    policy,
                });
            }

            if (isInitialCreationFlow) {
                Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID));
            } else {
                goBack();
            }
        },
        [selectedApproverEmail, employeeList, personalDetails, approverIndex, route.params.policyID, isInitialCreationFlow, goBack, currentApprovalWorkflow],
    );

    const subtitle = useMemo(
        () =>
            approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE &&
            !shouldShowListEmptyContent && <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsApproverPage.header')}</Text>,
        [approvalWorkflow?.action, shouldShowListEmptyContent, translate, styles.textHeadlineH1, styles.mh5, styles.mv3],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ApproverSelectionList
                testID={WorkspaceWorkflowsApprovalsApproverPage.displayName}
                headerTitle={translate('workflowsPage.approver')}
                subtitle={subtitle}
                isLoadingReportData={isLoadingReportData}
                policy={policy}
                initiallyFocusedOptionKey={selectedApproverEmail}
                shouldShowNotFoundViewLink
                allApprovers={allApprovers}
                onBackButtonPress={goBack}
                shouldShowListEmptyContent={shouldShowListEmptyContent}
                listEmptyContentSubtitle={translate('workflowsPage.emptyContent.approverSubtitle')}
                allowMultipleSelection={false}
                onSelectApprover={toggleApprover}
            />
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsApproverPage.displayName = 'WorkspaceWorkflowsApprovalsApproverPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsApproverPage);
