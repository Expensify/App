import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearInviteDraft, setWorkspaceInviteMembersDraft} from '@libs/actions/Policy/Member';
import {searchInServer} from '@libs/actions/Report';
import {setApprovalWorkflowMembers} from '@libs/actions/Workflow';
import {isAnyHRReadOnlyWorkflowMode} from '@libs/HRUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {canEditWorkspaceSettings, getDefaultApprover, getExcludedUsers, getMemberAccountIDsForWorkspace, isPendingDeletePolicy} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import MemberRightIcon from '@pages/workspace/MemberRightIcon';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
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
    const {showConfirmModal} = useConfirmModal();

    const personalDetailLogins = useMemo(() => Object.fromEntries(Object.entries(personalDetails ?? {}).map(([id, details]) => [id, details?.login])), [personalDetails]);

    const isLoadingApprovalWorkflow = isLoadingOnyxValue(approvalWorkflowResults);
    const [selectedMembers, setSelectedMembers] = useState<SelectionListApprover[]>([]);
    // Set true when nextStep navigates to the invite-message page so the cleanup
    // effect below knows to leave the draft intact for that page to consume.
    const isHandingOffToInviteRef = useRef(false);

    const excludedUsers = useMemo(() => {
        return getExcludedUsers(policy?.employeeList);
    }, [policy?.employeeList]);

    const {
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
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) || !canEditWorkspaceSettings(policy) || isPendingDeletePolicy(policy) || isAnyHRReadOnlyWorkflowMode(policy);
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && approvalWorkflow?.isInitialFlow;
    const hasAnyEligibleMember = Object.values(policy?.employeeList ?? {}).some((employee) => !!employee.email && employee.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const shouldShowListEmptyContent = !isLoadingApprovalWorkflow && !hasAnyEligibleMember;
    const firstApprover = approvalWorkflow?.originalApprovers?.[0]?.email ?? '';
    const isCreateAction = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE;
    const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);

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

                    // Fall back when getMemberAccountIDsForWorkspace can't resolve an accountID — for
                    // example a freshly invited user whose personal details haven't fully synced yet
                    // (the helper requires personalDetail.login). Without a real accountID,
                    // ReportActionAvatars renders the FallbackAvatar instead of the default avatar
                    // assigned to that account.
                    if (!accountID) {
                        const draftAccountID = invitedEmailsToAccountIDsDraft?.[member.email];
                        if (personalDetail?.accountID) {
                            accountID = personalDetail.accountID;
                        } else if (draftAccountID) {
                            accountID = draftAccountID;
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
    }, [approvalWorkflow?.members, icons.FallbackAvatar, invitedEmailsToAccountIDsDraft, personalDetailLogins, policy?.employeeList, policy?.owner, policyMemberEmailsToAccountIDs]);

    const workflowApprovers = approvalWorkflow?.approvers;

    // Derive available members live from policy.employeeList instead of approvalWorkflow.availableMembers,
    // which is a snapshot taken once when the EditPage first mounts and never refreshed. Without this,
    // a member invited mid-flow won't appear in the picker when the user returns to expenses-from.
    const liveAvailableMembers = useMemo<Member[]>(() => {
        const employees = policy?.employeeList ?? {};
        return Object.values(employees)
            .filter((employee) => !!employee.email && employee.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .map((employee) => {
                const personalDetail = getPersonalDetailByEmail(employee.email ?? '');
                return {
                    email: employee.email ?? '',
                    displayName: personalDetail?.displayName ?? employee.email ?? '',
                    avatar: personalDetail?.avatar,
                };
            });
    }, [policy?.employeeList]);

    const allApprovers = useMemo(() => {
        const members: SelectionListApprover[] = [...selectedMembers];
        const approversEmail = workflowApprovers?.map((member) => member?.email);

        const availableMembers = liveAvailableMembers
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
        liveAvailableMembers,
        workflowApprovers,
        policy?.employeeList,
        policy?.owner,
        policy?.preventSelfApproval,
        debouncedSearchTerm,
        areOptionsInitialized,
        availableOptions.userToInvite,
        availableOptions.recentReports,
        availableOptions.personalDetails,
        icons.FallbackAvatar,
        policyMemberEmailsToAccountIDs,
    ]);

    const goBack = useCallback(() => {
        // Going back means we're done with this expenses-from session, so any
        // hand-off to the invite-message page is no longer in flight.
        isHandingOffToInviteRef.current = false;

        // Drop any selected members who never made it into the workspace. They
        // were staged for invite but never confirmed, so leaving them in
        // approvalWorkflow.members would carry an un-invited user into the form
        // and fail backend validation with "Approvals can only be set for
        // members of the policy".
        const stagedMembers = approvalWorkflow?.members ?? [];
        const confirmedMembers = stagedMembers.filter((m) => !!policy?.employeeList?.[m.email]);
        if (confirmedMembers.length !== stagedMembers.length) {
            setApprovalWorkflowMembers(confirmedMembers);
        }

        let backTo;
        if (approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT) {
            backTo = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover);
        } else if (!isInitialCreationFlow) {
            backTo = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID);
        }
        // Don't compare params: the edit screen may carry "Add agent" seed params, so a strict param
        // match would miss it and REPLACE would mount a fresh edit screen that wipes the unsaved draft.
        Navigation.goBack(backTo, {compareParams: false});
    }, [isInitialCreationFlow, route.params.policyID, firstApprover, approvalWorkflow?.action, approvalWorkflow?.members, policy?.employeeList]);

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

            // The invite-message page reads the draft we just set, so the cleanup
            // effect must skip its clear if this page unmounts during the hand-off.
            isHandingOffToInviteRef.current = true;

            // The dynamic invite-message route is appended to the current expenses-from URL,
            // so the back navigation parent (with any nested backTo query param) is preserved
            // automatically without needing to construct a backToRoute manually.
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_INVITE_MESSAGE.path));
            return;
        }

        if (isInitialCreationFlow) {
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(route.params.policyID, 0));
        } else if (route.params.backTo) {
            // Use goBack so we return to the existing parent (e.g. the workflow edit page) in the stack
            // instead of pushing a new instance. A fresh mount of the edit page would re-derive members
            // from policy.employeeList via its useEffect and overwrite the selection we just saved.
            Navigation.goBack(route.params.backTo as Route);
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

    // Clean up invite draft when leaving the expenses-from page to prevent
    // stale non-member data from persisting in the approval workflow. Skip
    // when handing off to the invite-message page, which still needs the draft.
    useEffect(() => {
        return () => {
            if (isHandingOffToInviteRef.current) {
                return;
            }
            clearInviteDraft(route.params.policyID);
        };
    }, [route.params.policyID]);

    const toggleMember = useCallback(
        (members: SelectionListApprover[]) => {
            const applySelection = (nextMembers: SelectionListApprover[]) => {
                // Persist non-policy members to the invite draft AND to approvalWorkflow.members
                // so they survive re-renders triggered by Onyx updates (e.g. personalDetails
                // changes from search results). The effect that syncs selectedMembers from
                // approvalWorkflow.members filters non-policy members unless they're in the
                // invite draft, so both stores must stay in sync to avoid dropping the locally
                // selected new member.
                const nextDraft: Record<string, number> = {};
                const workflowMembers: Member[] = [];
                for (const member of nextMembers) {
                    if (!member.login) {
                        continue;
                    }
                    const iconSource = member.icons?.at(0)?.source;
                    workflowMembers.push({
                        displayName: member.text ?? member.login,
                        email: member.login,
                        avatar: typeof iconSource === 'string' ? iconSource : undefined,
                    });
                    if (policy?.employeeList?.[member.login]) {
                        continue;
                    }
                    const iconId = member.icons?.at(0)?.id;
                    nextDraft[member.login] = typeof iconId === 'number' ? iconId : (invitedEmailsToAccountIDsDraft?.[member.login] ?? CONST.DEFAULT_NUMBER_ID);
                }
                setWorkspaceInviteMembersDraft(route.params.policyID, nextDraft);
                setApprovalWorkflowMembers(workflowMembers);
                setSelectedMembers(nextMembers);
            };

            // Only show warning when creating a new workflow and a member is being added (not removed)
            if (isCreateAction && members.length > selectedMembers.length) {
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
                        applySelection(members);
                    });
                    return;
                }
            }

            applySelection(members);
        },
        [policy?.employeeList, invitedEmailsToAccountIDsDraft, route.params.policyID, isCreateAction, selectedMembers, membersInExistingWorkflows, showConfirmModal, translate],
    );

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
