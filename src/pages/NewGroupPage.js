import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../components/OptionsSelector';
import {getNewGroupOptions, getHeaderMessage} from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import {fetchOrCreateChatReport} from '../libs/actions/Report';
import CONST, {EXCLUDED_GROUP_EMAILS} from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import Button from '../components/Button';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import FixedFooter from '../components/FixedFooter';

const personalDetailsPropTypes = PropTypes.shape({
    /** The login of the person (either email or phone number) */
    login: PropTypes.string.isRequired,

    /** The URL of the person's avatar (there should already be a default avatar if
    the person doesn't have their own avatar uploaded yet) */
    avatar: PropTypes.string.isRequired,

    /** This is either the user's full name, or their login if full name is an empty string */
    displayName: PropTypes.string.isRequired,
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

    ...withLocalizePropTypes,
};

class NewGroupPage extends Component {
    constructor(props) {
        super(props);

        this.toggleOption = this.toggleOption.bind(this);
        this.createGroup = this.createGroup.bind(this);
        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = getNewGroupOptions(
            props.reports,
            props.personalDetails,
            props.betas,
            '',
            [],
            EXCLUDED_GROUP_EMAILS,
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
        sections.push({
            title: undefined,
            data: this.state.selectedOptions,
            shouldShow: true,
            indexOffset: 0,
        });

        if (maxParticipantsReached) {
            return sections;
        }

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
     * Once all our options are selected this method will call the API and  create new chat between all selected users
     * and the currently logged in user
     */
    createGroup() {
        const userLogins = _.map(this.state.selectedOptions, option => option.login);
        if (userLogins.length < 1) {
            return;
        }
        fetchOrCreateChatReport([this.props.session.email, ...userLogins]);
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
            } = getNewGroupOptions(
                this.props.reports,
                this.props.personalDetails,
                this.props.betas,
                isOptionInList ? prevState.searchValue : '',
                newSelectedOptions,
                EXCLUDED_GROUP_EMAILS,
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

    render() {
        const maxParticipantsReached = this.state.selectedOptions.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
        const sections = this.getSections(maxParticipantsReached);
        const headerMessage = getHeaderMessage(
            this.state.personalDetails.length + this.state.recentReports.length !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchValue,
            maxParticipantsReached,
        );
        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <KeyboardAvoidingView>
                        <HeaderWithCloseButton
                            title={this.props.translate('sidebarScreen.newGroup')}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />
                        <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                            <FullScreenLoadingIndicator visible={!didScreenTransitionEnd} />
                            {didScreenTransitionEnd && (
                                <>
                                    <View style={[styles.flex1, styles.w100]}>
                                        <OptionsSelector
                                            canSelectMultipleOptions
                                            sections={sections}
                                            selectedOptions={this.state.selectedOptions}
                                            value={this.state.searchValue}
                                            onSelectRow={this.toggleOption}
                                            onChangeText={(searchValue = '') => {
                                                const {
                                                    recentReports,
                                                    personalDetails,
                                                    userToInvite,
                                                } = getNewGroupOptions(
                                                    this.props.reports,
                                                    this.props.personalDetails,
                                                    this.props.betas,
                                                    searchValue,
                                                    [],
                                                    EXCLUDED_GROUP_EMAILS,
                                                );
                                                this.setState({
                                                    searchValue,
                                                    userToInvite,
                                                    recentReports,
                                                    personalDetails,
                                                });
                                            }}
                                            headerMessage={headerMessage}
                                            disableArrowKeysActions
                                            hideAdditionalOptionStates
                                            forceTextUnreadStyle
                                            shouldFocusOnSelectRow
                                        />
                                    </View>
                                    {this.state.selectedOptions?.length > 0 && (
                                        <FixedFooter>
                                            <Button
                                                success
                                                onPress={this.createGroup}
                                                style={[styles.w100]}
                                                text={this.props.translate('newGroupPage.createGroup')}
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

NewGroupPage.propTypes = propTypes;

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
)(NewGroupPage);
