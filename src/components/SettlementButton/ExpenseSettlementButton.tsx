import truncate from 'lodash/truncate';
import React from 'react';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSettlementData from '@hooks/useSettlementData';
import {getLastPolicyBankAccountID, getLastPolicyPaymentMethod} from '@libs/actions/Search';
import {isExpenseReport as isExpenseReportUtil, isIOUReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, LastPaymentMethodType} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import BaseSettlementButton from './BaseSettlementButton';
import {buildHandlePaymentSelection, getCustomText, getDefaultSelectedIndex} from './settlementUtils';
import type SettlementButtonProps from './types';
import useApproveAction from './useApproveAction';
import usePaymentGuard from './usePaymentGuard';

function ExpenseSettlementButton({
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
    const icons = useMemoizedLazyExpensifyIcons(['CheckCircle', 'ThumbsUp', 'Bank'] as const);
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);

    const data = useSettlementData({chatReportID, iouReport, policyID, currency, shouldHidePaymentOptions, shouldShowPersonalBankAccountOption});
    const {
        reportID,
        policyIDKey,
        isPersonalOnlyOption,
        shouldShowPayWithExpensifyOption,
        activeAdminPolicies,
        shouldShowPayElsewhereOption,
        formattedPaymentMethods,
        businessBankAccountOptionList,
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
    const hasIntentToPay = (policy?.achAccount?.state === CONST.BANK_ACCOUNT.STATE.OPEN || policy?.achAccount?.state === CONST.BANK_ACCOUNT.STATE.LOCKED) && !lastPaymentMethod;

    const {checkForNecessaryAction, userBillingGracePeriodEnds} = usePaymentGuard(chatReportID, reportID, policy);
    const {approveButtonOption, handleApprove} = useApproveAction({iouReport, policyID, formattedAmount, shouldDisableApproveButton, confirmApproval, userBillingGracePeriodEnds});

    const businessBankAccountOptions = businessBankAccountOptionList.length
        ? businessBankAccountOptionList.map((account) => ({...account, value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT}))
        : undefined;

    // Build payment button options — expense reports: business bank accounts + pay elsewhere + approve
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

        const shouldShowBusinessBankAccountOptions = shouldShowPayWithExpensifyOption && !isPersonalOnlyOption;

        if (shouldShowBusinessBankAccountOptions) {
            if (businessBankAccountOptionList.length === 0) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            } else {
                for (const account of businessBankAccountOptionList) {
                    buttonOptions.push({
                        text: account.text,
                        icon: typeof account.icon === 'number' ? icons.Bank : account.icon,
                        additionalIconStyles: typeof account.icon === 'number' ? undefined : account.iconStyles,
                        iconWidth: typeof account.icon === 'number' ? undefined : account.iconSize,
                        iconHeight: typeof account.icon === 'number' ? undefined : account.iconSize,
                        value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                        description: account.description,
                        onSelected: () => {
                            if (checkForNecessaryAction(CONST.IOU.PAYMENT_TYPE.VBBA)) {
                                return;
                            }
                            onPress({
                                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                                payAsBusiness: true,
                                methodID: account.methodID,
                                paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                            });
                        },
                    });
                }
            }
        }

        if (shouldShowPayElsewhereOption) {
            buttonOptions.push({
                ...paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE],
                ...(!buttonOptions.length && shouldUseShortForm ? {text: translate('iou.pay')} : {}),
            });
        }

        if (shouldShowApproveButton) {
            buttonOptions.push(approveButtonOption);
        }

        paymentButtonOptions = buttonOptions;
    }

    // selectPaymentType for expense is simple — no invoice branching
    const selectPaymentType = (_event: unknown, iouPaymentType: PaymentMethodType) => {
        if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
            handleApprove();
            return;
        }
        onPress({paymentType: iouPaymentType, payAsBusiness: false});
    };

    const customText = getCustomText(shouldUseShortForm, lastPaymentMethod, formattedAmount, translate);

    // secondaryText for expense: bank account last four
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
    } else {
        const bankAccountToDisplay = hasIntentToPay
            ? ((formattedPaymentMethods.find((method) => method.methodID === policy?.achAccount?.bankAccountID) ?? formattedPaymentMethods.at(0)) as BankAccount)
            : bankAccount;

        // Handle bank account payments first (expense reports require bank account, never wallet)
        if ((lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.VBBA || hasIntentToPay) && !!policy?.achAccount) {
            if (policy?.achAccount?.accountNumber) {
                secondaryTextRaw = translate('paymentMethodList.bankAccountLastFour', policy?.achAccount?.accountNumber?.slice(-4));
            } else if (bankAccountToDisplay?.accountData?.accountNumber) {
                secondaryTextRaw = translate('paymentMethodList.bankAccountLastFour', bankAccountToDisplay?.accountData?.accountNumber?.slice(-4));
            }
        } else if (bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS && bankAccount?.methodID === policy?.achAccount?.bankAccountID && isExpenseReportUtil(iouReport)) {
            secondaryTextRaw = translate('paymentMethodList.bankAccountLastFour', bankAccount?.accountData?.accountNumber?.slice(-4) ?? '');
        }
    }
    const secondaryText = secondaryTextRaw ? truncate(secondaryTextRaw, {length: CONST.FORM_CHARACTER_LIMIT}) : undefined;

    const defaultSelectedIndex = getDefaultSelectedIndex(paymentButtonOptions, lastPaymentMethod, lastPaymentPolicy, businessBankAccountOptionList);
    const isExpenseReport = true;
    const shouldUseSplitButton = hasPreferredPaymentMethod || !!lastPaymentPolicy || (isExpenseReport && hasIntentToPay);
    const shouldLimitWidth = shouldUseShortForm && shouldUseSplitButton && !paymentButtonOptions.length;

    const handlePaymentSelection = buildHandlePaymentSelection({
        checkForNecessaryAction,
        activeAdminPolicies,
        businessBankAccountOptions,
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
            isExpenseReport
            isInvoiceReport={false}
        />
    );
}

ExpenseSettlementButton.displayName = 'ExpenseSettlementButton';

export default ExpenseSettlementButton;
