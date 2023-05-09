import React from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
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
import withPolicy, {policyPropTypes, policyDefaultProps} from './withPolicy';
import CONST from '../../CONST';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import {withNetwork} from '../../components/OnyxProvider';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import networkPropTypes from '../../components/networkPropTypes';
import * as ReportUtils from '../../libs/ReportUtils';
import FormHelpMessage from '../../components/FormHelpMessage';
import TextInput from '../../components/TextInput';
import KeyboardDismissingFlatList from '../../components/KeyboardDismissingFlatList';
import withCurrentUserPersonalDetails from '../../components/withCurrentUserPersonalDetails';
import * as PolicyUtils from '../../libs/PolicyUtils';

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
        /**
         * We filter clientMemberEmails to only pass members without errors
         * Otherwise, the members with errors would immediately be removed before the user has a chance to read the error
         */
        const clientMemberEmails = _.keys(_.pick(this.props.policyMemberList, (member) => _.isEmpty(member.errors)));
        Policy.openWorkspaceMembersPage(this.props.route.params.policyID, clientMemberEmails);
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
        const membersToRemove = _.without(this.state.selectedEmployees, this.props.session.email);
        Policy.removeMembers(membersToRemove, this.props.route.params.policyID);
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
        const emailList = _.keys(memberList);
        this.setState(
            (prevState) => ({
                selectedEmployees: !_.every(emailList, (memberEmail) => _.contains(prevState.selectedEmployees, memberEmail)) ? emailList : [],
            }),
            () => this.validate(),
        );
    }

    /**
     * Toggle user from the selectedEmployees list
     *
     * @param {String} login
     * @param {String} pendingAction
     *
     */
    toggleUser(login, pendingAction) {
        if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        // Add or remove the user if the checkbox is enabled
        if (_.contains(this.state.selectedEmployees, login)) {
            this.removeUser(login);
        } else {
            this.addUser(login);
        }
    }

    /**
     * Add user from the selectedEmployees list
     *
     * @param {String} login
     */
    addUser(login) {
        this.setState(
            (prevState) => ({
                selectedEmployees: [...prevState.selectedEmployees, login],
            }),
            () => this.validate(),
        );
    }

    /**
     * Remove user from the selectedEmployees list
     *
     * @param {String} login
     */
    removeUser(login) {
        this.setState(
            (prevState) => ({
                selectedEmployees: _.without(prevState.selectedEmployees, login),
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
            Policy.clearDeleteMemberError(this.props.route.params.policyID, item.login);
        } else {
            Policy.clearAddMemberError(this.props.route.params.policyID, item.login);
        }
    }

    validate() {
        const errors = {};
        _.each(this.state.selectedEmployees, (member) => {
            if (member !== this.props.policy.owner && member !== this.props.session.email) {
                return;
            }

            errors[member] = this.props.translate('workspace.people.error.cannotRemove');
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
        return (
            <OfflineWithFeedback
                errorRowStyles={[styles.peopleRowBorderBottom]}
                onClose={() => this.dismissError(item)}
                pendingAction={item.pendingAction}
                errors={item.errors}
            >
                <TouchableOpacity
                    style={[styles.peopleRow, (_.isEmpty(item.errors) || this.state.errors[item.login]) && styles.peopleRowBorderBottom]}
                    onPress={() => this.toggleUser(item.login, item.pendingAction)}
                    activeOpacity={0.7}
                >
                    <Checkbox
                        isChecked={_.contains(this.state.selectedEmployees, item.login)}
                        onPress={() => this.toggleUser(item.login, item.pendingAction)}
                    />
                    <View style={styles.flex1}>
                        <OptionRow
                            onSelectRow={() => this.toggleUser(item.login, item.pendingAction)}
                            boldStyle
                            option={{
                                text: this.props.formatPhoneNumber(item.displayName),
                                alternateText: this.props.formatPhoneNumber(item.login),
                                participantsList: [item],
                                icons: [
                                    {
                                        source: ReportUtils.getAvatar(item.avatar, item.login),
                                        name: item.login,
                                        type: CONST.ICON_TYPE_AVATAR,
                                    },
                                ],
                                keyForList: item.login,
                            }}
                        />
                    </View>
                    {(this.props.session.email === item.login || item.role === 'admin') && (
                        <View style={[styles.badge, styles.peopleBadge]}>
                            <Text style={[styles.peopleBadgeText]}>{this.props.translate('common.admin')}</Text>
                        </View>
                    )}
                </TouchableOpacity>
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
        const policyMemberList = lodashGet(this.props, 'policyMemberList', {});
        const removableMembers = {};
        let data = [];
        _.each(policyMemberList, (policyMember, email) => {
            if (this.isDeletedPolicyMember(policyMember)) {
                return;
            }
            const details = lodashGet(this.props.personalDetails, email, {displayName: email, login: email});
            data.push({
                ...policyMember,
                ...details,
            });
        });
        data = _.sortBy(data, (value) => value.displayName.toLowerCase());
        data = this.getMemberOptions(data, this.state.searchValue.trim().toLowerCase());

        data = _.reject(data, (member) => {
            // If this policy is owned by Expensify then show all support (expensify.com or team.expensify.com) emails
            if (PolicyUtils.isExpensifyTeam(lodashGet(this.props.policy, 'owner'))) {
                return;
            }

            // We don't want to show guides as policy members unless the user is not a guide. Some customers get confused when they
            // see random people added to their policy, but guides having access to the policies help set them up.
            const isCurrentUserExpensifyTeam = PolicyUtils.isExpensifyTeam(this.props.currentUserPersonalDetails.login);
            return !isCurrentUserExpensifyTeam && PolicyUtils.isExpensifyTeam(member.login);
        });

        _.each(data, (member) => {
            if (member.login === this.props.session.email || member.login === this.props.policy.owner || member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }
            removableMembers[member.login] = member;
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
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                    >
                        <HeaderWithCloseButton
                            title={this.props.translate('workspace.common.members')}
                            subtitle={policyName}
                            onCloseButtonPress={() => Navigation.dismissModal()}
                            onBackButtonPress={() => {
                                this.updateSearchValue('');
                                Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID));
                            }}
                            shouldShowGetAssistanceButton
                            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                            shouldShowBackButton
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
                            <View style={[styles.w100, styles.pv4, styles.ph5]}>
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
                                                !_.isEmpty(removableMembers) && _.every(_.keys(removableMembers), (memberEmail) => _.contains(this.state.selectedEmployees, memberEmail))
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
    withPolicy,
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
