import truncate from 'lodash/truncate';
import React from 'react';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSettlementData from '@hooks/useSettlementData';
import {getLastPolicyPaymentMethod} from '@libs/actions/Search';
import {sortPoliciesByName} from '@libs/PolicyUtils';
import {isIOUReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastPaymentMethodType} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import BaseSettlementButton from './BaseSettlementButton';
import {buildHandlePaymentSelection, getCustomText, getDefaultSelectedIndex} from './settlementUtils';
import type SettlementButtonProps from './types';
import useApproveAction from './useApproveAction';
import usePaymentGuard from './usePaymentGuard';

function IOUSettlementButton({
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
    const icons = useMemoizedLazyExpensifyIcons(['CheckCircle', 'Wallet', 'Building', 'User'] as const);
    const {translate, localeCompare} = useLocalize();
    const policy = usePolicy(policyID);

    const data = useSettlementData({chatReportID, iouReport, policyID, currency, shouldHidePaymentOptions, shouldShowPersonalBankAccountOption});
    const {
        reportID,
        policyIDKey,
        canUseWallet,
        canUsePersonalBankAccount,
        isPersonalOnlyOption,
        hasSinglePolicy,
        hasMultiplePolicies,
        shouldShowPayElsewhereOption,
        personalBankAccountList,
        businessBankAccountOptionList,
        activeAdminPolicies,
        paymentMethods,
    } = data;

    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const lastPaymentMethod = iouReport?.type
        ? getLastPolicyPaymentMethod(policyIDKey, personalPolicyID, lastPaymentMethods, iouReport?.type as keyof LastPaymentMethodType, isIOUReport(iouReport))
        : undefined;
    const hasPreferredPaymentMethod = !!lastPaymentMethod;
    const lastPaymentPolicy = usePolicy(lastPaymentMethod);

    const {checkForNecessaryAction, userBillingGracePeriodEnds} = usePaymentGuard(chatReportID, reportID, policy);
    const {approveButtonOption, handleApprove} = useApproveAction({iouReport, policyID, formattedAmount, shouldDisableApproveButton, confirmApproval, userBillingGracePeriodEnds});

    // Build payment button options
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

        // To achieve the one tap pay experience we need to choose the correct payment type as default.
        if (canUseWallet) {
            if (personalBankAccountList.length && canUsePersonalBankAccount) {
                buttonOptions.push({
                    text: translate('iou.settleWallet', ''),
                    value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                    icon: icons.Wallet,
                });
            } else if (canUsePersonalBankAccount) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]);
            }

            if (activeAdminPolicies.length === 0 && !isPersonalOnlyOption) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            }
        }

        if ((hasMultiplePolicies || hasSinglePolicy) && canUseWallet && !isPersonalOnlyOption) {
            const sortedActiveAdminPolicies = sortPoliciesByName(activeAdminPolicies, localeCompare);
            for (const p of sortedActiveAdminPolicies) {
                const policyName = p.name;
                buttonOptions.push({
                    text: translate('iou.payWithPolicy', truncate(policyName, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), ''),
                    icon: icons.Building,
                    value: p.id,
                    shouldUpdateSelectedIndex: false,
                });
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

    // selectPaymentType for IOU is simple — no invoice branching
    const selectPaymentType = (_event: unknown, iouPaymentType: PaymentMethodType) => {
        if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
            handleApprove();
            return;
        }
        onPress({paymentType: iouPaymentType, payAsBusiness: false});
    };

    const customText = getCustomText(shouldUseShortForm, lastPaymentMethod, formattedAmount, translate);

    // secondaryText for IOU: wallet if EXPENSIFY + personal bank accounts
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
    } else if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY && personalBankAccountList.length) {
        secondaryTextRaw = translate('common.wallet');
    }
    const secondaryText = secondaryTextRaw ? truncate(secondaryTextRaw, {length: CONST.FORM_CHARACTER_LIMIT}) : undefined;

    const defaultSelectedIndex = getDefaultSelectedIndex(paymentButtonOptions, lastPaymentMethod, lastPaymentPolicy, businessBankAccountOptionList);
    const shouldUseSplitButton = hasPreferredPaymentMethod || !!lastPaymentPolicy;
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
            isInvoiceReport={false}
        />
    );
}

IOUSettlementButton.displayName = 'IOUSettlementButton';

export default IOUSettlementButton;
