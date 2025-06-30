import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {Section} from '@components/SelectionList/types';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useDeepCompareRef from '@hooks/useDeepCompareRef';
import useLocalize from '@hooks/useLocalize';
import useMemberInviteSearch from '@hooks/useMemberInviteSearch';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceInviteMembersDraft} from '@libs/actions/Policy/Member';
import {searchInServer} from '@libs/actions/Report';
import {setApprovalWorkflowMembers} from '@libs/actions/Workflow';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {appendCountryCode} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {formatMemberForList, getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getMemberAccountIDsForWorkspace, goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import MemberRightIcon from '@pages/workspace/MemberRightIcon';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Member} from '@src/types/onyx/ApprovalWorkflow';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

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
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EXPENSES_FROM>;

function WorkspaceWorkflowsApprovalsExpensesFromPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsExpensesFromPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [approvalWorkflow, approvalWorkflowResults] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const isLoadingApprovalWorkflow = isLoadingOnyxValue(approvalWorkflowResults);
    const [selectedMembers, setSelectedMembers] = useState<SelectionListMember[]>([]);
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});

    const {
        options: inviteOptions,
        areOptionsInitialized,
        excludedUsers,
    } = useMemberInviteSearch({
        shouldInitialize: true,
        searchTerm: debouncedSearchTerm,
        betas: betas ?? [],
        includeRecentReports: false,
    });

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !route.params.backTo;
    const shouldShowListEmptyContent = !isLoadingApprovalWorkflow && approvalWorkflow && approvalWorkflow.availableMembers.length === 0;
    const firstApprover = approvalWorkflow?.approvers?.[0]?.email ?? '';

    const personalDetailLogins = useDeepCompareRef(Object.fromEntries(Object.entries(personalDetails ?? {}).map(([id, details]) => [id, details?.login])));

    useEffect(() => {
        if (!approvalWorkflow?.members) {
            return;
        }

        setSelectedMembers((prevSelectedMembers) => {
            const workflowMembers = approvalWorkflow.members.map((member) => {
                const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
                let accountID = Number(policyMemberEmailsToAccountIDs[member.email]);

                // If no accountID found in workspace members, check invite options (for new users)
                if (!accountID) {
                    const personalDetail = inviteOptions.personalDetails.find((detail) => detail.login === member.email);
                    const userToInvite = inviteOptions.userToInvite?.login === member.email ? inviteOptions.userToInvite : null;
                    accountID = personalDetail?.accountID ?? userToInvite?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                }

                const login = personalDetailLogins?.[accountID];
                const isWorkspaceMember = !!policyMemberEmailsToAccountIDs[member.email];
                const isAdmin = policy?.employeeList?.[member.email]?.role === CONST.REPORT.ROLE.ADMIN;

                // Determine right element based on member type
                let rightElement: React.ReactNode;
                if (isWorkspaceMember) {
                    rightElement = (
                        <MemberRightIcon
                            role={policy?.employeeList?.[member.email]?.role}
                            owner={policy?.owner}
                            login={login}
                        />
                    );
                } else if (isAdmin) {
                    // For external users (invited), show admin badge if they're admin
                    rightElement = <Badge text={translate('common.admin')} />;
                } else {
                    rightElement = undefined;
                }

                return {
                    text: member.displayName,
                    alternateText: member.email,
                    keyForList: member.email,
                    isSelected: true,
                    login: member.email,
                    icons: [{source: member.avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: member.displayName, id: accountID}],
                    rightElement,
                    accountID,
                };
            });

            const workflowMemberEmails = new Set(approvalWorkflow.members.map((member) => member.email));
            const preservedSelectedMembers = prevSelectedMembers.filter((member) => !workflowMemberEmails.has(member.login));

            return [...workflowMembers, ...preservedSelectedMembers];
        });
    }, [approvalWorkflow?.members, policy?.employeeList, policy?.owner, personalDetailLogins, translate, inviteOptions.personalDetails, inviteOptions.userToInvite]);

    const approversEmail = useMemo(() => approvalWorkflow?.approvers.map((member) => member?.email), [approvalWorkflow?.approvers]);

    const sections: MembersSection[] = useMemo(() => {
        const members: SelectionListMember[] = [...selectedMembers];

        const workspaceMembers: SelectionListMember[] = [];
        if (approvalWorkflow?.availableMembers) {
            const availableMembers = approvalWorkflow.availableMembers
                .map((member) => {
                    const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
                    const accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');
                    const login = personalDetailLogins?.[accountID];

                    return {
                        text: member.displayName,
                        alternateText: member.email,
                        keyForList: member.email,
                        isSelected: false,
                        login: member.email,
                        icons: [{source: member.avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: member.displayName, id: accountID}],
                        rightElement: (
                            <MemberRightIcon
                                role={policy?.employeeList?.[member.email]?.role}
                                owner={policy?.owner}
                                login={login}
                            />
                        ),
                        accountID,
                    };
                })
                .filter(
                    (member) => (!policy?.preventSelfApproval || !approversEmail?.includes(member.login)) && !selectedMembers.some((selectedOption) => selectedOption.login === member.login),
                );

            workspaceMembers.push(...availableMembers);
        }

        const availableMemberLogins = new Set(approvalWorkflow?.availableMembers?.map((member) => member.email) ?? []);
        const selectedLogins = selectedMembers.map(({login}) => login);

        const personalDetailsWithoutExisting = inviteOptions.personalDetails.filter(
            (detail) => !availableMemberLogins.has(detail.login ?? '') && !selectedLogins.includes(detail.login ?? ''),
        );
        const personalDetailsFormatted = personalDetailsWithoutExisting
            .map((item) => formatMemberForList(item))
            .map((member) => ({
                ...member,
                // For external users, show Badge for admin role
                rightElement: policy?.employeeList?.[member.login]?.role === CONST.REPORT.ROLE.ADMIN ? <Badge text={translate('common.admin')} /> : undefined,
            }));

        const hasUnselectedUserToInvite = inviteOptions.userToInvite && !selectedLogins.includes(inviteOptions.userToInvite.login ?? '');
        const userToInviteFormatted = hasUnselectedUserToInvite && inviteOptions.userToInvite ? [formatMemberForList(inviteOptions.userToInvite)] : [];

        const externalUsers = [...personalDetailsFormatted, ...userToInviteFormatted];
        members.push(...workspaceMembers, ...externalUsers);

        let filteredMembers: SelectionListMember[];
        if (debouncedSearchTerm !== '') {
            filteredMembers = tokenizedSearch(members, getSearchValueForPhoneOrEmail(debouncedSearchTerm), (option) => [option.text ?? '', option.login ?? '']);
        } else {
            const sortedWorkspaceMembers = sortAlphabetically(workspaceMembers, 'text');
            const sortedExternalUsers = sortAlphabetically(externalUsers, 'text');
            filteredMembers = [...selectedMembers, ...sortedWorkspaceMembers, ...sortedExternalUsers];
        }

        return [
            {
                title: undefined,
                data: filteredMembers,
                shouldShow: true,
            },
        ];
    }, [
        approvalWorkflow?.availableMembers,
        debouncedSearchTerm,
        policy?.preventSelfApproval,
        policy?.employeeList,
        policy?.owner,
        selectedMembers,
        translate,
        approversEmail,
        personalDetailLogins,
        inviteOptions.personalDetails,
        inviteOptions.userToInvite,
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
        const members: Member[] = selectedMembers.map((member) => ({
            displayName: member.text,
            avatar: typeof member.icons?.at(0)?.source === 'string' ? member.icons.at(0)?.source : undefined,
            email: member.login,
        }));
        setApprovalWorkflowMembers(members);

        const existingMemberEmails = new Set(Object.keys(policy?.employeeList ?? {}));
        const newUsersSelected = selectedMembers.filter((member) => !existingMemberEmails.has(member.login));

        if (newUsersSelected.length > 0) {
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
                const backTo = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID);
                Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(route.params.policyID, backTo));
                return;
            }
        }

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

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (!inviteOptions.userToInvite && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !inviteOptions.userToInvite &&
            excludedUsers[parsePhoneNumber(appendCountryCode(searchValue)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue)) : searchValue]
        ) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: policy?.name ?? ''});
        }
        return getHeaderMessage(inviteOptions.personalDetails.length !== 0, !!inviteOptions.userToInvite, searchValue);
    }, [excludedUsers, translate, debouncedSearchTerm, policy?.name, inviteOptions.userToInvite, inviteOptions.personalDetails.length]);

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
                        showLoadingPlaceholder={isLoadingApprovalWorkflow || !areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                        addBottomSafeAreaPadding
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsExpensesFromPage.displayName = 'WorkspaceWorkflowsApprovalsExpensesFromPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsExpensesFromPage);
