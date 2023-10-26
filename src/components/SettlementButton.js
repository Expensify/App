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
import * as BankAccounts from '../libs/actions/BankAccounts';
import ROUTES from '../ROUTES';

const propTypes = {
    /** Callback to execute when this button is pressed. Receives a single payment type argument. */
    onPress: PropTypes.func.isRequired,

    /** Call the onPress function on main button when Enter key is pressed */
    pressOnEnter: PropTypes.bool,

    /** Settlement currency type */
    currency: PropTypes.string,

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

    /** The anchor alignment of the popover menu for payment method dropdown */
    paymentMethodDropdownAnchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    /** The anchor alignment of the popover menu for KYC wall popover */
    kycWallAnchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),
};

const defaultProps = {
    isLoading: false,
    isDisabled: false,
    pressOnEnter: false,
    addBankAccountRoute: '',
    addDebitCardRoute: '',
    currency: CONST.CURRENCY.USD,
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
    kycWallAnchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, // button is at left, so horizontal anchor is at LEFT
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    paymentMethodDropdownAnchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, // caret for dropdown is at right, so horizontal anchor is at RIGHT
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
};

function SettlementButton({
    addDebitCardRoute,
    addBankAccountRoute,
    kycWallAnchorAlignment,
    paymentMethodDropdownAnchorAlignment,
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
    pressOnEnter,
    policyID,
    shouldShowPaymentOptions,
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
        buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);

        // Put the preferred payment method to the front of the array so its shown as default
        if (paymentMethod) {
            return _.sortBy(buttonOptions, (method) => (method.value === paymentMethod ? 0 : 1));
        }
        return buttonOptions;
    }, [betas, currency, formattedAmount, iouReport, nvp_lastPaymentMethod, policyID, shouldShowPaymentOptions, translate]);

    const selectPaymentType = (event, iouPaymentType, triggerKYCFlow) => {
        if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || iouPaymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
            triggerKYCFlow(event, iouPaymentType);
            BankAccounts.setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
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
            source={CONST.KYC_WALL_SOURCE.REPORT}
            chatReportID={chatReportID}
            iouReport={iouReport}
            anchorAlignment={kycWallAnchorAlignment}
        >
            {(triggerKYCFlow, buttonRef) => (
                <ButtonWithDropdownMenu
                    buttonRef={buttonRef}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    onPress={(event, iouPaymentType) => selectPaymentType(event, iouPaymentType, triggerKYCFlow)}
                    pressOnEnter={pressOnEnter}
                    options={paymentButtonOptions}
                    style={style}
                    buttonSize={buttonSize}
                    anchorAlignment={paymentMethodDropdownAnchorAlignment}
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
