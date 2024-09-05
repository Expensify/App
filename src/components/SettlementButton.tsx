import React, {useMemo} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import * as BankAccounts from '@userActions/BankAccounts';
import * as IOU from '@userActions/IOU';
import * as PolicyActions from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {ButtonSizeValue} from '@src/styles/utils/types';
import type {LastPaymentMethod, Policy, Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {PaymentType} from './ButtonWithDropdownMenu/types';
import * as Expensicons from './Icon/Expensicons';
import KYCWall from './KYCWall';
import {useSession} from './OnyxProvider';

type KYCFlowEvent = GestureResponderEvent | KeyboardEvent | undefined;

type TriggerKYCFlow = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType) => void;

type EnablePaymentsRoute = typeof ROUTES.ENABLE_PAYMENTS | typeof ROUTES.IOU_SEND_ENABLE_PAYMENTS | typeof ROUTES.SETTINGS_ENABLE_PAYMENTS;

type SettlementButtonOnyxProps = {
    /** The last payment method used per policy */
    nvpLastPaymentMethod?: OnyxEntry<LastPaymentMethod>;

    /** The policy of the report */
    policy: OnyxEntry<Policy>;
};

type SettlementButtonProps = SettlementButtonOnyxProps & {
    /** Callback to execute when this button is pressed. Receives a single payment type argument. */
    onPress: (paymentType?: PaymentMethodType, payAsBusiness?: boolean) => void;

    /** Callback when the payment options popover is shown */
    onPaymentOptionsShow?: () => void;

    /** Callback when the payment options popover is closed */
    onPaymentOptionsHide?: () => void;

    /** The route to redirect if user does not have a payment method setup */
    enablePaymentsRoute: EnablePaymentsRoute;

    /** Call the onPress function on main button when Enter key is pressed */
    pressOnEnter?: boolean;

    /** Settlement currency type */
    currency?: string;

    /** When the button is opened via an IOU, ID for the chatReport that the IOU is linked to */
    chatReportID?: string;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxEntry<Report>;

    /** Should we show the payment options? */
    shouldHidePaymentOptions?: boolean;

    /** Should we show the payment options? */
    shouldShowApproveButton?: boolean;

    /** Should approve button be disabled? */
    shouldDisableApproveButton?: boolean;

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

    /** The priority to assign the enter key event listener to buttons. 0 is the highest priority. */
    enterKeyEventListenerPriority?: number;

    /** Callback to open confirmation modal if any of the transactions is on HOLD */
    confirmApproval?: () => void;

    /** Whether to use keyboard shortcuts for confirmation or not */
    useKeyboardShortcuts?: boolean;
};

function SettlementButton({
    addDebitCardRoute = ROUTES.IOU_SEND_ADD_DEBIT_CARD,
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
    iouReport,
    // The "nvpLastPaymentMethod" object needs to be stable to prevent the "useMemo"
    // hook from being recreated unnecessarily, hence the use of CONST.EMPTY_OBJECT
    nvpLastPaymentMethod = CONST.EMPTY_OBJECT,
    isDisabled = false,
    isLoading = false,
    formattedAmount = '',
    onPress,
    pressOnEnter = false,
    policyID = '',
    shouldHidePaymentOptions = false,
    shouldShowApproveButton = false,
    shouldDisableApproveButton = false,
    style,
    enterKeyEventListenerPriority = 0,
    confirmApproval,
    policy,
    useKeyboardShortcuts = false,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
}: SettlementButtonProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const session = useSession();
    const primaryPolicy = useMemo(() => PolicyActions.getPrimaryPolicy(activePolicyID, session?.email), [activePolicyID, session?.email]);

    // The app would crash due to subscribing to the entire report collection if chatReportID is an empty string. So we should have a fallback ID here.
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID || -1}`);
    const isInvoiceReport = (!isEmptyObject(iouReport) && ReportUtils.isInvoiceReport(iouReport)) || false;
    const isPaidGroupPolicy = ReportUtils.isPaidGroupPolicyExpenseChat(chatReport);
    const shouldShowPaywithExpensifyOption =
        !isPaidGroupPolicy ||
        (!shouldHidePaymentOptions && ReportUtils.isPayer(session, iouReport) && policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL);
    const shouldShowPayElsewhereOption = (!isPaidGroupPolicy || policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL) && !isInvoiceReport;
    const paymentButtonOptions = useMemo(() => {
        const isExpenseReport = ReportUtils.isExpenseReport(iouReport);
        const paymentMethods = {
            [CONST.IOU.PAYMENT_TYPE.VBBA]: {
                text: translate('iou.settleExpensify', {formattedAmount}),
                icon: Expensicons.Wallet,
                value: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            [CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]: {
                text: translate('iou.settlePersonalBank', {formattedAmount}),
                icon: Expensicons.Bank,
                value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            },
            [CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]: {
                text: translate('iou.settleBusinessBank', {formattedAmount}),
                icon: Expensicons.Bank,
                value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            },
            [CONST.PAYMENT_METHODS.DEBIT_CARD]: {
                text: translate('iou.settleDebitCard', {formattedAmount}),
                icon: Expensicons.CreditCard,
                value: CONST.PAYMENT_METHODS.DEBIT_CARD,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: translate('iou.payElsewhere', {formattedAmount}),
                icon: Expensicons.Cash,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };
        const buttonOptions = [];
        const approveButtonOption = {
            text: translate('iou.approve'),
            icon: Expensicons.ThumbsUp,
            value: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
            disabled: !!shouldDisableApproveButton,
        };
        const canUseWallet = !isExpenseReport && !isInvoiceReport && currency === CONST.CURRENCY.USD;

        // Only show the Approve button if the user cannot pay the expense
        if (shouldHidePaymentOptions && shouldShowApproveButton) {
            return [approveButtonOption];
        }

        // To achieve the one tap pay experience we need to choose the correct payment type as default.
        // If the user has previously chosen a specific payment option or paid for some expense,
        // let's use the last payment method or use default.
        const paymentMethod = nvpLastPaymentMethod?.[policyID] ?? '-1';
        if (canUseWallet || (isExpenseReport && shouldShowPaywithExpensifyOption)) {
            buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
        }

        if (shouldShowPayElsewhereOption) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
        }

        if (isInvoiceReport) {
            if (ReportUtils.isIndividualInvoiceRoom(chatReport)) {
                buttonOptions.push({
                    text: translate('iou.settlePersonal', {formattedAmount}),
                    icon: Expensicons.User,
                    value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    backButtonText: translate('iou.individual'),
                    subMenuItems: [
                        {
                            text: translate('iou.payElsewhere', {formattedAmount: ''}),
                            icon: Expensicons.Cash,
                            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                            onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.ELSEWHERE),
                        },
                    ],
                });
            }

            if (PolicyUtils.isPolicyAdmin(primaryPolicy) && PolicyUtils.isPaidGroupPolicy(primaryPolicy)) {
                buttonOptions.push({
                    text: translate('iou.settleBusiness', {formattedAmount}),
                    icon: Expensicons.Building,
                    value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    backButtonText: translate('iou.business'),
                    subMenuItems: [
                        {
                            text: translate('iou.payElsewhere', {formattedAmount: ''}),
                            icon: Expensicons.Cash,
                            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                            onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, true),
                        },
                    ],
                });
            }
        }

        if (shouldShowApproveButton) {
            buttonOptions.push(approveButtonOption);
        }

        // Put the preferred payment method to the front of the array, so it's shown as default
        if (paymentMethod) {
            return buttonOptions.sort((method) => (method.value === paymentMethod ? -1 : 0));
        }
        return buttonOptions;
        // We don't want to reorder the options when the preferred payment method changes while the button is still visible
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [currency, formattedAmount, iouReport, chatReport, policyID, translate, shouldHidePaymentOptions, shouldShowApproveButton, shouldDisableApproveButton]);

    const selectPaymentType = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
        if (policy && SubscriptionUtils.shouldRestrictUserBillableActions(policy.id)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }

        if (
            iouPaymentType === CONST.IOU.PAYMENT_TYPE.VBBA ||
            iouPaymentType === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT ||
            iouPaymentType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ||
            iouPaymentType === CONST.PAYMENT_METHODS.DEBIT_CARD
        ) {
            triggerKYCFlow(event, iouPaymentType);
            BankAccounts.setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
            return;
        }

        if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
            if (confirmApproval) {
                confirmApproval();
            } else {
                IOU.approveMoneyRequest(iouReport);
            }
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
            onSuccessfulKYC={(paymentType) => onPress(paymentType)}
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
                <ButtonWithDropdownMenu<PaymentType>
                    success
                    onOptionsMenuShow={onPaymentOptionsShow}
                    onOptionsMenuHide={onPaymentOptionsHide}
                    buttonRef={buttonRef}
                    menuHeaderText={isInvoiceReport ? translate('workspace.invoices.paymentMethods.chooseInvoiceMethod') : undefined}
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
                    useKeyboardShortcuts={useKeyboardShortcuts}
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
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
    },
})(SettlementButton);
