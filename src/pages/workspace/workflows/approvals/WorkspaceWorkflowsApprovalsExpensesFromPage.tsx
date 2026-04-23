import {Str} from 'expensify-common';
import React, {useEffect, useState} from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setApprovalWorkflowMembers} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getDefaultApprover, getMemberAccountIDsForWorkspace, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
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
    const [approvalWorkflow, approvalWorkflowResults] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const {showConfirmModal} = useConfirmModal();

    const isLoadingApprovalWorkflow = isLoadingOnyxValue(approvalWorkflowResults);
    const [selectedMembers, setSelectedMembers] = useState<SelectionListApprover[]>([]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && approvalWorkflow?.isInitialFlow;
    const shouldShowListEmptyContent = !isLoadingApprovalWorkflow && approvalWorkflow?.availableMembers.length === 0;
    const firstApprover = approvalWorkflow?.originalApprovers?.[0]?.email ?? '';
    const isCreateAction = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE;

    // Build a map of member emails to their existing workflow's approver email (for non-default workflows only)
    const membersInExistingWorkflows = (() => {
        const employees = policy?.employeeList ?? {};
        const defaultApprover = getDefaultApprover(policy);
        const map = new Map<string, string>();

        for (const employee of Object.values(employees)) {
            if (!employee.email || !employee.submitsTo || employee.submitsTo === defaultApprover) {
                continue;
            }
            // Only track members who submit to a non-default approver (i.e., they're in a custom workflow)
            if (employees[employee.submitsTo]) {
                map.set(employee.email, employee.submitsTo);
            }
        }
        return map;
    })();

    useEffect(() => {
        if (!approvalWorkflow?.members) {
            return;
        }

        // Intentional: derives the selected-members list from the approval workflow data.
        // This effect synchronizes local component state with the Onyx-sourced workflow when it changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedMembers(
            approvalWorkflow.members.map((member) => {
                const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
                const accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');

                return {
                    text: Str.removeSMSDomain(member.displayName),
                    alternateText: member.email,
                    keyForList: member.email,
                    isSelected: true,
                    login: member.email,
                    icons: [{source: member.avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: Str.removeSMSDomain(member.displayName), id: accountID}],
                    rightElement: (
                        <MemberRightIcon
                            role={policy?.employeeList?.[member.email]?.role}
                            owner={policy?.owner}
                            login={member.email}
                        />
                    ),
                };
            }),
        );
    }, [approvalWorkflow?.members, policy?.employeeList, policy?.owner, translate, icons.FallbackAvatar]);

    const approversEmail = approvalWorkflow?.approvers.map((member) => member?.email);
    const allApprovers: SelectionListApprover[] = [...selectedMembers];

    if (approvalWorkflow?.availableMembers) {
        const availableMembers = approvalWorkflow.availableMembers
            .map((member) => {
                const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
                const accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');

                return {
                    text: Str.removeSMSDomain(member.displayName),
                    alternateText: member.email,
                    keyForList: member.email,
                    isSelected: false,
                    login: member.email,
                    icons: [{source: member.avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: Str.removeSMSDomain(member.displayName), id: accountID}],
                    rightElement: (
                        <MemberRightIcon
                            role={policy?.employeeList?.[member.email]?.role}
                            owner={policy?.owner}
                            login={member.email}
                        />
                    ),
                };
            })
            .filter(
                (member) => (!policy?.preventSelfApproval || !approversEmail?.includes(member.login)) && !selectedMembers.some((selectedOption) => selectedOption.login === member.login),
            );

        allApprovers.push(...availableMembers);
    }

    const goBack = () => {
        let backTo;
        if (approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT) {
            backTo = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover);
        } else if (!isInitialCreationFlow) {
            backTo = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID);
        }
        Navigation.goBack(backTo);
    };

    const nextStep = () => {
        const members: Member[] = selectedMembers.map((member) => ({displayName: member.text ?? '', avatar: member.icons?.at(0)?.source, email: member.login ?? ''}));
        setApprovalWorkflowMembers(members);

        if (isInitialCreationFlow) {
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(route.params.policyID, 0));
        } else {
            goBack();
        }
    };

    let buttonText = isInitialCreationFlow ? translate('common.next') : translate('common.save');
    if (shouldShowListEmptyContent) {
        buttonText = translate('common.buttonConfirm');
    }

    const button = (
        <FormAlertWithSubmitButton
            isDisabled={!shouldShowListEmptyContent && !selectedMembers.length}
            buttonText={buttonText}
            onSubmit={shouldShowListEmptyContent ? () => Navigation.goBack() : nextStep}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
        />
    );

    const toggleMember = (members: SelectionListApprover[]) => {
        // Only show warning when creating a new workflow and a member is being added (not removed)
        if (isCreateAction && members.length > selectedMembers.length) {
            // Find the newly added member by comparing with current selection
            const newMember = members.find((m) => !selectedMembers.some((s) => s.login === m.login));
            const existingApproverEmail = newMember?.login ? membersInExistingWorkflows.get(newMember.login) : undefined;

            if (newMember && existingApproverEmail) {
                const memberName = Str.removeSMSDomain(newMember.text ?? newMember.login ?? '');
                const approverDetails = getPersonalDetailByEmail(existingApproverEmail);
                const approverName = Str.removeSMSDomain(approverDetails?.displayName ?? existingApproverEmail);

                showConfirmModal({
                    title: translate('workflowsExpensesFromPage.memberAlreadyInWorkflowTitle'),
                    prompt: translate('workflowsExpensesFromPage.memberAlreadyInWorkflowPrompt', {memberName, approverName}),
                    confirmText: translate('common.confirm'),
                    cancelText: translate('common.cancel'),
                }).then((result) => {
                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    setSelectedMembers(members);
                });
                return;
            }
        }

        setSelectedMembers(members);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ApproverSelectionList
                testID="WorkspaceWorkflowsApprovalsExpensesFromPage"
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
                shouldUpdateFocusedIndex={false}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsExpensesFromPage);
