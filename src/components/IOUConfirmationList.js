import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {ScrollView} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import Text from './Text';
import themeColors from '../styles/themes/default';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import OptionsList from './OptionsList';
import ONYXKEYS from '../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import FixedFooter from './FixedFooter';
import TextInput from './TextInput';
import CONST from '../CONST';
import ButtonWithMenu from './ButtonWithMenu';
import Log from '../libs/Log';
import SettlementButton from './SettlementButton';
import ROUTES from '../ROUTES';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    /** Callback to to parent modal to send money */
    onSendMoney: PropTypes.func.isRequired,

    // Callback to update comment from IOUModal
    onUpdateComment: PropTypes.func,

    /** Comment value from IOUModal */
    comment: PropTypes.string,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.string.isRequired,

    /** IOU type */
    iouType: PropTypes.string,

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
        payPalMeAddress: PropTypes.string,
        phoneNumber: PropTypes.string,
    })).isRequired,

    /** Whether this is an IOU split and belongs to a group report */
    isGroupSplit: PropTypes.bool.isRequired,

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
    }),

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (creating the IOU Report) */
        loading: PropTypes.bool,

        // Selected Currency Code of the current IOU
        selectedCurrencyCode: PropTypes.string,
    }),

    /** Information about the network */
    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,
};

const defaultProps = {
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
    onUpdateComment: null,
    comment: '',
    network: {},
    myPersonalDetails: {},
    iouType: CONST.IOU.IOU_TYPE.REQUEST,
};

class IOUConfirmationList extends Component {
    constructor(props) {
        super(props);

        const formattedParticipants = _.map(this.getParticipantsWithAmount(props.participants), participant => ({
            ...participant, selected: true,
        }));

        this.splitOrRequestOptions = [{
            text: props.translate(props.hasMultipleParticipants ? 'iou.split' : 'iou.request', {
                amount: props.numberFormat(
                    props.iouAmount,
                    {style: 'currency', currency: props.iou.selectedCurrencyCode},
                ),
            }),
            value: props.hasMultipleParticipants ? CONST.IOU.IOU_TYPE.SPLIT : CONST.IOU.IOU_TYPE.REQUEST,
        }];

        this.state = {
            participants: formattedParticipants,
        };
        this.state.focusedIndex = OptionsListUtils.flattenSections(this.getSections()).length;

        this.toggleOption = this.toggleOption.bind(this);
        this.confirm = this.confirm.bind(this);
        this.scrollToFocusedIndex = this.scrollToFocusedIndex.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        // We need to wait for the transition animation to end before focusing the TextInput,
        // otherwise the TextInput isn't animated correctly
        setTimeout(() => this.textInput.focus(), CONST.ANIMATED_TRANSITION);
    }

    /**
     * Get selected participants
     * @returns {Array}
     */
    getSelectedParticipants() {
        return _.filter(this.state.participants, participant => participant.selected);
    }

    /**
     * Get unselected participants
     * @returns {Array}
     */
    getUnselectedParticipants() {
        return _.filter(this.state.participants, participant => !participant.selected);
    }

    /**
     * Returns the participants with amount
     * @param {Array} participants
     * @returns {Array}
     */
    getParticipantsWithAmount(participants) {
        return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(
            participants,
            this.props.numberFormat(this.calculateAmount(participants) / 100, {
                style: 'currency',
                currency: this.props.iou.selectedCurrencyCode,
            }),
        );
    }

    /**
     * Returns the participants without amount
     * @param {Array} participants
     * @returns {Array}
     */
    getParticipantsWithoutAmount(participants) {
        return _.map(participants, option => _.omit(option, 'descriptiveText'));
    }

    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    getSections() {
        const sections = [];
        if (this.props.hasMultipleParticipants) {
            const selectedParticipants = this.getSelectedParticipants();
            const unselectedParticipants = this.getUnselectedParticipants();

            const formattedSelectedParticipants = this.getParticipantsWithAmount(selectedParticipants);
            const formattedUnselectedParticipants = this.getParticipantsWithoutAmount(unselectedParticipants);

            const formattedMyPersonalDetails = OptionsListUtils.getIOUConfirmationOptionsFromMyPersonalDetail(
                this.props.myPersonalDetails,
                this.props.numberFormat(this.calculateAmount(selectedParticipants, true) / 100, {
                    style: 'currency',
                    currency: this.props.iou.selectedCurrencyCode,
                }),
            );

            sections.push({
                title: this.props.translate('iOUConfirmationList.whoPaid'),
                data: [formattedMyPersonalDetails],
                shouldShow: true,
                indexOffset: 0,
            }, {
                title: this.props.translate('iOUConfirmationList.whoWasThere'),
                data: formattedSelectedParticipants,
                shouldShow: true,
                indexOffset: 1,
            }, {
                title: undefined,
                data: formattedUnselectedParticipants,
                shouldShow: !_.isEmpty(formattedUnselectedParticipants),
                indexOffset: 1 + formattedSelectedParticipants.length,
            });
        } else {
            const formattedParticipants = OptionsListUtils.getIOUConfirmationOptionsFromParticipants(this.props.participants,
                this.props.numberFormat(this.props.iouAmount, {
                    style: 'currency',
                    currency: this.props.iou.selectedCurrencyCode,
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
     * @returns {Array|null}
     */
    getSplits() {
        // There can only be splits when there are multiple participants, so return early when there are not
        // multiple participants
        if (!this.props.hasMultipleParticipants) {
            return null;
        }
        const selectedParticipants = this.getSelectedParticipants();
        const splits = _.map(selectedParticipants, participant => ({
            email: OptionsListUtils.addSMSDomainIfPhoneNumber(participant.login),

            // We should send in cents to API
            // Cents is temporary and there must be support for other currencies in the future
            amount: this.calculateAmount(selectedParticipants),
        }));

        splits.push({
            email: OptionsListUtils.addSMSDomainIfPhoneNumber(this.props.myPersonalDetails.login),

            // The user is default and we should send in cents to API
            // USD is temporary and there must be support for other currencies in the future
            amount: this.calculateAmount(selectedParticipants, true),
        });
        return splits;
    }

    /**
     * Returns selected options -- there is checkmark for every row in List for split flow
     * @returns {Array}
     */
    getSelectedOptions() {
        if (!this.props.hasMultipleParticipants) {
            return [];
        }
        const selectedParticipants = this.getSelectedParticipants();
        return [
            ...selectedParticipants,
            OptionsListUtils.getIOUConfirmationOptionsFromMyPersonalDetail(this.props.myPersonalDetails),
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
    * Toggle selected option's selected prop.
    * @param {Object} option
    */
    toggleOption(option) {
        // Return early if selected option is currently logged in user.
        if (option.login === this.props.session.email) {
            return;
        }

        this.setState((prevState) => {
            const newParticipants = _.map(prevState.participants, (participant) => {
                if (participant.login === option.login) {
                    return {...option, selected: !option.selected};
                }
                return participant;
            });
            return {participants: newParticipants};
        });
    }

    /**
     * Scrolls to the focused index within the SectionList
     *
     * @param {Number} sectionIndex
     * @param {Number} itemIndex
     */
    scrollToFocusedIndex(sectionIndex, itemIndex) {
        if (!this.list) {
            return;
        }

        // Note: react-native's SectionList automatically strips out any empty sections.
        // So we need to reduce the sectionIndex to remove any empty sections in front of the one we're trying to scroll to.
        // Otherwise, it will cause an index-out-of-bounds error and crash the app.
        let adjustedSectionIndex = sectionIndex;
        for (let i = 0; i < sectionIndex; i++) {
            if (_.isEmpty(lodashGet(this.props.sections, `[${i}].data`))) {
                adjustedSectionIndex--;
            }
        }

        this.list.scrollToLocation({sectionIndex: adjustedSectionIndex, itemIndex});
    }


    /**
     * Delegate key presses to specific callbacks
     *
     * @param {SyntheticEvent} e
     */
    handleKeyPress(e) {
        const allOptions = OptionsListUtils.flattenSections(this.getSections());
        switch (e.nativeEvent.key) {
            case 'Enter': {
                if (this.state.focusedIndex === allOptions.length) {
                    return;
                }

                e.preventDefault();

                if (this.props.hasMultipleParticipants) {
                    this.toggleOption(allOptions[this.state.focusedIndex]);
                }

                break;
            }
            case 'ArrowDown': {
                this.setState((prevState) => {
                    let newFocusedIndex = prevState.focusedIndex + 1;

                    // Wrap around to the top of the list
                    if (newFocusedIndex > allOptions.length - 1) {
                        newFocusedIndex = 0;
                    }

                    const {index, sectionIndex} = allOptions[newFocusedIndex];
                    this.scrollToFocusedIndex(sectionIndex, index);
                    return {focusedIndex: newFocusedIndex};
                });
                e.preventDefault();
                break;
            }

            case 'ArrowUp': {
                this.setState((prevState) => {
                    let newFocusedIndex = prevState.focusedIndex - 1;

                    // Wrap around to the bottom of the list
                    if (newFocusedIndex < 0) {
                        newFocusedIndex = allOptions.length - 1;
                    }

                    const {index, sectionIndex} = allOptions[newFocusedIndex];
                    this.scrollToFocusedIndex(sectionIndex, index);
                    return {focusedIndex: newFocusedIndex};
                });
                e.preventDefault();
                break;
            }

            default:
        }
    }

    /**
     * @param {String} value
     */
    confirm(value) {
        if (this.props.iouType === CONST.IOU.IOU_TYPE.SEND) {
            Log.info(`[IOU] Sending money via: ${value}`);
            this.props.onSendMoney(value);
        } else {
            Log.info(`[IOU] Requesting money via: ${value}`);
            this.props.onConfirm(this.getSplits());
        }
    }

    render() {
        const hoverStyle = this.props.hasMultipleParticipants ? styles.hoveredComponentBG : {};
        const toggleOption = this.props.hasMultipleParticipants ? this.toggleOption : undefined;
        const selectedParticipants = this.getSelectedParticipants();
        const shouldShowSettlementButton = this.props.iouType === CONST.IOU.IOU_TYPE.SEND;
        const shouldDisableButton = selectedParticipants.length === 0 || this.props.network.isOffline;
        const isLoading = this.props.iou.loading && !this.props.network.isOffline;
        const recipient = this.state.participants[0];
        return (
            <>
                <ScrollView style={[styles.flexGrow0, styles.flexShrink1, styles.flexBasisAuto, styles.w100]}>
                    <OptionsList
                        ref={e => this.list = e}
                        sections={this.getSections()}
                        focusedIndex={this.state.focusedIndex}
                        hideAdditionalOptionStates
                        forceTextUnreadStyle
                        canSelectMultipleOptions={this.props.hasMultipleParticipants}
                        selectedOptions={this.getSelectedOptions()}
                        onSelectRow={toggleOption}
                        disableRowInteractivity={!this.props.isGroupSplit}
                        optionHoveredStyle={hoverStyle}
                    />
                </ScrollView>
                <View style={[styles.ph5, styles.pv5, styles.flexGrow1, styles.flexShrink0, styles.iouConfirmComment]}>
                    <TextInput
                        ref={el => this.textInput = el}
                        label={this.props.translate('iOUConfirmationList.whatsItFor')}
                        value={this.props.comment}
                        onKeyPress={this.handleKeyPress}
                        onChangeText={this.props.onUpdateComment}
                        placeholder={this.props.translate('common.optional')}
                        placeholderTextColor={themeColors.placeholderText}
                    />
                </View>
                <FixedFooter>
                    {this.props.network.isOffline && (
                        <Text style={[styles.formError, styles.pb2]}>
                            {this.props.translate('session.offlineMessage')}
                        </Text>
                    )}
                    {shouldShowSettlementButton ? (
                        <SettlementButton
                            isDisabled={shouldDisableButton}
                            isLoading={this.props.iou.loading && !this.props.network.isOffline}
                            onPress={this.confirm}
                            shouldShowPaypal={Boolean(recipient.payPalMeAddress)}
                            recipientPhoneNumber={recipient.phoneNumber}
                            enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                            addBankAccountRoute={ROUTES.IOU_SEND_ADD_BANK_ACCOUNT}
                            addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                            currency={this.props.iou.selectedCurrencyCode}
                        />
                    ) : (
                        <ButtonWithMenu
                            isDisabled={shouldDisableButton}
                            isLoading={isLoading}
                            onPress={(_event, value) => {
                                const allOptions = OptionsListUtils.flattenSections(this.getSections());
                                if (this.state.focusedIndex !== allOptions.length) {
                                    return;
                                }
                                this.confirm(value);
                            }}
                            options={this.splitOrRequestOptions}
                        />
                    )}
                </FixedFooter>
            </>
        );
    }
}

IOUConfirmationList.propTypes = propTypes;
IOUConfirmationList.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        network: {
            key: ONYXKEYS.NETWORK,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(IOUConfirmationList);
