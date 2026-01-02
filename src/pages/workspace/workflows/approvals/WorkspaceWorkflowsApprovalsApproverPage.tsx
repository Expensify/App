import {useNavigationState} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
import SCREENS from '@src/SCREENS';
import {personalDetailsByEmailSelector} from '@src/selectors/PersonalDetails';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceWorkflowsApprovalsApproverPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER | typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER_CHANGE>;

function WorkspaceWorkflowsApprovalsApproverPage({policy, personalDetails, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsApproverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [approvalWorkflow, approvalWorkflowMetadata] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const isApprovalWorkflowLoading = isLoadingOnyxValue(approvalWorkflowMetadata);
    const [personalDetailsByEmail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: personalDetailsByEmailSelector,
    });
    const approverIndex = Number(route.params.approverIndex) ?? 0;
    const rhpRoutes = useNavigationState((state) => state.routes);
    const defaultApprover = getDefaultApprover(policy);
    const firstApprover = approvalWorkflow?.approvers?.[0]?.email ?? '';

    const isChangeApproverRoute = route.name === SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER_CHANGE;
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && approvalWorkflow?.isInitialFlow;
    const currentApprover = approvalWorkflow?.approvers[approverIndex];
    const selectedApproverEmail = currentApprover?.email;

    const employeeList = policy?.employeeList;
    const approversFromWorkflow = approvalWorkflow?.approvers;
    const isDefault = approvalWorkflow?.isDefault;

    const allApprovers: SelectionListApprover[] = useMemo(() => {
        if (isApprovalWorkflowLoading || !employeeList) {
            return [];
        }

        const membersEmail = approvalWorkflow?.members?.map((member) => member.email);

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
                    icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
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
        isDefault,
        policy?.preventSelfApproval,
        policy?.owner,
        approvalWorkflow?.members,
        approversFromWorkflow,
        selectedApproverEmail,
        approverIndex,
        defaultApprover,
        personalDetails,
        icons.FallbackAvatar,
    ]);

    const shouldShowListEmptyContent = !!approvalWorkflow && !isApprovalWorkflowLoading;

    const goBack = useCallback(() => {
        let backToRoute;
        if (isInitialCreationFlow) {
            backToRoute = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID);
            clearApprovalWorkflowApprovers();
        } else if (approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT) {
            backToRoute = rhpRoutes.length > 1 ? undefined : ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover);
        } else {
            backToRoute = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID);
        }
        Navigation.goBack(backToRoute);
    }, [isInitialCreationFlow, approvalWorkflow?.action, route.params.policyID, rhpRoutes.length, firstApprover]);

    const toggleApprover = useCallback(
        (approvers: SelectionListApprover[]) => {
            const approver = approvers.at(0);
            const isRemovingApprover = approvers.length === 0;

            if (isRemovingApprover) {
                clearApprovalWorkflowApprover({approverIndex, currentApprovalWorkflow: approvalWorkflow});
                goBack();
                return;
            }

            const newSelectedEmail = approver?.login ?? '';
            const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList);
            const accountID = Number(newSelectedEmail ? policyMemberEmailsToAccountIDs[newSelectedEmail] : '');
            const {avatar, displayName = newSelectedEmail} = personalDetails?.[accountID] ?? {};

            setApprovalWorkflowApprover({
                approver: {
                    email: newSelectedEmail,
                    avatar,
                    displayName,
                    approvalLimit: null,
                    overLimitForwardsTo: '',
                },
                approverIndex,
                currentApprovalWorkflow: approvalWorkflow,
                policy,
                personalDetailsByEmail,
            });

            // If this is the change approver route, go back to the Approval Limit page
            // Otherwise, navigate forward to set the approval limit
            if (isChangeApproverRoute) {
                Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(route.params.policyID, approverIndex));
            } else {
                Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(route.params.policyID, approverIndex));
            }
        },
        [approverIndex, approvalWorkflow, employeeList, personalDetails, policy, route.params.policyID, goBack, personalDetailsByEmail, isChangeApproverRoute],
    );

    const subtitle = useMemo(
        () => (
            <>
                <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsApproverPage.title')}</Text>
                <Text style={[styles.mh5, styles.mb3, styles.textSupporting]}>{translate('workflowsApproverPage.description')}</Text>
            </>
        ),
        [translate, styles.textHeadlineH1, styles.mh5, styles.mv3, styles.mb3, styles.textSupporting],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ApproverSelectionList
                testID="WorkspaceWorkflowsApprovalsApproverPage"
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

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsApproverPage);
