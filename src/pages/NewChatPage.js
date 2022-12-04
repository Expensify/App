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
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';

const propTypes = {
    /** Whether screen is used to create group chat */
    isGroupChat: PropTypes.bool,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** All of the personal details for everyone */
    personalDetails: personalDetailsPropType.isRequired,

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes).isRequired,

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
        this.createChat = this.createChat.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.updateOptionsWithSearchTerm = this.updateOptionsWithSearchTerm.bind(this);
        this.excludedGroupEmails = _.without(CONST.EXPENSIFY_EMAILS, CONST.EMAIL.CONCIERGE);

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
            searchTerm: '',
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
        let indexOffset = 0;

        if (this.props.isGroupChat) {
            sections.push({
                title: undefined,
                data: this.state.selectedOptions,
                shouldShow: !_.isEmpty(this.state.selectedOptions),
                indexOffset,
            });
            indexOffset += this.state.selectedOptions.length;

            if (maxParticipantsReached) {
                return sections;
            }
        }

        // Filtering out selected users from the search results
        const filterText = _.reduce(this.state.selectedOptions, (str, {login}) => `${str} ${login}`, '');
        const recentReportsWithoutSelected = _.filter(this.state.recentReports, ({login}) => !filterText.includes(login));
        const personalDetailsWithoutSelected = _.filter(this.state.personalDetails, ({login}) => !filterText.includes(login));
        const hasUnselectedUserToInvite = this.state.userToInvite && !filterText.includes(this.state.userToInvite.login);

        sections.push({
            title: this.props.translate('common.recents'),
            data: recentReportsWithoutSelected,
            shouldShow: !_.isEmpty(recentReportsWithoutSelected),
            indexOffset,
        });
        indexOffset += recentReportsWithoutSelected.length;

        sections.push({
            title: this.props.translate('common.contacts'),
            data: personalDetailsWithoutSelected,
            shouldShow: !_.isEmpty(personalDetailsWithoutSelected),
            indexOffset,
        });
        indexOffset += personalDetailsWithoutSelected.length;

        if (hasUnselectedUserToInvite) {
            sections.push(({
                title: undefined,
                data: [this.state.userToInvite],
                shouldShow: true,
                indexOffset,
            }));
        }

        return sections;
    }

    updateOptionsWithSearchTerm(searchTerm = '') {
        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getNewChatOptions(
            this.props.reports,
            this.props.personalDetails,
            this.props.betas,
            searchTerm,
            [],
            this.props.isGroupChat ? this.excludedGroupEmails : [],
        );
        this.setState({
            searchTerm,
            userToInvite,
            recentReports,
            personalDetails,
        });
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
                prevState.searchTerm,
                [],
                this.excludedGroupEmails,
            );

            return {
                selectedOptions: newSelectedOptions,
                recentReports,
                personalDetails,
                userToInvite,
                searchTerm: prevState.searchTerm,
            };
        });
    }

    /**
     * Creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     *
     * @param {Object} option
     */
    createChat(option) {
        Report.navigateToAndOpenReport([option.login]);
    }

    /**
     * Creates a new group chat with all the selected options and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    createGroup() {
        const userLogins = _.pluck(this.state.selectedOptions, 'login');
        if (userLogins.length < 1) {
            return;
        }
        Report.navigateToAndOpenReport(userLogins);
    }

    render() {
        const maxParticipantsReached = this.state.selectedOptions.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
        const sections = this.getSections(maxParticipantsReached);
        const headerMessage = OptionsListUtils.getHeaderMessage(
            (this.state.personalDetails.length + this.state.recentReports.length) !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchTerm,
            maxParticipantsReached,
        );
        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <>
                        <HeaderWithCloseButton
                            title={this.props.isGroupChat
                                ? this.props.translate('sidebarScreen.newGroup')
                                : this.props.translate('sidebarScreen.newChat')}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />
                        <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                            {didScreenTransitionEnd ? (
                                <OptionsSelector
                                    canSelectMultipleOptions={this.props.isGroupChat}
                                    sections={sections}
                                    selectedOptions={this.state.selectedOptions}
                                    value={this.state.searchTerm}
                                    onSelectRow={option => (this.props.isGroupChat ? this.toggleOption(option) : this.createChat(option))}
                                    onChangeText={this.updateOptionsWithSearchTerm}
                                    headerMessage={headerMessage}
                                    boldStyle
                                    shouldFocusOnSelectRow={this.props.isGroupChat}
                                    shouldShowConfirmButton={this.props.isGroupChat}
                                    confirmButtonText={this.props.translate('newChatPage.createGroup')}
                                    onConfirmSelection={this.props.isGroupChat && this.createGroup}
                                />
                            ) : (
                                <FullScreenLoadingIndicator />
                            )}
                        </View>
                    </>
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
