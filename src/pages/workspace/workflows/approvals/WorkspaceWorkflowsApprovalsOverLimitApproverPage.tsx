import React, {useCallback, useMemo} from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import MemberRightIcon from '@pages/workspace/MemberRightIcon';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import {setApprovalWorkflowApprover} from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsByEmailSelector} from '@src/selectors/PersonalDetails';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceWorkflowsApprovalsOverLimitApproverPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER>;

function WorkspaceWorkflowsApprovalsOverLimitApproverPage({policy, personalDetails, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsOverLimitApproverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [approvalWorkflow, approvalWorkflowMetadata] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const isApprovalWorkflowLoading = isLoadingOnyxValue(approvalWorkflowMetadata);
    const [personalDetailsByEmail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: personalDetailsByEmailSelector,
    });
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['FallbackAvatar'] as const);

    const policyID = route.params.policyID;
    const approverIndex = Number(route.params.approverIndex ?? 0);
    const backTo = route.params?.backTo;
    const currentApprover = approvalWorkflow?.approvers?.[approverIndex];

    const employeeList = policy?.employeeList;
    const isDefault = approvalWorkflow?.isDefault;
    const membersEmail = useMemo(() => approvalWorkflow?.members.map((member) => member.email), [approvalWorkflow?.members]);

    const allApprovers: SelectionListApprover[] = useMemo(() => {
        if (isApprovalWorkflowLoading || !employeeList) {
            return [];
        }

        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList);

        return Object.values(employeeList)
            .map((employee): SelectionListApprover | null => {
                const email = employee.email;

                if (!email) {
                    return null;
                }

                if (!isDefault && policy?.preventSelfApproval && membersEmail?.includes(email)) {
                    return null;
                }

                const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
                const {avatar, displayName = email, login} = personalDetails?.[accountID] ?? {};

                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: currentApprover?.overLimitForwardsTo === email,
                    login: email,
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
    }, [
        isApprovalWorkflowLoading,
        employeeList,
        personalDetails,
        policy?.owner,
        policy?.preventSelfApproval,
        currentApprover?.overLimitForwardsTo,
        expensifyIcons.FallbackAvatar,
        isDefault,
        membersEmail,
    ]);

    const shouldShowListEmptyContent = !!approvalWorkflow && !isApprovalWorkflowLoading;

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(policyID, approverIndex, backTo));
    }, [policyID, approverIndex, backTo]);

    const selectApprover = useCallback(
        (approvers: SelectionListApprover[]) => {
            const selectedApprover = approvers.at(0);

            if (!approvalWorkflow || !currentApprover) {
                return;
            }

            // If empty array, the same approver was tapped again to unselect
            if (approvers.length === 0) {
                setApprovalWorkflowApprover({
                    approver: {
                        ...currentApprover,
                        overLimitForwardsTo: '',
                    },
                    approverIndex,
                    currentApprovalWorkflow: approvalWorkflow,
                    policy,
                    personalDetailsByEmail,
                });
                goBack();
                return;
            }

            if (!selectedApprover?.login) {
                return;
            }

            setApprovalWorkflowApprover({
                approver: {
                    ...currentApprover,
                    overLimitForwardsTo: selectedApprover.login,
                },
                approverIndex,
                currentApprovalWorkflow: approvalWorkflow,
                policy,
                personalDetailsByEmail,
            });

            goBack();
        },
        [approvalWorkflow, currentApprover, approverIndex, policy, personalDetailsByEmail, goBack],
    );

    const subtitle = useMemo(
        () => !shouldShowListEmptyContent && <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsApprovalLimitPage.additionalApproverLabel')}</Text>,
        [shouldShowListEmptyContent, translate, styles.textHeadlineH1, styles.mh5, styles.mv3],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ApproverSelectionList
                testID={WorkspaceWorkflowsApprovalsOverLimitApproverPage.displayName}
                headerTitle={translate('workflowsApprovalLimitPage.additionalApproverLabel')}
                subtitle={subtitle}
                isLoadingReportData={isLoadingReportData}
                policy={policy}
                initiallyFocusedOptionKey={currentApprover?.overLimitForwardsTo}
                shouldShowNotFoundViewLink
                allApprovers={allApprovers}
                onBackButtonPress={goBack}
                shouldShowListEmptyContent={shouldShowListEmptyContent}
                listEmptyContentSubtitle={translate('workflowsPage.emptyContent.approverSubtitle')}
                allowMultipleSelection={false}
                onSelectApprover={selectApprover}
            />
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsOverLimitApproverPage.displayName = 'WorkspaceWorkflowsApprovalsOverLimitApproverPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsOverLimitApproverPage);
