import {useIsFocused} from '@react-navigation/native';
import lodashIsEqual from 'lodash/isEqual';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Badge from '@components/Badge';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import {Download, FallbackAvatar, MakeAdmin, Plus, RemoveMembers, Table, User, UserEye} from '@components/Icon/Expensicons';
import {ReceiptWrangler} from '@components/Icon/Illustrations';
import MessagesRow from '@components/MessagesRow';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
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
import {formatPhoneNumber as formatPhoneNumberUtil} from '@libs/LocalePhoneNumber';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isPersonalDetailsReady, sortAlphabetically} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault, getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {getMemberAccountIDsForWorkspace, isDeletedPolicyEmployee, isExpensifyTeam, isPaidGroupPolicy, isPolicyAdmin as isPolicyAdminUtils} from '@libs/PolicyUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import {convertPolicyEmployeesToApprovalWorkflows, updateWorkflowDataOnApproverRemoval} from '@libs/WorkflowUtils';
import {close} from '@userActions/Modal';
import {dismissAddedWithPrimaryLoginMessages} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList, PolicyEmployeeList} from '@src/types/onyx';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import WorkspacePageWithSections from './WorkspacePageWithSections';

type WorkspaceMembersPageProps = WithPolicyAndFullscreenLoadingProps &
    WithCurrentUserPersonalDetailsProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS>;

/**
 * Inverts an object, equivalent of _.invert
 */
function invertObject(object: Record<string, string>): Record<string, string> {
    const invertedEntries = Object.entries(object).map(([key, value]) => [value, key] as const);
    return Object.fromEntries(invertedEntries);
}

type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};

function WorkspaceMembersPage({personalDetails, route, policy, currentUserPersonalDetails}: WorkspaceMembersPageProps) {
    const policyMemberEmailsToAccountIDs = useMemo(() => getMemberAccountIDsForWorkspace(policy?.employeeList, true), [policy?.employeeList]);
    const styles = useThemeStyles();
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const {isOffline} = useNetwork();
    const {windowWidth} = useWindowDimensions();
    const prevIsOffline = usePrevious(isOffline);
    const accountIDs = useMemo(() => Object.values(policyMemberEmailsToAccountIDs ?? {}).map((accountID) => Number(accountID)), [policyMemberEmailsToAccountIDs]);
    const prevAccountIDs = usePrevious(accountIDs);
    const textInputRef = useRef<TextInput>(null);
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const isOfflineAndNoMemberDataAvailable = isEmptyObject(policy?.employeeList) && isOffline;
    const prevPersonalDetails = usePrevious(personalDetails);
    const {translate, formatPhoneNumber, preferredLocale} = useLocalize();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const isPolicyAdmin = isPolicyAdminUtils(policy);
    const isLoading = useMemo(
        () => !isOfflineAndNoMemberDataAvailable && (!isPersonalDetailsReady(personalDetails) || isEmptyObject(policy?.employeeList)),
        [isOfflineAndNoMemberDataAvailable, personalDetails, policy?.employeeList],
    );

    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`);
    const {selectionMode} = useMobileSelectionMode();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const currentUserAccountID = Number(session?.accountID);
    const selectionListRef = useRef<SelectionListHandle>(null);
    const isFocused = useIsFocused();
    const policyID = route.params.policyID;

    const ownerDetails = personalDetails?.[policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID] ?? ({} as PersonalDetails);
    const policyApproverEmail = policy?.approver;
    const {approvalWorkflows} = useMemo(
        () =>
            convertPolicyEmployeesToApprovalWorkflows({
                employees: policy?.employeeList ?? {},
                defaultApprover: policyApproverEmail ?? policy?.owner ?? '',
                personalDetails: personalDetails ?? {},
            }),
        [personalDetails, policy?.employeeList, policy?.owner, policyApproverEmail],
    );

    const canSelectMultiple = isPolicyAdmin && (shouldUseNarrowLayout ? selectionMode?.isEnabled : true);

    const confirmModalPrompt = useMemo(() => {
        const approverAccountID = selectedEmployees.find((selectedEmployee) => isApprover(policy, selectedEmployee));
        if (!approverAccountID) {
            return translate('workspace.people.removeMembersPrompt', {
                count: selectedEmployees.length,
                memberName: formatPhoneNumberUtil(getPersonalDetailsByIDs({accountIDs: selectedEmployees, currentUserAccountID}).at(0)?.displayName ?? ''),
            });
        }
        return translate('workspace.people.removeMembersWarningPrompt', {
            memberName: getDisplayNameForParticipant({accountID: approverAccountID}),
            ownerName: getDisplayNameForParticipant({accountID: policy?.ownerAccountID}),
        });
    }, [selectedEmployees, translate, policy, currentUserAccountID]);
    /**
     * Get filtered personalDetails list with current employeeList
     */
    const filterPersonalDetails = (members: OnyxEntry<PolicyEmployeeList>, details: OnyxEntry<PersonalDetailsList>): PersonalDetailsList =>
        Object.keys(members ?? {}).reduce((acc, key) => {
            const memberAccountIdKey = policyMemberEmailsToAccountIDs[key] ?? '';
            if (details?.[memberAccountIdKey]) {
                acc[memberAccountIdKey] = details[memberAccountIdKey];
            }
            return acc;
        }, {} as PersonalDetailsList);
    /**
     * Get members for the current workspace
     */
    const getWorkspaceMembers = useCallback(() => {
        openWorkspaceMembersPage(route.params.policyID, Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList)));
    }, [route.params.policyID, policy?.employeeList]);

    /**
     * Check if the current selection includes members that cannot be removed
     */
    const validateSelection = useCallback(() => {
        const newErrors: Errors = {};
        selectedEmployees.forEach((member) => {
            if (member !== policy?.ownerAccountID && member !== session?.accountID) {
                return;
            }
            newErrors[member] = translate('workspace.people.error.cannotRemove');
        });
        setErrors(newErrors);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [selectedEmployees, policy?.owner, session?.accountID]);

    // useFocus would make getWorkspaceMembers get called twice on fresh login because policyEmployee is a dependency of getWorkspaceMembers.
    useEffect(() => {
        if (!isFocused) {
            setSelectedEmployees([]);
            return;
        }
        getWorkspaceMembers();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isFocused]);

    useEffect(() => {
        validateSelection();
    }, [preferredLocale, validateSelection]);

    useEffect(() => {
        if (removeMembersConfirmModalVisible && !lodashIsEqual(accountIDs, prevAccountIDs)) {
            setRemoveMembersConfirmModalVisible(false);
        }
        setSelectedEmployees((prevSelected) => {
            // Filter all personal details in order to use the elements needed for the current workspace
            const currentPersonalDetails = filterPersonalDetails(policy?.employeeList ?? {}, personalDetails);
            // We need to filter the previous selected employees by the new personal details, since unknown/new user id's change when transitioning from offline to online
            const prevSelectedElements = prevSelected.map((id) => {
                const prevItem = prevPersonalDetails?.[id];
                const res = Object.values(currentPersonalDetails).find((item) => prevItem?.login === item?.login);
                return res?.accountID ?? id;
            });

            const currentSelectedElements = Object.entries(getMemberAccountIDsForWorkspace(policy?.employeeList))
                .filter((employee) => policy?.employeeList?.[employee[0]]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
                .map((employee) => employee[1]);

            // This is an equivalent of the lodash intersection function. The reduce method below is used to filter the items that exist in both arrays.
            return [prevSelectedElements, currentSelectedElements].reduce((prev, members) => prev.filter((item) => members.includes(item)));
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [policy?.employeeList, policyMemberEmailsToAccountIDs]);

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
        clearInviteDraft(route.params.policyID);
        Navigation.navigate(ROUTES.WORKSPACE_INVITE.getRoute(route.params.policyID, Navigation.getActiveRouteWithoutParams()));
    }, [route.params.policyID]);

    /**
     * Remove selected users from the workspace
     * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
     */
    const removeUsers = () => {
        if (!isEmptyObject(errors)) {
            return;
        }

        // Remove the admin from the list
        const accountIDsToRemove = session?.accountID ? selectedEmployees.filter((id) => id !== session.accountID) : selectedEmployees;

        // Check if any of the account IDs are approvers
        const hasApprovers = accountIDsToRemove.some((accountID) => isApprover(policy, accountID));

        if (hasApprovers) {
            const ownerEmail = ownerDetails.login;
            accountIDsToRemove.forEach((accountID) => {
                const removedApprover = personalDetails?.[accountID];
                if (!removedApprover?.login || !ownerEmail) {
                    return;
                }
                const updatedWorkflows = updateWorkflowDataOnApproverRemoval({
                    approvalWorkflows,
                    removedApprover,
                    ownerDetails,
                });
                updatedWorkflows.forEach((workflow) => {
                    if (workflow?.removeApprovalWorkflow) {
                        const {removeApprovalWorkflow, ...updatedWorkflow} = workflow;
                        removeApprovalWorkflowAction(policyID, updatedWorkflow);
                    } else {
                        updateApprovalWorkflow(policyID, workflow, [], []);
                    }
                });
            });
        }

        setSelectedEmployees([]);
        setRemoveMembersConfirmModalVisible(false);
        InteractionManager.runAfterInteractions(() => {
            removeMembers(accountIDsToRemove, route.params.policyID);
        });
    };

    /**
     * Show the modal to confirm removal of the selected members
     */
    const askForConfirmationToRemove = () => {
        if (!isEmptyObject(errors)) {
            return;
        }
        setRemoveMembersConfirmModalVisible(true);
    };

    /**
     * Add or remove all users passed from the selectedEmployees list
     */
    const toggleAllUsers = (memberList: MemberOption[]) => {
        const enabledAccounts = memberList.filter((member) => !member.isDisabled && !member.isDisabledCheckbox);
        const everyoneSelected = enabledAccounts.every((member) => selectedEmployees.includes(member.accountID));

        if (everyoneSelected) {
            setSelectedEmployees([]);
        } else {
            const everyAccountId = enabledAccounts.map((member) => member.accountID);
            setSelectedEmployees(everyAccountId);
        }

        validateSelection();
    };

    /**
     * Add user from the selectedEmployees list
     */
    const addUser = useCallback(
        (accountID: number) => {
            setSelectedEmployees((prevSelected) => [...prevSelected, accountID]);
            validateSelection();
        },
        [validateSelection],
    );

    /**
     * Remove user from the selectedEmployees list
     */
    const removeUser = useCallback(
        (accountID: number) => {
            setSelectedEmployees((prevSelected) => prevSelected.filter((id) => id !== accountID));
            validateSelection();
        },
        [validateSelection],
    );

    /**
     * Toggle user from the selectedEmployees list
     */
    const toggleUser = useCallback(
        (accountID: number, pendingAction?: PendingAction) => {
            if (accountID === policy?.ownerAccountID && accountID !== session?.accountID) {
                return;
            }

            if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }

            // Add or remove the user if the checkbox is enabled
            if (selectedEmployees.includes(accountID)) {
                removeUser(accountID);
            } else {
                addUser(accountID);
            }
        },
        [selectedEmployees, addUser, removeUser, policy?.ownerAccountID, session?.accountID],
    );

    /** Opens the member details page */
    const openMemberDetails = useCallback(
        (item: MemberOption) => {
            if (!isPolicyAdmin || !isPaidGroupPolicy(policy)) {
                Navigation.navigate(ROUTES.PROFILE.getRoute(item.accountID));
                return;
            }
            clearWorkspaceOwnerChangeFlow(policyID);
            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(route.params.policyID, item.accountID));
        },
        [isPolicyAdmin, policy, policyID, route.params.policyID],
    );

    /**
     * Dismisses the errors on one item
     */
    const dismissError = useCallback(
        (item: MemberOption) => {
            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                clearDeleteMemberError(route.params.policyID, item.accountID);
            } else {
                clearAddMemberError(route.params.policyID, item.accountID);
            }
        },
        [route.params.policyID],
    );

    const policyOwner = policy?.owner;
    const currentUserLogin = currentUserPersonalDetails.login;
    const invitedPrimaryToSecondaryLogins = invertObject(policy?.primaryLoginsInvited ?? {});
    const getUsers = useCallback((): MemberOption[] => {
        let result: MemberOption[] = [];

        Object.entries(policy?.employeeList ?? {}).forEach(([email, policyEmployee]) => {
            const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                return;
            }

            const details = personalDetails?.[accountID];

            if (!details) {
                Log.hmmm(`[WorkspaceMembersPage] no personal details found for policy member with accountID: ${accountID}`);
                return;
            }

            // If this policy is owned by Expensify then show all support (expensify.com or team.expensify.com) emails
            // We don't want to show guides as policy members unless the user is a guide. Some customers get confused when they
            // see random people added to their policy, but guides having access to the policies help set them up.
            if (isExpensifyTeam(details?.login ?? details?.displayName)) {
                if (policyOwner && currentUserLogin && !isExpensifyTeam(policyOwner) && !isExpensifyTeam(currentUserLogin)) {
                    return;
                }
            }

            const isSelected = selectedEmployees.includes(accountID) && canSelectMultiple;

            const isOwner = policy?.owner === details.login;
            const isAdmin = policyEmployee.role === CONST.POLICY.ROLE.ADMIN;
            const isAuditor = policyEmployee.role === CONST.POLICY.ROLE.AUDITOR;
            let roleBadge = null;
            if (isOwner || isAdmin) {
                roleBadge = <Badge text={isOwner ? translate('common.owner') : translate('common.admin')} />;
            } else if (isAuditor) {
                roleBadge = <Badge text={translate('common.auditor')} />;
            }
            const isPendingDeleteOrError = isPolicyAdmin && (policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(policyEmployee.errors));

            result.push({
                keyForList: String(accountID),
                accountID,
                isSelected,
                isDisabledCheckbox: !(isPolicyAdmin && accountID !== policy?.ownerAccountID && accountID !== session?.accountID),
                isDisabled: isPendingDeleteOrError,
                isInteractive: !details.isOptimisticPersonalDetail,
                cursorStyle: details.isOptimisticPersonalDetail ? styles.cursorDefault : {},
                text: formatPhoneNumber(getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                rightElement: roleBadge,
                icons: [
                    {
                        source: details.avatar ?? FallbackAvatar,
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: policyEmployee.errors,
                pendingAction: policyEmployee.pendingAction,
                // Note which secondary login was used to invite this primary login
                invitedSecondaryLogin: details?.login ? invitedPrimaryToSecondaryLogins[details.login] ?? '' : '',
            });
        });
        result = sortAlphabetically(result, 'text');
        return result;
    }, [
        isOffline,
        currentUserLogin,
        formatPhoneNumber,
        invitedPrimaryToSecondaryLogins,
        personalDetails,
        policy?.owner,
        policy?.ownerAccountID,
        policy?.employeeList,
        policyMemberEmailsToAccountIDs,
        policyOwner,
        selectedEmployees,
        session?.accountID,
        translate,
        styles.cursorDefault,
        canSelectMultiple,
        isPolicyAdmin,
    ]);

    const data = useMemo(() => getUsers(), [getUsers]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        if (isEmptyObject(invitedEmailsToAccountIDsDraft) || accountIDs === prevAccountIDs) {
            return;
        }
        const invitedEmails = Object.values(invitedEmailsToAccountIDsDraft).map(String);
        selectionListRef.current?.scrollAndHighlightItem?.(invitedEmails);
        clearInviteDraft(route.params.policyID);
    }, [invitedEmailsToAccountIDsDraft, isFocused, accountIDs, prevAccountIDs, route.params.policyID]);

    const getHeaderMessage = () => {
        if (isOfflineAndNoMemberDataAvailable) {
            return translate('workspace.common.mustBeOnlineToViewMembers');
        }

        return !isLoading && isEmptyObject(policy?.employeeList) ? translate('workspace.common.memberNotFound') : '';
    };

    const getHeaderContent = () => (
        <View style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}>
            <Text style={[styles.pl5, styles.mb4, styles.mt3, styles.textSupporting]}>{translate('workspace.people.membersListTitle')}</Text>
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
        if (selectionMode?.isEnabled) {
            return;
        }

        setSelectedEmployees([]);
    }, [setSelectedEmployees, selectionMode?.isEnabled]);

    useSearchBackPress({
        onClearSelection: () => setSelectedEmployees([]),
        onNavigationCallBack: () => Navigation.goBack(),
    });

    const getCustomListHeader = () => {
        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('common.member')}
                rightHeaderText={translate('common.role')}
            />
        );
    };

    const changeUserRole = (role: ValueOf<typeof CONST.POLICY.ROLE>) => {
        if (!isEmptyObject(errors)) {
            return;
        }

        const accountIDsToUpdate = selectedEmployees.filter((accountID) => {
            const email = personalDetails?.[accountID]?.login ?? '';
            return policy?.employeeList?.[email]?.role !== role;
        });

        updateWorkspaceMembersRole(route.params.policyID, accountIDsToUpdate, role);
        setSelectedEmployees([]);
    };

    const getBulkActionsButtonOptions = () => {
        const options: Array<DropdownOption<WorkspaceMemberBulkActionType>> = [
            {
                text: translate('workspace.people.removeMembersTitle', {count: selectedEmployees.length}),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: RemoveMembers,
                onSelected: askForConfirmationToRemove,
            },
        ];

        if (!isPaidGroupPolicy(policy)) {
            return options;
        }

        const selectedEmployeesRoles = selectedEmployees.map((accountID) => {
            const email = personalDetails?.[accountID]?.login ?? '';
            return policy?.employeeList?.[email]?.role;
        });

        const memberOption = {
            text: translate('workspace.people.makeMember'),
            value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_MEMBER,
            icon: User,
            onSelected: () => changeUserRole(CONST.POLICY.ROLE.USER),
        };
        const adminOption = {
            text: translate('workspace.people.makeAdmin'),
            value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_ADMIN,
            icon: MakeAdmin,
            onSelected: () => changeUserRole(CONST.POLICY.ROLE.ADMIN),
        };

        const auditorOption = {
            text: translate('workspace.people.makeAuditor'),
            value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_AUDITOR,
            icon: UserEye,
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

        if (hasAtLeastOneNonAuditorRole) {
            options.push(auditorOption);
        }

        return options;
    };

    const getHeaderButtons = () => {
        if (!isPolicyAdmin) {
            return null;
        }
        return (shouldUseNarrowLayout ? canSelectMultiple : selectedEmployees.length > 0) ? (
            <ButtonWithDropdownMenu<WorkspaceMemberBulkActionType>
                shouldAlwaysShowDropdownMenu
                pressOnEnter
                customText={translate('workspace.common.selected', {count: selectedEmployees.length})}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                onPress={() => null}
                options={getBulkActionsButtonOptions()}
                isSplitButton={false}
                style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                isDisabled={!selectedEmployees.length}
            />
        ) : (
            <Button
                success
                onPress={inviteUser}
                text={translate('workspace.invite.member')}
                icon={Plus}
                innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
            />
        );
    };

    const threeDotsMenuItems = useMemo(() => {
        if (!isPolicyAdmin) {
            return [];
        }

        const menuItems = [
            {
                icon: Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: () => {
                    if (isOffline) {
                        close(() => setIsOfflineModalVisible(true));
                        return;
                    }
                    Navigation.navigate(ROUTES.WORKSPACE_MEMBERS_IMPORT.getRoute(policyID));
                },
            },
            {
                icon: Download,
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
            },
        ];

        return menuItems;
    }, [policyID, translate, isOffline, isPolicyAdmin]);

    const selectionModeHeader = selectionMode?.isEnabled && shouldUseNarrowLayout;

    return (
        <WorkspacePageWithSections
            headerText={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.members')}
            route={route}
            icon={!selectionModeHeader ? ReceiptWrangler : undefined}
            headerContent={!shouldUseNarrowLayout && getHeaderButtons()}
            testID={WorkspaceMembersPage.displayName}
            shouldShowLoading={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldShowThreeDotsButton={isPolicyAdmin}
            threeDotsMenuItems={threeDotsMenuItems}
            threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
            shouldShowNonAdmin
            onBackButtonPress={() => {
                if (selectionMode?.isEnabled) {
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
                    <ConfirmModal
                        isVisible={isOfflineModalVisible}
                        onConfirm={() => setIsOfflineModalVisible(false)}
                        title={translate('common.youAppearToBeOffline')}
                        prompt={translate('common.thisFeatureRequiresInternet')}
                        confirmText={translate('common.buttonConfirm')}
                        shouldShowCancelButton={false}
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
                    <View style={[styles.w100, styles.flex1]}>
                        <SelectionListWithModal
                            ref={selectionListRef}
                            canSelectMultiple={canSelectMultiple}
                            sections={[{data, isDisabled: false}]}
                            ListItem={TableListItem}
                            turnOnSelectionModeOnLongPress={isPolicyAdmin}
                            onTurnOnSelectionMode={(item) => item && toggleUser(item?.accountID)}
                            shouldUseUserSkeletonView
                            disableKeyboardShortcuts={removeMembersConfirmModalVisible}
                            headerMessage={getHeaderMessage()}
                            headerContent={!shouldUseNarrowLayout && getHeaderContent()}
                            onSelectRow={openMemberDetails}
                            shouldSingleExecuteRowSelect={!isPolicyAdmin}
                            onCheckboxPress={(item) => toggleUser(item.accountID)}
                            onSelectAll={() => toggleAllUsers(data)}
                            onDismissError={dismissError}
                            showLoadingPlaceholder={isLoading}
                            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                            textInputRef={textInputRef}
                            customListHeader={getCustomListHeader()}
                            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                            listHeaderContent={shouldUseNarrowLayout ? <View style={[styles.pr5]}>{getHeaderContent()}</View> : null}
                            showScrollIndicator={false}
                        />
                    </View>
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceMembersPage.displayName = 'WorkspaceMembersPage';

export default withCurrentUserPersonalDetails(withPolicyAndFullscreenLoading(WorkspaceMembersPage));
