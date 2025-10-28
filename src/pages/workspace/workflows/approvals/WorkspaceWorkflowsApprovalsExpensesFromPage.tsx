import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useDeepCompareRef from '@hooks/useDeepCompareRef';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setApprovalWorkflowMembers} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getMemberAccountIDsForWorkspace, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import MemberRightIcon from '@pages/workspace/MemberRightIcon';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Member} from '@src/types/onyx/ApprovalWorkflow';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceWorkflowsApprovalsExpensesFromPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EXPENSES_FROM>;

function WorkspaceWorkflowsApprovalsExpensesFromPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsExpensesFromPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [approvalWorkflow, approvalWorkflowResults] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});

    const isLoadingApprovalWorkflow = isLoadingOnyxValue(approvalWorkflowResults);
    const [selectedMembers, setSelectedMembers] = useState<SelectionListApprover[]>([]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !route.params.backTo;
    const shouldShowListEmptyContent = !isLoadingApprovalWorkflow && approvalWorkflow && approvalWorkflow.availableMembers.length === 0;
    const firstApprover = approvalWorkflow?.originalApprovers?.[0]?.email ?? '';

    const personalDetailLogins = useDeepCompareRef(Object.fromEntries(Object.entries(personalDetails ?? {}).map(([id, details]) => [id, details?.login])));

    useEffect(() => {
        if (!approvalWorkflow?.members) {
            return;
        }

        setSelectedMembers(
            approvalWorkflow.members.map((member) => {
                const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
                const accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');
                const login = personalDetailLogins?.[accountID];

                return {
                    text: Str.removeSMSDomain(member.displayName),
                    alternateText: member.email,
                    keyForList: member.email,
                    isSelected: true,
                    login: member.email,
                    icons: [{source: member.avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: Str.removeSMSDomain(member.displayName), id: accountID}],
                    rightElement: (
                        <MemberRightIcon
                            role={policy?.employeeList?.[member.email]?.role}
                            owner={policy?.owner}
                            login={login}
                        />
                    ),
                };
            }),
        );
    }, [approvalWorkflow?.members, policy?.employeeList, policy?.owner, personalDetailLogins, translate]);

    const approversEmail = useMemo(() => approvalWorkflow?.approvers.map((member) => member?.email), [approvalWorkflow?.approvers]);
    const allApprovers = useMemo(() => {
        const members: SelectionListApprover[] = [...selectedMembers];

        if (!approvalWorkflow?.availableMembers) {
            return members;
        }
        const availableMembers = approvalWorkflow.availableMembers
            .map((member) => {
                const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
                const accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');
                const login = personalDetailLogins?.[accountID];

                return {
                    text: Str.removeSMSDomain(member.displayName),
                    alternateText: member.email,
                    keyForList: member.email,
                    isSelected: false,
                    login: member.email,
                    icons: [{source: member.avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: Str.removeSMSDomain(member.displayName), id: accountID}],
                    rightElement: (
                        <MemberRightIcon
                            role={policy?.employeeList?.[member.email]?.role}
                            owner={policy?.owner}
                            login={login}
                        />
                    ),
                };
            })
            .filter(
                (member) => (!policy?.preventSelfApproval || !approversEmail?.includes(member.login)) && !selectedMembers.some((selectedOption) => selectedOption.login === member.login),
            );

        members.push(...availableMembers);

        return members;
    }, [selectedMembers, approvalWorkflow?.availableMembers, policy?.employeeList, policy?.owner, policy?.preventSelfApproval, personalDetailLogins, approversEmail]);

    const goBack = useCallback(() => {
        let backTo;
        if (approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT) {
            backTo = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover);
        } else if (!isInitialCreationFlow) {
            backTo = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID);
        }
        Navigation.goBack(backTo);
    }, [isInitialCreationFlow, route.params.policyID, firstApprover, approvalWorkflow?.action]);

    const nextStep = useCallback(() => {
        const members: Member[] = selectedMembers.map((member) => ({displayName: member.text, avatar: member.icons.at(0)?.source, email: member.login}));
        setApprovalWorkflowMembers(members);

        if (isInitialCreationFlow) {
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(route.params.policyID, 0));
        } else {
            goBack();
        }
    }, [route.params.policyID, selectedMembers, isInitialCreationFlow, goBack]);

    const button = useMemo(() => {
        let buttonText = isInitialCreationFlow ? translate('common.next') : translate('common.save');

        if (shouldShowListEmptyContent) {
            buttonText = translate('common.buttonConfirm');
        }

        return (
            <FormAlertWithSubmitButton
                isDisabled={!shouldShowListEmptyContent && !selectedMembers.length}
                buttonText={buttonText}
                onSubmit={shouldShowListEmptyContent ? () => Navigation.goBack() : nextStep}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
            />
        );
    }, [isInitialCreationFlow, nextStep, selectedMembers.length, shouldShowListEmptyContent, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate]);

    const toggleMember = (members: SelectionListApprover[]) => setSelectedMembers(members);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ApproverSelectionList
                testID={WorkspaceWorkflowsApprovalsExpensesFromPage.displayName}
                headerTitle={translate('workflowsExpensesFromPage.title')}
                onBackButtonPress={goBack}
                subtitle={
                    approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE &&
                    !shouldShowListEmptyContent && <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsExpensesFromPage.header')}</Text>
                }
                isLoadingReportData={isLoadingReportData}
                policy={policy}
                shouldShowNotFoundViewLink
                shouldShowListEmptyContent={shouldShowListEmptyContent}
                shouldShowNotFoundView={shouldShowNotFoundView}
                allApprovers={allApprovers}
                listEmptyContentSubtitle={translate('workflowsPage.emptyContent.expensesFromSubtitle')}
                allowMultipleSelection
                onSelectApprover={toggleMember}
                footerContent={button}
                shouldShowLoadingPlaceholder={isLoadingApprovalWorkflow}
                shouldEnableHeaderMaxHeight
            />
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsExpensesFromPage.displayName = 'WorkspaceWorkflowsApprovalsExpensesFromPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsExpensesFromPage);
