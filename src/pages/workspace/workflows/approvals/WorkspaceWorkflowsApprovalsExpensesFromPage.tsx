import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearInviteDraft, setWorkspaceInviteMembersDraft} from '@libs/actions/Policy/Member';
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
import type {Route} from '@src/ROUTES';
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
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID}`);
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const personalDetailLogins = useMemo(() => Object.fromEntries(Object.entries(personalDetails ?? {}).map(([id, details]) => [id, details?.login])), [personalDetails]);

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
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !route.params.backTo;
    const shouldShowListEmptyContent = !isLoadingApprovalWorkflow && approvalWorkflow && approvalWorkflow.availableMembers.length === 0;
    const firstApprover = approvalWorkflow?.originalApprovers?.[0]?.email ?? '';

    useEffect(() => {
        if (!approvalWorkflow?.members) {
            return;
        }

        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);

        // Intentional: derives the selected-members list from the approval workflow data.
        // This effect synchronizes local component state with the Onyx-sourced workflow when it changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedMembers(
            approvalWorkflow.members
                .filter((member) => {
                    const isPolicyMember = !!policy?.employeeList?.[member.email];
                    // Keep policy members. For non-policy members, only keep if they're
                    // in the invite draft (meaning an invite flow is actively in progress).
                    // This mirrors the card flow's handleBackButtonPress cleanup pattern.
                    return isPolicyMember || invitedEmailsToAccountIDsDraft?.[member.email] != null;
                })
                .map((member) => {
                    let accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');
                    const isPolicyMember = !!policy?.employeeList?.[member.email];

                    const personalDetail = getPersonalDetailByEmail(member.email);

                    // For non-policy members, try to get accountID from draft or personal details
                    if (!isPolicyMember) {
                        const draftAccountID = invitedEmailsToAccountIDsDraft?.[member.email];
                        if (draftAccountID != null) {
                            accountID = draftAccountID;
                        } else if (personalDetail?.accountID) {
                            accountID = personalDetail.accountID;
                        }
                    }

                    const login = personalDetailLogins?.[accountID] ?? member.email;
                    const displayName = member.displayName ?? personalDetail?.displayName ?? member.email;
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

        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
        const availableMembers = approvalWorkflow.availableMembers
            .map((member) => {
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
                invitedEmailsToAccountIDs[user.email] = user.accountID ?? CONST.DEFAULT_NUMBER_ID;
            }

            setWorkspaceInviteMembersDraft(route.params.policyID, invitedEmailsToAccountIDs);

            const backToRoute = isInitialCreationFlow
                ? ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID)
                : ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID, route.params.backTo);
            Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(route.params.policyID, backToRoute));
            return;
        }

        if (isInitialCreationFlow) {
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(route.params.policyID, 0));
        } else if (route.params.backTo) {
            Navigation.navigate(route.params.backTo as Route);
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

    const toggleMember = useCallback(
        (members: SelectionListApprover[]) => {
            setSelectedMembers((prevSelected) => {
                // When editing an existing workflow, recently invited members must remain in the list
                // even if the policy employee list hasn't synced yet (Test 6).
                // When creating a new workflow, any member including Owner can be deselected (Test 5).
                if (approvalWorkflow?.action !== CONST.APPROVAL_WORKFLOW.ACTION.EDIT) {
                    return members;
                }
                const policyOrInvitedMembers = prevSelected.filter((m) => m.login && (policy?.employeeList?.[m.login] ?? invitedEmailsToAccountIDsDraft?.[m.login] != null));
                const alreadyInNewSelection = new Set(members.map((m) => m.login));
                const membersToKeep = policyOrInvitedMembers.filter((pm) => !alreadyInNewSelection.has(pm.login));
                return [...members, ...membersToKeep];
            });
        },
        [approvalWorkflow?.action, policy?.employeeList, invitedEmailsToAccountIDsDraft],
    );

    // Clean up invite draft when leaving the expenses-from page to prevent
    // stale non-member data from persisting in the approval workflow.
    useEffect(() => {
        return () => {
            clearInviteDraft(route.params.policyID);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params.policyID]);

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
