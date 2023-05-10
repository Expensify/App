import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
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
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from './withCurrentUserPersonalDetails';
import * as IOUUtils from '../libs/IOUUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Navigation from '../libs/Navigation/Navigation';
import optionPropTypes from './optionPropTypes';
import * as CurrencyUtils from '../libs/CurrencyUtils';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    /** Callback to parent modal to send money */
    onSendMoney: PropTypes.func.isRequired,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.number.isRequired,

    /** IOU type */
    iouType: PropTypes.string,

    /** Selected participants from MoneyRequestModal with login */
    participants: PropTypes.arrayOf(optionPropTypes).isRequired,

    /** Can the participants be modified or not */
    canModifyParticipants: PropTypes.bool,

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

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** Callback function to navigate to a provided step in the MoneyRequestModal flow */
    navigateToStep: PropTypes.func.isRequired,
};

const defaultProps = {
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
    iouType: CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
    canModifyParticipants: false,
    session: {
        email: null,
    },
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class MoneyRequestConfirmationList extends Component {
    constructor(props) {
        super(props);

        const formattedParticipants = _.map(this.getParticipantsWithAmount(props.participants), (participant) => ({
            ...participant,
            selected: true,
        }));

        this.state = {
            participants: formattedParticipants,
            didConfirm: false,
        };

        this.toggleOption = this.toggleOption.bind(this);
        this.confirm = this.confirm.bind(this);
    }

    /**
     * Get the confirmation button options
     * @returns {Array}
     */
    getSplitOrRequestOptions() {
        return [
            {
                text: Str.recapitalize(
                    this.props.translate(this.props.hasMultipleParticipants ? 'iou.splitAmount' : 'iou.requestAmount', {
                        amount: CurrencyUtils.convertToDisplayString(this.props.iouAmount, this.props.iou.selectedCurrencyCode),
                    }),
                ),
                value: this.props.hasMultipleParticipants ? CONST.IOU.MONEY_REQUEST_TYPE.SPLIT : CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
            },
        ];
    }

    /**
     * Get selected participants
     * @returns {Array}
     */
    getSelectedParticipants() {
        return _.filter(this.state.participants, (participant) => participant.selected);
    }

    /**
     * Get unselected participants
     * @returns {Array}
     */
    getUnselectedParticipants() {
        return _.filter(this.state.participants, (participant) => !participant.selected);
    }

    /**
     * Returns the participants with amount
     * @param {Array} participants
     * @returns {Array}
     */
    getParticipantsWithAmount(participants) {
        const iouAmount = IOUUtils.calculateAmount(participants, this.props.iouAmount);
        return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(participants, CurrencyUtils.convertToDisplayString(iouAmount, this.props.iou.selectedCurrencyCode));
    }

    /**
     * Returns the participants without amount
     *
     * @param {Array} participants
     * @returns {Array}
     */
    getParticipantsWithoutAmount(participants) {
        return _.map(participants, (option) => _.omit(option, 'descriptiveText'));
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

            const myIOUAmount = IOUUtils.calculateAmount(selectedParticipants, this.props.iouAmount, true);
            const formattedMyPersonalDetails = OptionsListUtils.getIOUConfirmationOptionsFromMyPersonalDetail(
                this.props.currentUserPersonalDetails,
                CurrencyUtils.convertToDisplayString(myIOUAmount, this.props.iou.selectedCurrencyCode),
            );

            sections.push(
                {
                    title: this.props.translate('moneyRequestConfirmationList.whoPaid'),
                    data: [formattedMyPersonalDetails],
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
            const formattedParticipants = this.getParticipantsWithoutAmount(this.props.participants);
            sections.push({
                title: this.props.translate('common.to'),
                data: formattedParticipants,
                shouldShow: true,
                indexOffset: 0,
            });
        }
        return sections;
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
        return [...selectedParticipants, OptionsListUtils.getIOUConfirmationOptionsFromMyPersonalDetail(this.props.currentUserPersonalDetails)];
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
                    return {...participant, selected: !participant.selected};
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
        const selectedParticipants = this.getSelectedParticipants();
        const shouldShowSettlementButton = this.props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND;
        const shouldDisableButton = selectedParticipants.length === 0;
        const recipient = this.state.participants[0];
        const canModifyParticipants = this.props.canModifyParticipants && this.props.hasMultipleParticipants;
        const formattedAmount = CurrencyUtils.convertToDisplayString(this.props.iouAmount, this.props.iou.selectedCurrencyCode);

        return (
            <OptionsSelector
                sections={this.getSections()}
                value=""
                onSelectRow={canModifyParticipants ? this.toggleOption : undefined}
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
                footerContent={
                    shouldShowSettlementButton ? (
                        <SettlementButton
                            isDisabled={shouldDisableButton}
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
                            onPress={(_event, value) => this.confirm(value)}
                            options={this.getSplitOrRequestOptions()}
                        />
                    )
                }
            >
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={formattedAmount}
                    description={this.props.translate('iou.amount')}
                    onPress={() => this.props.navigateToStep(0)}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={this.state.didConfirm}
                />
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={this.props.iou.comment}
                    description={this.props.translate('common.description')}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_DESCRIPTION)}
                    style={[styles.moneyRequestMenuItem, styles.mb2]}
                    disabled={this.state.didConfirm}
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
