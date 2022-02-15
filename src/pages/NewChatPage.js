import lodashGet from 'lodash/get';
import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../components/OptionsSelector';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import * as Report from '../libs/actions/Report';
import CONST from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import Button from '../components/Button';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import FixedFooter from '../components/FixedFooter';
import personalDetailsPropType from './personalDetailsPropType';

const propTypes = {
    /** Whether screen is used to create group chat */
    isGroupChat: PropTypes.bool,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** All of the personal details for everyone */
    personalDetails: personalDetailsPropType.isRequired,

    /** All reports shared with the user */
    reports: PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
    }).isRequired,

    /** Session of currently logged in user */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isGroupChat: false,
};

class NewChatPage extends Component {
    constructor(props) {
        super(props);

        this.toggleOption = this.toggleOption.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.toggleGroupOptionOrCreateChat = this.toggleGroupOptionOrCreateChat.bind(this);
        this.createNewChat = this.createNewChat.bind(this);
        this.excludedGroupEmails = _.without(CONST.EXPENSIFY_EMAILS, [
            CONST.EMAIL.CONCIERGE,
            CONST.EMAIL.RECEIPTS,
            CONST.EMAIL.INTEGRATION_TESTING_CREDS,
        ]);

        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getNewChatOptions(
            props.reports,
            props.personalDetails,
            props.betas,
            '',
            [],
            this.props.isGroupChat ? this.excludedGroupEmails : [],
        );
        this.state = {
            searchValue: '',
            recentReports,
            personalDetails,
            selectedOptions: [],
            userToInvite,
        };
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @param {Boolean} maxParticipantsReached
     * @returns {Array}
     */
    getSections(maxParticipantsReached) {
        const sections = [];
        if (this.props.isGroupChat) {
            sections.push({
                title: undefined,
                data: this.state.selectedOptions,
                shouldShow: !_.isEmpty(this.state.selectedOptions),
                indexOffset: 0,
            });

            if (maxParticipantsReached) {
                return sections;
            }
        }

        sections.push({
            title: this.props.translate('common.recents'),
            data: _.difference(this.state.recentReports, this.state.selectedOptions),
            shouldShow: !_.isEmpty(this.state.recentReports),
            indexOffset: _.reduce(sections, (prev, {data}) => prev + data.length, 0),
        });

        sections.push({
            title: this.props.translate('common.contacts'),
            data: _.difference(this.state.personalDetails, this.state.selectedOptions),
            shouldShow: !_.isEmpty(this.state.personalDetails),
            indexOffset: _.reduce(sections, (prev, {data}) => prev + data.length, 0),
        });

        if (this.state.userToInvite) {
            sections.push(({
                title: undefined,
                data: [this.state.userToInvite],
                shouldShow: true,
                indexOffset: 0,
            }));
        }

        return sections;
    }

    /**
     * Once all our options are selected this method will call the API and  create new chat between all selected users
     * and the currently logged in user
     */
    createGroup() {
        const userLogins = _.pluck(this.state.selectedOptions, 'login');
        if (userLogins.length < 1) {
            return;
        }

        Report.fetchOrCreateChatReport([this.props.session.email, ...userLogins]);
    }

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    toggleOption(option) {
        this.setState((prevState) => {
            const isOptionInList = _.some(prevState.selectedOptions, selectedOption => (
                selectedOption.login === option.login
            ));

            let newSelectedOptions;

            if (isOptionInList) {
                newSelectedOptions = _.reject(prevState.selectedOptions, selectedOption => (
                    selectedOption.login === option.login
                ));
            } else {
                newSelectedOptions = [...prevState.selectedOptions, option];
            }

            const {
                recentReports,
                personalDetails,
                userToInvite,
            } = OptionsListUtils.getNewChatOptions(
                this.props.reports,
                this.props.personalDetails,
                this.props.betas,
                isOptionInList ? prevState.searchValue : '',
                newSelectedOptions,
                this.excludedGroupEmails,
            );

            return {
                selectedOptions: newSelectedOptions,
                recentReports,
                personalDetails,
                userToInvite,
                searchValue: isOptionInList ? prevState.searchValue : '',
            };
        });
    }

    /**
     * Creates a new chat with the option
     * @param {Object} option
     */
    createNewChat(option) {
        Report.fetchOrCreateChatReport([
            this.props.session.email,
            option.login,
        ]);
    }

    toggleGroupOptionOrCreateChat(option) {
        if (this.props.isGroupChat) {
            return this.toggleOption(option);
        }

        this.createNewChat(option);
    }

    render() {
        const maxParticipantsReached = this.state.selectedOptions.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
        const sections = this.getSections(maxParticipantsReached);
        const headerMessage = OptionsListUtils.getHeaderMessage(
            (this.state.personalDetails.length + this.state.recentReports.length) !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchValue,
            maxParticipantsReached,
        );
        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <KeyboardAvoidingView>
                        <HeaderWithCloseButton
                            title={this.props.isGroupChat
                                ? this.props.translate('sidebarScreen.newGroup')
                                : this.props.translate('sidebarScreen.newChat')}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />
                        <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                            <FullScreenLoadingIndicator visible={!didScreenTransitionEnd} />
                            {didScreenTransitionEnd && (
                                <>
                                    <OptionsSelector
                                        canSelectMultipleOptions={this.props.isGroupChat}
                                        sections={sections}
                                        selectedOptions={this.state.selectedOptions}
                                        value={this.state.searchValue}
                                        onSelectRow={this.toggleGroupOptionOrCreateChat}
                                        onChangeText={(searchValue = '') => {
                                            const {
                                                recentReports,
                                                personalDetails,
                                                userToInvite,
                                            } = OptionsListUtils.getNewChatOptions(
                                                this.props.reports,
                                                this.props.personalDetails,
                                                this.props.betas,
                                                searchValue,
                                                [],
                                                this.props.isGroupChat ? this.excludedGroupEmails : [],
                                            );
                                            this.setState({
                                                searchValue,
                                                userToInvite,
                                                recentReports,
                                                personalDetails,
                                            });
                                        }}
                                        headerMessage={headerMessage}
                                        hideAdditionalOptionStates
                                        forceTextUnreadStyle
                                    />
                                    {this.props.isGroupChat && lodashGet(this.state, 'selectedOptions', []).length > 0 && (
                                        <FixedFooter>
                                            <Button
                                                success
                                                onPress={this.createGroup}
                                                style={[styles.w100]}
                                                text={this.props.translate('newChatPage.createGroup')}
                                            />
                                        </FixedFooter>
                                    )}
                                </>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                )}
            </ScreenWrapper>
        );
    }
}

NewChatPage.propTypes = propTypes;
NewChatPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
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
)(NewChatPage);
