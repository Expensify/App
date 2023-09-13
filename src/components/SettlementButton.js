import React, {useEffect, useMemo} from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import compose from '../libs/compose';
import Permissions from '../libs/Permissions';
import useNetwork from '../hooks/useNetwork';
import useLocalize from '../hooks/useLocalize';
import * as ReportUtils from '../libs/ReportUtils';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import * as PaymentMethods from '../libs/actions/PaymentMethods';
import KYCWall from './KYCWall';
import withNavigation from './withNavigation';
import * as Expensicons from './Icon/Expensicons';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';

const propTypes = {
    /** Callback to execute when this button is pressed. Receives a single payment type argument. */
    onPress: PropTypes.func.isRequired,

    /** Settlement currency type */
    currency: PropTypes.string,

    /** Should we show paypal option */
    shouldShowPaypal: PropTypes.bool,

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

    /** Route for the Add Bank Account screen for a given navigation stack */
    addBankAccountRoute: PropTypes.string,

    /** Route for the Add Debit Card screen for a given navigation stack */
    addDebitCardRoute: PropTypes.string,

    /** Whether the button should be disabled */
    isDisabled: PropTypes.bool,

    /** Whether we should show a loading state for the main button */
    isLoading: PropTypes.bool,

    /** The anchor alignment of the popover menu */
    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),
};

const defaultProps = {
    isLoading: false,
    isDisabled: false,
    addBankAccountRoute: '',
    addDebitCardRoute: '',
    currency: CONST.CURRENCY.USD,
    shouldShowPaypal: false,
    chatReportID: '',

    // The "betas" array, "iouReport" and "nvp_lastPaymentMethod" objects needs to be stable to prevent the "useMemo"
    // hook from being recreated unnecessarily, hence the use of CONST.EMPTY_ARRAY and CONST.EMPTY_OBJECT
    betas: CONST.EMPTY_ARRAY,
    iouReport: CONST.EMPTY_OBJECT,
    nvp_lastPaymentMethod: CONST.EMPTY_OBJECT,
    shouldShowPaymentOptions: false,
    style: [],
    policyID: '',
    formattedAmount: '',
    buttonSize: CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
};

function SettlementButton({
    addDebitCardRoute,
    addBankAccountRoute,
    anchorAlignment,
    betas,
    buttonSize,
    chatReportID,
    currency,
    enablePaymentsRoute,
    iouReport,
    isDisabled,
    isLoading,
    formattedAmount,
    nvp_lastPaymentMethod,
    onPress,
    policyID,
    shouldShowPaymentOptions,
    shouldShowPaypal,
    style,
}) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    useEffect(() => {
        PaymentMethods.openWalletPage();
    }, []);

    const paymentButtonOptions = useMemo(() => {
        const buttonOptions = [];
        const isExpenseReport = ReportUtils.isExpenseReport(iouReport);
        const paymentMethods = {
            [CONST.IOU.PAYMENT_TYPE.EXPENSIFY]: {
                text: translate('iou.settleExpensify', {formattedAmount}),
                icon: Expensicons.Wallet,
                value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            },
            [CONST.IOU.PAYMENT_TYPE.VBBA]: {
                text: translate('iou.settleExpensify', {formattedAmount}),
                icon: Expensicons.Wallet,
                value: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            [CONST.IOU.PAYMENT_TYPE.PAYPAL_ME]: {
                text: translate('iou.settlePaypalMe', {formattedAmount}),
                icon: Expensicons.PayPal,
                value: CONST.IOU.PAYMENT_TYPE.PAYPAL_ME,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: translate('iou.payElsewhere'),
                icon: Expensicons.Cash,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };
        const canUseWallet = !isExpenseReport && currency === CONST.CURRENCY.USD && Permissions.canUsePayWithExpensify(betas) && Permissions.canUseWallet(betas);

        // To achieve the one tap pay experience we need to choose the correct payment type as default,
        // if user already paid for some request or expense, let's use the last payment method or use default.
        let paymentMethod = nvp_lastPaymentMethod[policyID] || '';
        if (!shouldShowPaymentOptions) {
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
            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME && !_.includes(CONST.PAYPAL_SUPPORTED_CURRENCIES, currency)) {
                paymentMethod = CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
            }

            // In case of the settlement button in the report preview component, we do not show payment options and the label for Wallet and ACH type is simply "Pay".
            return [
                {
                    ...paymentMethods[paymentMethod],
                    text: paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE ? translate('iou.payElsewhere') : translate('iou.pay'),
                },
            ];
        }
        if (canUseWallet) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.EXPENSIFY]);
        }
        if (isExpenseReport) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.VBBA]);
        }
        if (shouldShowPaypal && _.includes(CONST.PAYPAL_SUPPORTED_CURRENCIES, currency)) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.PAYPAL_ME]);
        }
        buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);

        // Put the preferred payment method to the front of the array so its shown as default
        if (paymentMethod) {
            return _.sortBy(buttonOptions, (method) => (method.value === paymentMethod ? 0 : 1));
        }
        return buttonOptions;
    }, [betas, currency, formattedAmount, iouReport, nvp_lastPaymentMethod, policyID, shouldShowPaymentOptions, shouldShowPaypal, translate]);

    const selectPaymentType = (event, iouPaymentType, triggerKYCFlow) => {
        if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || iouPaymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
            triggerKYCFlow(event, iouPaymentType);
            return;
        }

        onPress(iouPaymentType);
    };

    return (
        <KYCWall
            onSuccessfulKYC={onPress}
            enablePaymentsRoute={enablePaymentsRoute}
            addBankAccountRoute={addBankAccountRoute}
            addDebitCardRoute={addDebitCardRoute}
            isDisabled={isOffline}
            chatReportID={chatReportID}
            iouReport={iouReport}
        >
            {(triggerKYCFlow, buttonRef) => (
                <ButtonWithDropdownMenu
                    buttonRef={buttonRef}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    onPress={(event, iouPaymentType) => selectPaymentType(event, iouPaymentType, triggerKYCFlow)}
                    options={paymentButtonOptions}
                    style={style}
                    buttonSize={buttonSize}
                    anchorAlignment={anchorAlignment}
                />
            )}
        </KYCWall>
    );
}

SettlementButton.propTypes = propTypes;
SettlementButton.defaultProps = defaultProps;
SettlementButton.displayName = 'SettlementButton';

export default compose(
    withNavigation,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        nvp_lastPaymentMethod: {
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
        },
    }),
)(SettlementButton);
