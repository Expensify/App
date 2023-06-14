import React, {useState, useEffect, useCallback} from 'react';
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
import Checkbox from '../../components/Checkbox';
import Text from '../../components/Text';
import ROUTES from '../../ROUTES';
import ConfirmModal from '../../components/ConfirmModal';
import personalDetailsPropType from '../personalDetailsPropType';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import OptionRow from '../../components/OptionRow';
import {policyPropTypes, policyDefaultProps} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import CONST from '../../CONST';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import {withNetwork} from '../../components/OnyxProvider';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import networkPropTypes from '../../components/networkPropTypes';
import * as UserUtils from '../../libs/UserUtils';
import FormHelpMessage from '../../components/FormHelpMessage';
import TextInput from '../../components/TextInput';
import KeyboardDismissingFlatList from '../../components/KeyboardDismissingFlatList';
import withCurrentUserPersonalDetails from '../../components/withCurrentUserPersonalDetails';
import * as PolicyUtils from '../../libs/PolicyUtils';
import PressableWithFeedback from '../../components/Pressable/PressableWithFeedback';
import usePrevious from '../../hooks/usePrevious';

const propTypes = {
    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType,

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
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    ...policyPropTypes,
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
    network: networkPropTypes.isRequired,
};

const defaultProps = {
    personalDetails: {},
    session: {
        email: null,
    },
    ...policyDefaultProps,
};

function WorkspaceMembersPage(props) {
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [removeMembersConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchValue, setSearchValue] = useState('');
    const prevIsOffline = usePrevious(props.network.isOffline);

    /**
     * Get members for the current workspace
     */
    const getWorkspaceMembers = useCallback(() => {
        /**
         * We filter clientMemberEmails to only pass members without errors
         * Otherwise, the members with errors would immediately be removed before the user has a chance to read the error
         */
        const clientMemberEmails = _.keys(_.pick(props.policyMemberList, (member) => _.isEmpty(member.errors)));
        Policy.openWorkspaceMembersPage(props.route.params.policyID, clientMemberEmails);
    }, [props.route.params.policyID, props.policyMemberList]);

    /**
     * Check if the current selection includes members that cannot be removed
     */
    const validateSelection = useCallback(() => {
        const newErrors = {};
        _.each(selectedEmployees, (member) => {
            if (member !== props.policy.owner && member !== props.session.email) {
                return;
            }
            newErrors[member] = props.translate('workspace.people.error.cannotRemove');
        });
        setErrors(newErrors);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEmployees]);

    useEffect(() => {
        getWorkspaceMembers();
    }, []);

    useEffect(() => {
        validateSelection();
    }, [props.preferredLocale, validateSelection]);

    useEffect(() => {
        setSelectedEmployees((prevSelected) => _.intersection(prevSelected, _.keys(props.policyMemberList)));
    }, [props.policyMemberList]);

    useEffect(() => {
        const isReconnecting = prevIsOffline && !props.network.isOffline;
        if (!isReconnecting) {
            return;
        }
        getWorkspaceMembers();
    }, [props.network.isOffline, prevIsOffline, getWorkspaceMembers]);

    /**
     * This function will iterate through the details of each policy member to check if the
     * search string matches with any detail and return that filter.
     * @param {Array} policyMembersPersonalDetails - This is the list of policy members
     * @param {*} search - This is the string that the user has entered
     * @returns {Array} - The list of policy members that have anything similar to the searchValue
     */
    const getMemberOptions = (policyMembersPersonalDetails, search) => {
        // If no search value, we return all members.
        if (_.isEmpty(search)) {
            return policyMembersPersonalDetails;
        }

        // We will filter through each policy member details to determine if they should be shown
        return _.filter(policyMembersPersonalDetails, (member) => {
            let memberDetails = '';
            if (member.login) {
                memberDetails += ` ${member.login.toLowerCase()}`;
            }
            if (member.firstName) {
                memberDetails += ` ${member.firstName.toLowerCase()}`;
            }
            if (member.lastName) {
                memberDetails += ` ${member.lastName.toLowerCase()}`;
            }
            if (member.displayName) {
                memberDetails += ` ${member.displayName.toLowerCase()}`;
            }
            if (member.phoneNumber) {
                memberDetails += ` ${member.phoneNumber.toLowerCase()}`;
            }
            return OptionsListUtils.isSearchStringMatch(search, memberDetails);
        });
    };

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
        const membersToRemove = _.without(selectedEmployees, props.session.email);
        Policy.removeMembers(membersToRemove, props.route.params.policyID);
        setSelectedEmployees([]);
        setConfirmModalVisible(false);
    };

    /**
     * Show the modal to confirm removal of the selected members
     */
    const askForConfirmationToRemove = () => {
        if (!_.isEmpty(errors)) {
            return;
        }
        setConfirmModalVisible(true);
    };

    /**
     * Add or remove all users passed from the selectedEmployees list
     * @param {Object} memberList
     */
    const toggleAllUsers = (memberList) => {
        const emailList = _.keys(memberList);
        setSelectedEmployees((prevSelected) => (!_.every(emailList, (memberEmail) => _.contains(prevSelected, memberEmail)) ? emailList : []));
        validateSelection();
    };

    /**
     * Add user from the selectedEmployees list
     *
     * @param {String} login
     */
    const addUser = useCallback(
        (login) => {
            setSelectedEmployees((prevSelected) => [...prevSelected, login]);
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
        (login) => {
            setSelectedEmployees((prevSelected) => _.without(prevSelected, login));
            validateSelection();
        },
        [validateSelection],
    );

    /**
     * Toggle user from the selectedEmployees list
     *
     * @param {String} login
     * @param {String} pendingAction
     *
     */
    const toggleUser = useCallback(
        (login, pendingAction) => {
            if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }

            // Add or remove the user if the checkbox is enabled
            if (_.contains(selectedEmployees, login)) {
                removeUser(login);
            } else {
                addUser(login);
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
            if (item.pendingAction === 'delete') {
                Policy.clearDeleteMemberError(props.route.params.policyID, item.login);
            } else {
                Policy.clearAddMemberError(props.route.params.policyID, item.login);
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
    const isDeletedPolicyMember = (policyMember) => !props.network.isOffline && policyMember.pendingAction === 'delete' && _.isEmpty(policyMember.errors);

    /**
     * Render a workspace member component
     * 
     * @param {Object} args
     * @param {Object} args.item
     * @param {Number} args.index
     *
     * @returns {React.Component}
     */
    const renderItem = useCallback(
        ({item}) => {
            const hasError = !_.isEmpty(item.errors) || errors[item.login];
            const isChecked = _.contains(selectedEmployees, item.login);
            return (
                <OfflineWithFeedback
                    onClose={() => dismissError(item)}
                    pendingAction={item.pendingAction}
                    errors={item.errors}
                >
                    <PressableWithFeedback
                        style={[styles.peopleRow, (_.isEmpty(item.errors) || errors[item.login]) && styles.peopleRowBorderBottom, hasError && styles.borderColorDanger]}
                        onPress={() => toggleUser(item.login, item.pendingAction)}
                        accessibilityRole="checkbox"
                        accessibilityState={{
                            checked: isChecked,
                        }}
                        accessibilityLabel={props.formatPhoneNumber(item.displayName)}
                        // disable hover dimming
                        hoverDimmingValue={1}
                        pressDimmingValue={0.7}
                    >
                        <Checkbox
                            isChecked={isChecked}
                            onPress={() => toggleUser(item.login, item.pendingAction)}
                        />
                        <View style={styles.flex1}>
                            <OptionRow
                                boldStyle
                                option={{
                                    text: props.formatPhoneNumber(item.displayName),
                                    alternateText: props.formatPhoneNumber(item.login),
                                    participantsList: [item],
                                    icons: [
                                        {
                                            source: UserUtils.getAvatar(item.avatar, item.login),
                                            name: item.login,
                                            type: CONST.ICON_TYPE_AVATAR,
                                        },
                                    ],
                                    keyForList: item.login,
                                }}
                                onSelectRow={() => toggleUser(item.login, item.pendingAction)}
                            />
                        </View>
                        {(props.session.email === item.login || item.role === 'admin') && (
                            <View style={[styles.badge, styles.peopleBadge]}>
                                <Text style={[styles.peopleBadgeText]}>{props.translate('common.admin')}</Text>
                            </View>
                        )}
                    </PressableWithFeedback>
                    {!_.isEmpty(errors[item.login]) && (
                        <FormHelpMessage
                            isError
                            message={errors[item.login]}
                        />
                    )}
                </OfflineWithFeedback>
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedEmployees, errors, props.session.email, dismissError, toggleUser],
    );

    const policyMemberList = lodashGet(props, 'policyMemberList', {});
    const policyOwner = lodashGet(props.policy, 'owner');
    const currentUserLogin = lodashGet(props.currentUserPersonalDetails, 'login');
    const removableMembers = {};
    let data = [];
    _.each(policyMemberList, (policyMember, email) => {
        if (isDeletedPolicyMember(policyMember)) {
            return;
        }
        const details = lodashGet(props.personalDetails, email, {displayName: email, login: email});
        data.push({
            ...policyMember,
            ...details,
        });
    });
    data = _.sortBy(data, (value) => value.displayName.toLowerCase());
    data = getMemberOptions(data, searchValue.trim().toLowerCase());

    // If this policy is owned by Expensify then show all support (expensify.com or team.expensify.com) emails
    // We don't want to show guides as policy members unless the user is a guide. Some customers get confused when they
    // see random people added to their policy, but guides having access to the policies help set them up.
    if (policyOwner && currentUserLogin && !PolicyUtils.isExpensifyTeam(policyOwner) && !PolicyUtils.isExpensifyTeam(currentUserLogin)) {
        data = _.reject(data, (member) => PolicyUtils.isExpensifyTeam(member.login));
    }

    _.each(data, (member) => {
        if (member.login === props.session.email || member.login === props.policy.owner || member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }
        removableMembers[member.login] = member;
    });
    const policyID = lodashGet(props.route, 'params.policyID');
    const policyName = lodashGet(props.policy, 'name');

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView
                    shouldShow={_.isEmpty(props.policy)}
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
                        onCancel={() => setConfirmModalVisible(false)}
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
                        <View style={[styles.w100, styles.pv3, styles.ph5]}>
                            <TextInput
                                value={searchValue}
                                onChangeText={setSearchValue}
                                label={props.translate('optionsSelector.findMember')}
                            />
                        </View>
                        {data.length > 0 ? (
                            <View style={[styles.w100, styles.mt4, styles.flex1]}>
                                <View style={[styles.peopleRow, styles.ph5, styles.pb3]}>
                                    <Checkbox
                                        isChecked={!_.isEmpty(removableMembers) && _.every(_.keys(removableMembers), (memberEmail) => _.contains(selectedEmployees, memberEmail))}
                                        onPress={() => toggleAllUsers(removableMembers)}
                                    />
                                    <View style={[styles.flex1]}>
                                        <Text style={[styles.textStrong, styles.ph5]}>{props.translate('workspace.people.selectAll')}</Text>
                                    </View>
                                </View>
                                <KeyboardDismissingFlatList
                                    renderItem={renderItem}
                                    data={data}
                                    keyExtractor={(item) => item.login}
                                    showsVerticalScrollIndicator
                                    style={[styles.ph5, styles.pb5]}
                                    contentContainerStyle={safeAreaPaddingBottomStyle}
                                    keyboardShouldPersistTaps="handled"
                                />
                            </View>
                        ) : (
                            <View style={[styles.ph5]}>
                                <Text style={[styles.textLabel, styles.colorMuted]}>{props.translate('workspace.common.memberNotFound')}</Text>
                            </View>
                        )}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

WorkspaceMembersPage.propTypes = propTypes;
WorkspaceMembersPage.defaultProps = defaultProps;
WorkspaceMembersPage.displayName = 'WorkspaceMembersPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withPolicyAndFullscreenLoading,
    withNetwork(),
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
    withCurrentUserPersonalDetails,
)(WorkspaceMembersPage);
