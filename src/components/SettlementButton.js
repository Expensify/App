import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import * as Expensicons from './Icon/Expensicons';
import Permissions from '../libs/Permissions';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as PaymentMethods from '../libs/actions/PaymentMethods';
import KYCWall from './KYCWall';
import withNavigation from './withNavigation';
import {withNetwork} from './OnyxProvider';
import networkPropTypes from './networkPropTypes';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import * as ReportUtils from '../libs/ReportUtils';

const propTypes = {
    /** Callback to execute when this button is pressed. Receives a single payment type argument. */
    onPress: PropTypes.func.isRequired,

    /** Settlement currency type */
    currency: PropTypes.string,

    /** Should we show paypal option */
    shouldShowPaypal: PropTypes.bool,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** When the button is opened via an IOU, ID for the chatReport that the IOU is linked to */
    chatReportID: PropTypes.string,

    /** The IOU/Expense report we are paying */
    iouReport: iouReportPropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The route to redirect if user does not have a payment method setup */
    enablePaymentsRoute: PropTypes.string.isRequired,

    /** Should we show the payment options? */
    shouldShowPaymentOptions: PropTypes.bool,

    /** The last payment method used per policy */
    nvp_lastPaymentMethod: PropTypes.objectOf(PropTypes.string),

    /** The policyID of the report we are paying */
    policyID: PropTypes.string,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Total money amount in form <currency><amount> */
    formattedAmount: PropTypes.string,

    /** The size of button size */
    buttonSize: PropTypes.oneOf(_.values(CONST.DROPDOWN_BUTTON_SIZE)),

    /** The anchor alignment of the popover menu */

    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    currency: CONST.CURRENCY.USD,
    shouldShowPaypal: false,
    chatReportID: '',
    betas: [],
    shouldShowPaymentOptions: false,
    nvp_lastPaymentMethod: {},
    style: [],
    iouReport: {},
    policyID: '',
    formattedAmount: '',
    buttonSize: CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
};

class SettlementButton extends React.Component {
    componentDidMount() {
        PaymentMethods.openWalletPage();
    }

    getButtonOptionsFromProps() {
        const buttonOptions = [];
        const isExpenseReport = ReportUtils.isExpenseReport(this.props.iouReport);
        const paymentMethods = {
            [CONST.IOU.PAYMENT_TYPE.EXPENSIFY]: {
                text: this.props.translate('iou.settleExpensify', {formattedAmount: this.props.formattedAmount || ''}),
                icon: Expensicons.Wallet,
                value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            },
            [CONST.IOU.PAYMENT_TYPE.VBBA]: {
                text: this.props.translate('iou.settleExpensify', {formattedAmount: this.props.formattedAmount || ''}),
                icon: Expensicons.Wallet,
                value: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            [CONST.IOU.PAYMENT_TYPE.PAYPAL_ME]: {
                text: this.props.translate('iou.settlePaypalMe', {formattedAmount: this.props.formattedAmount || ''}),
                icon: Expensicons.PayPal,
                value: CONST.IOU.PAYMENT_TYPE.PAYPAL_ME,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: this.props.translate('iou.payElsewhere'),
                icon: Expensicons.Cash,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };
        const canUseWallet =
            !isExpenseReport && this.props.currency === CONST.CURRENCY.USD && Permissions.canUsePayWithExpensify(this.props.betas) && Permissions.canUseWallet(this.props.betas);

        // To achieve the one tap pay experience we need to choose the correct payment type as default,
        // if user already paid for some request or expense, let's use the last payment method or use default.
        let paymentMethod = this.props.nvp_lastPaymentMethod[this.props.policyID] || '';
        if (!this.props.shouldShowPaymentOptions) {
            if (!paymentMethod) {
                // In case the user hasn't paid a request yet, let's default to VBBA payment type in case of expense reports
                if (isExpenseReport) {
                    paymentMethod = CONST.IOU.PAYMENT_TYPE.VBBA;
                } else if (canUseWallet) {
                    // If they have Wallet set up, use that payment method as default
                    paymentMethod = CONST.IOU.PAYMENT_TYPE.EXPENSIFY;
                } else {
                    paymentMethod = CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
                }
            }

            // In case the last payment method has been PayPal, but this request is made in currency unsupported by Paypal, default to Elsewhere
            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME && !_.includes(CONST.PAYPAL_SUPPORTED_CURRENCIES, this.props.currency)) {
                paymentMethod = CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
            }

            // In case of the settlement button in the report preview component, we do not show payment options and the label for Wallet and ACH type is simply "Pay".
            return [
                {
                    ...paymentMethods[paymentMethod],
                    text: paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE ? this.props.translate('iou.payElsewhere') : this.props.translate('iou.pay'),
                },
            ];
        }
        if (canUseWallet) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.EXPENSIFY]);
        }
        if (isExpenseReport) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.VBBA]);
        }
        if (this.props.shouldShowPaypal && _.includes(CONST.PAYPAL_SUPPORTED_CURRENCIES, this.props.currency)) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.PAYPAL_ME]);
        }
        buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);

        // Put the preferred payment method to the front of the array so its shown as default
        if (paymentMethod) {
            return _.sortBy(buttonOptions, (method) => (method.value === paymentMethod ? 0 : 1));
        }
        return buttonOptions;
    }

    render() {
        return (
            <KYCWall
                onSuccessfulKYC={(iouPaymentType) => this.props.onPress(iouPaymentType)}
                enablePaymentsRoute={this.props.enablePaymentsRoute}
                addBankAccountRoute={this.props.addBankAccountRoute}
                addDebitCardRoute={this.props.addDebitCardRoute}
                isDisabled={this.props.network.isOffline}
                chatReportID={this.props.chatReportID}
                iouReport={this.props.iouReport}
            >
                {(triggerKYCFlow, buttonRef) => (
                    <ButtonWithDropdownMenu
                        buttonRef={buttonRef}
                        isDisabled={this.props.isDisabled}
                        isLoading={this.props.isLoading}
                        onPress={(event, iouPaymentType) => {
                            if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || iouPaymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
                                triggerKYCFlow(event, iouPaymentType);
                                return;
                            }

                            this.props.onPress(iouPaymentType);
                        }}
                        options={this.getButtonOptionsFromProps()}
                        style={this.props.style}
                        buttonSize={this.props.buttonSize}
                        anchorAlignment={this.props.anchorAlignment}
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
    withNetwork(),
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        nvp_lastPaymentMethod: {
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
        },
    }),
)(SettlementButton);
