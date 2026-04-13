import truncate from 'lodash/truncate';
import React from 'react';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSettlementData from '@hooks/useSettlementData';
import {getLastPolicyBankAccountID, getLastPolicyPaymentMethod} from '@libs/actions/Search';
import {isBusinessInvoiceRoom, isIOUReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, LastPaymentMethodType} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import BaseSettlementButton from './BaseSettlementButton';
import {buildHandlePaymentSelection, getCustomText, getDefaultSelectedIndex} from './settlementUtils';
import type SettlementButtonProps from './types';
import useApproveAction from './useApproveAction';
import useInvoicePaymentOptions from './useInvoicePaymentOptions';
import usePaymentGuard from './usePaymentGuard';

function InvoiceSettlementButton({
    addDebitCardRoute,
    kycWallAnchorAlignment,
    paymentMethodDropdownAnchorAlignment,
    buttonSize,
    extraSmall,
    chatReportID = '',
    currency = CONST.CURRENCY.USD,
    enablePaymentsRoute,
    iouReport,
    formattedAmount = '',
    onPress,
    policyID = '-1',
    isDisabled,
    shouldStayNormalOnDisable,
    isLoading,
    pressOnEnter,
    style,
    disabledStyle,
    shouldHidePaymentOptions = false,
    shouldShowApproveButton = false,
    shouldDisableApproveButton = false,
    shouldShowPersonalBankAccountOption = false,
    enterKeyEventListenerPriority,
    confirmApproval,
    useKeyboardShortcuts,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    onlyShowPayElsewhere,
    wrapperStyle,
    shouldUseShortForm = false,
    hasOnlyHeldExpenses,
    sentryLabel,
}: SettlementButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['CheckCircle'] as const);
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);

    const data = useSettlementData({chatReportID, iouReport, policyID, currency, shouldHidePaymentOptions, shouldShowPersonalBankAccountOption});
    const {
        chatReport,
        reportID,
        policyIDKey,
        isPayInvoiceViaExpensifyBetaEnabled,
        formattedPaymentMethods,
        businessBankAccountOptionList,
        activeAdminPolicies,
        paymentMethods,
        bankAccountList,
    } = data;

    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const lastPaymentMethod = iouReport?.type
        ? getLastPolicyPaymentMethod(policyIDKey, personalPolicyID, lastPaymentMethods, iouReport?.type as keyof LastPaymentMethodType, isIOUReport(iouReport))
        : undefined;
    const lastBankAccountID = getLastPolicyBankAccountID(policyIDKey, lastPaymentMethods, iouReport?.type as keyof LastPaymentMethodType);
    const hasPreferredPaymentMethod = !!lastPaymentMethod;
    const lastPaymentPolicy = usePolicy(lastPaymentMethod);
    const bankAccount = bankAccountList?.[lastBankAccountID ?? CONST.DEFAULT_NUMBER_ID];
    const hasIntentToPay =
        ((formattedPaymentMethods.length === 1 && isIOUReport(iouReport)) ||
            policy?.achAccount?.state === CONST.BANK_ACCOUNT.STATE.OPEN ||
            policy?.achAccount?.state === CONST.BANK_ACCOUNT.STATE.LOCKED) &&
        !lastPaymentMethod;

    const {checkForNecessaryAction, userBillingGracePeriodEnds} = usePaymentGuard(chatReportID, reportID, policy);
    const {approveButtonOption, handleApprove} = useApproveAction({iouReport, policyID, formattedAmount, shouldDisableApproveButton, confirmApproval, userBillingGracePeriodEnds});
    const {buildInvoiceOptions} = useInvoicePaymentOptions({data, checkForNecessaryAction, onPress, formattedAmount, lastPaymentMethod, hasIntentToPay});

    // Build payment button options — invoice reports: invoice submenus + approve
    let paymentButtonOptions: Array<DropdownOption<string>>;

    // Only show the Approve button if the user cannot pay the expense
    if (shouldHidePaymentOptions && shouldShowApproveButton) {
        paymentButtonOptions = [approveButtonOption];
    } else if (onlyShowPayElsewhere) {
        paymentButtonOptions = [
            shouldUseShortForm
                ? {text: translate('iou.pay'), icon: icons.CheckCircle, value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, shouldUpdateSelectedIndex: false}
                : paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE],
        ];
    } else {
        const buttonOptions: Array<DropdownOption<string>> = [];

        buttonOptions.push(...buildInvoiceOptions());

        if (shouldShowApproveButton) {
            buttonOptions.push(approveButtonOption);
        }

        paymentButtonOptions = buttonOptions;
    }

    // selectPaymentType for invoice — complex branching
    const selectPaymentType = (_event: unknown, iouPaymentType: PaymentMethodType) => {
        if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
            handleApprove();
            return;
        }

        // if user has intent to pay, we should get the only bank account information to pay the invoice.
        if (hasIntentToPay && isPayInvoiceViaExpensifyBetaEnabled) {
            const currentBankInformation = formattedPaymentMethods.at(0) as BankAccount;
            onPress({
                paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                payAsBusiness: currentBankInformation.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                methodID: currentBankInformation.methodID,
                paymentMethod: currentBankInformation.accountType,
            });
            return;
        }

        const isBusinessInvoice = bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS || isBusinessInvoiceRoom(chatReport);
        if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            onPress({paymentType: iouPaymentType, payAsBusiness: isBusinessInvoice});
            return;
        }
        onPress({
            paymentType: iouPaymentType,
            payAsBusiness: isBusinessInvoice,
            methodID: lastBankAccountID,
            paymentMethod: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            policyID: policyIDKey,
        });
    };

    const customText = getCustomText(shouldUseShortForm, lastPaymentMethod, formattedAmount, translate);

    // secondaryText for invoice: business/personal bank label
    let secondaryTextRaw: string | undefined;
    if (
        shouldUseShortForm ||
        lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE ||
        (paymentButtonOptions.length === 1 && paymentButtonOptions.every((option) => option.value === CONST.IOU.PAYMENT_TYPE.ELSEWHERE)) ||
        (shouldHidePaymentOptions && (shouldShowApproveButton || onlyShowPayElsewhere))
    ) {
        secondaryTextRaw = undefined;
    } else if (lastPaymentPolicy) {
        secondaryTextRaw = lastPaymentPolicy.name;
    } else if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || hasIntentToPay) {
        const bankAccountToDisplay = hasIntentToPay
            ? ((formattedPaymentMethods.find((method) => method.methodID === policy?.achAccount?.bankAccountID) ?? formattedPaymentMethods.at(0)) as BankAccount)
            : bankAccount;
        const isBusinessBankAccount = bankAccountToDisplay?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS;
        secondaryTextRaw = translate(isBusinessBankAccount ? 'iou.invoiceBusinessBank' : 'iou.invoicePersonalBank', bankAccountToDisplay?.accountData?.accountNumber?.slice(-4) ?? '');
    }
    const secondaryText = secondaryTextRaw ? truncate(secondaryTextRaw, {length: CONST.FORM_CHARACTER_LIMIT}) : undefined;

    const defaultSelectedIndex = getDefaultSelectedIndex(paymentButtonOptions, lastPaymentMethod, lastPaymentPolicy, businessBankAccountOptionList);
    const isInvoiceReport = true;
    const shouldUseSplitButton = hasPreferredPaymentMethod || !!lastPaymentPolicy || (isInvoiceReport && hasIntentToPay);
    const shouldLimitWidth = shouldUseShortForm && shouldUseSplitButton && !paymentButtonOptions.length;

    const handlePaymentSelection = buildHandlePaymentSelection({
        checkForNecessaryAction,
        activeAdminPolicies,
        businessBankAccountOptions: undefined,
        policyIDKey,
        lastPaymentPolicy,
        selectPaymentType,
    });

    return (
        <BaseSettlementButton
            addDebitCardRoute={addDebitCardRoute}
            kycWallAnchorAlignment={kycWallAnchorAlignment}
            paymentMethodDropdownAnchorAlignment={paymentMethodDropdownAnchorAlignment}
            buttonSize={buttonSize}
            extraSmall={extraSmall}
            chatReportID={chatReportID}
            currency={currency}
            enablePaymentsRoute={enablePaymentsRoute}
            iouReport={iouReport}
            formattedAmount={formattedAmount}
            onPress={onPress}
            policyID={policyID}
            isDisabled={isDisabled}
            shouldStayNormalOnDisable={shouldStayNormalOnDisable}
            isLoading={isLoading}
            pressOnEnter={pressOnEnter}
            style={style}
            disabledStyle={disabledStyle}
            shouldHidePaymentOptions={shouldHidePaymentOptions}
            shouldShowApproveButton={shouldShowApproveButton}
            shouldDisableApproveButton={shouldDisableApproveButton}
            shouldShowPersonalBankAccountOption={shouldShowPersonalBankAccountOption}
            enterKeyEventListenerPriority={enterKeyEventListenerPriority}
            confirmApproval={confirmApproval}
            useKeyboardShortcuts={useKeyboardShortcuts}
            onPaymentOptionsShow={onPaymentOptionsShow}
            onPaymentOptionsHide={onPaymentOptionsHide}
            onlyShowPayElsewhere={onlyShowPayElsewhere}
            wrapperStyle={wrapperStyle}
            shouldUseShortForm={shouldUseShortForm}
            hasOnlyHeldExpenses={hasOnlyHeldExpenses}
            sentryLabel={sentryLabel}
            paymentButtonOptions={paymentButtonOptions}
            customText={customText}
            secondaryText={secondaryText}
            defaultSelectedIndex={defaultSelectedIndex}
            shouldUseSplitButton={shouldUseSplitButton}
            shouldLimitWidth={shouldLimitWidth}
            handlePaymentSelection={handlePaymentSelection}
            lastPaymentPolicy={lastPaymentPolicy}
            isExpenseReport={false}
            isInvoiceReport
        />
    );
}

InvoiceSettlementButton.displayName = 'InvoiceSettlementButton';

export default InvoiceSettlementButton;
