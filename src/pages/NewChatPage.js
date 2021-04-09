import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../components/OptionsSelector';
import {getNewChatOptions, getHeaderMessage} from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import {fetchOrCreateChatReportAndRedirect} from '../libs/actions/Report';
import KeyboardSpacer from '../components/KeyboardSpacer';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';

const personalDetailsPropTypes = PropTypes.shape({
    // The login of the person (either email or phone number)
    login: PropTypes.string.isRequired,

    // The URL of the person's avatar (there should already be a default avatar if
    // the person doesn't have their own avatar uploaded yet)
    avatar: PropTypes.string.isRequired,

    // This is either the user's full name, or their login if full name is an empty string
    displayName: PropTypes.string.isRequired,
});

const propTypes = {
    // All of the personal details for everyone
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes).isRequired,

    // All reports shared with the user
    reports: PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
    }).isRequired,

    // Session of currently logged in user
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,

    ...windowDimensionsPropTypes,
};

class NewChatPage extends Component {
    constructor(props) {
        super(props);

        this.createNewChat = this.createNewChat.bind(this);

        const {
            personalDetails,
            userToInvite,
        } = getNewChatOptions(
            props.reports,
            props.personalDetails,
            '',
        );

        this.state = {
            searchValue: '',
            personalDetails,
            userToInvite,
        };
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    getSections() {
        const sections = [];

        sections.push({
            title: 'CONTACTS',
            data: this.state.personalDetails,
            shouldShow: this.state.personalDetails.length > 0,
            indexOffset: sections.reduce((prev, {data}) => prev + data.length, 0),
        });

        if (this.state.userToInvite) {
            sections.push(({
                undefined,
                data: [this.state.userToInvite],
                shouldShow: true,
                indexOffset: 0,
            }));
        }

        return sections;
    }

    /**
     * Creates a new chat with the option
     * @param {Object} option
     */
    createNewChat(option) {
        fetchOrCreateChatReportAndRedirect([
            this.props.session.email,
            option.login,
        ]);
    }

    render() {
        const sections = this.getSections();
        const headerMessage = getHeaderMessage(
            this.state.personalDetails.length !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchValue,
        );

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title="New Chat"
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <View style={[styles.flex1, styles.w100]}>
                    <OptionsSelector
                        sections={sections}
                        value={this.state.searchValue}
                        onSelectRow={this.createNewChat}
                        onChangeText={(searchValue = '') => {
                            const {
                                personalDetails,
                                userToInvite,
                            } = getNewChatOptions(
                                this.props.reports,
                                this.props.personalDetails,
                                searchValue,
                            );
                            this.setState({
                                searchValue,
                                userToInvite,
                                personalDetails,
                            });
                        }}
                        headerMessage={headerMessage}
                        hideSectionHeaders
                        disableArrowKeysActions
                        hideAdditionalOptionStates
                        forceTextUnreadStyle
                    />
                </View>
                <KeyboardSpacer />
            </ScreenWrapper>
        );
    }
}

NewChatPage.propTypes = propTypes;

export default withWindowDimensions(withOnyx({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(NewChatPage));
