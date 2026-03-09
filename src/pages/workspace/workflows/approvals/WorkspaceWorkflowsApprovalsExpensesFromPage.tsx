import {useFocusEffect} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useState} from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Text from '@components/Text';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
    const [approvalWorkflow, approvalWorkflowResults] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const isLoadingApprovalWorkflow = isLoadingOnyxValue(approvalWorkflowResults);
    const [selectedMemberEmails, setSelectedMemberEmails] = useState<string[]>([]);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && approvalWorkflow?.isInitialFlow;
    const shouldShowListEmptyContent = !isLoadingApprovalWorkflow && approvalWorkflow && approvalWorkflow.availableMembers.length === 0;
    const firstApprover = approvalWorkflow?.originalApprovers?.[0]?.email ?? '';
    const workflowMembers = approvalWorkflow?.members ?? [];
    const workflowMemberEmails = useMemo(() => workflowMembers.map((member) => member.email).filter(Boolean), [workflowMembers]);
    const initialSelectedMemberEmails = useInitialSelectionRef(workflowMemberEmails, {resetDeps: [workflowMemberEmails.join(',')], resetOnFocus: true});
    const activeSelectedMemberEmails = hasUserInteracted ? selectedMemberEmails : initialSelectedMemberEmails;
    const activeSelectedMemberEmailSet = useMemo(() => new Set(activeSelectedMemberEmails), [activeSelectedMemberEmails]);
    const approverEmails = useMemo(() => approvalWorkflow?.approvers.map((member) => member?.email).filter(Boolean) ?? [], [approvalWorkflow?.approvers]);
    const policyMemberEmailsToAccountIDs = useMemo(() => getMemberAccountIDsForWorkspace(policy?.employeeList), [policy?.employeeList]);

    useFocusEffect(
        useCallback(() => {
            setHasUserInteracted(false);
        }, []),
    );

    const createApproverOption = useCallback(
        (member: Member): SelectionListApprover => {
            const accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');
            const displayName = Str.removeSMSDomain(member.displayName);

            return {
                text: displayName,
                alternateText: member.email,
                keyForList: member.email,
                isSelected: false,
                login: member.email,
                icons: [{source: member.avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                rightElement: (
                    <MemberRightIcon
                        role={policy?.employeeList?.[member.email]?.role}
                        owner={policy?.owner}
                        login={member.email}
                    />
                ),
            };
        },
        [icons.FallbackAvatar, policy?.employeeList, policy?.owner, policyMemberEmailsToAccountIDs],
    );

    const baseApprovers = useMemo(() => {
        const approvers: SelectionListApprover[] = [];
        const seenEmails = new Set<string>();

        for (const member of workflowMembers) {
            if (!member.email || seenEmails.has(member.email)) {
                continue;
            }

            approvers.push(createApproverOption(member));
            seenEmails.add(member.email);
        }

        for (const member of approvalWorkflow?.availableMembers ?? []) {
            if (!member.email || seenEmails.has(member.email)) {
                continue;
            }

            if (policy?.preventSelfApproval && approverEmails.includes(member.email)) {
                continue;
            }

            approvers.push(createApproverOption(member));
            seenEmails.add(member.email);
        }

        return approvers;
    }, [approvalWorkflow?.availableMembers, approverEmails, createApproverOption, policy?.preventSelfApproval, workflowMembers]);

    const allApprovers = useMemo(
        () =>
            baseApprovers.map((member) => ({
                ...member,
                isSelected: activeSelectedMemberEmailSet.has(member.login ?? ''),
            })),
        [activeSelectedMemberEmailSet, baseApprovers],
    );

    const selectedApproversForSave = useMemo(() => baseApprovers.filter((member) => activeSelectedMemberEmailSet.has(member.login ?? '')), [activeSelectedMemberEmailSet, baseApprovers]);

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
        const members: Member[] = selectedApproversForSave.map((member) => ({displayName: member.text ?? '', avatar: member.icons?.at(0)?.source, email: member.login ?? ''}));
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
            isDisabled={!shouldShowListEmptyContent && !activeSelectedMemberEmails.length}
            buttonText={buttonText}
            onSubmit={shouldShowListEmptyContent ? () => Navigation.goBack() : nextStep}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
        />
    );

    const toggleMember = useCallback((members: SelectionListApprover[]) => {
        setSelectedMemberEmails(members.map((member) => member.login ?? '').filter(Boolean));
        setHasUserInteracted(true);
    }, []);

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

export {WorkspaceWorkflowsApprovalsExpensesFromPage};
export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsExpensesFromPage);
