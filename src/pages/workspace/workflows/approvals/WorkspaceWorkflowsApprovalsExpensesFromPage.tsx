import Badge from '@components/Badge';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import { FallbackAvatar } from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import { useOptionsList } from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type { Section } from '@components/SelectionList/types';
import Text from '@components/Text';
import type { WithNavigationTransitionEndProps } from '@components/withNavigationTransitionEnd';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import { setWorkspaceInviteMembersDraft } from '@libs/actions/Policy/Member';
import { searchInServer } from '@libs/actions/Report';
import { setApprovalWorkflowMembers, setIsInApprovalWorkflowInviteFlow } from '@libs/actions/Workflow';
import { canUseTouchScreen } from '@libs/DeviceCapabilities';
import { appendCountryCode } from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type { PlatformStackScreenProps } from '@libs/Navigation/PlatformStackNavigation/types';
import type { WorkspaceSplitNavigatorParamList } from '@libs/Navigation/types';
import { filterAndOrderOptions, formatMemberForList, getHeaderMessage, getMemberInviteOptions, getSearchValueForPhoneOrEmail, sortAlphabetically } from '@libs/OptionsListUtils';
import { addSMSDomainIfPhoneNumber, parsePhoneNumber } from '@libs/PhoneNumber';
import { getMemberAccountIDsForWorkspace, goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin } from '@libs/PolicyUtils';
import type { OptionData } from '@libs/ReportUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type { WithPolicyAndFullscreenLoadingProps } from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type { Member } from '@src/types/onyx/ApprovalWorkflow';
import type { Icon } from '@src/types/onyx/OnyxCommon';
import { isEmptyObject } from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import variables from '@styles/variables';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { SectionListData } from 'react-native';
import { useOnyx } from 'react-native-onyx';

type SelectionListMember = {
    text: string;
    alternateText: string;
    keyForList: string;
    isSelected: boolean;
    login: string;
    rightElement?: React.ReactNode;
    icons?: Icon[];
    accountID?: number;
};

type MembersSection = SectionListData<SelectionListMember, Section<SelectionListMember>>;

type WorkspaceWorkflowsApprovalsExpensesFromPageProps = WithPolicyAndFullscreenLoadingProps &
    WithNavigationTransitionEndProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EXPENSES_FROM>;

function WorkspaceWorkflowsApprovalsExpensesFromPage({policy, isLoadingReportData = true, route, didScreenTransitionEnd}: WorkspaceWorkflowsApprovalsExpensesFromPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [approvalWorkflow, approvalWorkflowResults] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const isLoadingApprovalWorkflow = isLoadingOnyxValue(approvalWorkflowResults);
    const [selectedMembers, setSelectedMembers] = useState<SelectionListMember[]>([]);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});

    // States for invite functionality
    const [personalDetails, setPersonalDetails] = useState<OptionData[]>([]);
    const [usersToInvite, setUsersToInvite] = useState<OptionData[]>([]);

    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !route.params.backTo;
    const shouldShowListEmptyContent = !isLoadingApprovalWorkflow && approvalWorkflow && approvalWorkflow.availableMembers.length === 0;
    const firstApprover = approvalWorkflow?.approvers?.[0]?.email ?? '';

    // Create excluded users list for invite functionality
    const excludedUsers = useMemo(() => {
        // For approval workflows, we only need to exclude Expensify emails
        // We should NOT exclude existing workspace members because they should be available for approval workflows
        const excludedLogins: string[] = [...CONST.EXPENSIFY_EMAILS];

        return excludedLogins.reduce(
            (acc: Record<string, boolean>, login: string) => {
                acc[login] = true;
                return acc;
            },
            {} as Record<string, boolean>,
        );
    }, []);

    // Default options for invite functionality
    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null};
        }

        const inviteOptions = getMemberInviteOptions(options.personalDetails, betas ?? [], excludedUsers, true);

        return {...inviteOptions, recentReports: [], currentUserOption: null};
    }, [areOptionsInitialized, betas, excludedUsers, options.personalDetails]);

    // Filtered invite options based on search term
    const inviteOptions = useMemo(() => filterAndOrderOptions(defaultOptions, debouncedSearchTerm, {excludeLogins: excludedUsers}), [debouncedSearchTerm, defaultOptions, excludedUsers]);

    // Update personal details and users to invite when options change
    useEffect(() => {
        if (!areOptionsInitialized) {
            return;
        }

        const newUsersToInviteDict: Record<number, OptionData> = {};
        const newPersonalDetailsDict: Record<number, OptionData> = {};

        const userToInvite = inviteOptions.userToInvite;

        // Only add the user to the invites list if it is valid
        if (typeof userToInvite?.accountID === 'number') {
            newUsersToInviteDict[userToInvite.accountID] = userToInvite;
        }

        // Add all personal details to the new dict
        inviteOptions.personalDetails.forEach((details) => {
            if (typeof details.accountID !== 'number') {
                return;
            }
            newPersonalDetailsDict[details.accountID] = details;
        });

        // Strip out dictionary keys and update arrays
        setUsersToInvite(Object.values(newUsersToInviteDict));
        setPersonalDetails(Object.values(newPersonalDetailsDict));
    }, [areOptionsInitialized, inviteOptions.personalDetails, inviteOptions.userToInvite]);

    useEffect(() => {
        if (!approvalWorkflow?.members) {
            return;
        }

        setSelectedMembers(
            approvalWorkflow.members.map((member) => {
                const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
                let accountID = Number(policyMemberEmailsToAccountIDs[member.email]);
                
                // If not found in workspace members, look up in personal details or users to invite
                if (!accountID) {
                    const personalDetail = personalDetails.find((detail) => detail.login === member.email);
                    const userToInvite = usersToInvite.find((user) => user.login === member.email);
                    accountID = personalDetail?.accountID ?? userToInvite?.accountID ?? 0;
                }
                
                const isAdmin = policy?.employeeList?.[member.email]?.role === CONST.REPORT.ROLE.ADMIN;

                return {
                    text: member.displayName,
                    alternateText: member.email,
                    keyForList: member.email,
                    isSelected: true,
                    login: member.email,
                    icons: [{source: member.avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: member.displayName, id: accountID}],
                    rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : undefined,
                    accountID,
                };
            }),
        );
    }, [approvalWorkflow?.members, policy?.employeeList, translate, personalDetails, usersToInvite]);

    const approversEmail = useMemo(() => approvalWorkflow?.approvers.map((member) => member?.email), [approvalWorkflow?.approvers]);
    const sections: MembersSection[] = useMemo(() => {
        const members: SelectionListMember[] = [...selectedMembers];

        // Add existing workspace members from approval workflow
        if (approvalWorkflow?.availableMembers) {
            const availableMembers = approvalWorkflow.availableMembers
                .map((member) => {
                    const isAdmin = policy?.employeeList?.[member.email]?.role === CONST.REPORT.ROLE.ADMIN;
                    const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
                    const accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');

                    return {
                        text: member.displayName,
                        alternateText: member.email,
                        keyForList: member.email,
                        isSelected: false,
                        login: member.email,
                        icons: [{source: member.avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: member.displayName, id: accountID}],
                        rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : undefined,
                        accountID,
                    };
                })
                .filter(
                    (member) => (!policy?.preventSelfApproval || !approversEmail?.includes(member.login)) && !selectedMembers.some((selectedOption) => selectedOption.login === member.login),
                );

            members.push(...availableMembers);
        }

        // Add personal details that are not already in available members
        const availableMemberLogins = new Set(approvalWorkflow?.availableMembers?.map((member) => member.email) ?? []);
        const personalDetailsWithoutExisting = personalDetails.filter((detail) => !availableMemberLogins.has(detail.login ?? ''));
        const personalDetailsFormatted = personalDetailsWithoutExisting
            .map((item) => formatMemberForList(item))
            .map((member) => ({
                ...member,
                rightElement: policy?.employeeList?.[member.login]?.role === CONST.REPORT.ROLE.ADMIN ? <Badge text={translate('common.admin')} /> : undefined,
            }))
            .filter((member) => !selectedMembers.some((selectedOption) => selectedOption.login === member.login));

        members.push(...personalDetailsFormatted);

        // Add users to invite
        Object.values(usersToInvite).forEach((userToInvite) => {
            const hasUnselectedUserToInvite = !selectedMembers.some((selectedMember) => selectedMember.login === userToInvite.login);
            if (hasUnselectedUserToInvite) {
                members.push(formatMemberForList(userToInvite));
            }
        });

        const filteredMembers =
            debouncedSearchTerm !== '' ? tokenizedSearch(members, getSearchValueForPhoneOrEmail(debouncedSearchTerm), (option) => [option.text ?? '', option.login ?? '']) : members;

        return [
            {
                title: undefined,
                data: sortAlphabetically(filteredMembers, 'text'),
                shouldShow: true,
            },
        ];
    }, [
        approvalWorkflow?.availableMembers,
        debouncedSearchTerm,
        policy?.preventSelfApproval,
        policy?.employeeList,
        selectedMembers,
        translate,
        approversEmail,
        personalDetails,
        usersToInvite,
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
        // Only store serializable data - no React components
        const members: Member[] = selectedMembers.map((member) => ({
            displayName: member.text,
            avatar: typeof member.icons?.at(0)?.source === 'string' ? member.icons.at(0)?.source : undefined, // Only store string avatars
            email: member.login,
        }));
        setApprovalWorkflowMembers(members);

        // Check if any selected members are new users (not in existing workspace)
        const existingMemberEmails = new Set(Object.keys(policy?.employeeList ?? {}));
        const newUsersSelected = selectedMembers.filter((member) => !existingMemberEmails.has(member.login));

        if (newUsersSelected.length > 0) {
            // If there are new users, set the flag to indicate we're in approval workflow invite flow
            setIsInApprovalWorkflowInviteFlow(true);

            // Set up the invite draft
            const invitedEmailsToAccountIDs: Record<string, number> = {};
            newUsersSelected.forEach((member) => {
                const login = member.login ?? '';
                const accountID = member.accountID ?? CONST.DEFAULT_NUMBER_ID;
                if (login.toLowerCase().trim() && accountID !== undefined) {
                    invitedEmailsToAccountIDs[login] = Number(accountID);
                }
            });

            if (Object.keys(invitedEmailsToAccountIDs).length > 0) {
                setWorkspaceInviteMembersDraft(route.params.policyID, invitedEmailsToAccountIDs);
                // Navigate to invite message page
                Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(route.params.policyID));
                return;
            }
        }

        // If no new users or failed to set up invites, continue with normal flow
        if (isInitialCreationFlow) {
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(route.params.policyID, 0));
        } else {
            goBack();
        }
    }, [route.params.policyID, selectedMembers, isInitialCreationFlow, goBack, policy?.employeeList]);

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

    const toggleMember = (member: SelectionListMember) => {
        const isAlreadySelected = selectedMembers.some((selectedOption) => selectedOption.login === member.login);
        
        if (isAlreadySelected) {
            const newSelectedMembers = selectedMembers.filter((selectedOption) => selectedOption.login !== member.login);
            setSelectedMembers(newSelectedMembers);
        } else {
            const memberToAdd = {...member, isSelected: true};
            const newSelectedMembers = [...selectedMembers, memberToAdd];
            setSelectedMembers(newSelectedMembers);
        }
    };

    // Header message with proper validation
    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (usersToInvite.length === 0 && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            usersToInvite.length === 0 &&
            excludedUsers[parsePhoneNumber(appendCountryCode(searchValue)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue)) : searchValue]
        ) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: policy?.name ?? ''});
        }
        return getHeaderMessage(personalDetails.length !== 0, usersToInvite.length > 0, searchValue);
    }, [excludedUsers, translate, debouncedSearchTerm, policy?.name, usersToInvite, personalDetails.length]);

    // Add search functionality
    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TurtleInShell}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workflowsPage.emptyContent.title')}
                subtitle={translate('workflowsPage.emptyContent.expensesFromSubtitle')}
                subtitleStyle={styles.textSupporting}
                containerStyle={styles.pb10}
                contentFitImage="contain"
            />
        ),
        [translate, styles.textSupporting, styles.pb10],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceWorkflowsApprovalsExpensesFromPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    addBottomSafeAreaPadding
                >
                    <HeaderWithBackButton
                        title={translate('workflowsExpensesFromPage.title')}
                        onBackButtonPress={goBack}
                    />

                    {approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !shouldShowListEmptyContent && (
                        <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsExpensesFromPage.header')}</Text>
                    )}
                    <SelectionList
                        canSelectMultiple
                        sections={sections}
                        ListItem={InviteMemberListItem}
                        textInputLabel={shouldShowListEmptyContent ? undefined : translate('selectionList.findMember')}
                        textInputValue={searchTerm}
                        onChangeText={setSearchTerm}
                        headerMessage={headerMessage}
                        onSelectRow={toggleMember}
                        showScrollIndicator
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        footerContent={button}
                        listEmptyContent={listEmptyContent}
                        shouldShowListEmptyContent={shouldShowListEmptyContent}
                        showLoadingPlaceholder={isLoadingApprovalWorkflow || !areOptionsInitialized || !didScreenTransitionEnd}
                        isLoadingNewOptions={!!isSearchingForReports}
                        addBottomSafeAreaPadding
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsExpensesFromPage.displayName = 'WorkspaceWorkflowsApprovalsExpensesFromPage';

export default withNavigationTransitionEnd(withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsExpensesFromPage));
