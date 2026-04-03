import React from 'react';
import {isExpenseReport as isExpenseReportUtil, isInvoiceReport as isInvoiceReportUtil} from '@libs/ReportUtils';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ExpenseSettlementButton from './ExpenseSettlementButton';
import InvoiceSettlementButton from './InvoiceSettlementButton';
import IOUSettlementButton from './IOUSettlementButton';
import type SettlementButtonProps from './types';

function SettlementButton({
    addDebitCardRoute,
    kycWallAnchorAlignment,
    paymentMethodDropdownAnchorAlignment,
    buttonSize,
    extraSmall,
    chatReportID,
    currency,
    enablePaymentsRoute,
    iouReport,
    formattedAmount,
    onPress,
    policyID,
    isDisabled,
    shouldStayNormalOnDisable,
    isLoading,
    pressOnEnter,
    style,
    disabledStyle,
    shouldHidePaymentOptions,
    shouldShowApproveButton,
    shouldDisableApproveButton,
    shouldShowPersonalBankAccountOption,
    enterKeyEventListenerPriority,
    confirmApproval,
    useKeyboardShortcuts,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    onlyShowPayElsewhere,
    wrapperStyle,
    shouldUseShortForm,
    hasOnlyHeldExpenses,
    sentryLabel,
}: SettlementButtonProps) {
    const isInvoiceReport = (!isEmptyObject(iouReport) && isInvoiceReportUtil(iouReport)) || false;
    const isExpenseReport = isExpenseReportUtil(iouReport);

    let Variant;
    if (isInvoiceReport) {
        Variant = InvoiceSettlementButton;
    } else if (isExpenseReport) {
        Variant = ExpenseSettlementButton;
    } else {
        Variant = IOUSettlementButton;
    }

    return (
        <Variant
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
        />
    );
}

SettlementButton.displayName = 'SettlementButton';

export default SettlementButton;
