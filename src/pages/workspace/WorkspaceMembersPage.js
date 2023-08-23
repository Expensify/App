import React, {useCallback, useEffect, useState} from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import * as Policy from '../../libs/actions/Policy';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import Button from '../../components/Button';
import ROUTES from '../../ROUTES';
import ConfirmModal from '../../components/ConfirmModal';
import personalDetailsPropType from '../personalDetailsPropType';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import withPolicy, {policyDefaultProps, policyPropTypes} from './withPolicy';
import CONST from '../../CONST';
import {withNetwork} from '../../components/OnyxProvider';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import networkPropTypes from '../../components/networkPropTypes';
import * as UserUtils from '../../libs/UserUtils';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../components/withCurrentUserPersonalDetails';
import * as PolicyUtils from '../../libs/PolicyUtils';
import usePrevious from '../../hooks/usePrevious';
import Log from '../../libs/Log';
import * as PersonalDetailsUtils from '../../libs/PersonalDetailsUtils';
import SelectionList from '../../components/SelectionList';
import Text from '../../components/Text';

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
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
    network: networkPropTypes.isRequired,
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

function WorkspaceMembersPage(props) {
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchValue, setSearchValue] = useState('');
    const prevIsOffline = usePrevious(props.network.isOffline);

    /**
     * Get members for the current workspace
     */
    const getWorkspaceMembers = useCallback(() => {
        Policy.openWorkspaceMembersPage(props.route.params.policyID, _.keys(PolicyUtils.getMemberAccountIDsForWorkspace(props.policyMembers, props.personalDetails)));
    }, [props.route.params.policyID, props.policyMembers, props.personalDetails]);

    /**
     * Check if the current selection includes members that cannot be removed
     */
    const validateSelection = useCallback(() => {
        const newErrors = {};
        const ownerAccountID = _.first(PersonalDetailsUtils.getAccountIDsByLogins(props.policy.owner ? [props.policy.owner] : []));
        _.each(selectedEmployees, (member) => {
            if (member !== ownerAccountID && member !== props.session.accountID) {
                return;
            }
            newErrors[member] = props.translate('workspace.people.error.cannotRemove');
        });
        setErrors(newErrors);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEmployees, props.policy.owner, props.session.accountID]);

    useEffect(() => {
        getWorkspaceMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        validateSelection();
    }, [props.preferredLocale, validateSelection]);

    useEffect(() => {
        setSelectedEmployees((prevSelected) =>
            _.intersection(
                prevSelected,
                _.map(_.values(PolicyUtils.getMemberAccountIDsForWorkspace(props.policyMembers, props.personalDetails)), (accountID) => Number(accountID)),
            ),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.policyMembers]);

    useEffect(() => {
        const isReconnecting = prevIsOffline && !props.network.isOffline;
        if (!isReconnecting) {
            return;
        }
        getWorkspaceMembers();
    }, [props.network.isOffline, prevIsOffline, getWorkspaceMembers]);

    /**
     * Open the modal to invite a user
     */
    const inviteUser = () => {
        setSearchValue('');
        Navigation.navigate(ROUTES.getWorkspaceInviteRoute(props.route.params.policyID));
    };

    /**
     * Remove selected users from the workspace
     */
    const removeUsers = () => {
        if (!_.isEmpty(errors)) {
            return;
        }

        // Remove the admin from the list
        const accountIDsToRemove = _.without(selectedEmployees, props.session.accountID);

        Policy.removeMembers(accountIDsToRemove, props.route.params.policyID);
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
     * @param {Object} memberList
     */
    const toggleAllUsers = (memberList) => {
        const enabledAccounts = _.filter(memberList, (member) => !member.isDisabled);
        const everyoneSelected = _.every(enabledAccounts, (member) => _.contains(selectedEmployees, Number(member.keyForList)));

        if (everyoneSelected) {
            setSelectedEmployees([]);
        } else {
            const everyAccountId = _.map(enabledAccounts, (member) => Number(member.keyForList));
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
            if (_.contains(selectedEmployees, Number(accountID))) {
                removeUser(Number(accountID));
            } else {
                addUser(Number(accountID));
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
                Policy.clearDeleteMemberError(props.route.params.policyID, item.accountID);
            } else {
                Policy.clearAddMemberError(props.route.params.policyID, item.accountID);
            }
        },
        [props.route.params.policyID],
    );

    /**
     * Check if the policy member is deleted from the workspace
     *
     * @param {Object} policyMember
     * @returns {Boolean}
     */
    const isDeletedPolicyMember = (policyMember) => !props.network.isOffline && policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && _.isEmpty(policyMember.errors);
    const policyOwner = lodashGet(props.policy, 'owner');
    const currentUserLogin = lodashGet(props.currentUserPersonalDetails, 'login');
    const policyID = lodashGet(props.route, 'params.policyID');
    const policyName = lodashGet(props.policy, 'name');

    const getMemberOptions = () => {
        let result = [];

        _.each(props.policyMembers, (policyMember, accountID) => {
            if (isDeletedPolicyMember(policyMember)) {
                return;
            }

            const details = props.personalDetails[accountID];

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
            if (PolicyUtils.isExpensifyTeam(details.login || details.displayName)) {
                if (policyOwner && currentUserLogin && !PolicyUtils.isExpensifyTeam(policyOwner) && !PolicyUtils.isExpensifyTeam(currentUserLogin)) {
                    return;
                }
            }

            const isAdmin = props.session.email === details.login || policyMember.role === CONST.POLICY.ROLE.ADMIN;

            result.push({
                keyForList: accountID,
                isSelected: _.contains(selectedEmployees, Number(accountID)),
                isDisabled: accountID === props.session.accountID || details.login === props.policy.owner || policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                text: props.formatPhoneNumber(details.displayName),
                alternateText: props.formatPhoneNumber(details.login),
                rightElement: isAdmin ? (
                    <View style={[styles.badge, styles.peopleBadge]}>
                        <Text style={styles.peopleBadgeText}>{props.translate('common.admin')}</Text>
                    </View>
                ) : null,
                avatar: {
                    source: UserUtils.getAvatar(details.avatar, accountID),
                    name: details.login,
                    type: CONST.ICON_TYPE_AVATAR,
                },
                errors: policyMember.errors,
                pendingAction: policyMember.pendingAction,
            });
        });

        result = _.sortBy(result, (value) => value.text.toLowerCase());

        return result;
    };

    const data = getMemberOptions();
    const headerMessage = searchValue.trim() && !data.length ? props.translate('workspace.common.memberNotFound') : '';

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
        >
            <FullPageNotFoundView
                shouldShow={(_.isEmpty(props.policy) || !PolicyUtils.isPolicyAdmin(props.policy)) && !props.isLoadingReportData}
                subtitleKey={_.isEmpty(props.policy) ? undefined : 'workspace.common.notAuthorized'}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
            >
                <HeaderWithBackButton
                    title={props.translate('workspace.common.members')}
                    subtitle={policyName}
                    onBackButtonPress={() => {
                        setSearchValue('');
                        Navigation.goBack(ROUTES.getWorkspaceInitialRoute(policyID));
                    }}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                />
                <ConfirmModal
                    danger
                    title={props.translate('workspace.people.removeMembersTitle')}
                    isVisible={removeMembersConfirmModalVisible}
                    onConfirm={removeUsers}
                    onCancel={() => setRemoveMembersConfirmModalVisible(false)}
                    prompt={props.translate('workspace.people.removeMembersPrompt')}
                    confirmText={props.translate('common.remove')}
                    cancelText={props.translate('common.cancel')}
                />
                <View style={[styles.w100, styles.flex1]}>
                    <View style={[styles.w100, styles.flexRow, styles.pt3, styles.ph5]}>
                        <Button
                            medium
                            success
                            text={props.translate('common.invite')}
                            onPress={inviteUser}
                        />
                        <Button
                            medium
                            danger
                            style={[styles.ml2]}
                            isDisabled={selectedEmployees.length === 0}
                            text={props.translate('common.remove')}
                            onPress={askForConfirmationToRemove}
                        />
                    </View>
                    <View style={[styles.w100, styles.mt4, styles.flex1]}>
                        <SelectionList
                            canSelectMultiple
                            sections={[{data, indexOffset: 0, isDisabled: false}]}
                            textInputLabel={props.translate('optionsSelector.findMember')}
                            textInputValue={searchValue}
                            onChangeText={setSearchValue}
                            headerMessage={headerMessage}
                            onSelectRow={(item) => toggleUser(item.keyForList)}
                            onSelectAll={() => toggleAllUsers(data)}
                            onDismissError={dismissError}
                            showLoadingPlaceholder={!OptionsListUtils.isPersonalDetailsReady(props.personalDetails) || _.isEmpty(props.policyMembers)}
                            initiallyFocusedOptionKey={lodashGet(
                                _.find(data, (item) => !item.isDisabled),
                                'keyForList',
                                undefined,
                            )}
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
    withLocalize,
    withWindowDimensions,
    withPolicy,
    withNetwork(),
    withOnyx({
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
    withCurrentUserPersonalDetails,
)(WorkspaceMembersPage);
