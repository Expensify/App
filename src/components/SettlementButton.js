import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {withNavigation} from '@react-navigation/compat';
import ButtonWithMenu from './ButtonWithMenu';
import * as Expensicons from './Icon/Expensicons';
import Permissions from '../libs/Permissions';
import isAppInstalled from '../libs/isAppInstalled';
import * as ValidationUtils from '../libs/ValidationUtils';
import makeCancellablePromise from '../libs/MakeCancellablePromise';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import AddPaymentMethodMenu from './AddPaymentMethodMenu';
import Navigation from '../libs/Navigation/Navigation';
import getClickedElementLocation from '../libs/getClickedElementLocation';
import * as PaymentUtils from '../libs/PaymentUtils';
import * as PaymentMethods from '../libs/actions/PaymentMethods';
import userWalletPropTypes from '../pages/EnablePayments/userWalletPropTypes';

const propTypes = {
    /** Settlement currency type */
    currency: PropTypes.string,

    /** Should we show paypal option */
    shouldShowPaypal: PropTypes.bool,

    /** Associated phone login for the person we are sending money to */
    recipientPhoneNumber: PropTypes.string,

    ...userWalletPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    currency: CONST.CURRENCY.USD,
    recipientPhoneNumber: '',
    shouldShowPaypal: false,

    // eslint-disable-next-line react/default-props-match-prop-types
    userWallet: {},
};

class SettlementButton extends React.Component {
    constructor(props) {
        super(props);

        this.payWithExpensify = this.payWithExpensify.bind(this);

        const buttonOptions = [];

        if (props.currency === CONST.CURRENCY.USD && Permissions.canUsePayWithExpensify(props.betas) && Permissions.canUseWallet(props.betas)) {
            buttonOptions.push({
                text: props.translate('iou.settleExpensify'),
                icon: Expensicons.Wallet,
                value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            });
        }

        if (props.shouldShowPaypal) {
            buttonOptions.push({
                text: props.translate('iou.settlePaypalMe'),
                icon: Expensicons.PayPal,
                value: CONST.IOU.PAYMENT_TYPE.PAYPAL_ME,
            });
        }

        buttonOptions.push({
            text: props.translate('iou.settleElsewhere'),
            icon: Expensicons.Cash,
            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        });

        // Venmo requires an async call to the native layer to determine availability and will be added as an option if available.
        this.checkVenmoAvailabilityPromise = null;

        this.state = {
            buttonOptions,
            shouldShowAddPaymentMenu: false,
            anchorPositionTop: 0,
            anchorPositionLeft: 0,
        };
    }

    componentDidMount() {
        this.addVenmoPaymentOptionToMenu();
    }

    componentWillUnmount() {
        if (!this.checkVenmoAvailabilityPromise) {
            return;
        }

        this.checkVenmoAvailabilityPromise.cancel();
        this.checkVenmoAvailabilityPromise = null;
        PaymentMethods.setSetupAction(null);
    }

    /**
     * @returns {Boolean}
     */
    doesRecipientHaveValidPhoneLogin() {
        return this.props.recipientPhoneNumber && ValidationUtils.isValidUSPhone(this.props.recipientPhoneNumber);
    }

    /**
     * Adds Venmo, if available, as the second option in the menu of payment options
     */
    addVenmoPaymentOptionToMenu() {
        if (this.props.currency !== CONST.CURRENCY.USD || !this.doesRecipientHaveValidPhoneLogin()) {
            return;
        }

        this.checkVenmoAvailabilityPromise = makeCancellablePromise(isAppInstalled('venmo'));
        this.checkVenmoAvailabilityPromise
            .promise
            .then((isVenmoInstalled) => {
                if (!isVenmoInstalled) {
                    return;
                }

                this.setState(prevState => ({
                    buttonOptions: [...prevState.buttonOptions.slice(0, 1),
                        {
                            text: this.props.translate('iou.settleVenmo'),
                            icon: Expensicons.Venmo,
                            value: CONST.IOU.PAYMENT_TYPE.VENMO,
                        },
                        ...prevState.buttonOptions.slice(1),
                    ],
                }));
            });
    }

    payWithExpensify(event) {
        // Check to see if user has a valid payment method on file and display the add payment popover if they don't
        if (!PaymentUtils.hasExpensifyPaymentMethod(this.props.cardList, this.props.bankAccountList)) {
            const position = getClickedElementLocation(event.nativeEvent);
            this.setState({
                shouldShowAddPaymentMenu: true,
                anchorPositionTop: position.bottom - 226,
                anchorPositionLeft: position.right - 356,
            });
            return;
        }

        // Ask the user to upgrade to a gold wallet as this means they have not yet went through our Know Your Customer (KYC) checks
        const hasGoldWallet = this.props.userWallet.tierName && this.props.userWallet.tierName === CONST.WALLET.TIER_NAME.GOLD;
        if (!hasGoldWallet) {
            Navigation.navigate(this.props.enablePaymentsRoute);
            return;
        }

        this.props.onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY);
    }

    render() {
        return (
            <>
                <AddPaymentMethodMenu
                    isVisible={this.state.shouldShowAddPaymentMenu}
                    onClose={() => this.setState({shouldShowAddPaymentMenu: false})}
                    anchorPosition={{
                        top: this.state.anchorPositionTop,
                        left: this.state.anchorPositionLeft,
                    }}
                    shouldShowPaypal={false}
                    onItemSelected={(item) => {
                        this.setState({shouldShowAddPaymentMenu: false});
                        if (item === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
                            Navigation.navigate(this.props.addBankAccountRoute);
                        } else if (item === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                            Navigation.navigate(this.props.addDebitCardRoute);
                        }
                    }}
                />
                <ButtonWithMenu
                    isDisabled={this.props.isDisabled}
                    isLoading={this.props.isLoading}
                    onPress={(event, iouPaymentType) => {
                        if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                            // We are setting a callback here so that we can "continue" the original action the user wants to take
                            // after they add a payment method and successfully go through KYC checks.
                            PaymentMethods.setSetupAction(this.payWithExpensify);
                            this.payWithExpensify(event);
                            return;
                        }

                        this.props.onPress(iouPaymentType);
                    }}
                    options={this.state.buttonOptions}
                />
            </>
        );
    }
}

SettlementButton.propTypes = propTypes;
SettlementButton.defaultProps = defaultProps;

export default compose(
    withNavigation,
    withLocalize,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        cardList: {
            key: ONYXKEYS.CARD_LIST,
        },
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
    }),
)(SettlementButton);
