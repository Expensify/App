import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {TextInput} from 'react-native-gesture-handler';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import themeColors from '../../../styles/themes/default';
import {
    getDisplayOptionFromMyPersonalDetail,
    getDisplayOptionsFromParticipants,
} from '../../../libs/OptionsListUtils';
import ButtonWithLoader from '../../../components/ButtonWithLoader';
import OptionsList from '../../../components/OptionsList';

const propTypes = {
    // Callback to inform parent modal of success
    onConfirm: PropTypes.func.isRequired,

    // callback to update comment from IOUModal
    onUpdateComment: PropTypes.func,

    // comment value from IOUModal
    comment: PropTypes.string,

    // Should we request a single or multiple participant selection from user
    hasMultipleParticipants: PropTypes.bool.isRequired,

    // IOU amount
    iouAmount: PropTypes.string.isRequired,

    // Selected currency from the user
    // remove eslint disable after currency symbol is available
    // eslint-disable-next-line react/no-unused-prop-types
    selectedCurrency: PropTypes.string.isRequired,

    // Selected participants from IOUMOdal with login
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
        participantsList: PropTypes.arrayOf(PropTypes.object),
    })).isRequired,

    /* Onyx Props */

    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({

        // Display name of the current user from their personal details
        displayName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatar: PropTypes.string,

        // Primary login of the user
        login: PropTypes.string,
    }).isRequired,

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (creating the IOU Report)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    iou: {},
    onUpdateComment: null,
    comment: '',
};

class IOUConfirmPage extends Component {
    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @param {Boolean} maxParticipantsReached
     * @returns {Array}
     */
    getSections() {
        const sections = [];

        if (this.props.hasMultipleParticipants) {
            const formattedMyPersonalDetails = getDisplayOptionFromMyPersonalDetail(this.props.myPersonalDetails,

                // convert from cent to bigger form
                `$${this.calculateAmount(true) / 100}`);
            const formattedParticipants = getDisplayOptionsFromParticipants(this.props.participants,
                `$${this.calculateAmount() / 100}`);

            sections.push({
                title: 'WHO PAID?',
                data: formattedMyPersonalDetails,
                shouldShow: true,
                indexOffset: 0,
            });
            sections.push({
                title: 'WHO WAS THERE?',
                data: formattedParticipants,
                shouldShow: true,
                indexOffset: 0,
            });
        } else {
        // $ should be replaced by currency symbol once available
            const formattedParticipants = getDisplayOptionsFromParticipants(this.props.participants,
                `$${this.props.iouAmount}`);

            sections.push({
                title: 'TO',
                data: formattedParticipants,
                shouldShow: true,
                indexOffset: 0,
            });
        }
        return sections;
    }

    /**
     * Gets splits for the transaction
     *
     * @returns {Array}
     */
    getSplits() {
        const splits = this.props.participants.map(participant => ({
            email: participant.login,

            // we should send in cents to API
            amount: this.calculateAmount(),
        }));

        splits.push({
            email: this.props.myPersonalDetails.login,

            // the user is default and we should send in cents to API
            amount: this.calculateAmount(true),
        });
        return splits;
    }

    /**
     * Gets participants list for a report
     *
     * @returns {Array}
     */
    getParticipants() {
        const participants = this.props.participants.map(participant => participant.login);
        participants.push(this.props.myPersonalDetails.login);
        return participants;
    }

    /**
     * Returns selected options with all participant logins
     * @returns {Array}
     */
    getAllOptionsAsSelected() {
        return [...this.props.participants,
            getDisplayOptionFromMyPersonalDetail(this.props.myPersonalDetails)];
    }

    /**
     * Calculates the amount per user
     * @param {Boolean} isDefaultUser
     * @returns {Number}
     */
    calculateAmount(isDefaultUser = false) {
        // convert to cents before working with iouAmount to avoid
        // javascript subtraction with decimal problem
        const iouAmount = Math.round(parseFloat(this.props.iouAmount * 100));
        const totalParticipants = this.props.participants.length + 1;

        const amountPerPerson = Math.round(iouAmount / totalParticipants);

        const sumAmount = amountPerPerson * totalParticipants;

        const difference = iouAmount - sumAmount;

        if (!isDefaultUser) { return amountPerPerson; }

        return iouAmount !== sumAmount ? (amountPerPerson + difference) : amountPerPerson;
    }

    render() {
        const sections = this.getSections();
        return (
            <View style={[styles.flex1, styles.w100, styles.justifyContentBetween]}>
                <View>
                    <OptionsList
                        sections={sections}
                        disableArrowKeysActions
                        hideAdditionalOptionStates
                        forceTextUnreadStyle
                        canSelectMultipleOptions={this.props.hasMultipleParticipants}
                        disableFocusOptions
                        selectedOptions={this.props.hasMultipleParticipants && this.getAllOptionsAsSelected()}
                    />
                    <View>
                        <Text style={[styles.p5, styles.textMicroBold, styles.colorHeading]}>
                            WHAT&apos;S IT FOR?
                        </Text>
                    </View>
                    <View style={[styles.ph5]}>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.props.comment}
                            onChangeText={this.props.onUpdateComment}
                            placeholder="Optional"
                            placeholderTextColor={themeColors.placeholderText}
                        />
                    </View>
                </View>
                <View style={[styles.ph5, styles.pb3]}>
                    <ButtonWithLoader
                        isLoading={this.props.iou.loading}
                        text={this.props.hasMultipleParticipants ? 'Split' : `Request $${this.props.iouAmount}`}
                        onClick={() => {
                            if (this.props.hasMultipleParticipants) {
                                this.props.onConfirm({
                                    splits: this.getSplits(),
                                    participants: this.getParticipants(),
                                });
                            } else {
                                this.props.onConfirm({
                                    debtorEmail: this.props.participants[0].login,
                                });
                            }
                        }}
                    />
                </View>
            </View>
        );
    }
}

IOUConfirmPage.displayName = 'IOUConfirmPage';
IOUConfirmPage.propTypes = propTypes;
IOUConfirmPage.defaultProps = defaultProps;

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    myPersonalDetails: {
        key: ONYXKEYS.MY_PERSONAL_DETAILS,
    },
})(IOUConfirmPage);
