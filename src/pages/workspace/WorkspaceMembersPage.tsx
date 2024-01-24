import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MessagesRow from '@components/MessagesRow';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as UserUtils from '@libs/UserUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, PolicyMembers, Session} from '@src/types/onyx';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';
import SearchInputManager from './SearchInputManager';
import {policyDefaultProps, policyPropTypes} from './withPolicy';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

const propTypes = {
    /** All personal details asssociated with user */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/members */
            policyID: PropTypes.string,
        }),
    }).isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),

    isLoadingReportData: PropTypes.bool,
    ...policyPropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

type WorkspaceMembersPageOnyxProps = {
    personalDetails: OnyxEntry<PersonalDetailsList>;
    session: OnyxEntry<Session>;
    isLoadingReportData: OnyxEntry<boolean>;
};

type WorkspaceMembersPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    WithCurrentUserPersonalDetailsProps &
    WorkspaceMembersPageOnyxProps &
    StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS>;

type MemberOption = {
    keyForList: string;
    accountID: number;
    isSelected: boolean;
    isDisabled: boolean;
    text: string;
    alternateText: string;
    rightElement: React.ReactNode | null;
    icons: Icon[];
    errors?: Errors;
    pendingAction?: PendingAction;
    invitedSecondaryLogin?: string;
};

const defaultProps = {
    personalDetails: {},
    session: {
        accountID: 0,
    },
    isLoadingReportData: true,
    ...policyDefaultProps,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function WorkspaceMembersPage({policyMembers, personalDetails, route, policy, session, currentUserPersonalDetails, isLoadingReportData}: WorkspaceMembersPageProps) {
    const styles = useThemeStyles();
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchValue, setSearchValue] = useState('');
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const accountIDs = useMemo(() => Object.keys(policyMembers ?? {}).map((accountID) => Number(accountID)), [policyMembers]);
    const prevAccountIDs = usePrevious(accountIDs);
    const textInputRef = useRef<TextInput>(null);
    const isOfflineAndNoMemberDataAvailable = _.isEmpty(policyMembers) && isOffline;
    const prevPersonalDetails = usePrevious(personalDetails);
    const {translate, formatPhoneNumber, preferredLocale} = useLocalize();

    const isFocusedScreen = useIsFocused();

    useEffect(() => {
        setSearchValue(SearchInputManager.searchInput);
    }, [isFocusedScreen]);

    useEffect(() => {
        SearchInputManager.searchInput = '';
    }, []);

    /**
     * Get filtered personalDetails list with current policyMembers
     * @param policyMembers
     * @param personalDetails
     * @returns
     */
    const filterPersonalDetails = (members: OnyxEntry<PolicyMembers>, details: OnyxEntry<PersonalDetailsList>) =>
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
        const newErrors = {};
        const ownerAccountID = PersonalDetailsUtils.getAccountIDsByLogins(policy?.owner ? [policy.owner] : [])[0];
        _.each(selectedEmployees, (member) => {
            if (member !== ownerAccountID && member !== session.accountID) {
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
        if (removeMembersConfirmModalVisible && !_.isEqual(accountIDs, prevAccountIDs)) {
            setRemoveMembersConfirmModalVisible(false);
        }
        setSelectedEmployees((prevSelected) => {
            // Filter all personal details in order to use the elements needed for the current workspace
            const currentPersonalDetails = filterPersonalDetails(policyMembers, personalDetails);
            // We need to filter the previous selected employees by the new personal details, since unknown/new user id's change when transitioning from offline to online
            const prevSelectedElements = _.map(prevSelected, (id) => {
                const prevItem = lodashGet(prevPersonalDetails, id);
                const res = _.find(_.values(currentPersonalDetails), (item) => lodashGet(prevItem, 'login') === lodashGet(item, 'login'));
                return lodashGet(res, 'accountID', id);
            });
            return _.intersection(prevSelectedElements, _.values(PolicyUtils.getMemberAccountIDsForWorkspace(policyMembers, personalDetails)));
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
     */
    const removeUsers = () => {
        if (!_.isEmpty(errors)) {
            return;
        }

        // Remove the admin from the list
        const accountIDsToRemove = _.without(selectedEmployees, session.accountID);

        Policy.removeMembers(accountIDsToRemove, route.params.policyID);
        setSelectedEmployees([]);
        setRemoveMembersConfirmModalVisible(false);
    };

    /**
     * Show the modal to confirm removal of the selected members
     */
    const askForConfirmationToRemove = () => {
        if (!_.isEmpty(errors)) {
            return;
        }
        setRemoveMembersConfirmModalVisible(true);
    };

    /**
     * Add or remove all users passed from the selectedEmployees list
     * @param memberList
     */
    const toggleAllUsers = (memberList) => {
        const enabledAccounts = _.filter(memberList, (member) => !member.isDisabled);
        const everyoneSelected = _.every(enabledAccounts, (member) => _.contains(selectedEmployees, member.accountID));

        if (everyoneSelected) {
            setSelectedEmployees([]);
        } else {
            const everyAccountId = _.map(enabledAccounts, (member) => member.accountID);
            setSelectedEmployees(everyAccountId);
        }

        validateSelection();
    };

    /**
     * Add user from the selectedEmployees list
     *
     * @param {String} login
     */
    const addUser = useCallback(
        (accountID) => {
            setSelectedEmployees((prevSelected) => [...prevSelected, accountID]);
            validateSelection();
        },
        [validateSelection],
    );

    /**
     * Remove user from the selectedEmployees list
     *
     * @param {String} login
     */
    const removeUser = useCallback(
        (accountID) => {
            setSelectedEmployees((prevSelected) => _.without(prevSelected, accountID));
            validateSelection();
        },
        [validateSelection],
    );

    /**
     * Toggle user from the selectedEmployees list
     *
     * @param {String} accountID
     * @param {String} pendingAction
     *
     */
    const toggleUser = useCallback(
        (accountID, pendingAction) => {
            if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }

            // Add or remove the user if the checkbox is enabled
            if (_.contains(selectedEmployees, accountID)) {
                removeUser(accountID);
            } else {
                addUser(accountID);
            }
        },
        [selectedEmployees, addUser, removeUser],
    );

    /**
     * Dismisses the errors on one item
     *
     * @param {Object} item
     */
    const dismissError = useCallback(
        (item) => {
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
     *
     * @param policyMember
     * @returns
     */
    const isDeletedPolicyMember = (policyMember) => !isOffline && policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && _.isEmpty(policyMember.errors);
    const policyOwner = lodashGet(policy, 'owner');
    const currentUserLogin = lodashGet(currentUserPersonalDetails, 'login');
    const policyID = lodashGet(route, 'params.policyID');
    const policyName = lodashGet(policy, 'name');
    const invitedPrimaryToSecondaryLogins = _.invert(policy?.primaryLoginsInvited);

    const getMemberOptions = () => {
        let result: MemberOption[] = [];

        console.log('*** POLICY MEMBERS ***', policyMembers);

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
            if (PolicyUtils.isExpensifyTeam(details?.login ?? details?.displayName ?? '')) {
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
                    Object.keys(policyMember.errors ?? {}).length > 0,
                text: formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                rightElement: isAdmin ? (
                    <View style={[styles.badge, styles.peopleBadge]}>
                        <Text style={styles.peopleBadgeText}>{translate('common.admin')}</Text>
                    </View>
                ) : null,
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

        result = result.sort((a, b) => a.text.localeCompare(b.text.toLowerCase()));

        return result;
    };
    const data = getMemberOptions();

    const getHeaderMessage = () => {
        if (isOfflineAndNoMemberDataAvailable) {
            return translate('workspace.common.mustBeOnlineToViewMembers');
        }
        return searchValue.trim() && !data.length ? translate('workspace.common.memberNotFound') : '';
    };

    const getHeaderContent = () => {
        if (_.isEmpty(invitedPrimaryToSecondaryLogins)) {
            return null;
        }
        return (
            <MessagesRow
                type="success"
                messages={{0: translate('workspace.people.addedWithPrimary')}}
                containerStyles={[styles.pb5, styles.ph5]}
                onClose={() => Policy.dismissAddedWithPrimaryLoginMessages(policyID)}
            />
        );
    };
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={WorkspaceMembersPage.displayName}
        >
            <FullPageNotFoundView
                shouldShow={(_.isEmpty(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy)}
                subtitleKey={_.isEmpty(policy) ? undefined : 'workspace.common.notAuthorized'}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.members')}
                    subtitle={policyName}
                    onBackButtonPress={() => {
                        setSearchValue('');
                        Navigation.goBack(ROUTES.WORKSPACE_INITIAL.getRoute(policyID));
                    }}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                />
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
                    <View style={[styles.w100, styles.flexRow, styles.pt3, styles.ph5]}>
                        <Button
                            medium
                            success
                            text={translate('common.invite')}
                            onPress={inviteUser}
                        />
                        <Button
                            medium
                            danger
                            style={[styles.ml2]}
                            isDisabled={selectedEmployees.length === 0}
                            text={translate('common.remove')}
                            onPress={askForConfirmationToRemove}
                        />
                    </View>
                    <View style={[styles.w100, styles.mt4, styles.flex1]}>
                        <SelectionList
                            // @ts-expect-error TODO: remove this once SelectionList (https://github.com/Expensify/App/issues/31981) is converted to TypeScript.
                            canSelectMultiple
                            sections={[{data, indexOffset: 0, isDisabled: false}]}
                            textInputLabel={translate('optionsSelector.findMember')}
                            textInputValue={searchValue}
                            // @ts-expect-error TODO: remove this once SelectionList (https://github.com/Expensify/App/issues/31981) is converted to TypeScript.
                            onChangeText={(value) => {
                                SearchInputManager.searchInput = value;
                                setSearchValue(value);
                            }}
                            disableKeyboardShortcuts={removeMembersConfirmModalVisible}
                            headerMessage={getHeaderMessage()}
                            headerContent={getHeaderContent()}
                            // @ts-expect-error TODO: remove this once SelectionList (https://github.com/Expensify/App/issues/31981) is converted to TypeScript.
                            onSelectRow={(item) => toggleUser(item.accountID)}
                            onSelectAll={() => toggleAllUsers(data)}
                            onDismissError={dismissError}
                            // @ts-expect-error TODO: remove this once SelectionList (https://github.com/Expensify/App/issues/31981) is converted to TypeScript.
                            showLoadingPlaceholder={!isOfflineAndNoMemberDataAvailable && (!OptionsListUtils.isPersonalDetailsReady(personalDetails) ?? !policyMembers)}
                            showScrollIndicator
                            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                            inputRef={textInputRef}
                        />
                    </View>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceMembersPage.propTypes = propTypes;
WorkspaceMembersPage.defaultProps = defaultProps;
WorkspaceMembersPage.displayName = 'WorkspaceMembersPage';

export default compose(
    withPolicyAndFullscreenLoading,
    withCurrentUserPersonalDetails,
    withOnyx<WorkspaceMembersPageProps, WorkspaceMembersPageOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
    }),
)(WorkspaceMembersPage);
