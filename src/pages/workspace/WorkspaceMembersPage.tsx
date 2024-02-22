import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import lodashIsEqual from 'lodash/isEqual';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MessagesRow from '@components/MessagesRow';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as UserUtils from '@libs/UserUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, PolicyMember, PolicyMembers, Session} from '@src/types/onyx';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import SearchInputManager from './SearchInputManager';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceMembersPageOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type WorkspaceMembersPageProps = WithPolicyAndFullscreenLoadingProps &
    WithCurrentUserPersonalDetailsProps &
    WorkspaceMembersPageOnyxProps &
    StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS>;

/**
 * Inverts an object, equivalent of _.invert
 */
function invertObject(object: Record<string, string>): Record<string, string> {
    const invertedEntries = Object.entries(object).map(([key, value]) => [value, key]);
    const inverted: Record<string, string> = Object.fromEntries(invertedEntries);
    return inverted;
}

type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};

function WorkspaceMembersPage({policyMembers, personalDetails, route, policy, session, currentUserPersonalDetails, isLoadingReportData = true}: WorkspaceMembersPageProps) {
    const styles = useThemeStyles();
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchValue, setSearchValue] = useState('');
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const accountIDs = useMemo(() => Object.keys(policyMembers ?? {}).map((accountID) => Number(accountID)), [policyMembers]);
    const prevAccountIDs = usePrevious(accountIDs);
    const textInputRef = useRef<TextInput>(null);
    const isOfflineAndNoMemberDataAvailable = isEmptyObject(policyMembers) && isOffline;
    const prevPersonalDetails = usePrevious(personalDetails);
    const {translate, formatPhoneNumber, preferredLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const isFocusedScreen = useIsFocused();

    useEffect(() => {
        setSearchValue(SearchInputManager.searchInput);
    }, [isFocusedScreen]);

    useEffect(
        () => () => {
            SearchInputManager.searchInput = '';
        },
        [],
    );

    /**
     * Get filtered personalDetails list with current policyMembers
     */
    const filterPersonalDetails = (members: OnyxEntry<PolicyMembers>, details: OnyxEntry<PersonalDetailsList>): PersonalDetailsList =>
        Object.keys(members ?? {}).reduce((result, key) => {
            if (details?.[key]) {
                return {
                    ...result,
                    [key]: details[key],
                };
            }
            return result;
        }, {});

    /**
     * Get members for the current workspace
     */
    const getWorkspaceMembers = useCallback(() => {
        Policy.openWorkspaceMembersPage(route.params.policyID, Object.keys(PolicyUtils.getMemberAccountIDsForWorkspace(policyMembers, personalDetails)));
    }, [route.params.policyID, policyMembers, personalDetails]);

    /**
     * Check if the current selection includes members that cannot be removed
     */
    const validateSelection = useCallback(() => {
        const newErrors: Errors = {};
        const ownerAccountID = PersonalDetailsUtils.getAccountIDsByLogins(policy?.owner ? [policy.owner] : [])[0];
        selectedEmployees.forEach((member) => {
            if (member !== ownerAccountID && member !== session?.accountID) {
                return;
            }
            newErrors[member] = translate('workspace.people.error.cannotRemove');
        });
        setErrors(newErrors);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEmployees, policy?.owner, session?.accountID]);

    useEffect(() => {
        getWorkspaceMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        validateSelection();
    }, [preferredLocale, validateSelection]);

    useEffect(() => {
        if (removeMembersConfirmModalVisible && !lodashIsEqual(accountIDs, prevAccountIDs)) {
            setRemoveMembersConfirmModalVisible(false);
        }
        setSelectedEmployees((prevSelected) => {
            // Filter all personal details in order to use the elements needed for the current workspace
            const currentPersonalDetails = filterPersonalDetails(policyMembers, personalDetails);
            // We need to filter the previous selected employees by the new personal details, since unknown/new user id's change when transitioning from offline to online
            const prevSelectedElements = prevSelected.map((id) => {
                const prevItem = prevPersonalDetails?.id;
                const res = Object.values(currentPersonalDetails).find((item) => prevItem?.login === item?.login);
                return res?.accountID ?? id;
            });
            // This is an equivalent of the lodash intersection function. The reduce method below is used to filter the items that exist in both arrays.
            return [prevSelectedElements, Object.values(PolicyUtils.getMemberAccountIDsForWorkspace(policyMembers, personalDetails))].reduce((prev, members) =>
                prev.filter((item) => members.includes(item)),
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policyMembers]);

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
        setSearchValue('');
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
        const enabledAccounts = memberList.filter((member) => !member.isDisabled);
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
    const isDeletedPolicyMember = (policyMember: PolicyMember): boolean =>
        !isOffline && policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyMember.errors);
    const policyOwner = policy?.owner;
    const currentUserLogin = currentUserPersonalDetails.login;
    const policyID = route.params.policyID;

    const invitedPrimaryToSecondaryLogins = invertObject(policy?.primaryLoginsInvited ?? {});

    const getUsers = (): MemberOption[] => {
        let result: MemberOption[] = [];

        Object.entries(policyMembers ?? {}).forEach(([accountIDKey, policyMember]) => {
            const accountID = Number(accountIDKey);
            if (isDeletedPolicyMember(policyMember)) {
                return;
            }

            const details = personalDetails?.[accountID];

            if (!details) {
                Log.hmmm(`[WorkspaceMembersPage] no personal details found for policy member with accountID: ${accountID}`);
                return;
            }

            // If search value is provided, filter out members that don't match the search value
            if (searchValue.trim()) {
                let memberDetails = '';
                if (details.login) {
                    memberDetails += ` ${details.login.toLowerCase()}`;
                }
                if (details.firstName) {
                    memberDetails += ` ${details.firstName.toLowerCase()}`;
                }
                if (details.lastName) {
                    memberDetails += ` ${details.lastName.toLowerCase()}`;
                }
                if (details.displayName) {
                    memberDetails += ` ${details.displayName.toLowerCase()}`;
                }
                if (details.phoneNumber) {
                    memberDetails += ` ${details.phoneNumber.toLowerCase()}`;
                }

                if (!OptionsListUtils.isSearchStringMatch(searchValue.trim(), memberDetails)) {
                    return;
                }
            }

            // If this policy is owned by Expensify then show all support (expensify.com or team.expensify.com) emails
            // We don't want to show guides as policy members unless the user is a guide. Some customers get confused when they
            // see random people added to their policy, but guides having access to the policies help set them up.
            if (PolicyUtils.isExpensifyTeam(details?.login ?? details?.displayName)) {
                if (policyOwner && currentUserLogin && !PolicyUtils.isExpensifyTeam(policyOwner) && !PolicyUtils.isExpensifyTeam(currentUserLogin)) {
                    return;
                }
            }

            const isAdmin = session?.email === details.login || policyMember.role === CONST.POLICY.ROLE.ADMIN;

            result.push({
                keyForList: accountIDKey,
                accountID,
                isSelected: selectedEmployees.includes(accountID),
                isDisabled:
                    accountID === session?.accountID ||
                    details.login === policy?.owner ||
                    policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                    !isEmptyObject(policyMember.errors),
                text: formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                rightElement: isAdmin ? (
                    <View style={[styles.badge, styles.peopleBadge]}>
                        <Text style={styles.peopleBadgeText}>{translate('common.admin')}</Text>
                    </View>
                ) : undefined,
                icons: [
                    {
                        source: UserUtils.getAvatar(details.avatar, accountID),
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: policyMember.errors,
                pendingAction: policyMember.pendingAction,

                // Note which secondary login was used to invite this primary login
                invitedSecondaryLogin: details?.login ? invitedPrimaryToSecondaryLogins[details.login] ?? '' : '',
            });
        });

        result = result.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));

        return result;
    };
    const data = getUsers();

    const getHeaderMessage = () => {
        if (isOfflineAndNoMemberDataAvailable) {
            return translate('workspace.common.mustBeOnlineToViewMembers');
        }
        return searchValue.trim() && !data.length ? translate('workspace.common.memberNotFound') : '';
    };

    const getHeaderContent = () => {
        if (isEmptyObject(invitedPrimaryToSecondaryLogins)) {
            return null;
        }
        return (
            <MessagesRow
                type="success"
                // eslint-disable-next-line @typescript-eslint/naming-convention
                messages={{'0': 'workspace.people.addedWithPrimary'}}
                containerStyles={[styles.pb5, styles.ph5]}
                onClose={() => Policy.dismissAddedWithPrimaryLoginMessages(policyID)}
            />
        );
    };

    const getHeaderButtons = () => (
        <View style={[styles.w100, styles.flexRow, shouldUseNarrowLayout && styles.mb3]}>
            <Button
                medium
                success
                onPress={inviteUser}
                text={translate('workspace.invite.member')}
                icon={Expensicons.Plus}
                iconStyles={{transform: [{scale: 0.6}]}}
                innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                style={[shouldUseNarrowLayout && styles.flexGrow1]}
            />
            <Button
                medium
                danger
                style={[styles.ml2, shouldUseNarrowLayout && styles.w50]}
                isDisabled={selectedEmployees.length === 0}
                text={translate('common.remove')}
                onPress={askForConfirmationToRemove}
            />
        </View>
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={WorkspaceMembersPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                shouldShow={(isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy)}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.members')}
                    icon={Illustrations.ReceiptWrangler}
                    onBackButtonPress={() => {
                        setSearchValue('');
                        Navigation.goBack();
                    }}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                >
                    {!shouldUseNarrowLayout && getHeaderButtons()}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
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
                        canSelectMultiple
                        sections={[{data, indexOffset: 0, isDisabled: false}]}
                        ListItem={UserListItem}
                        textInputLabel={translate('optionsSelector.findMember')}
                        textInputValue={searchValue}
                        onChangeText={(value) => {
                            SearchInputManager.searchInput = value;
                            setSearchValue(value);
                        }}
                        disableKeyboardShortcuts={removeMembersConfirmModalVisible}
                        headerMessage={getHeaderMessage()}
                        headerContent={getHeaderContent()}
                        onSelectRow={(item) => toggleUser(item.accountID)}
                        onSelectAll={() => toggleAllUsers(data)}
                        onDismissError={dismissError}
                        showLoadingPlaceholder={!isOfflineAndNoMemberDataAvailable && (!OptionsListUtils.isPersonalDetailsReady(personalDetails) || isEmptyObject(policyMembers))}
                        showScrollIndicator
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        ref={textInputRef}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceMembersPage.displayName = 'WorkspaceMembersPage';

export default withCurrentUserPersonalDetails(
    withPolicyAndFullscreenLoading(
        withOnyx<WorkspaceMembersPageProps, WorkspaceMembersPageOnyxProps>({
            personalDetails: {
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            },
            session: {
                key: ONYXKEYS.SESSION,
            },
        })(WorkspaceMembersPage),
    ),
);
