import _ from 'underscore';
import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import OptionsSelector from '../components/OptionsSelector';
import {getNewGroupOptions} from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import {fetchOrCreateChatReport} from '../libs/actions/Report';
import CONST from '../CONST';

const personalDetailsPropTypes = PropTypes.shape({
    // The login of the person (either email or phone number)
    login: PropTypes.string.isRequired,

    // The URL of the person's avatar (there should already be a default avatarURL if
    // the person doesn't have their own avatar uploaded yet)
    avatarURL: PropTypes.string.isRequired,

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
            '',
            [],
        );

        this.state = {
            searchValue: '',
            recentReports,
            personalDetails,
            selectedOptions: [],
            userToInvite,
        };
    }

    getHeaderTitleAndMessage() {
        const maxParticipantsReached = this.state.selectedOptions.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
        if (maxParticipantsReached) {
            return {
                headerTitle: 'Maximum participants reached',
                headerMessage: 'You\'ve reached the maximum number of participants for a group chat.',
            };
        }

        const hasSelectableOptions = this.state.personalDetails.length + this.state.recentReports.length !== 0;
        if (!hasSelectableOptions && !this.state.userToInvite) {
            return {
                headerTitle: '',
                // eslint-disable-next-line max-len
                headerMessage: 'Don\'t see who you\'re looking for? Type their email or phone number to invite them to chat.',
            };
        }

        return {
            headerTitle: '',
            headerMessage: '',
        };
    }

    getSections() {
        const sections = [];
        sections.push({
            title: undefined,
            data: this.state.selectedOptions,
            shouldShow: true,
            indexOffset: 0,
        });
        sections.push({
            title: 'RECENTS',
            data: this.state.recentReports,
            shouldShow: this.state.recentReports.length > 0,
            indexOffset: sections.reduce((prev, {data}) => prev + data.length, 0),
        });
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

    createGroup() {
        const userLogins = _.map(this.state.selectedOptions, option => option.login);
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
                this.state.searchValue,
                newSelectedOptions,
            );

            return {
                selectedOptions: newSelectedOptions,
                recentReports,
                personalDetails,
                userToInvite,
            };
        });
    }

    render() {
        const sections = this.getSections();
        const {headerTitle, headerMessage} = this.getHeaderTitleAndMessage();
        return (
            <View style={[styles.flex1, styles.p2]}>
                <HeaderWithCloseButton
                    title="New Group"
                />
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
                            searchValue,
                            [],
                        );
                        this.setState({
                            searchValue,
                            userToInvite,
                            recentReports,
                            personalDetails,
                        });
                    }}
                    headerTitle={headerTitle}
                    headerMessage={headerMessage}
                />
                <TouchableOpacity
                    onPress={this.createGroup}
                    style={[styles.button, styles.buttonSuccess, styles.w100, styles.mt5]}
                >
                    <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                        Create Group
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

NewGroupPage.propTypes = propTypes;

export default withOnyx({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(NewGroupPage);
