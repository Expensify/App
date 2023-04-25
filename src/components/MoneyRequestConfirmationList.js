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
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from './withCurrentUserPersonalDetails';
import * as IOUUtils from '../libs/IOUUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Navigation from '../libs/Navigation/Navigation';
import withMoneyRequest, {moneyRequestPropTypes} from '../pages/iou/withMoneyRequest';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    /** Callback to parent modal to send money */
    onSendMoney: PropTypes.func.isRequired,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU type */
    iouType: PropTypes.string,

    /** Can the participants be modified or not */
    canModifyParticipants: PropTypes.bool,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,

    /* Onyx Props */

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    ...moneyRequestPropTypes,
};

const defaultProps = {
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
        this.toggleOption = this.toggleOption.bind(this);
        this.confirm = this.confirm.bind(this);
    }

    /**
     * Get the confirmation button options
     * @returns {Array}
     */
    getSplitOrRequestOptions() {
        return [{
            text: this.props.translate(this.props.hasMultipleParticipants ? 'iou.split' : 'iou.request', {
                amount: this.props.numberFormat(
                    this.props.amount,
                    {style: 'currency', currency: this.props.currency},
                ),
            }),
            value: this.props.hasMultipleParticipants ? CONST.IOU.MONEY_REQUEST_TYPE.SPLIT : CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
        }];
    }

    /**
     * Get selected participants
     * @returns {Array}
     */
    getSelectedParticipants() {
        return _.filter(this.props.participants, participant => participant.selected);
    }

    /**
     * Get unselected participants
     * @returns {Array}
     */
    getUnselectedParticipants() {
        return _.filter(this.props.participants, participant => !participant.selected);
    }

    /**
     * Returns the participants with amount
     * @param {Array} participants
     * @returns {Array}
     */
    getParticipantsWithAmount(participants) {
        const iouAmount = IOUUtils.calculateAmount(participants, this.props.amount, this.props.currency);

        return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(
            participants,
            this.props.numberFormat(iouAmount / 100, {
                style: 'currency',
                currency: this.props.currency,
            }),
        );
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

            const myIOUAmount = IOUUtils.calculateAmount(selectedParticipants, this.props.amount, this.props.currency, true);
            const formattedMyPersonalDetails = OptionsListUtils.getIOUConfirmationOptionsFromMyPersonalDetail(
                this.props.currentUserPersonalDetails,
                this.props.numberFormat(myIOUAmount / 100, {
                    style: 'currency',
                    currency: this.props.currency,
                }),
            );

            sections.push({
                title: this.props.translate('moneyRequestConfirmationList.whoPaid'),
                data: [formattedMyPersonalDetails],
                shouldShow: true,
                indexOffset: 0,
                isDisabled: true,
            }, {
                title: this.props.translate('moneyRequestConfirmationList.whoWasThere'),
                data: formattedParticipants,
                shouldShow: true,
                indexOffset: 1,
            });
        } else {
            const formattedParticipants = this.props.participants;
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
        return [
            ...selectedParticipants,
            OptionsListUtils.getIOUConfirmationOptionsFromMyPersonalDetail(this.props.currentUserPersonalDetails),
        ];
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

        const newParticipants = _.map(this.props.participants, (participant) => {
            if (participant.login === option.login) {
                return {...participant, selected: !participant.selected};
            }
            return participant;
        });
        this.props.setParticipants(newParticipants);
    }

    /**
     * @param {String} paymentMethod
     */
    confirm(paymentMethod) {
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
        const recipient = this.props.participants[0] || {};
        const canModifyParticipants = this.props.canModifyParticipants && this.props.hasMultipleParticipants;
        const formattedAmount = this.props.numberFormat(this.props.amount, {
            style: 'currency',
            currency: this.props.currency,
        });

        return (
            <OptionsSelector
                sections={this.getSections()}
                value=""
                onSelectRow={canModifyParticipants ? this.toggleOption : undefined}
                onConfirmSelection={this.confirm}
                onChangeText={this.props.onUpdateComment}
                selectedOptions={this.getSelectedOptions()}
                canSelectMultipleOptions={canModifyParticipants}
                disableArrowKeysActions={!canModifyParticipants}
                isDisabled={!canModifyParticipants}
                boldStyle
                shouldTextInputAppearBelowOptions
                shouldShowTextInput={false}
                optionHoveredStyle={canModifyParticipants ? styles.hoveredComponentBG : {}}
                footerContent={shouldShowSettlementButton
                    ? (
                        <SettlementButton
                            isDisabled={shouldDisableButton}
                            onPress={this.confirm}
                            shouldShowPaypal={Boolean(recipient.payPalMeAddress)}
                            enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                            addBankAccountRoute={ROUTES.IOU_SEND_ADD_BANK_ACCOUNT}
                            addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                            currency={this.props.currency}
                        />
                    ) : (
                        <ButtonWithMenu
                            isDisabled={shouldDisableButton}
                            onPress={(_event, value) => this.confirm(value)}
                            options={this.getSplitOrRequestOptions()}
                        />
                    )}
            >
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={formattedAmount}
                    description={this.props.translate('iou.amount')}
                    interactive={false} // This is so the menu item's background doesn't change color on hover
                    onPress={() => Navigation.navigate(ROUTES.getMoneyRequestAmountRoute(this.props.iouType, this.props.reportID))}
                    style={styles.moneyRequestMenuItem}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                />
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={this.props.comment}
                    description={this.props.translate('common.description')}
                    interactive={false} // This is so the menu item's background doesn't change color on hover
                    onPress={() => Navigation.navigate(ROUTES.getMoneyRequestDescriptionRoute(this.props.iouType, this.props.reportID))}
                    style={styles.moneyRequestMenuItem}
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
    withMoneyRequest,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(MoneyRequestConfirmationList);
