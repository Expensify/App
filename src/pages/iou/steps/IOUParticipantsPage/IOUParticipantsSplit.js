import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';
import styles from '../../../../styles/styles';
import OptionsSelector from '../../../../components/OptionsSelector';
import * as OptionsListUtils from '../../../../libs/OptionsListUtils';
import CONST from '../../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import Button from '../../../../components/Button';
import Text from '../../../../components/Text';
import FixedFooter from '../../../../components/FixedFooter';
import personalDetailsPropType from '../../../personalDetailsPropType';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** Callback to add participants in IOUModal */
    onAddParticipants: PropTypes.func.isRequired,

    /** Selected participants from IOUModal with login */
    participants: PropTypes.arrayOf(PropTypes.shape({
        login: PropTypes.string.isRequired,
        alternateText: PropTypes.string,
        hasDraftComment: PropTypes.bool,
        icons: PropTypes.arrayOf(PropTypes.string),
        searchText: PropTypes.string,
        text: PropTypes.string,
        keyForList: PropTypes.string,
        isPinned: PropTypes.bool,
        isUnread: PropTypes.bool,
        reportID: PropTypes.number,
    })),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType).isRequired,

    /** All reports shared with the user */
    reports: PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    participants: [],
};

class IOUParticipantsSplit extends Component {
    constructor(props) {
        super(props);

        this.toggleOption = this.toggleOption.bind(this);
        this.finalizeParticipants = this.finalizeParticipants.bind(this);

        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getNewChatOptions(
            props.reports,
            props.personalDetails,
            props.betas,
            '',
            props.participants,
            CONST.EXPENSIFY_EMAILS,
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
     * @param {Boolean} maxParticipantsReached
     * @returns {Array}
     */
    getSections(maxParticipantsReached) {
        const sections = [];
        sections.push({
            title: undefined,
            data: this.props.participants,
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

            // takes the sum off the length of all data
            // (this.state.selectedOptions) in previous sections
            indexOffset: _.reduce(sections, (prev, {data}) => prev + data.length, 0),
        });

        sections.push({
            title: this.props.translate('common.contacts'),
            data: this.state.personalDetails,
            shouldShow: !_.isEmpty(this.state.personalDetails),

            // takes the sum off the length of all data
            // (this.state.selectedOptions, this.state.recentReports) in previous sections
            indexOffset: _.reduce(sections, (prev, {data}) => prev + data.length, 0),
        });

        if (this.state.userToInvite && !OptionsListUtils.isCurrentUser(this.state.userToInvite)) {
            sections.push(({
                undefined,
                data: [this.state.userToInvite],
                shouldShow: true,
                indexOffset: _.reduce(sections, (prev, {data}) => prev + data.length, 0),
            }));
        }

        return sections;
    }

    /**
     * Once a single or more users are selected, navigates to next step
     */
    finalizeParticipants() {
        this.props.onStepComplete();
    }

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    toggleOption(option) {
        const isOptionInList = _.some(this.props.participants, selectedOption => (
            selectedOption.login === option.login
        ));

        let newSelectedOptions;

        if (isOptionInList) {
            newSelectedOptions = _.reject(this.props.participants, selectedOption => (
                selectedOption.login === option.login
            ));
        } else {
            newSelectedOptions = [...this.props.participants, option];
        }

        this.props.onAddParticipants(newSelectedOptions);

        this.setState((prevState) => {
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
                CONST.EXPENSIFY_EMAILS,
            );
            return {
                recentReports,
                personalDetails,
                userToInvite,
                searchValue: isOptionInList ? prevState.searchValue : '',
            };
        });
    }

    render() {
        const maxParticipantsReached = this.props.participants.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
        const sections = this.getSections(maxParticipantsReached);
        const headerMessage = !maxParticipantsReached ? OptionsListUtils.getHeaderMessage(
            this.state.personalDetails.length + this.state.recentReports.length !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchValue,
        ) : '';
        return (
            <>
                <View style={[styles.flex1, styles.w100]}>
                    <Text style={[styles.formLabel, styles.pt3, styles.ph5]}>
                        {this.props.translate('common.to')}
                    </Text>
                    <OptionsSelector
                        canSelectMultipleOptions
                        sections={sections}
                        selectedOptions={this.props.participants}
                        value={this.state.searchValue}
                        onSelectRow={this.toggleOption}
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
                                CONST.EXPENSIFY_EMAILS,
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
                        shouldDelayFocus
                    />
                </View>
                {lodashGet(this.props, 'participants', []).length > 0 && (
                    <FixedFooter>
                        {maxParticipantsReached && (
                            <Text style={[styles.textLabelSupporting, styles.textAlignCenter, styles.mt1, styles.mb3]}>
                                {this.props.translate('iou.maxParticipantsReached', {count: CONST.REPORT.MAXIMUM_PARTICIPANTS})}
                            </Text>
                        )}
                        <Button
                            success
                            style={[styles.w100]}
                            onPress={this.finalizeParticipants}
                            text={this.props.translate('common.next')}
                        />
                    </FixedFooter>
                )}
            </>
        );
    }
}

IOUParticipantsSplit.displayName = 'IOUParticipantsSplit';
IOUParticipantsSplit.propTypes = propTypes;
IOUParticipantsSplit.defaultProps = defaultProps;

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
)(IOUParticipantsSplit);
