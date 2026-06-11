import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import DecisionModal from '@components/DecisionModal';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MessagesRow from '@components/MessagesRow';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import WorkspaceMembersTable, {WorkspaceMemberRowData} from '@components/Tables/WorkspaceMembersTable';
import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextLink from '@components/TextLink';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHRSyncResultsModal from '@hooks/useHRSyncResultsModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {isConnectionInProgress, syncConnection} from '@libs/actions/connections';
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
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import {getConnectedHRProvider} from '@libs/HRUtils';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isPersonalDetailsReady} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault, getPersonalDetailsByID} from '@libs/PersonalDetailsUtils';
import {
    canEditWorkspaceSettings,
    getConnectionExporters,
    getMemberAccountIDsForWorkspace,
    isControlPolicy,
    isDeletedPolicyEmployee,
    isExpensifyTeam,
    isGroupPolicy,
    isPaidGroupPolicy,
    isPolicyApprover,
    shouldFilterExpensifyTeam,
} from '@libs/PolicyUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import {convertPolicyEmployeesToApprovalWorkflows, updateWorkflowDataOnApproverRemoval} from '@libs/WorkflowUtils';
import {close} from '@userActions/Modal';
import {dismissAddedWithPrimaryLoginMessages} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, PolicyEmployee} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
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
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'FallbackAvatar', 'MakeAdmin', 'Plus', 'RemoveMembers', 'Sync', 'Table', 'User', 'UserEye']);
    const policyMemberEmailsToAccountIDs = useMemo(() => getMemberAccountIDsForWorkspace(policy?.employeeList, true), [policy?.employeeList]);
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
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const isPolicyAdmin = canEditWorkspaceSettings(policy);
    // Group policies (Collect/Control + Submit) allow member management.
    const canManageMembers = isGroupPolicy(policy);
    const isLoading = useMemo(
        () => !isOfflineAndNoMemberDataAvailable && (!isPersonalDetailsReady(personalDetails) || isEmptyObject(policy?.employeeList)),
        [isOfflineAndNoMemberDataAvailable, personalDetails, policy?.employeeList],
    );

    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const selectionListRef = useRef<SelectionListHandle<MemberOption>>(null);
    const isFocused = useIsFocused();
    const policyID = route.params.policyID;
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
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
            memberName: formatPhoneNumber(getPersonalDetailsByID(firstSelectedEmployeeAccountID, personalDetails)?.displayName ?? ''),
        });
    }, [selectedEmployees, policyMemberEmailsToAccountIDs, translate, policy, formatPhoneNumber, personalDetails]);
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

        setSelectedEmployees([]);
        removeMembers(policy, selectedEmployees, policyMemberEmailsToAccountIDs);
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

    /** Opens the member details page */
    const openMemberDetails = (accountID: number) => {
        if (!isPolicyAdmin || !isPaidGroupPolicy(policy)) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(accountID)));
            return;
        }
        clearWorkspaceOwnerChangeFlow(policyID);
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(route.params.policyID, accountID));
        });
    };

    const dismissError = (login: string, accountID: number, pendingAction?: PendingAction) => {
        if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            clearDeleteMemberError(route.params.policyID, login);
            return;
        }

        if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE) {
            clearUpdateMemberRoleError(route.params.policyID, login);
            return;
        }

        clearAddMemberError(route.params.policyID, login, accountID);
    };

    const policyOwner = policy?.owner;
    const currentUserLogin = currentUserPersonalDetails.login;
    const invitedPrimaryToSecondaryLogins = useMemo(() => invertObject(policy?.primaryLoginsInvited ?? {}), [policy?.primaryLoginsInvited]);
    const isControlPolicyWithWideLayout = !shouldUseNarrowLayout && isControlPolicy(policy);

    const filteredMembers = useMemo(() => {
        const shouldFilter = shouldFilterExpensifyTeam(policyOwner, currentUserLogin);
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
            if (shouldFilter && isExpensifyTeam(details?.login ?? details?.displayName)) {
                continue;
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

    const data: WorkspaceMemberRowData[] = useMemo(() => {
        return filteredMembers.map(({policyEmployee, accountID, details}) => {
            const isPendingDeleteOrError = isPolicyAdmin && (policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(policyEmployee.errors));

            let role = '';
            if (policy?.owner === details.login) {
                role = translate('common.owner');
            } else if (policyEmployee.role === CONST.POLICY.ROLE.ADMIN) {
                role = translate('common.admin');
            } else if (policyEmployee.role === CONST.POLICY.ROLE.AUDITOR) {
                role = translate('common.auditor');
            } else if (policyEmployee.role === CONST.POLICY.ROLE.EDITOR) {
                role = translate('common.editor');
            }

            const login = details.login ?? '';
            const memberEmail = formatPhoneNumber(login);
            const memberName = formatPhoneNumber(getDisplayNameOrDefault(details));

            return {
                keyForList: login,
                role,
                login,
                accountID,
                name: memberName,
                email: memberEmail,
                employeeUserID: policyEmployee.employeeUserID,
                employeePayrollID: policyEmployee.employeePayrollID,
                isDisabled: isPendingDeleteOrError,
                isInteractive: !details.isOptimisticPersonalDetail,
                isSelectionDisabled: !(isPolicyAdmin && accountID !== policy?.ownerAccountID && accountID !== session?.accountID),
                shouldShowEmployeeUserID: shouldShowCustomField1Column,
                shouldShowEmployeePayrollID: shouldShowCustomField2Column,
                errors: getLatestErrorMessageField(policyEmployee),
                pendingAction: policyEmployee.pendingAction,
                // Note which secondary login was used to invite this primary login
                invitedSecondaryLogin: details?.login ? (invitedPrimaryToSecondaryLogins[details.login] ?? '') : '',
                action: () => openMemberDetails(accountID),
                dismissError: () => dismissError(login, accountID, policyEmployee.pendingAction),
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

    useHRSyncResultsModal(policyID, connectionSyncProgress, isFocused);

    const headerMessage = useMemo(() => {
        if (isOfflineAndNoMemberDataAvailable) {
            return translate('workspace.common.mustBeOnlineToViewMembers');
        }

        return !isLoading && isEmptyObject(policy?.employeeList) ? translate('workspace.common.memberNotFound') : '';
    }, [isLoading, policy?.employeeList, translate, isOfflineAndNoMemberDataAvailable]);

    const memberCount = data.filter((member) => member.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const connectedHRProvider = getConnectedHRProvider(policy);
    const shouldShowHRSyncLink = isPolicyAdmin && !!connectedHRProvider;
    const isMergeHRSyncInProgress =
        connectedHRProvider?.connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR &&
        policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]?.lastSync?.syncStatus === CONST.MERGE_HR.SYNC_STATUS.SYNCING;
    const isHRSyncInProgress =
        shouldShowHRSyncLink &&
        (isMergeHRSyncInProgress || (connectionSyncProgress?.connectionName === connectedHRProvider?.connectionName && isConnectionInProgress(connectionSyncProgress, policy)));
    const isPendingAddOrDelete =
        isOffline && data?.some((member) => member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

    const getHeaderContent = () => (
        <View style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}>
            <View style={[styles.pl5, styles.mb5, styles.mt3, styles.flexRow, styles.alignItemsCenter]}>
                <Text style={[styles.textSupporting, styles.flexShrink1, isPendingAddOrDelete && styles.offlineFeedbackPending]}>
                    {translate('workspace.people.workspaceMembersCount', memberCount)}
                    {shouldShowHRSyncLink && '. '}
                    {shouldShowHRSyncLink && (
                        <TextLink onPress={() => Navigation.navigate(ROUTES.WORKSPACE_HR.getRoute(policyID))}>
                            {translate('workspace.people.configureHRSync', connectedHRProvider?.displayName ?? '')}
                        </TextLink>
                    )}
                </Text>
                {shouldShowHRSyncLink && isHRSyncInProgress && (
                    <ActivityIndicator
                        size="small"
                        style={styles.ml2}
                        reasonAttributes={{context: 'WorkspaceMembersPage.hrSync'}}
                    />
                )}
            </View>
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

    useSearchBackPress({
        onClearSelection: () => setSelectedEmployees([]),
        onNavigationCallBack: () => Navigation.goBack(),
    });

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

        const menuItems: Array<DropdownOption<ValueOf<typeof CONST.POLICY.SECONDARY_ACTIONS>>> = [
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

        const hrProvider = getConnectedHRProvider(policy);
        if (hrProvider) {
            menuItems.push({
                icon: icons.Sync,
                text: translate('workspace.people.syncWithHR', hrProvider.displayName),
                onSelected: () => {
                    if (isOffline) {
                        close(showRequiresInternetModal);
                        return;
                    }

                    close(() => syncConnection(policy, hrProvider.connectionName));
                },
                value: CONST.POLICY.SECONDARY_ACTIONS.SYNC_WITH_HR,
                disabled: isHRSyncInProgress,
            });
        }

        return menuItems;
    }, [
        isPolicyAdmin,
        icons.Table,
        icons.Download,
        icons.Sync,
        translate,
        isAccountLocked,
        isOffline,
        policyID,
        showLockedAccountModal,
        showRequiresInternetModal,
        isHRSyncInProgress,
        policy,
    ]);

    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

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
                style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
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
                    innerStyles={[shouldDisplayButtonsInSeparateLine && styles.alignItemsCenter]}
                    style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
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

    return (
        <WorkspacePageWithSections
            headerText={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.members')}
            route={route}
            icon={!selectionModeHeader ? illustrations.ReceiptWrangler : undefined}
            headerContent={!shouldDisplayButtonsInSeparateLine && getHeaderButtons()}
            testID="WorkspaceMembersPage"
            shouldShowLoading={false}
            shouldUseHeadlineHeader={!selectionModeHeader}
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNonAdmin
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
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
                    {shouldDisplayButtonsInSeparateLine && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                    <DecisionModal
                        title={translate('common.downloadFailedTitle')}
                        prompt={translate('common.downloadFailedDescription')}
                        isSmallScreenWidth={isSmallScreenWidth}
                        onSecondOptionSubmit={() => setIsDownloadFailureModalVisible(false)}
                        secondOptionText={translate('common.buttonConfirm')}
                        isVisible={isDownloadFailureModalVisible}
                        onClose={() => setIsDownloadFailureModalVisible(false)}
                    />

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

                    <WorkspaceMembersTable
                        members={data}
                        policy={policy}
                        isPolicyAdmin={isPolicyAdmin}
                        selectedKeys={selectedEmployees}
                        shouldShowCustomField1Column={shouldShowCustomField1Column}
                        shouldShowCustomField2Column={shouldShowCustomField2Column}
                        onRowSelectionChange={(selectedRows) => setSelectedEmployees(selectedRows)}
                    />
                </>
            )}
        </WorkspacePageWithSections>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMembersPage);
