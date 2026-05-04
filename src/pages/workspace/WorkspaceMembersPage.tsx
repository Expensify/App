import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import DecisionModal from '@components/DecisionModal';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MessagesRow from '@components/MessagesRow';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import type {SingleSelectItem} from '@components/Search/FilterDropdowns/SingleSelectPopup';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useDebouncedValue from '@hooks/useDebouncedValue';
import useFilteredSelection from '@hooks/useFilteredSelection';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useSearchResults from '@hooks/useSearchResults';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    clearAddMemberError,
    clearDeleteMemberError,
    clearInviteDraft,
    clearUpdateMemberRoleError,
    clearWorkspaceOwnerChangeFlow,
    downloadMembersCSV,
    openWorkspaceMembersPage,
    removeMembers,
    updateWorkspaceMembersRole,
} from '@libs/actions/Policy/Member';
import {removeApprovalWorkflow as removeApprovalWorkflowAction, updateApprovalWorkflow} from '@libs/actions/Workflow';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isPersonalDetailsReady, sortAlphabetically} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault, getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {
    getConnectionExporters,
    getMemberAccountIDsForWorkspace,
    isControlPolicy,
    isDeletedPolicyEmployee,
    isExpensifyTeam,
    isPaidGroupPolicy,
    isPolicyAdmin as isPolicyAdminUtils,
    isPolicyApprover,
} from '@libs/PolicyUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {convertPolicyEmployeesToApprovalWorkflows, updateWorkflowDataOnApproverRemoval} from '@libs/WorkflowUtils';
import variables from '@styles/variables';
import {close} from '@userActions/Modal';
import {dismissAddedWithPrimaryLoginMessages} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, PolicyEmployee, PolicyEmployeeList} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import MemberRightIcon from './MemberRightIcon';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import WorkspacePageWithSections from './WorkspacePageWithSections';

type WorkspaceMembersPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS>;

/**
 * Inverts an object, equivalent of _.invert
 */
function invertObject(object: Record<string, string>): Record<string, string> {
    const invertedEntries = Object.entries(object).map(([key, value]) => [value, key] as const);
    return Object.fromEntries(invertedEntries);
}

type MemberOption = Omit<ListItem, 'accountID' | 'login'> & {
    accountID: number;
    login: string;
    customField1?: string;
    customField2?: string;
};

const WORKSPACE_MEMBER_FILTER_VALUES = {
    ALL: 'all',
    ADMINS: 'admins',
    APPROVERS: 'approvers',
    AUDITORS: 'auditors',
} as const;

type WorkspaceMemberFilterValue = ValueOf<typeof WORKSPACE_MEMBER_FILTER_VALUES>;
type WorkspaceMemberFilterOption = SingleSelectItem<WorkspaceMemberFilterValue>;

function WorkspaceMembersPage({personalDetails, route, policy}: WorkspaceMembersPageProps) {
    useWorkspaceDocumentTitle(policy?.name, 'common.members');
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'FallbackAvatar', 'MakeAdmin', 'Plus', 'RemoveMembers', 'Table', 'User', 'UserEye']);
    const policyMemberEmailsToAccountIDs = useMemo(() => getMemberAccountIDsForWorkspace(policy?.employeeList, true), [policy?.employeeList]);
    const employeeListDetails = useMemo(() => policy?.employeeList ?? ({} as PolicyEmployeeList), [policy?.employeeList]);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const accountIDs = useMemo(() => Object.values(policyMemberEmailsToAccountIDs ?? {}).map((accountID) => Number(accountID)), [policyMemberEmailsToAccountIDs]);
    const prevAccountIDs = usePrevious(accountIDs);
    const textInputRef = useRef<BaseTextInputRef>(null);
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<WorkspaceMemberFilterOption | null>(null);
    const isOfflineAndNoMemberDataAvailable = isEmptyObject(policy?.employeeList) && isOffline;
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const filterEmployees = useCallback(
        (employee: PolicyEmployee | undefined) => {
            if (!employee?.email) {
                return false;
            }
            if (employee.email === policy?.owner || employee.email === currentUserPersonalDetails.login) {
                return false;
            }
            const isPendingDelete = employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            return !isPendingDelete;
        },
        [currentUserPersonalDetails.login, policy?.owner],
    );

    const [selectedEmployees, setSelectedEmployees] = useFilteredSelection(employeeListDetails, filterEmployees);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const isPolicyAdmin = isPolicyAdminUtils(policy);
    const isLoading = useMemo(
        () => !isOfflineAndNoMemberDataAvailable && (!isPersonalDetailsReady(personalDetails) || isEmptyObject(policy?.employeeList)),
        [isOfflineAndNoMemberDataAvailable, personalDetails, policy?.employeeList],
    );

    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const currentUserAccountID = Number(session?.accountID);
    const selectionListRef = useRef<SelectionListHandle<MemberOption>>(null);
    const isFocused = useIsFocused();
    const policyID = route.params.policyID;
    const illustrations = useMemoizedLazyIllustrations(['ReceiptWrangler', 'EmptyShelves']);

    const ownerDetails = personalDetails?.[policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID] ?? ({} as PersonalDetails);
    const {approvalWorkflows} = useMemo(
        () =>
            convertPolicyEmployeesToApprovalWorkflows({
                policy,
                personalDetails: personalDetails ?? {},
                localeCompare,
            }),
        [personalDetails, policy, localeCompare],
    );

    const canSelectMultiple = isPolicyAdmin && (shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true);

    const confirmModalPrompt = useMemo(() => {
        const approverEmail = selectedEmployees.find((selectedEmployee) => isPolicyApprover(policy, selectedEmployee));

        if (approverEmail) {
            const approverAccountID = policyMemberEmailsToAccountIDs[approverEmail];
            return translate(
                'workspace.people.removeMembersWarningPrompt',
                getDisplayNameForParticipant({accountID: approverAccountID, formatPhoneNumber}),
                getDisplayNameForParticipant({accountID: policy?.ownerAccountID, formatPhoneNumber}),
            );
        }

        const exporters = getConnectionExporters(policy);
        const userExporter = selectedEmployees.find((selectedEmployee) => exporters.includes(selectedEmployee));

        if (userExporter) {
            const exporterAccountID = policyMemberEmailsToAccountIDs[userExporter];
            return translate('workspace.people.removeMemberPromptExporter', {
                memberName: getDisplayNameForParticipant({accountID: exporterAccountID, formatPhoneNumber}),
                workspaceOwner: getDisplayNameForParticipant({accountID: policy?.ownerAccountID, formatPhoneNumber}),
            });
        }

        const firstSelectedEmployeeAccountID = policyMemberEmailsToAccountIDs[selectedEmployees[0]];
        return translate('workspace.people.removeMembersPrompt', {
            count: selectedEmployees.length,
            memberName: formatPhoneNumber(getPersonalDetailsByIDs({accountIDs: [firstSelectedEmployeeAccountID], currentUserAccountID}).at(0)?.displayName ?? ''),
        });
    }, [selectedEmployees, policyMemberEmailsToAccountIDs, translate, policy, formatPhoneNumber, currentUserAccountID]);
    /**
     * Get members for the current workspace
     */
    const getWorkspaceMembers = useCallback(() => {
        const clientMemberEmails = Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList));
        openWorkspaceMembersPage(route.params.policyID, clientMemberEmails);
    }, [route.params.policyID, policy?.employeeList]);

    useEffect(() => {
        getWorkspaceMembers();
    }, [getWorkspaceMembers]);

    useEffect(() => {
        const isReconnecting = prevIsOffline && !isOffline;
        if (!isReconnecting) {
            return;
        }
        getWorkspaceMembers();
    }, [isOffline, prevIsOffline, getWorkspaceMembers]);

    /**
     * Open the modal to invite a user
     */
    const inviteUser = useCallback(() => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        clearInviteDraft(route.params.policyID);
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_INVITE.path));
    }, [route.params.policyID, isAccountLocked, showLockedAccountModal]);

    /**
     * Remove selected users from the workspace
     * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
     */
    const removeUsers = () => {
        // Check if any of the members are approvers
        const hasApprovers = selectedEmployees.some((email) => isPolicyApprover(policy, email));

        if (hasApprovers) {
            const ownerEmail = ownerDetails.login;
            let currentWorkflows = approvalWorkflows;
            for (const login of selectedEmployees) {
                if (!isPolicyApprover(policy, login)) {
                    continue;
                }

                const accountID = policyMemberEmailsToAccountIDs[login];
                const removedApprover = personalDetails?.[accountID];
                if (!removedApprover?.login || !ownerEmail) {
                    continue;
                }
                const updatedWorkflows = updateWorkflowDataOnApproverRemoval({
                    approvalWorkflows: currentWorkflows,
                    removedApprover,
                    ownerDetails,
                });
                currentWorkflows = updatedWorkflows.filter((workflow) => !workflow.removeApprovalWorkflow);
                for (const workflow of updatedWorkflows) {
                    if (workflow?.removeApprovalWorkflow) {
                        const {removeApprovalWorkflow, ...updatedWorkflow} = workflow;
                        removeApprovalWorkflowAction(updatedWorkflow, policy);
                    } else {
                        updateApprovalWorkflow(workflow, [], [], policy);
                    }
                }
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setSelectedEmployees([]);
            removeMembers(policy, selectedEmployees, policyMemberEmailsToAccountIDs);
        });
    };

    /**
     * Show the modal to confirm removal of the selected members
     */
    const askForConfirmationToRemove = useCallback(async () => {
        const result = await showConfirmModal({
            danger: true,
            title: translate('workspace.people.removeMembersTitle', {count: selectedEmployees.length}),
            prompt: confirmModalPrompt,
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
            onModalHide: () => {
                if (!textInputRef.current) {
                    return;
                }
                textInputRef.current.focus();
            },
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        removeUsers();
    }, [confirmModalPrompt, removeUsers, selectedEmployees.length, showConfirmModal, translate]);

    /**
     * Add or remove all users passed from the selectedEmployees list
     */
    const toggleAllUsers = (memberList: MemberOption[]) => {
        const enabledAccounts = memberList.filter((member) => !member.isDisabled && !member.isDisabledCheckbox);
        const someSelected = selectedEmployees.length > 0;

        if (someSelected) {
            setSelectedEmployees([]);
        } else {
            const everyLogin = enabledAccounts.map((member) => member.login);
            setSelectedEmployees(everyLogin);
        }
    };

    /**
     * Add user from the selectedEmployees list
     */
    const addUser = useCallback(
        (login: string) => {
            setSelectedEmployees((prevSelected) => [...prevSelected, login]);
        },
        [setSelectedEmployees],
    );

    /**
     * Remove user from the selectedEmployees list
     */
    const removeUser = useCallback(
        (login: string) => {
            setSelectedEmployees((prevSelected) => prevSelected.filter((email) => email !== login));
        },
        [setSelectedEmployees],
    );

    /**
     * Toggle user from the selectedEmployees list
     */
    const toggleUser = useCallback(
        (login: string, pendingAction?: PendingAction) => {
            if (login === policy?.owner && login !== currentUserPersonalDetails.login) {
                return;
            }

            if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }

            // Add or remove the user if the checkbox is enabled
            if (selectedEmployees.includes(login)) {
                removeUser(login);
            } else {
                addUser(login);
            }
        },
        [policy?.owner, currentUserPersonalDetails.login, selectedEmployees, removeUser, addUser],
    );

    /** Opens the member details page */
    const openMemberDetails = useCallback(
        (item: MemberOption) => {
            if (!isPolicyAdmin || !isPaidGroupPolicy(policy)) {
                Navigation.navigate(ROUTES.PROFILE.getRoute(item.accountID, Navigation.getActiveRoute()));
                return;
            }
            clearWorkspaceOwnerChangeFlow(policyID);
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(route.params.policyID, item.accountID));
            });
        },
        [isPolicyAdmin, policy, policyID, route.params.policyID],
    );

    /**
     * Dismisses the errors on one item
     */
    const dismissError = useCallback(
        (item: MemberOption) => {
            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                clearDeleteMemberError(route.params.policyID, item.login);
                return;
            }

            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE) {
                clearUpdateMemberRoleError(route.params.policyID, item.login);
                return;
            }

            clearAddMemberError(route.params.policyID, item.login, item.accountID);
        },
        [route.params.policyID],
    );

    const policyOwner = policy?.owner;
    const currentUserLogin = currentUserPersonalDetails.login;
    const invitedPrimaryToSecondaryLogins = useMemo(() => invertObject(policy?.primaryLoginsInvited ?? {}), [policy?.primaryLoginsInvited]);
    const isControlPolicyWithWideLayout = !shouldUseNarrowLayout && isControlPolicy(policy);

    const filteredMembers = useMemo(() => {
        const result: Array<{email: string; policyEmployee: PolicyEmployee; accountID: number; details: PersonalDetails}> = [];

        for (const [email, policyEmployee] of Object.entries(policy?.employeeList ?? {})) {
            const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                continue;
            }

            const details = personalDetails?.[accountID];

            if (!details) {
                Log.hmmm(`[WorkspaceMembersPage] no personal details found for policy member with accountID: ${accountID}`);
                continue;
            }

            // If this policy is owned by Expensify then show all support (expensify.com or team.expensify.com) emails
            // We don't want to show guides as policy members unless the user is a guide. Some customers get confused when they
            // see random people added to their policy, but guides having access to the policies help set them up.
            if (isExpensifyTeam(details?.login ?? details?.displayName)) {
                if (policyOwner && currentUserLogin && !isExpensifyTeam(policyOwner) && !isExpensifyTeam(currentUserLogin)) {
                    continue;
                }
            }

            result.push({email, policyEmployee, accountID, details});
        }
        return result;
    }, [policy?.employeeList, policyMemberEmailsToAccountIDs, isOffline, personalDetails, policyOwner, currentUserLogin]);

    const hasAnyCustomField1 = useMemo(() => filteredMembers.some(({policyEmployee}) => !!policyEmployee.employeeUserID), [filteredMembers]);
    const hasAnyCustomField2 = useMemo(() => filteredMembers.some(({policyEmployee}) => !!policyEmployee.employeePayrollID), [filteredMembers]);
    const shouldShowCustomField1Column = isControlPolicyWithWideLayout && hasAnyCustomField1;
    const shouldShowCustomField2Column = isControlPolicyWithWideLayout && hasAnyCustomField2;
    const shouldShowAnyCustomFieldColumn = shouldShowCustomField1Column || shouldShowCustomField2Column;

    const data: MemberOption[] = useMemo(() => {
        return filteredMembers.map(({policyEmployee, accountID, details}) => {
            const isPendingDeleteOrError = isPolicyAdmin && (policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(policyEmployee.errors));

            let roleBadgeText = '';
            if (policy?.owner === details.login) {
                roleBadgeText = translate('common.owner');
            } else if (policyEmployee.role === CONST.POLICY.ROLE.ADMIN) {
                roleBadgeText = translate('common.admin');
            } else if (policyEmployee.role === CONST.POLICY.ROLE.AUDITOR) {
                roleBadgeText = translate('common.auditor');
            }
            const memberName = formatPhoneNumber(getDisplayNameOrDefault(details));
            const memberEmail = formatPhoneNumber(details?.login ?? '');
            const accessibilityLabel = [memberName, memberEmail, roleBadgeText].filter(Boolean).join(', ');

            return {
                keyForList: details.login ?? '',
                accountID,
                login: details.login ?? '',
                customField1: policyEmployee.employeeUserID,
                customField2: policyEmployee.employeePayrollID,
                isDisabledCheckbox: !(isPolicyAdmin && accountID !== policy?.ownerAccountID && accountID !== session?.accountID),
                isDisabled: isPendingDeleteOrError,
                isInteractive: !details.isOptimisticPersonalDetail,
                cursorStyle: details.isOptimisticPersonalDetail ? styles.cursorDefault : {},
                text: memberName,
                alternateText: memberEmail,
                accessibilityLabel,
                rightElement: shouldShowAnyCustomFieldColumn ? (
                    <>
                        {shouldShowCustomField1Column && (
                            <View style={[styles.flex1, styles.pr3]}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.alignSelfStart]}
                                >
                                    {policyEmployee.employeeUserID}
                                </Text>
                            </View>
                        )}
                        {shouldShowCustomField2Column && (
                            <View style={[styles.flex1, styles.pr3]}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.alignSelfStart]}
                                >
                                    {policyEmployee.employeePayrollID}
                                </Text>
                            </View>
                        )}
                        <View style={[StyleUtils.getMinimumWidth(variables.w72)]}>
                            <MemberRightIcon
                                role={policyEmployee.role}
                                owner={policy?.owner}
                                login={details.login}
                                badgeStyles={[styles.alignSelfEnd]}
                            />
                        </View>
                    </>
                ) : (
                    <MemberRightIcon
                        role={policyEmployee.role}
                        owner={policy?.owner}
                        login={details.login}
                    />
                ),
                icons: [
                    {
                        source: details.avatar ?? icons.FallbackAvatar,
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: getLatestErrorMessageField(policyEmployee),
                pendingAction: policyEmployee.pendingAction,
                // Note which secondary login was used to invite this primary login
                invitedSecondaryLogin: details?.login ? (invitedPrimaryToSecondaryLogins[details.login] ?? '') : '',
            };
        });
    }, [
        filteredMembers,
        policy?.ownerAccountID,
        policy?.owner,
        isPolicyAdmin,
        session?.accountID,
        styles.cursorDefault,
        styles.flex1,
        styles.pr3,
        translate,
        styles.alignSelfStart,
        styles.alignSelfEnd,
        shouldShowAnyCustomFieldColumn,
        shouldShowCustomField1Column,
        shouldShowCustomField2Column,
        StyleUtils,
        formatPhoneNumber,
        invitedPrimaryToSecondaryLogins,
        icons.FallbackAvatar,
    ]);

    const filterMember = useCallback((memberOption: MemberOption, searchQuery: string) => {
        const results = tokenizedSearch([memberOption], searchQuery, (option) => [option.text ?? '', option.alternateText ?? '']);
        return results.length > 0;
    }, []);
    const sortMembers = useCallback((memberOptions: MemberOption[]) => sortAlphabetically(memberOptions, 'text', localeCompare), [localeCompare]);
    const roleFilterOptions: WorkspaceMemberFilterOption[] = [
        {text: translate('workspace.people.allMembers'), value: WORKSPACE_MEMBER_FILTER_VALUES.ALL},
        {text: translate('workspace.people.admins'), value: WORKSPACE_MEMBER_FILTER_VALUES.ADMINS},
        {text: translate('workspace.people.approvers'), value: WORKSPACE_MEMBER_FILTER_VALUES.APPROVERS},
    ];

    if (isControlPolicy(policy)) {
        roleFilterOptions.push({
            text: translate('workspace.people.auditors'),
            value: WORKSPACE_MEMBER_FILTER_VALUES.AUDITORS,
        });
    }

    const handleRoleFilterChange = (item: WorkspaceMemberFilterOption | null) => {
        setSelectedEmployees([]);

        if (!item || item.value === WORKSPACE_MEMBER_FILTER_VALUES.ALL) {
            setSelectedRoleFilter(null);
            return;
        }

        setSelectedRoleFilter(item);
    };

    const rolePreFilter = (member: MemberOption) => {
        if (!selectedRoleFilter) {
            return true;
        }

        const employee = policy?.employeeList?.[member.login];

        switch (selectedRoleFilter.value) {
            case WORKSPACE_MEMBER_FILTER_VALUES.ADMINS:
                return member.login === policy?.owner || employee?.role === CONST.POLICY.ROLE.ADMIN;
            case WORKSPACE_MEMBER_FILTER_VALUES.APPROVERS:
                return isPolicyApprover(policy, member.login);
            case WORKSPACE_MEMBER_FILTER_VALUES.AUDITORS:
                return employee?.role === CONST.POLICY.ROLE.AUDITOR;
            default:
                return true;
        }
    };
    const [inputValue, setInputValue, filteredData] = useSearchResults(data, filterMember, sortMembers, rolePreFilter);

    const handleSearchChange = (value: string) => {
        setSelectedEmployees([]);
        setInputValue(value);
    };

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        if (isEmptyObject(invitedEmailsToAccountIDsDraft) || accountIDs === prevAccountIDs) {
            return;
        }
        const invitedEmails = Object.keys(invitedEmailsToAccountIDsDraft);
        selectionListRef.current?.scrollAndHighlightItem?.(invitedEmails);
        clearInviteDraft(route.params.policyID);
    }, [invitedEmailsToAccountIDsDraft, isFocused, accountIDs, prevAccountIDs, route.params.policyID]);

    const headerMessage = useMemo(() => {
        if (isOfflineAndNoMemberDataAvailable) {
            return translate('workspace.common.mustBeOnlineToViewMembers');
        }

        return !isLoading && isEmptyObject(policy?.employeeList) ? translate('workspace.common.memberNotFound') : '';
    }, [isLoading, policy?.employeeList, translate, isOfflineAndNoMemberDataAvailable]);

    const memberCount = data.filter((member) => member.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const isPendingAddOrDelete =
        isOffline && data?.some((member) => member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    const shouldShowSearchBar = data.length > CONST.SEARCH_ITEM_LIMIT;
    const debouncedFilteredData = useDebouncedValue(filteredData, CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
    const isFilteringMembers = filteredData?.length < debouncedFilteredData?.length;
    const displayedFilteredData = isFilteringMembers ? debouncedFilteredData : filteredData;
    const hasNoDisplayedMembers = displayedFilteredData.length === 0;
    const shouldShowRoleFilter = data.length > 0;
    const shouldShowRoleFilterEmptyState = shouldShowRoleFilter && !!selectedRoleFilter && inputValue.length === 0 && hasNoDisplayedMembers;
    const shouldShowEmptySearchMessage = !shouldShowRoleFilterEmptyState && hasNoDisplayedMembers;
    const noResultsMessage = translate('common.noResultsFoundMatching', inputValue);

    // SearchBar's built-in empty state also controls screen-reader announcements.
    // We render a custom no-results message in this page, so we announce it manually
    // to preserve the same accessibility behavior without using SearchBar's default layout.
    useDebouncedAccessibilityAnnouncement(noResultsMessage, shouldShowEmptySearchMessage, inputValue);

    const rolePopoverComponent = ({closeOverlay}: PopoverComponentProps) => (
        <SingleSelectPopup
            label={translate('common.role')}
            items={roleFilterOptions}
            value={selectedRoleFilter ?? roleFilterOptions.at(0) ?? null}
            closeOverlay={closeOverlay}
            onChange={handleRoleFilterChange}
            defaultValue={roleFilterOptions.at(0)?.value}
            selectionListStyle={{listItemWrapperStyle: styles.mnh40}}
        />
    );

    const roleFilterDropdown = shouldShowRoleFilter ? (
        <DropdownButton
            label={selectedRoleFilter?.text ?? translate('workspace.people.allMembers')}
            value={null}
            PopoverComponent={rolePopoverComponent}
            innerStyles={[styles.gap2, shouldUseNarrowLayout && styles.mw100]}
            wrapperStyle={shouldUseNarrowLayout ? styles.flexGrow0 : undefined}
            labelStyle={styles.fontSizeLabel}
            caretWrapperStyle={styles.gap2}
            medium
        />
    ) : null;

    const getHeaderContent = () => (
        <View style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}>
            <Text style={[styles.pl5, styles.mb5, styles.mt3, styles.textSupporting, isPendingAddOrDelete && styles.offlineFeedbackPending]}>
                {translate('workspace.people.workspaceMembersCount', memberCount)}
            </Text>
            {!isEmptyObject(invitedPrimaryToSecondaryLogins) && (
                <MessagesRow
                    type="success"
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    messages={{0: translate('workspace.people.addedWithPrimary')}}
                    containerStyles={[styles.pb5, styles.ph5]}
                    onDismiss={() => dismissAddedWithPrimaryLoginMessages(policyID)}
                />
            )}
        </View>
    );

    useEffect(() => {
        if (isMobileSelectionModeEnabled) {
            return;
        }

        setSelectedEmployees([]);
    }, [setSelectedEmployees, isMobileSelectionModeEnabled]);

    useSearchBackPress({
        onClearSelection: () => setSelectedEmployees([]),
        onNavigationCallBack: () => Navigation.goBack(),
    });

    const getCustomListHeader = () => {
        if (hasNoDisplayedMembers) {
            return null;
        }

        // Show custom field columns only on wide screens for control policies when members have data
        if (shouldShowAnyCustomFieldColumn) {
            const header = (
                <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, canSelectMultiple && styles.pl3]}>
                    <View style={[styles.flex1, StyleUtils.getPaddingRight(variables.w52 + variables.w12)]}>
                        <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('common.member')}</Text>
                    </View>
                    {shouldShowCustomField1Column && (
                        <View style={[styles.flex1, styles.pr3]}>
                            <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('workspace.common.customField1')}</Text>
                        </View>
                    )}
                    {shouldShowCustomField2Column && (
                        <View style={[styles.flex1, styles.pr3]}>
                            <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('workspace.common.customField2')}</Text>
                        </View>
                    )}
                    <View style={[StyleUtils.getMinimumWidth(variables.w72), styles.mr6, styles.pl2]}>
                        <Text style={[styles.textMicroSupporting, styles.textAlignCenter]}>{translate('common.role')}</Text>
                    </View>
                </View>
            );

            if (canSelectMultiple) {
                return header;
            }
            return <View style={[styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
        }

        // Fall back to 2-column layout for narrow screens or non-control policies
        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('common.member')}
                rightHeaderText={translate('common.role')}
                shouldShowRightCaret
            />
        );
    };

    const changeUserRole = (role: ValueOf<typeof CONST.POLICY.ROLE>) => {
        const loginsToUpdate = selectedEmployees.filter((login) => {
            return policy?.employeeList?.[login]?.role !== role;
        });

        const accountIDsToUpdate = loginsToUpdate.map((login) => policyMemberEmailsToAccountIDs[login]).filter((id) => id !== undefined);

        setSelectedEmployees([]);
        updateWorkspaceMembersRole(policy, loginsToUpdate, accountIDsToUpdate, role);
    };

    const getBulkActionsButtonOptions = () => {
        const options: Array<DropdownOption<WorkspaceMemberBulkActionType>> = [
            {
                text: translate('workspace.people.removeMembersTitle', {count: selectedEmployees.length}),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: icons.RemoveMembers,
                onSelected: askForConfirmationToRemove,
            },
        ];

        if (!isPaidGroupPolicy(policy)) {
            return options;
        }

        const selectedEmployeesRoles = selectedEmployees.map((email) => {
            return policy?.employeeList?.[email]?.role;
        });

        const memberOption = {
            text: translate('workspace.people.makeMember', {count: selectedEmployees.length}),
            value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_MEMBER,
            icon: icons.User,
            onSelected: () => changeUserRole(CONST.POLICY.ROLE.USER),
        };
        const adminOption = {
            text: translate('workspace.people.makeAdmin', {count: selectedEmployees.length}),
            value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_ADMIN,
            icon: icons.MakeAdmin,
            onSelected: () => changeUserRole(CONST.POLICY.ROLE.ADMIN),
        };

        const auditorOption = {
            text: translate('workspace.people.makeAuditor', {count: selectedEmployees.length}),
            value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_AUDITOR,
            icon: icons.UserEye,
            onSelected: () => changeUserRole(CONST.POLICY.ROLE.AUDITOR),
        };

        const hasAtLeastOneNonAuditorRole = selectedEmployeesRoles.some((role) => role !== CONST.POLICY.ROLE.AUDITOR);
        const hasAtLeastOneNonMemberRole = selectedEmployeesRoles.some((role) => role !== CONST.POLICY.ROLE.USER);
        const hasAtLeastOneNonAdminRole = selectedEmployeesRoles.some((role) => role !== CONST.POLICY.ROLE.ADMIN);
        const isReimbursementEnabled = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
        const hasAtLeastOnePayer = isReimbursementEnabled && policy?.achAccount?.reimburser ? selectedEmployees.includes(policy?.achAccount?.reimburser) : false;

        if (hasAtLeastOneNonMemberRole && !hasAtLeastOnePayer) {
            options.push(memberOption);
        }

        if (hasAtLeastOneNonAdminRole) {
            options.push(adminOption);
        }

        if (hasAtLeastOneNonAuditorRole && isControlPolicy(policy) && !hasAtLeastOnePayer) {
            options.push(auditorOption);
        }

        return options;
    };

    const showRequiresInternetModal = useCallback(() => {
        showConfirmModal({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.thisFeatureRequiresInternet'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            shouldHandleNavigationBack: true,
        });
    }, [showConfirmModal, translate]);

    const secondaryActions = useMemo(() => {
        if (!isPolicyAdmin) {
            return [];
        }

        const menuItems = [
            {
                icon: icons.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: () => {
                    if (isAccountLocked) {
                        showLockedAccountModal();
                        return;
                    }
                    if (isOffline) {
                        close(showRequiresInternetModal);
                        return;
                    }
                    Navigation.navigate(ROUTES.WORKSPACE_MEMBERS_IMPORT.getRoute(policyID));
                },
                value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
            },
            {
                icon: icons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: () => {
                    if (isOffline) {
                        close(showRequiresInternetModal);
                        return;
                    }

                    close(() => {
                        downloadMembersCSV(
                            policyID,
                            () => {
                                setIsDownloadFailureModalVisible(true);
                            },
                            translate,
                        );
                    });
                },
                value: CONST.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            },
        ];

        return menuItems;
    }, [isPolicyAdmin, icons.Table, icons.Download, translate, isAccountLocked, isOffline, policyID, showLockedAccountModal, showRequiresInternetModal]);

    const getHeaderButtons = () => {
        if (!isPolicyAdmin) {
            return null;
        }
        return (shouldUseNarrowLayout ? canSelectMultiple : selectedEmployees.length > 0) ? (
            <ButtonWithDropdownMenu<WorkspaceMemberBulkActionType>
                shouldAlwaysShowDropdownMenu
                customText={translate('workspace.common.selected', {count: selectedEmployees.length})}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                onPress={() => null}
                options={getBulkActionsButtonOptions()}
                isSplitButton={false}
                style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                isDisabled={!selectedEmployees.length}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.BULK_ACTIONS_DROPDOWN}
                testID="WorkspaceMembersPage-header-dropdown-menu-button"
            />
        ) : (
            <View style={[styles.flexRow, styles.gap2]}>
                <Button
                    success
                    onPress={inviteUser}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.INVITE_BUTTON}
                    text={translate('workspace.invite.member')}
                    icon={icons.Plus}
                    innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                />
                <ButtonWithDropdownMenu
                    success={false}
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.MORE_DROPDOWN}
                    options={secondaryActions}
                    isSplitButton={false}
                    wrapperStyle={styles.flexGrow0}
                />
            </View>
        );
    };

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const headerContent = (
        <>
            {shouldUseNarrowLayout && data.length > 0 && <View style={[styles.pr5]}>{getHeaderContent()}</View>}
            {!shouldUseNarrowLayout && (
                <>
                    {!!headerMessage && (
                        <View style={[styles.ph5, styles.pb5]}>
                            <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{headerMessage}</Text>
                        </View>
                    )}
                    {getHeaderContent()}
                </>
            )}
            {(shouldShowRoleFilter || shouldShowSearchBar) && (
                <View style={styles.flexColumn}>
                    <View style={[styles.mh5, styles.gap3, styles.mb5, styles.flexRow, styles.alignItemsCenter]}>
                        {!!roleFilterDropdown && roleFilterDropdown}
                        {shouldShowSearchBar && (
                            <SearchBar
                                inputValue={inputValue}
                                onChangeText={handleSearchChange}
                                label={translate('workspace.people.findMember')}
                                shouldShowEmptyState={false}
                                style={[styles.flex1, styles.mh0, styles.mb0]}
                            />
                        )}
                    </View>
                    {shouldShowEmptySearchMessage && (
                        <View style={[styles.ph5, styles.pb5]}>
                            <Text style={[styles.textNormal, styles.colorMuted]}>{noResultsMessage}</Text>
                        </View>
                    )}
                </View>
            )}
        </>
    );

    const textInputOptions = useMemo(
        () => ({
            headerMessage: shouldUseNarrowLayout ? headerMessage : undefined,
            ref: textInputRef,
        }),
        [headerMessage, shouldUseNarrowLayout],
    );

    return (
        <WorkspacePageWithSections
            headerText={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.members')}
            route={route}
            icon={!selectionModeHeader ? illustrations.ReceiptWrangler : undefined}
            headerContent={!shouldUseNarrowLayout && getHeaderButtons()}
            testID="WorkspaceMembersPage"
            shouldShowLoading={false}
            shouldUseHeadlineHeader={!selectionModeHeader}
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNonAdmin
            onBackButtonPress={() => {
                if (isMobileSelectionModeEnabled) {
                    setSelectedEmployees([]);
                    turnOffMobileSelectionMode();
                    return;
                }
                Navigation.goBack();
            }}
        >
            {() => (
                <>
                    {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                    <DecisionModal
                        title={translate('common.downloadFailedTitle')}
                        prompt={translate('common.downloadFailedDescription')}
                        isSmallScreenWidth={isSmallScreenWidth}
                        onSecondOptionSubmit={() => setIsDownloadFailureModalVisible(false)}
                        secondOptionText={translate('common.buttonConfirm')}
                        isVisible={isDownloadFailureModalVisible}
                        onClose={() => setIsDownloadFailureModalVisible(false)}
                    />
                    <SelectionListWithModal
                        data={filteredData}
                        ref={selectionListRef}
                        ListItem={TableListItem}
                        onSelectRow={openMemberDetails}
                        selectedItems={selectedEmployees}
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress={isPolicyAdmin}
                        onSelectAll={displayedFilteredData.length > 0 ? () => toggleAllUsers(displayedFilteredData) : undefined}
                        style={{
                            listItemTitleContainerStyles: shouldUseNarrowLayout ? undefined : styles.pr3,
                            contentContainerStyle: shouldShowRoleFilterEmptyState ? [styles.flex1, styles.mh100] : undefined,
                            listFooterContentStyle: shouldShowRoleFilterEmptyState ? styles.flex1 : undefined,
                        }}
                        onTurnOnSelectionMode={(item) => item && toggleUser(item.login)}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        onCheckboxPress={(item) => toggleUser(item.login)}
                        shouldUseDefaultRightHandSideCheckmark={false}
                        shouldSingleExecuteRowSelect={!isPolicyAdmin}
                        customListHeader={getCustomListHeader()}
                        customListHeaderContent={headerContent}
                        textInputOptions={textInputOptions}
                        shouldShowLoadingPlaceholder={isLoading}
                        onDismissError={dismissError}
                        shouldShowListEmptyContent={false}
                        showScrollIndicator={false}
                        shouldUseUserSkeletonView
                        shouldHeaderBeInsideList
                        shouldShowRightCaret
                        listFooterContent={
                            shouldShowRoleFilterEmptyState ? (
                                <GenericEmptyStateComponent
                                    headerMedia={illustrations.EmptyShelves}
                                    headerContentStyles={styles.emptyShelvesIllustration}
                                    title={translate('workspace.people.emptyRoleFilter.title')}
                                    subtitle={translate('workspace.people.emptyRoleFilter.subtitle')}
                                    headerStyles={styles.emptyStateCardIllustrationContainer}
                                />
                            ) : undefined
                        }
                    />
                </>
            )}
        </WorkspacePageWithSections>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMembersPage);
