import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import OptionsSelector from '../components/OptionsSelector';
import {getNewChatOptions, getHeaderMessage} from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import {fetchOrCreateChatReport} from '../libs/actions/Report';
import KeyboardSpacer from '../components/KeyboardSpacer';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';

const personalDetailsPropTypes = PropTypes.shape({
    /** The login of the person (either email or phone number) */
    login: PropTypes.string.isRequired,

    /** The URL of the person's avatar (there should already be a default avatar if
    the person doesn't have their own avatar uploaded yet) */
    avatar: PropTypes.string.isRequired,

    /** This is either the user's full name, or their login if full name is an empty string */
    displayName: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
});

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes).isRequired,

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
};

class NewChatPage extends Component {
    constructor(props) {
        super(props);

        this.createNewChat = this.createNewChat.bind(this);
        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = getNewChatOptions(
            props.reports,
            props.personalDetails,
            props.betas,
        );

        this.state = {
            searchValue: '',
            recentReports,
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
            title: this.props.translate('common.recents'),
            data: this.state.recentReports,
            shouldShow: !_.isEmpty(this.state.recentReports),
            indexOffset: sections.reduce((prev, {data}) => prev + data.length, 0),
        });

        sections.push({
            title: this.props.translate('common.contacts'),
            data: this.state.personalDetails,
            shouldShow: !_.isEmpty(this.state.personalDetails),
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
        fetchOrCreateChatReport([
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
                {({didScreenTransitionEnd}) => (
                    <>
                        <HeaderWithCloseButton
                            title={this.props.translate('sidebarScreen.newChat')}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />
                        <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                            <FullScreenLoadingIndicator visible={!didScreenTransitionEnd} />
                            {didScreenTransitionEnd && (
                            <OptionsSelector
                                sections={sections}
                                value={this.state.searchValue}
                                onSelectRow={this.createNewChat}
                                onChangeText={(searchValue = '') => {
                                    const {
                                        recentReports,
                                        personalDetails,
                                        userToInvite,
                                    } = getNewChatOptions(
                                        this.props.reports,
                                        this.props.personalDetails,
                                        this.props.betas,
                                        searchValue,
                                    );
                                    this.setState({
                                        searchValue,
                                        recentReports,
                                        userToInvite,
                                        personalDetails,
                                    });
                                }}
                                headerMessage={headerMessage}
                                disableArrowKeysActions
                                hideAdditionalOptionStates
                                forceTextUnreadStyle
                            />
                            )}
                        </View>
                        <KeyboardSpacer />
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

NewChatPage.propTypes = propTypes;

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
