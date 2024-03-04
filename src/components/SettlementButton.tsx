import React, {useEffect, useMemo} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import * as BankAccounts from '@userActions/BankAccounts';
import * as IOU from '@userActions/IOU';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {ButtonSizeValue} from '@src/styles/utils/types';
import type {LastPaymentMethod, Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {PaymentType} from './ButtonWithDropdownMenu/types';
import * as Expensicons from './Icon/Expensicons';
import KYCWall from './KYCWall';

type KYCFlowEvent = GestureResponderEvent | KeyboardEvent | undefined;

type TriggerKYCFlow = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType) => void;

type EnablePaymentsRoute = typeof ROUTES.ENABLE_PAYMENTS | typeof ROUTES.IOU_SEND_ENABLE_PAYMENTS | typeof ROUTES.SETTINGS_ENABLE_PAYMENTS;

type SettlementButtonOnyxProps = {
    /** The last payment method used per policy */
    nvpLastPaymentMethod?: OnyxEntry<LastPaymentMethod>;
};

type SettlementButtonProps = SettlementButtonOnyxProps & {
    /** Callback to execute when this button is pressed. Receives a single payment type argument. */
    onPress: (paymentType?: PaymentMethodType) => void;

    /** The route to redirect if user does not have a payment method setup */
    enablePaymentsRoute: EnablePaymentsRoute;

    /** Call the onPress function on main button when Enter key is pressed */
    pressOnEnter?: boolean;

    /** Settlement currency type */
    currency?: string;

    /** When the button is opened via an IOU, ID for the chatReport that the IOU is linked to */
    chatReportID?: string;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxEntry<Report> | EmptyObject;

    /** Should we show the payment options? */
    shouldHidePaymentOptions?: boolean;

    /** Should we show the payment options? */
    shouldShowApproveButton?: boolean;

    /** The policyID of the report we are paying */
    policyID?: string;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** Total money amount in form <currency><amount> */
    formattedAmount?: string;

    /** The size of button size */
    buttonSize?: ButtonSizeValue;

    /** Route for the Add Bank Account screen for a given navigation stack */
    addBankAccountRoute?: Route;

    /** Route for the Add Debit Card screen for a given navigation stack */
    addDebitCardRoute?: Route;

    /** Whether the button should be disabled */
    isDisabled?: boolean;

    /** Whether we should show a loading state for the main button */
    isLoading?: boolean;

    /** The anchor alignment of the popover menu for payment method dropdown */
    paymentMethodDropdownAnchorAlignment?: AnchorAlignment;

    /** The anchor alignment of the popover menu for KYC wall popover */
    kycWallAnchorAlignment?: AnchorAlignment;

    /** Whether the personal bank account option should be shown */
    shouldShowPersonalBankAccountOption?: boolean;

    /** The priority to assign the enter key event listener to buttons. 0 is the highest priority. */
    enterKeyEventListenerPriority?: number;
};

function SettlementButton({
    addDebitCardRoute = '',
    addBankAccountRoute = '',
    kycWallAnchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, // button is at left, so horizontal anchor is at LEFT
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    paymentMethodDropdownAnchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, // caret for dropdown is at right, so horizontal anchor is at RIGHT
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    buttonSize = CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    chatReportID = '',
    currency = CONST.CURRENCY.USD,
    enablePaymentsRoute,
    // The "iouReport" and "nvpLastPaymentMethod" objects needs to be stable to prevent the "useMemo"
    // hook from being recreated unnecessarily, hence the use of CONST.EMPTY_ARRAY and CONST.EMPTY_OBJECT
    iouReport = CONST.EMPTY_OBJECT,
    nvpLastPaymentMethod = CONST.EMPTY_OBJECT,
    isDisabled = false,
    isLoading = false,
    formattedAmount = '',
    onPress,
    pressOnEnter = false,
    policyID = '',
    shouldHidePaymentOptions = false,
    shouldShowApproveButton = false,
    style,
    shouldShowPersonalBankAccountOption = false,
    enterKeyEventListenerPriority = 0,
}: SettlementButtonProps) {
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
                text: translate('iou.payElsewhere', {formattedAmount}),
                icon: Expensicons.Cash,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };
        const approveButtonOption = {
            text: translate('iou.approve'),
            icon: Expensicons.ThumbsUp,
            value: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
        };
        const canUseWallet = !isExpenseReport && currency === CONST.CURRENCY.USD;

        // Only show the Approve button if the user cannot pay the request
        if (shouldHidePaymentOptions && shouldShowApproveButton) {
            return [approveButtonOption];
        }

        // To achieve the one tap pay experience we need to choose the correct payment type as default.
        // If the user has previously chosen a specific payment option or paid for some request or expense,
        // let's use the last payment method or use default.
        const paymentMethod = nvpLastPaymentMethod?.[policyID] ?? '';
        if (canUseWallet) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.EXPENSIFY]);
        }
        if (isExpenseReport) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.VBBA]);
        }
        buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);

        if (shouldShowApproveButton) {
            buttonOptions.push(approveButtonOption);
        }

        // Put the preferred payment method to the front of the array, so it's shown as default
        if (paymentMethod) {
            return buttonOptions.sort((method) => (method.value === paymentMethod ? -1 : 0));
        }
        return buttonOptions;
        // We don't want to reorder the options when the preferred payment method changes while the button is still visible
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currency, formattedAmount, iouReport, policyID, translate, shouldHidePaymentOptions, shouldShowApproveButton]);

    const selectPaymentType = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
        if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || iouPaymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
            triggerKYCFlow(event, iouPaymentType);
            BankAccounts.setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
            return;
        }

        if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
            IOU.approveMoneyRequest(iouReport ?? {});
            return;
        }

        playSound(SOUNDS.DONE);
        onPress(iouPaymentType);
    };

    const savePreferredPaymentMethod = (id: string, value: PaymentMethodType) => {
        IOU.savePreferredPaymentMethod(id, value);
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
            shouldShowPersonalBankAccountOption={shouldShowPersonalBankAccountOption}
        >
            {(triggerKYCFlow, buttonRef) => (
                <ButtonWithDropdownMenu<PaymentType>
                    success
                    buttonRef={buttonRef}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    onPress={(event, iouPaymentType) => selectPaymentType(event, iouPaymentType, triggerKYCFlow)}
                    pressOnEnter={pressOnEnter}
                    options={paymentButtonOptions}
                    onOptionSelected={(option) => savePreferredPaymentMethod(policyID, option.value)}
                    style={style}
                    buttonSize={buttonSize}
                    anchorAlignment={paymentMethodDropdownAnchorAlignment}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                />
            )}
        </KYCWall>
    );
}

SettlementButton.displayName = 'SettlementButton';

export default withOnyx<SettlementButtonProps, SettlementButtonOnyxProps>({
    nvpLastPaymentMethod: {
        key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
        selector: (paymentMethod) => paymentMethod ?? {},
    },
})(SettlementButton);
