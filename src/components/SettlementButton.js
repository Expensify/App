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
import KYCWall from './KYCWall';

const propTypes = {
    /** Settlement currency type */
    currency: PropTypes.string,

    /** Should we show paypal option */
    shouldShowPaypal: PropTypes.bool,

    /** Associated phone login for the person we are sending money to */
    recipientPhoneNumber: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    currency: CONST.CURRENCY.USD,
    recipientPhoneNumber: '',
    shouldShowPaypal: false,
};

class SettlementButton extends React.Component {
    constructor(props) {
        super(props);

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

    render() {
        return (
            <KYCWall
                onSuccessfulKYC={() => this.props.onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY)}
                enablePaymentsRoute={this.props.enablePaymentsRoute}
                addBankAccountRoute={this.props.addBankAccountRoute}
                addDebitCardRoute={this.props.addDebitCardRoute}
            >
                {triggerKYCFlow => (
                    <ButtonWithMenu
                        isDisabled={this.props.isDisabled}
                        isLoading={this.props.isLoading}
                        onPress={(event, iouPaymentType) => {
                            if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                                triggerKYCFlow(event);
                                return;
                            }

                            this.props.onPress(iouPaymentType);
                        }}
                        options={this.state.buttonOptions}
                    />
                )}
            </KYCWall>
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
    }),
)(SettlementButton);
