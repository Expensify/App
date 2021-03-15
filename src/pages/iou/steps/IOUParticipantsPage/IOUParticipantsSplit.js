import React, {Component} from 'react';
import {
    Pressable,
    View,
    Text,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import {hide as hideSidebar} from '../../../../libs/actions/Sidebar';
import ONYXKEYS from '../../../../ONYXKEYS';
import styles from '../../../../styles/styles';
import OptionsSelector from '../../../../components/OptionsSelector';
import {getNewGroupOptions} from '../../../../libs/OptionsListUtils';
import CONST from '../../../../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';

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
    // Callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    // All of the personal details for everyone
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes).isRequired,

    // All reports shared with the user
    reports: PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
    }).isRequired,

    /* Onyx Props */

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (retrieving participants)
        loading: PropTypes.bool,
    }),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    iou: {},
};

class IOUParticipantsSplit extends Component {
    constructor(props) {
        super(props);

        this.toggleOption = this.toggleOption.bind(this);
        this.addParticipants = this.addParticipants.bind(this);

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

    /**
     * Once a single or more users are selected, adds the selected user emails with the request
     */
    addParticipants() {
        const userEmails = this.state.selectedOptions.map(selectedOption => selectedOption.login);
        this.props.onStepComplete(userEmails);
        if (this.props.isSmallScreenWidth) {
            hideSidebar();
        }
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
                isOptionInList ? prevState.searchValue : '',
                newSelectedOptions,
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

        return (
            <View style={[styles.flex1, styles.w100]}>
                <Text style={[styles.formLabel, styles.pt3, styles.ph5]}>
                    To
                </Text>
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
                    disableArrowKeysActions
                    hideAdditionalOptionStates
                    forceTextUnreadStyle
                />
                {this.state.selectedOptions?.length > 0 && (
                    <View style={[styles.ph5, styles.pb5]}>
                        <Pressable
                            onPress={this.addParticipants}
                            style={({hovered}) => [
                                styles.button,
                                styles.buttonSuccess,
                                styles.w100,
                                hovered && styles.buttonSuccessHovered,
                            ]}
                        >
                            <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                                Next
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>
        );
    }
}


IOUParticipantsSplit.displayName = 'IOUParticipantsSplit';
IOUParticipantsSplit.propTypes = propTypes;
IOUParticipantsSplit.defaultProps = defaultProps;

export default withWindowDimensions(withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(IOUParticipantsSplit));
