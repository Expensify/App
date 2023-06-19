import React from 'react';
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
import Log from '../../libs/Log';

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

class WorkspaceMembersPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedEmployees: [],
            isRemoveMembersConfirmModalVisible: false,
            errors: {},
            searchValue: '',
        };

        this.renderItem = this.renderItem.bind(this);
        this.updateSearchValue = this.updateSearchValue.bind(this);
        this.inviteUser = this.inviteUser.bind(this);
        this.addUser = this.addUser.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.askForConfirmationToRemove = this.askForConfirmationToRemove.bind(this);
        this.hideConfirmModal = this.hideConfirmModal.bind(this);
    }

    componentDidMount() {
        this.getWorkspaceMembers();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.preferredLocale !== this.props.preferredLocale) {
            this.validate();
        }

        if (prevProps.policyMembers !== this.props.policyMembers) {
            this.setState((prevState) => ({
                selectedEmployees: _.intersection(
                    prevState.selectedEmployees,
                    _.map(_.values(PolicyUtils.getClientPolicyMemberEmailsToAccountIDs(this.props.policyMembers, this.props.personalDetails)), (accountID) => Number(accountID)),
                ),
            }));
        }

        const isReconnecting = prevProps.network.isOffline && !this.props.network.isOffline;
        if (!isReconnecting) {
            return;
        }

        this.getWorkspaceMembers();
    }

    /**
     * Get members for the current workspace
     */
    getWorkspaceMembers() {
        Policy.openWorkspaceMembersPage(this.props.route.params.policyID, _.keys(PolicyUtils.getClientPolicyMemberEmailsToAccountIDs(this.props.policyMembers, this.props.personalDetails)));
    }

    /**
     * This function will iterate through the details of each policy member to check if the
     * search string matches with any detail and return that filter.
     * @param {Array} policyMembersPersonalDetails - This is the list of policy members
     * @param {*} searchValue - This is the string that the user has entered
     * @returns {Array} - The list of policy members that have anything similar to the searchValue
     */
    getMemberOptions(policyMembersPersonalDetails, searchValue) {
        // If no search value, we return all members.
        if (_.isEmpty(searchValue)) {
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
            return OptionsListUtils.isSearchStringMatch(searchValue, memberDetails);
        });
    }

    /**
     * @param {String} searchValue
     */
    updateSearchValue(searchValue = '') {
        this.setState({searchValue});
    }

    /**
     * Open the modal to invite a user
     */
    inviteUser() {
        this.updateSearchValue('');
        Navigation.navigate(ROUTES.getWorkspaceInviteRoute(this.props.route.params.policyID));
    }

    /**
     * Remove selected users from the workspace
     */
    removeUsers() {
        if (!_.isEmpty(this.state.errors)) {
            return;
        }

        // Remove the admin from the list
        const accountIDsToRemove = _.without(this.state.selectedEmployees, this.props.session.accountID);

        Policy.removeMembers(accountIDsToRemove, this.props.route.params.policyID);
        this.setState({
            selectedEmployees: [],
            isRemoveMembersConfirmModalVisible: false,
        });
    }

    /**
     * Show the modal to confirm removal of the selected members
     */
    askForConfirmationToRemove() {
        if (!_.isEmpty(this.state.errors)) {
            return;
        }

        this.setState({isRemoveMembersConfirmModalVisible: true});
    }

    /**
     * Hide the confirmation modal
     */
    hideConfirmModal() {
        this.setState({isRemoveMembersConfirmModalVisible: false});
    }

    /**
     * Add or remove all users passed from the selectedEmployees list
     * @param {Object} memberList
     */
    toggleAllUsers(memberList) {
        const accountIDList = _.map(_.keys(memberList), (memberAccountID) => Number(memberAccountID));
        this.setState(
            (prevState) => ({
                selectedEmployees: !_.every(accountIDList, (memberAccountID) => _.contains(prevState.selectedEmployees, memberAccountID)) ? accountIDList : [],
            }),
            () => this.validate(),
        );
    }

    /**
     * Toggle user from the selectedEmployees list
     *
     * @param {String} accountID
     * @param {String} pendingAction
     *
     */
    toggleUser(accountID, pendingAction) {
        if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        // Add or remove the user if the checkbox is enabled
        if (_.contains(this.state.selectedEmployees, Number(accountID))) {
            this.removeUser(Number(accountID));
        } else {
            this.addUser(Number(accountID));
        }
    }

    /**
     * Add user from the selectedEmployees list
     *
     * @param {Number} accountID
     */
    addUser(accountID) {
        this.setState(
            (prevState) => ({
                selectedEmployees: [...prevState.selectedEmployees, accountID],
            }),
            () => this.validate(),
        );
    }

    /**
     * Remove user from the selectedEmployees list
     *
     * @param {Number} accountID
     */
    removeUser(accountID) {
        this.setState(
            (prevState) => ({
                selectedEmployees: _.without(prevState.selectedEmployees, accountID),
            }),
            () => this.validate(),
        );
    }

    /**
     * Dismisses the errors on one item
     *
     * @param {Object} item
     */
    dismissError(item) {
        if (item.pendingAction === 'delete') {
            Policy.clearDeleteMemberError(this.props.route.params.policyID, item.accountID);
        } else {
            Policy.clearAddMemberError(this.props.route.params.policyID, item.accountID);
        }
    }

    validate() {
        const errors = {};
        _.each(this.state.selectedEmployees, (member) => {
            if (member !== this.props.policy.owner && member !== this.props.session.email) {
                return;
            }

            errors[member] = 'workspace.people.error.cannotRemove';
        });

        this.setState({errors});
    }

    /**
     * Check if the policy member is deleted from the workspace
     * @param {Object} policyMember
     * @returns {Boolean}
     */
    isDeletedPolicyMember(policyMember) {
        return !this.props.network.isOffline && policyMember.pendingAction === 'delete' && _.isEmpty(policyMember.errors);
    }

    /**
     * Do not move this or make it an anonymous function it is a method
     * so it will not be recreated each time we render an item
     *
     * See: https://reactnative.dev/docs/optimizing-flatlist-configuration#avoid-anonymous-function-on-renderitem
     *
     * @param {Object} args
     * @param {Object} args.item
     * @param {Number} args.index
     *
     * @returns {React.Component}
     */
    renderItem({item}) {
        const hasError = !_.isEmpty(item.errors) || this.state.errors[item.login];
        const isChecked = _.contains(this.state.selectedEmployees, Number(item.accountID));
        return (
            <OfflineWithFeedback
                onClose={() => this.dismissError(item)}
                pendingAction={item.pendingAction}
                errors={item.errors}
            >
                <PressableWithFeedback
                    style={[styles.peopleRow, (_.isEmpty(item.errors) || this.state.errors[item.login]) && styles.peopleRowBorderBottom, hasError && styles.borderColorDanger]}
                    onPress={() => this.toggleUser(item.accountID, item.pendingAction)}
                    accessibilityRole="checkbox"
                    accessibilityState={{
                        checked: isChecked,
                    }}
                    accessibilityLabel={this.props.formatPhoneNumber(item.displayName)}
                    // disable hover dimming
                    hoverDimmingValue={1}
                    pressDimmingValue={0.7}
                >
                    <Checkbox
                        isChecked={isChecked}
                        onPress={() => this.toggleUser(item.accountID, item.pendingAction)}
                    />
                    <View style={styles.flex1}>
                        <OptionRow
                            boldStyle
                            option={{
                                text: this.props.formatPhoneNumber(item.displayName),
                                alternateText: this.props.formatPhoneNumber(item.login),
                                participantsList: [item],
                                icons: [
                                    {
                                        source: UserUtils.getAvatar(item.avatar, item.accountID),
                                        name: item.login,
                                        type: CONST.ICON_TYPE_AVATAR,
                                    },
                                ],
                                keyForList: item.login,
                            }}
                            onSelectRow={() => this.toggleUser(item.accountID, item.pendingAction)}
                        />
                    </View>
                    {(this.props.session.email === item.login || item.role === 'admin') && (
                        <View style={[styles.badge, styles.peopleBadge]}>
                            <Text style={[styles.peopleBadgeText]}>{this.props.translate('common.admin')}</Text>
                        </View>
                    )}
                </PressableWithFeedback>
                {!_.isEmpty(this.state.errors[item.login]) && (
                    <FormHelpMessage
                        isError
                        message={this.state.errors[item.login]}
                    />
                )}
            </OfflineWithFeedback>
        );
    }

    render() {
        const policyOwner = lodashGet(this.props.policy, 'owner');
        const currentUserLogin = lodashGet(this.props.currentUserPersonalDetails, 'login');
        const removableMembers = {};
        let data = [];
        _.each(this.props.policyMembers, (policyMember, accountID) => {
            if (this.isDeletedPolicyMember(policyMember)) {
                return;
            }
            const details = this.props.personalDetails[accountID];
            if (!details) {
                Log.hmmm(`[WorkspaceMembersPage] no personal details found for policy member with accountID: ${accountID}`);
                return;
            }
            data.push({
                ...policyMember,
                ...details,
            });
        });
        data = _.sortBy(data, (value) => value.displayName.toLowerCase());
        data = this.getMemberOptions(data, this.state.searchValue.trim().toLowerCase());

        // If this policy is owned by Expensify then show all support (expensify.com or team.expensify.com) emails
        // We don't want to show guides as policy members unless the user is a guide. Some customers get confused when they
        // see random people added to their policy, but guides having access to the policies help set them up.
        if (policyOwner && currentUserLogin && !PolicyUtils.isExpensifyTeam(policyOwner) && !PolicyUtils.isExpensifyTeam(currentUserLogin)) {
            data = _.reject(data, (member) => PolicyUtils.isExpensifyTeam(member.login));
        }

        _.each(data, (member) => {
            if (member.login === this.props.session.email || member.login === this.props.policy.owner || member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }
            removableMembers[member.accountID] = member;
        });
        const policyID = lodashGet(this.props.route, 'params.policyID');
        const policyName = lodashGet(this.props.policy, 'name');

        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
            >
                {({safeAreaPaddingBottomStyle}) => (
                    <FullPageNotFoundView
                        shouldShow={_.isEmpty(this.props.policy)}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                    >
                        <HeaderWithBackButton
                            title={this.props.translate('workspace.common.members')}
                            subtitle={policyName}
                            onBackButtonPress={() => {
                                this.updateSearchValue('');
                                Navigation.goBack(ROUTES.getWorkspaceInitialRoute(policyID));
                            }}
                            shouldShowGetAssistanceButton
                            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                        />
                        <ConfirmModal
                            danger
                            title={this.props.translate('workspace.people.removeMembersTitle')}
                            isVisible={this.state.isRemoveMembersConfirmModalVisible}
                            onConfirm={() => this.removeUsers()}
                            onCancel={this.hideConfirmModal}
                            prompt={this.props.translate('workspace.people.removeMembersPrompt')}
                            confirmText={this.props.translate('common.remove')}
                            cancelText={this.props.translate('common.cancel')}
                        />
                        <View style={[styles.w100, styles.flex1]}>
                            <View style={[styles.w100, styles.flexRow, styles.pt3, styles.ph5]}>
                                <Button
                                    medium
                                    success
                                    text={this.props.translate('common.invite')}
                                    onPress={this.inviteUser}
                                />
                                <Button
                                    medium
                                    danger
                                    style={[styles.ml2]}
                                    isDisabled={this.state.selectedEmployees.length === 0}
                                    text={this.props.translate('common.remove')}
                                    onPress={this.askForConfirmationToRemove}
                                />
                            </View>
                            <View style={[styles.w100, styles.pv3, styles.ph5]}>
                                <TextInput
                                    value={this.state.searchValue}
                                    onChangeText={this.updateSearchValue}
                                    label={this.props.translate('optionsSelector.findMember')}
                                />
                            </View>
                            {data.length > 0 ? (
                                <View style={[styles.w100, styles.mt4, styles.flex1]}>
                                    <View style={[styles.peopleRow, styles.ph5, styles.pb3]}>
                                        <Checkbox
                                            isChecked={
                                                !_.isEmpty(removableMembers) && _.every(_.keys(removableMembers), (accountID) => _.contains(this.state.selectedEmployees, Number(accountID)))
                                            }
                                            onPress={() => this.toggleAllUsers(removableMembers)}
                                        />
                                        <View style={[styles.flex1]}>
                                            <Text style={[styles.textStrong, styles.ph5]}>{this.props.translate('workspace.people.selectAll')}</Text>
                                        </View>
                                    </View>
                                    <KeyboardDismissingFlatList
                                        renderItem={this.renderItem}
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
                                    <Text style={[styles.textLabel, styles.colorMuted]}>{this.props.translate('workspace.common.memberNotFound')}</Text>
                                </View>
                            )}
                        </View>
                    </FullPageNotFoundView>
                )}
            </ScreenWrapper>
        );
    }
}

WorkspaceMembersPage.propTypes = propTypes;
WorkspaceMembersPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withPolicyAndFullscreenLoading,
    withNetwork(),
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
    withCurrentUserPersonalDetails,
)(WorkspaceMembersPage);
