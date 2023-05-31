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
};

class SettlementButton extends React.Component {
    componentDidMount() {
        PaymentMethods.openPaymentsPage();
    }

    getButtonOptionsFromProps() {
        const buttonOptions = [];
        const paymentMethods = {
            [CONST.IOU.PAYMENT_TYPE.EXPENSIFY]: {
                text: this.props.translate('iou.settleExpensify'),
                icon: Expensicons.Wallet,
                value: ReportUtils.isExpenseReport(this.props.iouReport) ? CONST.IOU.PAYMENT_TYPE.VBBA : CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            },
            [CONST.IOU.PAYMENT_TYPE.PAYPAL_ME]: {
                text: this.props.translate('iou.settlePaypalMe'),
                icon: Expensicons.PayPal,
                value: CONST.IOU.PAYMENT_TYPE.PAYPAL_ME,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: this.props.translate('iou.settleElsewhere'),
                icon: Expensicons.Cash,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };
        if (!this.props.shouldShowPaymentOptions && this.props.nvp_lastPaymentMethod[this.props.policyID]) {
            return [paymentMethods[this.props.nvp_lastPaymentMethod[this.props.policyID]]];
        }
        if (this.props.currency === CONST.CURRENCY.USD && Permissions.canUsePayWithExpensify(this.props.betas) && Permissions.canUseWallet(this.props.betas)) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.EXPENSIFY]);
        }
        if (this.props.shouldShowPaypal && _.includes(CONST.PAYPAL_SUPPORTED_CURRENCIES, this.props.currency)) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.PAYPAL_ME]);
        }
        buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
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
                {(triggerKYCFlow) => (
                    <ButtonWithDropdownMenu
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
