import {useIsFocused} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
// eslint-disable-next-line no-restricted-imports
import {FallbackAvatar, Plus} from '@components/Icon/Expensicons';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import MessagesRow from '@components/MessagesRow';
import SearchBar from '@components/SearchBar';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import TableListItem from '@components/SelectionListWithSections/TableListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    clearAddMemberError,
    clearDeleteMemberError,
    clearInviteDraft,
    clearWorkspaceOwnerChangeFlow,
    downloadMembersCSV,
    isApprover,
    openWorkspaceMembersPage,
    removeMembers,
    updateWorkspaceMembersRole,
} from '@libs/actions/Policy/Member';
import {removeApprovalWorkflow as removeApprovalWorkflowAction, updateApprovalWorkflow} from '@libs/actions/Workflow';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isPersonalDetailsReady, sortAlphabetically} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault, getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {getMemberAccountIDsForWorkspace, isControlPolicy, isDeletedPolicyEmployee, isExpensifyTeam, isPaidGroupPolicy, isPolicyAdmin as isPolicyAdminUtils} from '@libs/PolicyUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {convertPolicyEmployeesToApprovalWorkflows, updateWorkflowDataOnApproverRemoval} from '@libs/WorkflowUtils';
import {close} from '@userActions/Modal';
import {dismissAddedWithPrimaryLoginMessages} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

type MemberOption = Omit<ListItem, 'accountID' | 'login'> & {accountID: number; login: string};

function WorkspaceMembersPage({personalDetails, route, policy}: WorkspaceMembersPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'User', 'UserEye', 'MakeAdmin', 'RemoveMembers', 'Table'] as const);
    const policyMemberEmailsToAccountIDs = useMemo(() => getMemberAccountIDsForWorkspace(policy?.employeeList, true), [policy?.employeeList]);
    const employeeListDetails = useMemo(() => policy?.employeeList ?? ({} as PolicyEmployeeList), [policy?.employeeList]);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const styles = useThemeStyles();
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const accountIDs = useMemo(() => Object.values(policyMemberEmailsToAccountIDs ?? {}).map((accountID) => Number(accountID)), [policyMemberEmailsToAccountIDs]);
    const prevAccountIDs = usePrevious(accountIDs);
    const textInputRef = useRef<TextInput>(null);
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const isOfflineAndNoMemberDataAvailable = isEmptyObject(policy?.employeeList) && isOffline;
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
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

    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`, {canBeMissing: true});
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const currentUserAccountID = Number(session?.accountID);
    const selectionListRef = useRef<SelectionListHandle>(null);
    const isFocused = useIsFocused();
    const policyID = route.params.policyID;
    const illustrations = useMemoizedLazyIllustrations(['ReceiptWrangler'] as const);

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
        const approverEmail = selectedEmployees.find((selectedEmployee) => isApprover(policy, selectedEmployee));
        if (!approverEmail) {
            const firstSelectedEmployeeAccountID = policyMemberEmailsToAccountIDs[selectedEmployees[0]];
            return translate('workspace.people.removeMembersPrompt', {
                count: selectedEmployees.length,
                memberName: formatPhoneNumber(getPersonalDetailsByIDs({accountIDs: [firstSelectedEmployeeAccountID], currentUserAccountID}).at(0)?.displayName ?? ''),
            });
        }
        const approverAccountID = policyMemberEmailsToAccountIDs[approverEmail];
        return translate('workspace.people.removeMembersWarningPrompt', {
            memberName: getDisplayNameForParticipant({accountID: approverAccountID, formatPhoneNumber}),
            ownerName: getDisplayNameForParticipant({accountID: policy?.ownerAccountID, formatPhoneNumber}),
        });
    }, [selectedEmployees, policyMemberEmailsToAccountIDs, translate, policy, formatPhoneNumber, currentUserAccountID]);
    /**
     * Get members for the current workspace
     */
    const getWorkspaceMembers = useCallback(() => {
        openWorkspaceMembersPage(route.params.policyID, Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList)));
    }, [route.params.policyID, policy?.employeeList]);

    useEffect(() => {
        getWorkspaceMembers();
    }, [getWorkspaceMembers]);

    useEffect(() => {
        if (!removeMembersConfirmModalVisible || deepEqual(accountIDs, prevAccountIDs)) {
            return;
        }
        setRemoveMembersConfirmModalVisible(false);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [accountIDs]);

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
        Navigation.navigate(ROUTES.WORKSPACE_INVITE.getRoute(route.params.policyID, Navigation.getActiveRouteWithoutParams()));
    }, [route.params.policyID, isAccountLocked, showLockedAccountModal]);

    /**
     * Remove selected users from the workspace
     * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
     */
    const removeUsers = () => {
        // Check if any of the members are approvers
        const hasApprovers = selectedEmployees.some((email) => isApprover(policy, email));

        if (hasApprovers) {
            const ownerEmail = ownerDetails.login;
            for (const login of selectedEmployees) {
                const accountID = policyMemberEmailsToAccountIDs[login];
                const removedApprover = personalDetails?.[accountID];
                if (!removedApprover?.login || !ownerEmail) {
                    continue;
                }
                const updatedWorkflows = updateWorkflowDataOnApproverRemoval({
                    approvalWorkflows,
                    removedApprover,
                    ownerDetails,
                });
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

        setRemoveMembersConfirmModalVisible(false);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setSelectedEmployees([]);
            removeMembers(policyID, selectedEmployees, policyMemberEmailsToAccountIDs);
        });
    };

    /**
     * Show the modal to confirm removal of the selected members
     */
    const askForConfirmationToRemove = () => {
        setRemoveMembersConfirmModalVisible(true);
    };

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
            } else {
                clearAddMemberError(route.params.policyID, item.login, item.accountID);
            }
        },
        [route.params.policyID],
    );

    const policyOwner = policy?.owner;
    const currentUserLogin = currentUserPersonalDetails.login;
    const invitedPrimaryToSecondaryLogins = useMemo(() => invertObject(policy?.primaryLoginsInvited ?? {}), [policy?.primaryLoginsInvited]);
    const data: MemberOption[] = useMemo(() => {
        const result: MemberOption[] = [];

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

            const isPendingDeleteOrError = isPolicyAdmin && (policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(policyEmployee.errors));

            result.push({
                keyForList: details.login ?? '',
                accountID,
                login: details.login ?? '',
                isDisabledCheckbox: !(isPolicyAdmin && accountID !== policy?.ownerAccountID && accountID !== session?.accountID),
                isDisabled: isPendingDeleteOrError,
                isInteractive: !details.isOptimisticPersonalDetail,
                cursorStyle: details.isOptimisticPersonalDetail ? styles.cursorDefault : {},
                text: formatPhoneNumber(getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                rightElement: (
                    <MemberRightIcon
                        role={policyEmployee.role}
                        owner={policy?.owner}
                        login={details.login}
                    />
                ),
                icons: [
                    {
                        source: details.avatar ?? FallbackAvatar,
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: getLatestErrorMessageField(policyEmployee),
                pendingAction: policyEmployee.pendingAction,
                // Note which secondary login was used to invite this primary login
                invitedSecondaryLogin: details?.login ? (invitedPrimaryToSecondaryLogins[details.login] ?? '') : '',
            });
        }
        return result;
    }, [
        policy?.employeeList,
        policy?.ownerAccountID,
        policy?.owner,
        policyMemberEmailsToAccountIDs,
        isOffline,
        personalDetails,
        isPolicyAdmin,
        session?.accountID,
        styles.cursorDefault,
        formatPhoneNumber,
        FallbackAvatar,
        invitedPrimaryToSecondaryLogins,
        policyOwner,
        currentUserLogin,
    ]);

    const filterMember = useCallback((memberOption: MemberOption, searchQuery: string) => {
        const results = tokenizedSearch([memberOption], searchQuery, (option) => [option.text ?? '', option.alternateText ?? '']);
        return results.length > 0;
    }, []);
    const sortMembers = useCallback((memberOptions: MemberOption[]) => sortAlphabetically(memberOptions, 'text', localeCompare), [localeCompare]);
    const [inputValue, setInputValue, filteredData] = useSearchResults(data, filterMember, sortMembers);

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

    const getHeaderContent = () => (
        <View style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}>
            <Text style={[styles.pl5, styles.mb5, styles.mt3, styles.textSupporting, isPendingAddOrDelete && styles.offlineFeedbackPending]}>
                {translate('workspace.people.workspaceMembersCount', {count: memberCount})}
            </Text>
            {!isEmptyObject(invitedPrimaryToSecondaryLogins) && (
                <MessagesRow
                    type="success"
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    messages={{0: translate('workspace.people.addedWithPrimary')}}
                    containerStyles={[styles.pb5, styles.ph5]}
                    onClose={() => dismissAddedWithPrimaryLoginMessages(policyID)}
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
        if (filteredData.length === 0) {
            return null;
        }
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
        updateWorkspaceMembersRole(route.params.policyID, loginsToUpdate, accountIDsToUpdate, role);
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
            text: translate('workspace.people.makeMember'),
            value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_MEMBER,
            icon: icons.User,
            onSelected: () => changeUserRole(CONST.POLICY.ROLE.USER),
        };
        const adminOption = {
            text: translate('workspace.people.makeAdmin'),
            value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_ADMIN,
            icon: icons.MakeAdmin,
            onSelected: () => changeUserRole(CONST.POLICY.ROLE.ADMIN),
        };

        const auditorOption = {
            text: translate('workspace.people.makeAuditor'),
            value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_AUDITOR,
            icon: icons.UserEye,
            onSelected: () => changeUserRole(CONST.POLICY.ROLE.AUDITOR),
        };

        const hasAtLeastOneNonAuditorRole = selectedEmployeesRoles.some((role) => role !== CONST.POLICY.ROLE.AUDITOR);
        const hasAtLeastOneNonMemberRole = selectedEmployeesRoles.some((role) => role !== CONST.POLICY.ROLE.USER);
        const hasAtLeastOneNonAdminRole = selectedEmployeesRoles.some((role) => role !== CONST.POLICY.ROLE.ADMIN);

        if (hasAtLeastOneNonMemberRole) {
            options.push(memberOption);
        }

        if (hasAtLeastOneNonAdminRole) {
            options.push(adminOption);
        }

        if (hasAtLeastOneNonAuditorRole && isControlPolicy(policy)) {
            options.push(auditorOption);
        }

        return options;
    };

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
                        close(() => setIsOfflineModalVisible(true));
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
                        close(() => setIsOfflineModalVisible(true));
                        return;
                    }

                    close(() => {
                        downloadMembersCSV(policyID, () => {
                            setIsDownloadFailureModalVisible(true);
                        });
                    });
                },
                value: CONST.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            },
        ];

        return menuItems;
    }, [icons.Download, icons.Table, policyID, translate, isOffline, isPolicyAdmin, isAccountLocked, showLockedAccountModal]);

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
                testID={`${WorkspaceMembersPage.displayName}-header-dropdown-menu-button`}
            />
        ) : (
            <View style={[styles.flexRow, styles.gap2]}>
                <Button
                    success
                    onPress={inviteUser}
                    text={translate('workspace.invite.member')}
                    icon={Plus}
                    innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                />
                <ButtonWithDropdownMenu
                    success={false}
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
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
            {data.length > CONST.SEARCH_ITEM_LIMIT && (
                <SearchBar
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    label={translate('workspace.people.findMember')}
                    shouldShowEmptyState={!filteredData.length}
                />
            )}
        </>
    );

    return (
        <WorkspacePageWithSections
            headerText={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.members')}
            route={route}
            icon={!selectionModeHeader ? illustrations.ReceiptWrangler : undefined}
            headerContent={!shouldUseNarrowLayout && getHeaderButtons()}
            testID={WorkspaceMembersPage.displayName}
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
                Navigation.popToSidebar();
            }}
        >
            {() => (
                <>
                    {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                    <ConfirmModal
                        isVisible={isOfflineModalVisible}
                        onConfirm={() => setIsOfflineModalVisible(false)}
                        title={translate('common.youAppearToBeOffline')}
                        prompt={translate('common.thisFeatureRequiresInternet')}
                        confirmText={translate('common.buttonConfirm')}
                        shouldShowCancelButton={false}
                        onCancel={() => setIsOfflineModalVisible(false)}
                        shouldHandleNavigationBack
                    />

                    <ConfirmModal
                        danger
                        title={translate('workspace.people.removeMembersTitle', {count: selectedEmployees.length})}
                        isVisible={removeMembersConfirmModalVisible}
                        onConfirm={removeUsers}
                        onCancel={() => setRemoveMembersConfirmModalVisible(false)}
                        prompt={confirmModalPrompt}
                        confirmText={translate('common.remove')}
                        cancelText={translate('common.cancel')}
                        onModalHide={() => {
                            // eslint-disable-next-line @typescript-eslint/no-deprecated
                            InteractionManager.runAfterInteractions(() => {
                                if (!textInputRef.current) {
                                    return;
                                }
                                textInputRef.current.focus();
                            });
                        }}
                    />
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
                        ref={selectionListRef}
                        canSelectMultiple={canSelectMultiple}
                        sections={[{data: filteredData, isDisabled: false}]}
                        selectedItems={selectedEmployees}
                        ListItem={TableListItem}
                        shouldUseDefaultRightHandSideCheckmark={false}
                        turnOnSelectionModeOnLongPress={isPolicyAdmin}
                        onTurnOnSelectionMode={(item) => item && toggleUser(item.login)}
                        shouldUseUserSkeletonView
                        disableKeyboardShortcuts={removeMembersConfirmModalVisible}
                        headerMessage={shouldUseNarrowLayout ? headerMessage : undefined}
                        onSelectRow={openMemberDetails}
                        shouldSingleExecuteRowSelect={!isPolicyAdmin}
                        onCheckboxPress={(item) => toggleUser(item.login)}
                        onSelectAll={filteredData.length > 0 ? () => toggleAllUsers(filteredData) : undefined}
                        onDismissError={dismissError}
                        showLoadingPlaceholder={isLoading}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        textInputRef={textInputRef}
                        listHeaderContent={headerContent}
                        shouldShowListEmptyContent={false}
                        customListHeader={getCustomListHeader()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        showScrollIndicator={false}
                        addBottomSafeAreaPadding
                        shouldShowRightCaret
                    />
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceMembersPage.displayName = 'WorkspaceMembersPage';

export default withPolicyAndFullscreenLoading(WorkspaceMembersPage);
