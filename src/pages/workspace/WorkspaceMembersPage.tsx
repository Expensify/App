import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import lodashIsEqual from 'lodash/isEqual';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MessagesRow from '@components/MessagesRow';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {WorkspacesCentralPaneNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as UserUtils from '@libs/UserUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InvitedEmailsToAccountIDs, PersonalDetailsList, PolicyEmployee, PolicyEmployeeList, Session} from '@src/types/onyx';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import WorkspacePageWithSections from './WorkspacePageWithSections';

type WorkspaceMembersPageOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;

    /** An object containing the accountID for every invited user email */
    invitedEmailsToAccountIDsDraft: OnyxEntry<InvitedEmailsToAccountIDs>;
};
type WorkspaceMembersPageProps = WithPolicyAndFullscreenLoadingProps &
    WithCurrentUserPersonalDetailsProps &
    WorkspaceMembersPageOnyxProps &
    StackScreenProps<WorkspacesCentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS>;
/**
 * Inverts an object, equivalent of _.invert
 */
function invertObject(object: Record<string, string>): Record<string, string> {
    const invertedEntries = Object.entries(object).map(([key, value]) => [value, key]);
    const inverted: Record<string, string> = Object.fromEntries(invertedEntries);
    return inverted;
}

type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};

function WorkspaceMembersPage({personalDetails, invitedEmailsToAccountIDsDraft, route, policy, session, currentUserPersonalDetails}: WorkspaceMembersPageProps) {
    const policyMemberEmailsToAccountIDs = useMemo(() => PolicyUtils.getMemberAccountIDsForWorkspace(policy?.employeeList), [policy?.employeeList]);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const accountIDs = useMemo(() => Object.values(policyMemberEmailsToAccountIDs ?? {}).map((accountID) => Number(accountID)), [policyMemberEmailsToAccountIDs]);
    const prevAccountIDs = usePrevious(accountIDs);
    const textInputRef = useRef<TextInput>(null);
    const isOfflineAndNoMemberDataAvailable = isEmptyObject(policy?.employeeList) && isOffline;
    const prevPersonalDetails = usePrevious(personalDetails);
    const {translate, formatPhoneNumber, preferredLocale} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const dropdownButtonRef = useRef(null);
    const isPolicyAdmin = PolicyUtils.isPolicyAdmin(policy);
    const isLoading = useMemo(
        () => !isOfflineAndNoMemberDataAvailable && (!OptionsListUtils.isPersonalDetailsReady(personalDetails) || isEmptyObject(policy?.employeeList)),
        [isOfflineAndNoMemberDataAvailable, personalDetails, policy?.employeeList],
    );
    const selectionListRef = useRef<SelectionListHandle>(null);
    const isFocused = useIsFocused();
    const policyID = route.params.policyID;
    /**
     * Get filtered personalDetails list with current employeeList
     */
    const filterPersonalDetails = (members: OnyxEntry<PolicyEmployeeList>, details: OnyxEntry<PersonalDetailsList>): PersonalDetailsList =>
        Object.keys(members ?? {}).reduce((result, key) => {
            const memberAccountIdKey = policyMemberEmailsToAccountIDs[key] ?? '';
            if (details?.[memberAccountIdKey]) {
                return {
                    ...result,
                    [memberAccountIdKey]: details[memberAccountIdKey],
                };
            }
            return result;
        }, {});
    /**
     * Get members for the current workspace
     */
    const getWorkspaceMembers = useCallback(() => {
        Policy.openWorkspaceMembersPage(route.params.policyID, Object.keys(PolicyUtils.getMemberAccountIDsForWorkspace(policy?.employeeList)));
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEmployees, policy?.owner, session?.accountID]);

    // useFocus would make getWorkspaceMembers get called twice on fresh login because policyEmployee is a dependency of getWorkspaceMembers.
    useEffect(() => {
        if (!isFocused) {
            setSelectedEmployees([]);
            return;
        }
        getWorkspaceMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                const prevItem = prevPersonalDetails?.id;
                const res = Object.values(currentPersonalDetails).find((item) => prevItem?.login === item?.login);
                return res?.accountID ?? id;
            });

            const currentSelectedElements = Object.entries(PolicyUtils.getMemberAccountIDsForWorkspace(policy?.employeeList))
                .filter((employee) => policy?.employeeList?.[employee[0]]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
                .map((employee) => employee[1]);

            // This is an equivalent of the lodash intersection function. The reduce method below is used to filter the items that exist in both arrays.
            return [prevSelectedElements, currentSelectedElements].reduce((prev, members) => prev.filter((item) => members.includes(item)));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const inviteUser = () => {
        Navigation.navigate(ROUTES.WORKSPACE_INVITE.getRoute(route.params.policyID));
    };

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

        Policy.removeMembers(accountIDsToRemove, route.params.policyID);
        setSelectedEmployees([]);
        setRemoveMembersConfirmModalVisible(false);
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
        [selectedEmployees, addUser, removeUser],
    );

    /** Opens the member details page */
    const openMemberDetails = useCallback(
        (item: MemberOption) => {
            if (!isPolicyAdmin || !PolicyUtils.isPaidGroupPolicy(policy)) {
                Navigation.navigate(ROUTES.PROFILE.getRoute(item.accountID));
                return;
            }
            Policy.clearWorkspaceOwnerChangeFlow(policyID);
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
                Policy.clearDeleteMemberError(route.params.policyID, item.accountID);
            } else {
                Policy.clearAddMemberError(route.params.policyID, item.accountID);
            }
        },
        [route.params.policyID],
    );

    /**
     * Check if the policy member is deleted from the workspace
     */
    const isDeletedPolicyEmployee = useCallback(
        (policyEmployee: PolicyEmployee): boolean => !isOffline && policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyEmployee.errors),
        [isOffline],
    );

    const policyOwner = policy?.owner;
    const currentUserLogin = currentUserPersonalDetails.login;
    const invitedPrimaryToSecondaryLogins = invertObject(policy?.primaryLoginsInvited ?? {});
    const getUsers = useCallback((): MemberOption[] => {
        let result: MemberOption[] = [];

        Object.entries(policy?.employeeList ?? {}).forEach(([email, policyEmployee]) => {
            const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
            if (isDeletedPolicyEmployee(policyEmployee)) {
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
            if (PolicyUtils.isExpensifyTeam(details?.login ?? details?.displayName)) {
                if (policyOwner && currentUserLogin && !PolicyUtils.isExpensifyTeam(policyOwner) && !PolicyUtils.isExpensifyTeam(currentUserLogin)) {
                    return;
                }
            }

            const isSelected = selectedEmployees.includes(accountID);

            const isOwner = policy?.owner === details.login;
            const isAdmin = policyEmployee.role === CONST.POLICY.ROLE.ADMIN;
            let roleBadge = null;
            if (isOwner || isAdmin) {
                roleBadge = (
                    <Badge
                        text={isOwner ? translate('common.owner') : translate('common.admin')}
                        textStyles={styles.textStrong}
                        badgeStyles={[styles.justifyContentCenter, StyleUtils.getMinimumWidth(60), styles.badgeBordered, isSelected && styles.activeItemBadge]}
                    />
                );
            }

            result.push({
                keyForList: String(accountID),
                accountID,
                isSelected,
                isDisabledCheckbox: !(isPolicyAdmin && accountID !== policy?.ownerAccountID && accountID !== session?.accountID),
                isDisabled: isPolicyAdmin && (policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(policyEmployee.errors)),
                text: formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                rightElement: roleBadge,
                icons: [
                    {
                        source: UserUtils.getAvatar(details.avatar, accountID),
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
        result = result.sort((a, b) => (a.text ?? '').toLowerCase().localeCompare((b.text ?? '').toLowerCase()));
        return result;
    }, [
        StyleUtils,
        currentUserLogin,
        formatPhoneNumber,
        invitedPrimaryToSecondaryLogins,
        isDeletedPolicyEmployee,
        isPolicyAdmin,
        personalDetails,
        policy?.owner,
        policy?.ownerAccountID,
        policy?.employeeList,
        policyMemberEmailsToAccountIDs,
        policyOwner,
        selectedEmployees,
        session?.accountID,
        styles.activeItemBadge,
        styles.badgeBordered,
        styles.justifyContentCenter,
        styles.textStrong,
        translate,
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
        selectionListRef.current?.scrollAndHighlightItem?.(invitedEmails, 1500);
        Policy.setWorkspaceInviteMembersDraft(route.params.policyID, {});
    }, [invitedEmailsToAccountIDsDraft, route.params.policyID, isFocused, accountIDs, prevAccountIDs]);

    const getHeaderMessage = () => {
        if (isOfflineAndNoMemberDataAvailable) {
            return translate('workspace.common.mustBeOnlineToViewMembers');
        }

        return !isLoading && isEmptyObject(policy?.employeeList) ? translate('workspace.common.memberNotFound') : '';
    };

    const getHeaderContent = () => (
        <>
            <Text style={[styles.pl5, styles.mb4, styles.mt3, styles.textSupporting]}>{translate('workspace.people.membersListTitle')}</Text>
            {!isEmptyObject(invitedPrimaryToSecondaryLogins) && (
                <MessagesRow
                    type="success"
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    messages={{0: 'workspace.people.addedWithPrimary'}}
                    containerStyles={[styles.pb5, styles.ph5]}
                    onClose={() => Policy.dismissAddedWithPrimaryLoginMessages(policyID)}
                />
            )}
        </>
    );

    const getCustomListHeader = () => {
        const header = (
            <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween]}>
                <View>
                    <Text style={[styles.searchInputStyle, isPolicyAdmin ? styles.ml3 : styles.ml0]}>{translate('common.member')}</Text>
                </View>
                <View style={[StyleUtils.getMinimumWidth(60)]}>
                    <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('common.role')}</Text>
                </View>
            </View>
        );
        if (isPolicyAdmin) {
            return header;
        }
        return <View style={[styles.peopleRow, styles.userSelectNone, styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
    };

    const changeUserRole = (role: typeof CONST.POLICY.ROLE.ADMIN | typeof CONST.POLICY.ROLE.USER) => {
        if (!isEmptyObject(errors)) {
            return;
        }

        const accountIDsToUpdate = selectedEmployees.filter((id) => policy?.employeeList?.[policyMemberEmailsToAccountIDs[id]]?.role !== role);

        Policy.updateWorkspaceMembersRole(route.params.policyID, accountIDsToUpdate, role);
        setSelectedEmployees([]);
    };

    const getBulkActionsButtonOptions = () => {
        const options: Array<DropdownOption<WorkspaceMemberBulkActionType>> = [
            {
                text: translate('workspace.people.removeMembersTitle'),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: Expensicons.RemoveMembers,
                onSelected: askForConfirmationToRemove,
            },
        ];

        if (PolicyUtils.isPaidGroupPolicy(policy)) {
            if (selectedEmployees.find((employeeEmail) => policy?.employeeList?.[policyMemberEmailsToAccountIDs[employeeEmail]]?.role === CONST.POLICY.ROLE.ADMIN)) {
                options.push({
                    text: translate('workspace.people.makeMember'),
                    value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_MEMBER,
                    icon: Expensicons.User,
                    onSelected: () => changeUserRole(CONST.POLICY.ROLE.USER),
                });
            }

            if (selectedEmployees.find((employeeEmail) => policy?.employeeList?.[policyMemberEmailsToAccountIDs[employeeEmail]]?.role === CONST.POLICY.ROLE.USER)) {
                options.push({
                    text: translate('workspace.people.makeAdmin'),
                    value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_ADMIN,
                    icon: Expensicons.MakeAdmin,
                    onSelected: () => changeUserRole(CONST.POLICY.ROLE.ADMIN),
                });
            }
        }
        return options;
    };

    const getHeaderButtons = () => {
        if (!isPolicyAdmin) {
            return null;
        }
        return (
            <View style={styles.w100}>
                {selectedEmployees.length > 0 ? (
                    <ButtonWithDropdownMenu<WorkspaceMemberBulkActionType>
                        shouldAlwaysShowDropdownMenu
                        pressOnEnter
                        customText={translate('workspace.common.selected', {selectedNumber: selectedEmployees.length})}
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                        onPress={() => null}
                        options={getBulkActionsButtonOptions()}
                        buttonRef={dropdownButtonRef}
                        style={[isSmallScreenWidth && styles.flexGrow1]}
                    />
                ) : (
                    <Button
                        medium
                        success
                        onPress={inviteUser}
                        text={translate('workspace.invite.member')}
                        icon={Expensicons.Plus}
                        innerStyles={[isSmallScreenWidth && styles.alignItemsCenter]}
                        style={[isSmallScreenWidth && styles.flexGrow1]}
                    />
                )}
            </View>
        );
    };

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.common.members')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
            headerContent={!isSmallScreenWidth && getHeaderButtons()}
            icon={Illustrations.ReceiptWrangler}
            testID={WorkspaceMembersPage.displayName}
            shouldShowLoading={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNonAdmin
        >
            {() => (
                <>
                    {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                    <ConfirmModal
                        danger
                        title={translate('workspace.people.removeMembersTitle')}
                        isVisible={removeMembersConfirmModalVisible}
                        onConfirm={removeUsers}
                        onCancel={() => setRemoveMembersConfirmModalVisible(false)}
                        prompt={translate('workspace.people.removeMembersPrompt')}
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

                    <View style={[styles.w100, styles.flex1]}>
                        <SelectionList
                            ref={selectionListRef}
                            canSelectMultiple={isPolicyAdmin}
                            sections={[{data, isDisabled: false}]}
                            ListItem={TableListItem}
                            disableKeyboardShortcuts={removeMembersConfirmModalVisible}
                            headerMessage={getHeaderMessage()}
                            headerContent={getHeaderContent()}
                            onSelectRow={openMemberDetails}
                            onCheckboxPress={(item) => toggleUser(item.accountID)}
                            onSelectAll={() => toggleAllUsers(data)}
                            onDismissError={dismissError}
                            showLoadingPlaceholder={isLoading}
                            showScrollIndicator
                            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                            textInputRef={textInputRef}
                            customListHeader={getCustomListHeader()}
                            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        />
                    </View>
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceMembersPage.displayName = 'WorkspaceMembersPage';

export default withCurrentUserPersonalDetails(
    withPolicyAndFullscreenLoading(
        withOnyx<WorkspaceMembersPageProps, WorkspaceMembersPageOnyxProps>({
            invitedEmailsToAccountIDsDraft: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`,
            },
            session: {
                key: ONYXKEYS.SESSION,
            },
        })(WorkspaceMembersPage),
    ),
);
