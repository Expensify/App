import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../styles/styles';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import OptionsSelector from './OptionsSelector';
import ONYXKEYS from '../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import CONST from '../CONST';
import ButtonWithMenu from './ButtonWithMenu';
import Log from '../libs/Log';
import SettlementButton from './SettlementButton';
import ROUTES from '../ROUTES';
import networkPropTypes from './networkPropTypes';
import {withNetwork} from './OnyxProvider';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from './withCurrentUserPersonalDetails';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    /** Callback to parent modal to send money */
    onSendMoney: PropTypes.func.isRequired,

    /** Callback to update comment from IOUModal */
    onUpdateComment: PropTypes.func,

    /** Comment value from IOUModal */
    comment: PropTypes.string,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.string.isRequired,

    /** IOU type */
    iouType: PropTypes.string,

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
        participantsList: PropTypes.arrayOf(PropTypes.object),
        payPalMeAddress: PropTypes.string,
        phoneNumber: PropTypes.string,
    })).isRequired,

    /** Is this IOU associated with existing report */
    isIOUAttachedToExistingChatReport: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (creating the IOU Report) */
        loading: PropTypes.bool,

        // Selected Currency Code of the current IOU
        selectedCurrencyCode: PropTypes.string,
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

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
    iouType: CONST.IOU.IOU_TYPE.REQUEST,
    ...withCurrentUserPersonalDetailsDefaultProps,
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

        this.toggleOption = this.toggleOption.bind(this);
        this.confirm = this.confirm.bind(this);
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
     *
     * @param {Array} participants
     * @returns {Array}
     */
    getParticipantsWithoutAmount(participants) {
        return _.map(participants, option => _.omit(option, 'descriptiveText'));
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    getSections() {
        const sections = [];
        if (this.props.hasMultipleParticipants) {
            const selectedParticipants = this.getSelectedParticipants();
            const unselectedParticipants = this.getUnselectedParticipants();

            const formattedSelectedParticipants = this.getParticipantsWithAmount(selectedParticipants);
            const formattedUnselectedParticipants = this.getParticipantsWithoutAmount(unselectedParticipants);
            const formattedParticipants = _.union(formattedSelectedParticipants, formattedUnselectedParticipants);

            const formattedMyPersonalDetails = OptionsListUtils.getIOUConfirmationOptionsFromMyPersonalDetail(
                this.props.currentUserPersonalDetails,
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
                isDisabled: true,
            }, {
                title: this.props.translate('iOUConfirmationList.whoWasThere'),
                data: formattedParticipants,
                shouldShow: true,
                indexOffset: 1,
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
            email: OptionsListUtils.addSMSDomainIfPhoneNumber(this.props.currentUserPersonalDetails.login),

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
            OptionsListUtils.getIOUConfirmationOptionsFromMyPersonalDetail(this.props.currentUserPersonalDetails),
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
     * @param {String} paymentMethod
     */
    confirm(paymentMethod) {
        const selectedParticipants = this.getSelectedParticipants();
        if (_.isEmpty(selectedParticipants)) {
            return;
        }

        if (this.props.iouType === CONST.IOU.IOU_TYPE.SEND) {
            if (!paymentMethod) {
                return;
            }

            Log.info(`[IOU] Sending money via: ${paymentMethod}`);
            this.props.onSendMoney(paymentMethod);
        } else {
            this.props.onConfirm(this.getSplits());
        }
    }

    render() {
        const selectedParticipants = this.getSelectedParticipants();
        const shouldShowSettlementButton = this.props.iouType === CONST.IOU.IOU_TYPE.SEND;
        const shouldDisableButton = selectedParticipants.length === 0 || this.props.network.isOffline;
        const isLoading = this.props.iou.loading && !this.props.network.isOffline;
        const recipient = this.state.participants[0];
        const canModifyParticipants = this.props.isIOUAttachedToExistingChatReport && this.props.hasMultipleParticipants;
        return (
            <OptionsSelector
                sections={this.getSections()}
                value={this.props.comment}
                onSelectRow={canModifyParticipants ? this.toggleOption : undefined}
                onConfirmSelection={this.confirm}
                onChangeText={this.props.onUpdateComment}
                textInputLabel={this.props.translate('iOUConfirmationList.whatsItFor')}
                placeholderText={this.props.translate('common.optional')}
                selectedOptions={this.getSelectedOptions()}
                canSelectMultipleOptions={this.props.hasMultipleParticipants}
                disableArrowKeysActions={!canModifyParticipants}
                isDisabled={!canModifyParticipants}
                hideAdditionalOptionStates
                forceTextUnreadStyle
                autoFocus
                shouldTextInputAppearBelowOptions
                shouldShowOfflineMessage
                optionHoveredStyle={canModifyParticipants ? styles.hoveredComponentBG : {}}
                footerContent={shouldShowSettlementButton
                    ? (
                        <SettlementButton
                            isDisabled={shouldDisableButton}
                            isLoading={isLoading}
                            onPress={this.confirm}
                            shouldShowPaypal={Boolean(recipient.payPalMeAddress)}
                            enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                            addBankAccountRoute={ROUTES.IOU_SEND_ADD_BANK_ACCOUNT}
                            addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                            currency={this.props.iou.selectedCurrencyCode}
                        />
                    ) : (
                        <ButtonWithMenu
                            isDisabled={shouldDisableButton}
                            isLoading={isLoading}
                            onPress={(_event, value) => this.confirm(value)}
                            options={this.splitOrRequestOptions}
                        />
                    )}
            />
        );
    }
}

IOUConfirmationList.propTypes = propTypes;
IOUConfirmationList.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withNetwork(),
    withCurrentUserPersonalDetails,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        session: {
            key: ONYXKEYS.SESSION,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(IOUConfirmationList);
