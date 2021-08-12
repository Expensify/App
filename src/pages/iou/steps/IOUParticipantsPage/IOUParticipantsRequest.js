import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import {getNewChatOptions, isCurrentUser} from '../../../../libs/OptionsListUtils';
import OptionsSelector from '../../../../components/OptionsSelector';
import ONYXKEYS from '../../../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';

const personalDetailsPropTypes = PropTypes.shape({
    /** The login of the person (either email or phone number) */
    login: PropTypes.string.isRequired,

    /** The URL of the person's avatar (there should already be a default avatar if the person doesn't have
     * their own avatar uploaded yet) */
    avatar: PropTypes.string.isRequired,

    /** This is either the user's full name, or their login if full name is an empty string */
    displayName: PropTypes.string.isRequired,
});

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** Callback to add participants in IOUModal */
    onAddParticipants: PropTypes.func.isRequired,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes).isRequired,

    /** All reports shared with the user */
    reports: PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

class IOUParticipantsRequest extends Component {
    constructor(props) {
        super(props);

        this.addSingleParticipant = this.addSingleParticipant.bind(this);

        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = getNewChatOptions(
            props.reports,
            props.personalDetails,
            '',
            true,
            props.betas,
        );

        this.state = {
            recentReports,
            personalDetails,
            userToInvite,
            searchValue: '',
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
            indexOffset: 0,
        });

        if (this.state.userToInvite && !isCurrentUser(this.state.userToInvite)) {
            sections.push({
                undefined,
                data: [this.state.userToInvite],
                shouldShow: true,
                indexOffset: 0,
            });
        }

        return sections;
    }

    /**
     * Adds a single participant to the request
     *
     * @param {Object} option
     */
    addSingleParticipant(option) {
        this.props.onAddParticipants([option]);
        this.props.onStepComplete();
    }

    render() {
        const sections = this.getSections();
        return (
            <OptionsSelector
                direction={this.props.direction}
                sections={sections}
                value={this.state.searchValue}
                onSelectRow={this.addSingleParticipant}
                onChangeText={(searchValue = '') => {
                    const {
                        recentReports,
                        personalDetails,
                        userToInvite,
                    } = getNewChatOptions(
                        this.props.reports,
                        this.props.personalDetails,
                        searchValue,
                        true,
                        this.props.betas,
                    );
                    this.setState({
                        searchValue,
                        recentReports,
                        userToInvite,
                        personalDetails,
                    });
                }}
                disableArrowKeysActions
                hideAdditionalOptionStates
                forceTextUnreadStyle
            />
        );
    }
}

IOUParticipantsRequest.displayName = 'IOUParticipantsRequest';
IOUParticipantsRequest.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(IOUParticipantsRequest);
