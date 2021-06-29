import React from 'react';
import _ from 'underscore';
import {
    View, FlatList, ScrollView,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import {removeMembers} from '../../libs/actions/Policy';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import Text from '../../components/Text';
import ROUTES from '../../ROUTES';
import ConfirmModal from '../../components/ConfirmModal';
import personalDetailsPropType from '../personalDetailsPropType';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';

const propTypes = {
    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType.isRequired,

    /** The policy passed via the route */
    policy: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/people */
            policyID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    policy: {
        name: '',
    },
};

class WorkspacePeoplePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedEmployees: [],
            isRemoveMembersConfirmModalVisible: false,
        };

        this.renderItem = this.renderItem.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
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
        removeMembers(membersToRemove, this.props.route.params.policyID);
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
     * Add or remove user from the selectedEmployees list
     *
     * @param {Sting} login
     */
    toggleUser(login) {
        if (login === 'ALL') {
            this.setState(prevState => ({
                selectedEmployees: this.props.policy.employeeList.length !== prevState.selectedEmployees.length 
                    ? this.props.policy.employeeList 
                    : [],
            }));
            return;
        }

        this.setState(prevState => ({
            selectedEmployees: _.contains(prevState.selectedEmployees, login)
                ? _.without(prevState.selectedEmployees, login)
                : [...prevState.selectedEmployees, login],
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
        return (
            <View style={[styles.peopleRow]}>
                <View style={[styles.peopleRowCell, styles.peopleCheckbox]}>
                    <Checkbox
                        isChecked={_.contains(this.state.selectedEmployees, item.login)}
                        onPress={() => this.toggleUser(item.login)}
                    />
                </View>
                {
                    this.props.isSmallScreenWidth ? (
                        <View style={[styles.peopleRowCell, styles.mobileAvatarWithName]}>
                            <View style={[styles.avatarWithName]}>
                                <Avatar
                                    imageStyles={[styles.mr2, styles.mobileAvatarWithName]}
                                    source={item.avatar}
                                />
                                <View style={[styles.dFlex, styles.flexColumn, styles.justifyContentCenter, styles.overflowHidden, styles.mobilePeopleName]}>
                                    <Text style={[styles.textStrong, styles.peopleMobileAssigneeText]}>
                                        {item.displayName}
                                    </Text>
                                    <Text style={[styles.textLabel, styles.colorMuted, styles.peopleMobileAssigneeText]}>
                                        {item.login}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.peopleRowCell, styles.flex4]}>
                                <View style={[styles.avatarWithName]}>
                                    <Avatar
                                        imageStyles={[styles.mr2]}
                                        source={item.avatar}
                                    />
                                    <Text style={[styles.textStrong]}>
                                        {item.displayName}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.peopleRowCell, styles.flex4]}>
                                <Text style={[styles.textLabel, styles.colorMuted]}>
                                    {item.login}
                                </Text>
                            </View>
                        </>
                    )
                }
                <View style={[
                    styles.peopleRowCell,
                    styles.peopleBadgesContainer,
                    this.props.isSmallScreenWidth ? styles.peopleBadgesMobile : styles.peopleBadgesContainerDesktop,
                ]}>
                    {
                        this.props.session.email === item.login && (
                            <View>
                                <View style={[styles.peopleBadge]}>
                                    <Text style={[styles.peopleBadgeText]}>
                                        Admin
                                    </Text>
                                </View>
                            </View>
                        )
                    }
                </View>
            </View>
        );
    }

    renderHeader() {
        return (
            <View style={[styles.peopleRow, styles.peopleHeaderRow]}>
                <View style={[styles.peopleRowCell, styles.peopleCheckbox]}>
                    <Checkbox
                        isChecked={this.state.selectedEmployees.length === this.props.policy.employeeList.length}
                        onPress={() => this.toggleUser('ALL')}
                    />
                </View>
                <View style={[styles.peopleRowCell, styles.flex4]}>
                    <Text style={[styles.textStrong]}>
                        {this.props.translate('workspace.people.assignee')}
                    </Text>
                </View>
                {
                    !this.props.isSmallScreenWidth && (
                        <View style={[styles.peopleRowCell, styles.flex4]}>
                            <Text style={[styles.textStrong]}>
                                {this.props.translate('common.email')}
                            </Text>
                        </View>
                    )
                }
                <View style={[styles.peopleRowCell, styles.flex1]} />
            </View>
        );
    }

    render() {
        let data = [];
        if (this.props.policy.employeeList && this.props.policy.employeeList.length !== 0) {
            data = _.filter(this.props.policy.employeeList, (email) => this.props.personalDetails[email])
                    .map(email => this.props.personalDetails[email]);
        }
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.people')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
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
                <ScrollView style={[styles.settingsPageBackground]} bounces={false}>
                    <View style={styles.pageWrapper}>
                        <View style={styles.buttonRow}>
                            <Button
                                success
                                text={this.props.translate('common.invite')}
                                onPress={() => this.inviteUser()}
                            />
                            <Button
                                danger
                                style={[styles.ml2]}
                                isDisabled={this.state.selectedEmployees.length === 0}
                                text={this.props.translate('common.remove')}
                                onPress={this.askForConfirmationToRemove}
                            />
                        </View>
                        <View style={[styles.w100, styles.mt4]}>
                            {
                                this.props.policy.employeeList && (
                                    <FlatList
                                        ListHeaderComponent={this.renderHeader()}
                                        renderItem={this.renderItem}
                                        data={data}
                                    />
                                )
                            }
                        </View>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

WorkspacePeoplePage.propTypes = propTypes;
WorkspacePeoplePage.defaultProps = defaultProps;
WorkspacePeoplePage.displayName = 'WorkspacePeoplePage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        policy: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(WorkspacePeoplePage);
