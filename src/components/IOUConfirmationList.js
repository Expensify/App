import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import _ from 'underscore';
import styles from '../styles/styles';
import Text from './Text';
import themeColors from '../styles/themes/default';
import {
    getIOUConfirmationOptionsFromMyPersonalDetail,
    getIOUConfirmationOptionsFromParticipants,
} from '../libs/OptionsListUtils';
import OptionsList from './OptionsList';
import Button from './Button';
import ONYXKEYS from '../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import SafeAreaInsetPropTypes from '../pages/SafeAreaInsetPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import FixedFooter from './FixedFooter';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    // User's currency preference
    selectedCurrency: PropTypes.shape({
        // Currency code for the selected currency
        currencyCode: PropTypes.string,

        // Currency symbol for the selected currency
        currencySymbol: PropTypes.string,
    }).isRequired,

    // Callback to update comment from IOUModal
    onUpdateComment: PropTypes.func,

    /** Comment value from IOUModal */
    comment: PropTypes.string,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** Safe area insets required for mobile devices margins */
    insets: SafeAreaInsetPropTypes.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.string.isRequired,

    // Selected participants from IOUModal with login
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

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    /* Onyx Props */

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape({

        /** Display name of the current user from their personal details */
        displayName: PropTypes.string,

        /** Avatar URL of the current user from their personal details */
        avatar: PropTypes.string,

        /** Primary login of the user */
        login: PropTypes.string,
    }).isRequired,

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (creating the IOU Report) */
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    iou: {},
    onUpdateComment: null,
    comment: '',
};

// Gives minimum height to offset the height of
// button and comment box
const MINIMUM_BOTTOM_OFFSET = 240;

class IOUConfirmationList extends Component {
    constructor(props) {
        super(props);

        this.toggleOption = this.toggleOption.bind(this);

        const formattedSelectedParticipants = this.getFormattedSelectedParticipants(this.props.participants);

        this.state = {
            selectedParticipants: formattedSelectedParticipants,
            unselectedParticipants: [],
        };
    }

    /**
     * Returns the selectedParticipants with amount
     *
     * @param {Array} selectedParticipants
     * @returns {Array}
     */
    getFormattedSelectedParticipants(selectedParticipants) {
        return getIOUConfirmationOptionsFromParticipants(
            selectedParticipants,
            this.props.numberFormat(this.calculateAmount(selectedParticipants) / 100, {
                style: 'currency',
                currency: this.props.selectedCurrency.currencyCode,
            }),
        );
    }

    /**
     * Returns the unselectedParticipants without amount
     *
     * @param {Array} unselectedParticipants
     * @returns {Array}
     */
    getFormattedUnselectedParticipants(unselectedParticipants) {
        return unselectedParticipants.map(option => _.omit(option, 'descriptiveText'));
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @param {Boolean} maxParticipantsReached
     * @returns {Array}
     */
    getSections() {
        const sections = [];
        if (this.props.hasMultipleParticipants) {
            const formattedMyPersonalDetails = getIOUConfirmationOptionsFromMyPersonalDetail(
                this.props.myPersonalDetails,
                this.props.numberFormat(this.calculateAmount(this.state.selectedParticipants) / 100, {
                    style: 'currency',
                    currency: this.props.selectedCurrency.currencyCode,
                }),
            );

            sections.push({
                title: this.props.translate('iOUConfirmationList.whoPaid'),
                data: [formattedMyPersonalDetails],
                shouldShow: true,
                indexOffset: 0,
            });

            sections.push({
                title: this.props.translate('iOUConfirmationList.whoWasThere'),
                data: this.state.selectedParticipants,
                shouldShow: true,
                indexOffset: 0,
            });

            sections.push(({
                title: undefined,
                data: this.state.unselectedParticipants,
                shouldShow: !_.isEmpty(this.state.unselectedParticipants),
                indexOffset: 0,
            }));
        } else {
            const formattedParticipants = getIOUConfirmationOptionsFromParticipants(this.props.participants,
                this.props.numberFormat(this.props.iouAmount, {
                    style: 'currency',
                    currency: this.props.selectedCurrency.currencyCode,
                }));

            sections.push({
                title: this.props.translate('common.to').toUpperCase(),
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
     * @returns {Array|null}
     */
    getSplits() {
        // There can only be splits when there are multiple participants, so return early when there are not
        // multiple participants
        if (!this.props.hasMultipleParticipants) {
            return null;
        }

        const splits = this.state.selectedParticipants.map(participant => ({
            email: participant.login,

            // We should send in cents to API
            // Cents is temporary and there must be support for other currencies in the future
            amount: this.calculateAmount(this.state.selectedParticipants),
        }));

        splits.push({
            email: this.props.myPersonalDetails.login,

            // The user is default and we should send in cents to API
            // USD is temporary and there must be support for other currencies in the future
            amount: this.calculateAmount(this.state.selectedParticipants, true),
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
     * Returns selected options -- there is checkmark for every row in List for split flow
     * @returns {Array}
     */
    getSelectedOptions() {
        if (!this.props.hasMultipleParticipants) {
            return [];
        }
        return [
            ...this.state.selectedParticipants,
            getIOUConfirmationOptionsFromMyPersonalDetail(this.props.myPersonalDetails),
        ];
    }

    /**
     * Calculates the amount per user given a list of participants
     * @param {Array} participants
     * @param {Boolean} isDefaultUser
     * @returns {Number}
     */
    calculateAmount(participants, isDefaultUser = false) {
        // Convert to cents before working with iouAmount to avoid
        // javascript subtraction with decimal problem -- when dealing with decimals,
        // because they are encoded as IEEE 754 floating point numbers, some of the decimal
        // numbers cannot be represented with perfect accuracy.
        // Cents is temporary and there must be support for other currencies in the future
        const iouAmount = Math.round(parseFloat(this.props.iouAmount * 100));
        const totalParticipants = participants.length + 1;
        const amountPerPerson = Math.round(iouAmount / totalParticipants);

        if (!isDefaultUser) { return amountPerPerson; }

        const sumAmount = amountPerPerson * totalParticipants;
        const difference = iouAmount - sumAmount;

        return iouAmount !== sumAmount ? (amountPerPerson + difference) : amountPerPerson;
    }

    /**
    * Toggle selected option between selectedParticipant and unselectedParticipant.
    * @param {Object} option
    */
    toggleOption(option) {
        const isOptionInSelectedList = _.some(this.state.selectedParticipants, selectedOption => (
            selectedOption.login === option.login
        ));
        const isOptionInUnselectedList = _.some(this.state.unselectedParticipants, selectedOption => (
            selectedOption.login === option.login
        ));

        // selected option is self
        if (!isOptionInSelectedList && !isOptionInUnselectedList) {
            return;
        }

        let newSelectedParticipants;
        let newUnselectedParticipants;
        if (isOptionInSelectedList) {
            newSelectedParticipants = _.without(this.state.selectedParticipants, option);
            newUnselectedParticipants = [...this.state.unselectedParticipants, option];
        } else {
            newSelectedParticipants = [...this.state.selectedParticipants, option];
            newUnselectedParticipants = _.reject(this.state.unselectedParticipants, selectedOption => (
                selectedOption.login === option.login
            ));
        }

        const formattedSelectedParticipants = this.getFormattedSelectedParticipants(newSelectedParticipants);
        const formattedUnselectedParticipants = this.getFormattedUnselectedParticipants(newUnselectedParticipants);

        this.setState({
            selectedParticipants: formattedSelectedParticipants,
            unselectedParticipants: formattedUnselectedParticipants,
        });
    }

    render() {
        const buttonText = this.props.translate(
            this.props.hasMultipleParticipants ? 'iou.split' : 'iou.request', {
                amount: this.props.numberFormat(
                    this.props.iouAmount,
                    {style: 'currency', currency: this.props.selectedCurrency.currencyCode},
                ),
            },
        );
        const hoverStyle = this.props.hasMultipleParticipants ? styles.hoveredComponentBG : {};
        const toggleOption = this.props.hasMultipleParticipants ? this.toggleOption : undefined;
        return (
            <>
                <ScrollView style={[styles.flex1, styles.w100]}>
                    <OptionsList
                        listContainerStyles={[{
                            // Give max height to the list container so that it does not extend
                            // beyond the comment view as well as button
                            maxHeight: this.props.windowHeight - MINIMUM_BOTTOM_OFFSET
                                - this.props.insets.top - this.props.insets.bottom,
                        }]}
                        sections={this.getSections()}
                        disableArrowKeysActions
                        disableFocusOptions
                        hideAdditionalOptionStates
                        forceTextUnreadStyle
                        canSelectMultipleOptions={this.props.hasMultipleParticipants}
                        selectedOptions={this.getSelectedOptions()}
                        onSelectRow={toggleOption}
                        disableRowInteractivity={!this.props.hasMultipleParticipants}
                        optionHoveredStyle={hoverStyle}
                    />
                    <Text style={[styles.p5, styles.textMicroBold, styles.colorHeading]}>
                        {this.props.translate('iOUConfirmationList.whatsItFor')}
                    </Text>
                    <View style={[styles.ph5, styles.pb5]}>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.props.comment}
                            onChangeText={this.props.onUpdateComment}
                            placeholder={this.props.translate('common.optional')}
                            placeholderTextColor={themeColors.placeholderText}
                        />
                    </View>
                </ScrollView>
                <FixedFooter>
                    <Button
                        success
                        style={[styles.w100]}
                        isLoading={this.props.iou.loading}
                        isDisabled={this.state.selectedParticipants.length === 0}
                        text={buttonText}
                        onPress={() => this.props.onConfirm(this.getSplits())}
                    />
                </FixedFooter>
            </>
        );
    }
}

IOUConfirmationList.displayName = 'IOUConfirmPage';
IOUConfirmationList.propTypes = propTypes;
IOUConfirmationList.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withSafeAreaInsets,
    withWindowDimensions,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
    }),
)(IOUConfirmationList);
