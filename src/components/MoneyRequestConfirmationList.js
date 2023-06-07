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
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import Log from '../libs/Log';
import SettlementButton from './SettlementButton';
import ROUTES from '../ROUTES';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from './withCurrentUserPersonalDetails';
import * as IOUUtils from '../libs/IOUUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Navigation from '../libs/Navigation/Navigation';
import optionPropTypes from './optionPropTypes';
import * as CurrencyUtils from '../libs/CurrencyUtils';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func,

    /** Callback to parent modal to send money */
    onSendMoney: PropTypes.func,

    /** Callback to inform a participant is selected */
    onSelectParticipant: PropTypes.func,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.number.isRequired,

    /** IOU type */
    iouType: PropTypes.string,

    /** Selected participants from MoneyRequestModal with login */
    participants: PropTypes.arrayOf(optionPropTypes).isRequired,

    /** Payee of the money request with login */
    payeePersonalDetails: optionPropTypes,

    /** Can the participants be modified or not */
    canModifyParticipants: PropTypes.bool,

    /** Should the list be read only, and not editable? */
    isReadOnly: PropTypes.bool,

    /** Depending on expense report or personal IOU report, respective bank account route */
    bankAccountRoute: PropTypes.string,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,

    /* Onyx Props */

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        currency: PropTypes.string,
        comment: PropTypes.string,
    }),

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** The policyID of the request */
    policyID: PropTypes.string,

    /** The reportID of the request */
    reportID: PropTypes.string,
};

const defaultProps = {
    onConfirm: () => {},
    onSendMoney: () => {},
    onSelectParticipant: () => {},
    iou: {
        currency: CONST.CURRENCY.USD,
        comment: '',
    },
    iouType: CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
    payeePersonalDetails: null,
    canModifyParticipants: false,
    isReadOnly: false,
    bankAccountRoute: '',
    session: {
        email: null,
    },
    policyID: '',
    reportID: '',
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class MoneyRequestConfirmationList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            didConfirm: false,
        };

        this.selectParticipant = this.selectParticipant.bind(this);
        this.confirm = this.confirm.bind(this);
    }

    /**
     * Get the confirmation button options
     * @returns {Array}
     */
    getSplitOrRequestOptions() {
        const text = this.props.translate(this.props.hasMultipleParticipants ? 'iou.splitAmount' : 'iou.requestAmount', {
            amount: CurrencyUtils.convertToDisplayString(this.props.iouAmount, this.props.iou.currency),
        });
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: this.props.hasMultipleParticipants ? CONST.IOU.MONEY_REQUEST_TYPE.SPLIT : CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
            },
        ];
    }

    /**
     * Get selected participants
     * @returns {Array}
     */
    getSelectedParticipants() {
        return _.filter(this.props.participants, (participant) => participant.selected);
    }

    /**
     * Get unselected participants
     * @returns {Array}
     */
    getUnselectedParticipants() {
        return _.filter(this.props.participants, (participant) => !participant.selected);
    }

    /**
     * Returns the participants with amount
     * @param {Array} participants
     * @returns {Array}
     */
    getParticipantsWithAmount(participants) {
        const iouAmount = IOUUtils.calculateAmount(participants.length, this.props.iouAmount);
        return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(participants, CurrencyUtils.convertToDisplayString(iouAmount, this.props.iou.currency));
    }

    /**
     * Returns the personalDetails object for the payee. Use the payee prop if passed, else fallback to current user
     *
     * @returns {Object} personalDetails
     */
    getPayeePersonalDetails() {
        return this.props.payeePersonalDetails || this.props.currentUserPersonalDetails;
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
            const formattedParticipants = _.union(formattedSelectedParticipants, unselectedParticipants);

            const myIOUAmount = IOUUtils.calculateAmount(selectedParticipants.length, this.props.iouAmount, true);
            const formattedPayeePersonalDetails = OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(
                this.getPayeePersonalDetails(),
                CurrencyUtils.convertToDisplayString(myIOUAmount, this.props.iou.currency),
            );

            sections.push(
                {
                    title: this.props.translate('moneyRequestConfirmationList.whoPaid'),
                    data: [formattedPayeePersonalDetails],
                    shouldShow: true,
                    indexOffset: 0,
                    isDisabled: true,
                },
                {
                    title: this.props.translate('moneyRequestConfirmationList.whoWasThere'),
                    data: formattedParticipants,
                    shouldShow: true,
                    indexOffset: 1,
                },
            );
        } else {
            sections.push({
                title: this.props.translate('common.to'),
                data: this.props.participants,
                shouldShow: true,
                indexOffset: 0,
            });
        }
        return sections;
    }

    getFooterContent() {
        if (this.props.isReadOnly) {
            return;
        }

        const selectedParticipants = this.getSelectedParticipants();
        const shouldShowSettlementButton = this.props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND;
        const shouldDisableButton = selectedParticipants.length === 0;
        const recipient = this.props.participants[0] || {};

        return shouldShowSettlementButton ? (
            <SettlementButton
                isDisabled={shouldDisableButton}
                onPress={this.confirm}
                shouldShowPaypal={Boolean(recipient && recipient.payPalMeAddress)}
                enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                addBankAccountRoute={this.props.bankAccountRoute}
                addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                currency={this.props.iou.currency}
                policyID={this.props.policyID}
                shouldShowPaymentOptions
            />
        ) : (
            <ButtonWithDropdownMenu
                isDisabled={shouldDisableButton}
                onPress={(_event, value) => this.confirm(value)}
                options={this.getSplitOrRequestOptions()}
            />
        );
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
        return [...selectedParticipants, OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(this.getPayeePersonalDetails())];
    }

    /**
     * @param {Object} option
     */
    selectParticipant(option) {
        // Return early if selected option is currently logged in user.
        if (option.login === this.props.session.email) {
            return;
        }

        this.props.onSelectParticipant(option);
    }

    /**
     * @param {String} paymentMethod
     */
    confirm(paymentMethod) {
        this.setState({didConfirm: true});

        const selectedParticipants = this.getSelectedParticipants();
        if (_.isEmpty(selectedParticipants)) {
            return;
        }

        if (this.props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND) {
            if (!paymentMethod) {
                return;
            }

            Log.info(`[IOU] Sending money via: ${paymentMethod}`);
            this.props.onSendMoney(paymentMethod);
        } else {
            this.props.onConfirm(selectedParticipants);
        }
    }

    render() {
        const canModifyParticipants = !this.props.isReadOnly && this.props.canModifyParticipants && this.props.hasMultipleParticipants;
        const formattedAmount = CurrencyUtils.convertToDisplayString(this.props.iouAmount, this.props.iou.currency);

        return (
            <OptionsSelector
                sections={this.getSections()}
                value=""
                onSelectRow={canModifyParticipants ? this.selectParticipant : undefined}
                onConfirmSelection={this.confirm}
                selectedOptions={this.getSelectedOptions()}
                canSelectMultipleOptions={canModifyParticipants}
                disableArrowKeysActions={!canModifyParticipants}
                isDisabled={!canModifyParticipants}
                boldStyle
                shouldTextInputAppearBelowOptions
                shouldShowTextInput={false}
                shouldUseStyleForChildren={false}
                optionHoveredStyle={canModifyParticipants ? styles.hoveredComponentBG : {}}
                footerContent={this.getFooterContent()}
            >
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!this.props.isReadOnly}
                    title={formattedAmount}
                    description={this.props.translate('iou.amount')}
                    onPress={() => Navigation.navigate(ROUTES.getMoneyRequestAmountRoute(this.props.iouType, this.props.reportID))}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={this.state.didConfirm || this.props.isReadOnly}
                />
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!this.props.isReadOnly}
                    title={this.props.iou.comment}
                    description={this.props.translate('common.description')}
                    onPress={() => Navigation.navigate(ROUTES.getMoneyRequestDescriptionRoute(this.props.iouType, this.props.reportID))}
                    style={[styles.moneyRequestMenuItem, styles.mb2]}
                    disabled={this.state.didConfirm || this.props.isReadOnly}
                />
            </OptionsSelector>
        );
    }
}

MoneyRequestConfirmationList.propTypes = propTypes;
MoneyRequestConfirmationList.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withCurrentUserPersonalDetails,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(MoneyRequestConfirmationList);
