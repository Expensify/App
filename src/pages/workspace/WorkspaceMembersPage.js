import React from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {
    View, TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import * as Policy from '../../libs/actions/Policy';
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

    ...policyPropTypes,
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
    network: networkPropTypes.isRequired,
};

const defaultProps = policyDefaultProps;

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
        const clientMemberEmails = _.keys(_.pick(this.props.policyMemberList, member => _.isEmpty(member.errors)));
        Policy.openWorkspaceMembersPage(this.props.route.params.policyID, clientMemberEmails);
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
     * Add or remove all users from the selectedEmployees list
     */
    toggleAllUsers() {
        let policyMemberList = lodashGet(this.props, 'policyMemberList', {});
        policyMemberList = _.filter(_.keys(policyMemberList), policyMember => policyMemberList[policyMember].pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const removableMembers = _.without(policyMemberList, this.props.session.email, this.props.policy.owner);
        this.setState(prevState => ({
            selectedEmployees: !_.every(removableMembers, member => _.contains(prevState.selectedEmployees, member))
                ? removableMembers
                : [],
        }), () => this.validate());
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
        this.setState(prevState => ({
            selectedEmployees: [...prevState.selectedEmployees, login],
        }), () => this.validate());
    }

    /**
     * Remove user from the selectedEmployees list
     *
     * @param {String} login
     */
    removeUser(login) {
        this.setState(prevState => ({
            selectedEmployees: _.without(prevState.selectedEmployees, login),
        }), () => this.validate());
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
     * @param {String} value
     * @param {String} keyword
     * @returns {Boolean}
     */
    isKeywordMatch(value, keyword) {
        return value.trim().toLowerCase().includes(keyword);
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
    renderItem({
        item,
    }) {
        return (
            <OfflineWithFeedback errorRowStyles={[styles.peopleRowBorderBottom]} onClose={() => this.dismissError(item)} pendingAction={item.pendingAction} errors={item.errors}>
                <TouchableOpacity
                    style={[styles.peopleRow, (_.isEmpty(item.errors) || this.state.errors[item.login]) && styles.peopleRowBorderBottom]}
                    onPress={() => this.toggleUser(item.login, item.pendingAction)}
                    activeOpacity={0.7}
                >
                    <Checkbox
                        style={[styles.peopleRowCell]}
                        isChecked={_.contains(this.state.selectedEmployees, item.login)}
                        onPress={() => this.toggleUser(item.login, item.pendingAction)}
                    />
                    <View style={styles.flex1}>
                        <OptionRow
                            onSelectRow={() => this.toggleUser(item.login, item.pendingAction)}
                            boldStyle
                            option={{
                                text: Str.removeSMSDomain(item.displayName),
                                alternateText: Str.removeSMSDomain(item.login),
                                participantsList: [item],
                                icons: [{
                                    source: ReportUtils.getAvatar(item.avatar, item.login),
                                    name: item.login,
                                    type: CONST.ICON_TYPE_AVATAR,
                                }],
                                keyForList: item.login,
                            }}
                        />
                    </View>
                    {(this.props.session.email === item.login || item.role === 'admin') && (
                        <View style={styles.peopleRowCell}>
                            <View style={[styles.badge, styles.peopleBadge]}>
                                <Text style={[styles.peopleBadgeText]}>
                                    {this.props.translate('common.admin')}
                                </Text>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
                {!_.isEmpty(this.state.errors[item.login]) && (
                    <FormHelpMessage isError message={this.state.errors[item.login]} />
                )}
            </OfflineWithFeedback>
        );
    }

    render() {
        const policyMemberList = lodashGet(this.props, 'policyMemberList', {});
        const removableMembers = [];
        let data = [];
        _.each(policyMemberList, (policyMember, email) => {
            if (email !== this.props.session.email && email !== this.props.policy.owner && policyMember.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                removableMembers.push(email);
            }
            const details = lodashGet(this.props.personalDetails, email, {displayName: email, login: email});
            data.push({
                ...policyMember,
                ...details,
            });
        });
        data = _.sortBy(data, value => value.displayName.toLowerCase());
        const searchValue = this.state.searchValue.trim().toLowerCase();
        data = _.filter(data, member => this.isKeywordMatch(member.displayName, searchValue)
            || this.isKeywordMatch(member.login, searchValue)
            || this.isKeywordMatch(member.phoneNumber, searchValue)
            || this.isKeywordMatch(member.firstName, searchValue)
            || this.isKeywordMatch(member.lastName, searchValue));
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
                                    placeholder={this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                                />
                            </View>
                            {data.length > 0 ? (
                                <View style={[styles.w100, styles.mt4, styles.flex1]}>
                                    <View style={[styles.peopleRow, styles.ph5, styles.pb3]}>
                                        <View style={[styles.peopleRowCell]}>
                                            <Checkbox
                                                isChecked={removableMembers.length !== 0 && _.every(removableMembers, member => _.contains(this.state.selectedEmployees, member))}
                                                onPress={() => this.toggleAllUsers()}
                                            />
                                        </View>
                                        <View style={[styles.peopleRowCell, styles.flex1]}>
                                            <Text style={[styles.textStrong, styles.ph5]}>
                                                {this.props.translate('workspace.people.selectAll')}
                                            </Text>
                                        </View>
                                    </View>
                                    <KeyboardDismissingFlatList
                                        renderItem={this.renderItem}
                                        data={data}
                                        keyExtractor={item => item.login}
                                        showsVerticalScrollIndicator
                                        style={[styles.ph5, styles.pb5]}
                                        contentContainerStyle={safeAreaPaddingBottomStyle}
                                        keyboardShouldPersistTaps="handled"
                                    />
                                </View>
                            ) : (
                                !_.isEmpty(policyMemberList) && (
                                    <View style={[styles.ph5]}>
                                        <Text style={[styles.textLabel, styles.colorMuted]}>
                                            {this.props.translate('common.noResultsFound')}
                                        </Text>
                                    </View>
                                )
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
)(WorkspaceMembersPage);
