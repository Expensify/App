import React from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {
    View, FlatList, TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import Log from '../../libs/Log';
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
import Permissions from '../../libs/Permissions';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import OptionRow from '../../components/OptionRow';
import CheckboxWithTooltip from '../../components/CheckboxWithTooltip';
import Hoverable from '../../components/Hoverable';
import withFullPolicy, {fullPolicyPropTypes, fullPolicyDefaultProps} from './withFullPolicy';
import CONST from '../../CONST';

const propTypes = {
    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType.isRequired,

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/members */
            policyID: PropTypes.string,
        }),
    }).isRequired,

    ...fullPolicyPropTypes,
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = fullPolicyDefaultProps;

class WorkspaceMembersPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedEmployees: [],
            isRemoveMembersConfirmModalVisible: false,
            showTooltipForLogin: '',
        };

        this.renderItem = this.renderItem.bind(this);
        this.inviteUser = this.inviteUser.bind(this);
        this.addUser = this.addUser.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.askForConfirmationToRemove = this.askForConfirmationToRemove.bind(this);
        this.hideConfirmModal = this.hideConfirmModal.bind(this);
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
        this.setState({showTooltipForLogin: ''});
        const removableMembers = _.without(this.props.policy.employeeList, this.props.session.email, this.props.policy.owner);
        this.setState(prevState => ({
            selectedEmployees: removableMembers.length !== prevState.selectedEmployees.length
                ? removableMembers
                : [],
        }));
    }

    /**
     * Toggle user from the selectedEmployees list
     *
     * @param {String} login
     */
    toggleUser(login) {
        if (this.willTooltipShowForLogin(login)) {
            return;
        }

        // Add or remove the user if the checkbox is enabled and is clickable.
        if (_.contains(this.state.selectedEmployees, login)) {
            this.removeUser(login);
        } else {
            this.addUser(login);
        }

        this.setState({showTooltipForLogin: ''});
    }

    /**
     * Shows the tooltip for non removable members
     *
     * @param {String} login
     * @param {Boolean} wasHovered
     * @returns {Boolean} Return true if the tooltip was displayed so we can use the state of it in other functions.
     */
    willTooltipShowForLogin(login, wasHovered = false) {
        // Small screens only show the tooltip on press, so ignore hovered event on those cases.
        if (wasHovered && (this.props.isSmallScreenWidth || this.props.isMediumScreenWidth)) {
            return false;
        }

        const canBeRemoved = this.props.policy.owner !== login && this.props.session.email !== login;
        if (!canBeRemoved) {
            this.setState({showTooltipForLogin: login});
        }

        return !canBeRemoved;
    }

    /**
     * Add user from the selectedEmployees list
     *
     * @param {String} login
     */
    addUser(login) {
        this.setState(prevState => ({
            selectedEmployees: [...prevState.selectedEmployees, login],
        }));
    }

    /**
     * Remove user from the selectedEmployees list
     *
     * @param {String} login
     */
    removeUser(login) {
        this.setState(prevState => ({
            selectedEmployees: _.without(prevState.selectedEmployees, login),
        }));
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
        const canBeRemoved = this.props.policy.owner !== item.login && this.props.session.email !== item.login;
        return (
            <Hoverable onHoverIn={() => this.willTooltipShowForLogin(item.login, true)} onHoverOut={() => this.setState({showTooltipForLogin: ''})}>
                <TouchableOpacity
                    style={[styles.peopleRow, !canBeRemoved && styles.cursorDisabled]}
                    onPress={() => this.toggleUser(item.login)}
                    activeOpacity={0.7}
                >
                    <CheckboxWithTooltip
                        style={[styles.peopleRowCell]}
                        isChecked={_.contains(this.state.selectedEmployees, item.login)}
                        disabled={!canBeRemoved}
                        onPress={() => this.toggleUser(item.login)}
                        toggleTooltip={this.state.showTooltipForLogin === item.login}
                        text={this.props.translate('workspace.people.error.cannotRemove')}
                    />
                    <View style={styles.flex1}>
                        <OptionRow
                            onSelectRow={() => this.toggleUser(item.login)}
                            forceTextUnreadStyle
                            isDisabled={!canBeRemoved}
                            option={{
                                text: Str.removeSMSDomain(item.displayName),
                                alternateText: Str.removeSMSDomain(item.login),
                                participantsList: [item],
                                icons: [item.avatar],
                                keyForList: item.login,
                            }}
                        />
                    </View>
                    {this.props.session.email === item.login && (
                        <View style={styles.peopleRowCell}>
                            <View style={[styles.badge, styles.peopleBadge]}>
                                <Text style={[styles.peopleBadgeText]}>
                                    {this.props.translate('common.admin')}
                                </Text>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            </Hoverable>
        );
    }

    render() {
        if (!Permissions.canUseFreePlan(this.props.betas)) {
            Log.info('Not showing workspace people page because user is not on free plan beta');
            return <Navigation.DismissModal />;
        }
        const policyEmployeeList = lodashGet(this.props, 'policy.employeeList', []);
        const removableMembers = _.without(this.props.policy.employeeList, this.props.session.email, this.props.policy.owner);
        const data = _.chain(policyEmployeeList)
            .map(email => this.props.personalDetails[email])
            .filter()
            .sortBy(person => person.displayName.toLowerCase())
            .value();
        const policyID = lodashGet(this.props.route, 'params.policyID');
        const policyName = lodashGet(this.props.policy, 'name');

        return (
            <ScreenWrapper style={[styles.defaultModalContainer]}>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.members')}
                    subtitle={policyName}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                    onBackButtonPress={() => Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID))}
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
                <View style={[styles.pageWrapper, styles.flex1]}>
                    <View style={[styles.w100, styles.flexRow]}>
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
                    <View style={[styles.w100, styles.mt4, styles.flex1]}>
                        <View style={[styles.peopleRow]}>
                            <View style={[styles.peopleRowCell]}>
                                <Checkbox
                                    isChecked={this.state.selectedEmployees.length === removableMembers.length && removableMembers.length !== 0}
                                    onPress={() => this.toggleAllUsers()}
                                />
                            </View>
                            <View style={[styles.peopleRowCell, styles.flex1]}>
                                <Text style={[styles.textStrong, styles.ph5]}>
                                    {this.props.translate('workspace.people.selectAll')}
                                </Text>
                            </View>
                        </View>
                        <FlatList
                            renderItem={this.renderItem}
                            data={data}
                            keyExtractor={item => item.login}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </ScreenWrapper>
        );
    }
}

WorkspaceMembersPage.propTypes = propTypes;
WorkspaceMembersPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withFullPolicy,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(WorkspaceMembersPage);
