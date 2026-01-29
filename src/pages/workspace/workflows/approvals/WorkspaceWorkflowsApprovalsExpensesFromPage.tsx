import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Text from '@components/Text';
import useDeepCompareRef from '@hooks/useDeepCompareRef';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceInviteMembersDraft} from '@libs/actions/Policy/Member';
import {searchInServer} from '@libs/actions/Report';
import {setApprovalWorkflowMembers} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getExcludedUsers, getMemberAccountIDsForWorkspace, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
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
    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID}`, {canBeMissing: true});
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const isLoadingApprovalWorkflow = isLoadingOnyxValue(approvalWorkflowResults);
    const [selectedMembers, setSelectedMembers] = useState<SelectionListApprover[]>([]);

    const excludedUsers = useMemo(() => {
        return getExcludedUsers(policy?.employeeList);
    }, [policy?.employeeList]);

    const {
        searchTerm: searchSelectorTerm,
        setSearchTerm: setSearchSelectorTerm,
        debouncedSearchTerm,
        availableOptions,
        areOptionsInitialized,
    } = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
        includeUserToInvite: true,
        excludeLogins: excludedUsers,
        includeRecentReports: true,
        shouldInitialize: true,
    });

    useEffect(() => {
        searchInServer(searchSelectorTerm);
    }, [searchSelectorTerm]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);
    // Fix for #78777: Use route.params.backTo to detect initial creation flow instead of approvalWorkflow?.isInitialFlow
    // This ensures proper state sync when navigating back
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !route.params.backTo;
    const shouldShowListEmptyContent = !isLoadingApprovalWorkflow && approvalWorkflow && approvalWorkflow.availableMembers.length === 0;
    const firstApprover = approvalWorkflow?.originalApprovers?.[0]?.email ?? '';

    const personalDetailLogins = useDeepCompareRef(Object.fromEntries(Object.entries(personalDetails ?? {}).map(([id, details]) => [id, details?.login])));

    // Fix for #78777: Remove the selectedMembers.length > 0 check that prevented proper state sync
    useEffect(() => {
        if (!approvalWorkflow?.members) {
            return;
        }

        setSelectedMembers(
            approvalWorkflow.members.map((member) => {
                const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
                // Fix for #78781: Handle non-workspace members properly
                let accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');
                const isPolicyMember = !!policy?.employeeList?.[member.email];

                const personalDetail = getPersonalDetailByEmail(member.email);

                // For non-policy members, try to get accountID from draft or personal details
                if (!isPolicyMember) {
                    const draftAccountID = invitedEmailsToAccountIDsDraft?.[member.email];
                    if (draftAccountID) {
                        accountID = draftAccountID;
                    } else if (personalDetail?.accountID) {
                        accountID = personalDetail.accountID;
                    }
                }

                const login = personalDetailLogins?.[accountID] ?? member.email;
                const displayName = member.displayName ?? personalDetail?.displayName ?? member.email;
                // Fix for #78781: Use avatar from personalDetail if member.avatar is not available
                const avatar = member.avatar ?? personalDetail?.avatar;

                return {
                    text: Str.removeSMSDomain(displayName),
                    alternateText: member.email,
                    keyForList: member.email,
                    isSelected: true,
                    login: member.email,
                    icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: Str.removeSMSDomain(displayName), id: accountID}],
                    // Only show right element for policy members
                    rightElement: isPolicyMember ? (
                        <MemberRightIcon
                            role={policy?.employeeList?.[member.email]?.role}
                            owner={policy?.owner}
                            login={login}
                        />
                    ) : undefined,
                };
            }),
        );
    }, [approvalWorkflow?.members, icons.FallbackAvatar, invitedEmailsToAccountIDsDraft, personalDetailLogins, policy?.employeeList, policy?.owner]);

    const allApprovers = useMemo(() => {
        const members: SelectionListApprover[] = [...selectedMembers];
        const approversEmail = approvalWorkflow?.approvers.map((member) => member?.email);

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
                    icons: [{source: member.avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: Str.removeSMSDomain(member.displayName), id: accountID}],
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

        // Add search results for non-workspace members
        if (debouncedSearchTerm && areOptionsInitialized) {
            // Add userToInvite if available
            if (availableOptions.userToInvite) {
                const userToInvite = availableOptions.userToInvite;
                const isAlreadySelected = selectedMembers.some((selectedOption) => selectedOption.login === userToInvite.login);
                if (!isAlreadySelected) {
                    members.push({
                        text: userToInvite.text ?? userToInvite.login ?? '',
                        alternateText: userToInvite.login ?? '',
                        keyForList: userToInvite.login ?? '',
                        isSelected: false,
                        login: userToInvite.login ?? '',
                        icons: userToInvite.icons ?? [],
                    });
                }
            }

            // Add search results that are not already workspace members
            const searchResults = [...availableOptions.recentReports, ...availableOptions.personalDetails].filter((option) => {
                const isMember = policy?.employeeList?.[option.login ?? ''];
                const isAlreadyInList = members.some((m) => m.login === option.login);
                return !isMember && !isAlreadyInList;
            });

            for (const option of searchResults) {
                members.push({
                    text: option.text ?? option.login ?? '',
                    alternateText: option.login ?? '',
                    keyForList: option.login ?? '',
                    isSelected: false,
                    login: option.login ?? '',
                    icons: option.icons ?? [],
                });
            }
        }

        return members;
    }, [
        selectedMembers,
        approvalWorkflow?.availableMembers,
        approvalWorkflow?.approvers,
        policy?.employeeList,
        policy?.owner,
        policy?.preventSelfApproval,
        personalDetailLogins,
        debouncedSearchTerm,
        areOptionsInitialized,
        availableOptions.userToInvite,
        availableOptions.recentReports,
        availableOptions.personalDetails,
        icons.FallbackAvatar,
    ]);

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
        // Fix for #78776: Separate existing members from users that need to be invited
        const existingMembers: Member[] = [];
        const usersToInvite: Array<{email: string; accountID?: number}> = [];

        for (const member of selectedMembers) {
            if (!member.login) {
                continue;
            }
            const isPolicyMember = policy?.employeeList?.[member.login];
            if (isPolicyMember) {
                existingMembers.push({
                    displayName: member.text ?? '',
                    avatar: member.icons?.at(0)?.source,
                    email: member.login,
                });
            } else {
                // This is a non-workspace member that needs to be invited
                const iconId = member.icons?.at(0)?.id;
                const accountID = typeof iconId === 'number' ? iconId : undefined;
                usersToInvite.push({
                    email: member.login,
                    accountID,
                });
            }
        }

        // Normalize avatar types for existing members
        const normalizedExistingMembers: Member[] = existingMembers.map((member) => ({
            ...member,
            avatar: typeof member.avatar === 'string' ? member.avatar : undefined,
        }));

        // Combine all members for the workflow
        const allMembers: Member[] = [
            ...normalizedExistingMembers,
            ...usersToInvite.map((user) => ({
                displayName: user.email,
                email: user.email,
                avatar: undefined,
            })),
        ];
        setApprovalWorkflowMembers(allMembers);

        // If there are users to invite, navigate to invite flow first
        if (usersToInvite.length > 0) {
            const invitedEmailsToAccountIDs: Record<string, number> = {};
            for (const user of usersToInvite) {
                if (!user.email) {
                    continue;
                }
                if (user.accountID) {
                    invitedEmailsToAccountIDs[user.email] = user.accountID;
                }
            }

            setWorkspaceInviteMembersDraft(route.params.policyID, invitedEmailsToAccountIDs);

            // Navigate to invite page with backTo set to return here
            const backToRoute = isInitialCreationFlow
                ? ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID)
                : ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID, route.params.backTo);
            Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(route.params.policyID, backToRoute));
            return;
        }

        if (isInitialCreationFlow) {
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(route.params.policyID, 0));
        } else {
            goBack();
        }
    }, [route.params.policyID, route.params.backTo, selectedMembers, isInitialCreationFlow, goBack, policy?.employeeList]);

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
    }, [isInitialCreationFlow, translate, shouldShowListEmptyContent, selectedMembers.length, nextStep, styles]);

    const toggleMember = useCallback((members: SelectionListApprover[]) => setSelectedMembers(members), []);

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
                shouldShowTextInput
                onSelectApprover={toggleMember}
                footerContent={button}
                shouldShowLoadingPlaceholder={isLoadingApprovalWorkflow}
                shouldEnableHeaderMaxHeight
                onSearchChange={setSearchSelectorTerm}
                shouldUpdateFocusedIndex={false}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsExpensesFromPage);
