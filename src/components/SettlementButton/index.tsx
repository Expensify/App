import React, {useContext} from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SettlementButtonProps from './types';
import useSettlementButtonOptions from './useSettlementButtonOptions';

function SettlementButton({
    addDebitCardRoute = ROUTES.IOU_SEND_ADD_DEBIT_CARD,
    kycWallAnchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, // button is at left, so horizontal anchor is at LEFT
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    paymentMethodDropdownAnchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, // caret for dropdown is at right, so horizontal anchor is at RIGHT
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    buttonSize = CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    extraSmall = false,
    chatReportID = '',
    currency = CONST.CURRENCY.USD,
    enablePaymentsRoute,
    iouReport,
    formattedAmount = '',
    onPress,
    policyID = '-1',
    isDisabled = false,
    shouldStayNormalOnDisable = false,
    isLoading = false,
    pressOnEnter = false,
    style,
    disabledStyle,
    shouldHidePaymentOptions = false,
    shouldShowApproveButton = false,
    shouldDisableApproveButton = false,
    shouldShowPersonalBankAccountOption = false,
    enterKeyEventListenerPriority = 0,
    confirmApproval,
    useKeyboardShortcuts = false,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    onlyShowPayElsewhere,
    wrapperStyle,
    shouldUseShortForm = false,
    hasOnlyHeldExpenses = false,
    sentryLabel,
}: SettlementButtonProps) {
    const kycWallRef = useContext(KYCWallContext);
    const {
        paymentButtonOptions,
        customText,
        secondaryText,
        defaultSelectedIndex,
        shouldUseSplitButton,
        shouldLimitWidth,
        shouldPopoverUseScrollView,
        handlePaymentSelection,
        isExpenseReport,
        isInvoiceReport,
        isOffline,
        lastPaymentPolicy,
        styles,
        translate,
    } = useSettlementButtonOptions({
        chatReportID,
        currency,
        iouReport,
        formattedAmount,
        onPress,
        policyID,
        shouldHidePaymentOptions,
        shouldShowApproveButton,
        shouldDisableApproveButton,
        shouldShowPersonalBankAccountOption,
        onlyShowPayElsewhere,
        shouldUseShortForm,
        confirmApproval,
    });

    return (
        <KYCWall
            ref={kycWallRef}
            onSuccessfulKYC={(paymentType) => onPress({paymentType})}
            enablePaymentsRoute={enablePaymentsRoute}
            addDebitCardRoute={addDebitCardRoute}
            isDisabled={isOffline}
            source={CONST.KYC_WALL_SOURCE.REPORT}
            chatReportID={chatReportID}
            addBankAccountRoute={isExpenseReport ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: iouReport?.policyID, backTo: Navigation.getActiveRoute()}) : undefined}
            iouReport={iouReport}
            policy={lastPaymentPolicy}
            anchorAlignment={kycWallAnchorAlignment}
            shouldShowPersonalBankAccountOption={shouldShowPersonalBankAccountOption}
        >
            {(triggerKYCFlow, buttonRef) => (
                <ButtonWithDropdownMenu<string>
                    onOptionsMenuShow={onPaymentOptionsShow}
                    onOptionsMenuHide={onPaymentOptionsHide}
                    buttonRef={buttonRef}
                    shouldAlwaysShowDropdownMenu={isInvoiceReport && !onlyShowPayElsewhere}
                    customText={customText}
                    menuHeaderText={isInvoiceReport ? translate('workspace.invoices.paymentMethods.chooseInvoiceMethod') : undefined}
                    isSplitButton={shouldUseSplitButton}
                    isDisabled={isDisabled}
                    shouldStayNormalOnDisable={shouldStayNormalOnDisable}
                    isLoading={isLoading}
                    defaultSelectedIndex={defaultSelectedIndex !== -1 ? defaultSelectedIndex : 0}
                    onPress={(event, iouPaymentType) => handlePaymentSelection(event, iouPaymentType, triggerKYCFlow)}
                    success={!hasOnlyHeldExpenses}
                    extraSmall={extraSmall}
                    secondLineText={secondaryText}
                    pressOnEnter={pressOnEnter}
                    options={paymentButtonOptions}
                    onOptionSelected={(option) => {
                        if (paymentButtonOptions.length === 1) {
                            return;
                        }

                        handlePaymentSelection(undefined, option.value, triggerKYCFlow);
                    }}
                    style={style}
                    shouldUseShortForm={shouldUseShortForm}
                    shouldPopoverUseScrollView={shouldPopoverUseScrollView}
                    containerStyles={paymentButtonOptions.length > 5 ? styles.settlementButtonListContainer : {}}
                    wrapperStyle={[wrapperStyle, shouldLimitWidth ? styles.settlementButtonShortFormWidth : {}]}
                    disabledStyle={disabledStyle}
                    buttonSize={buttonSize}
                    anchorAlignment={paymentMethodDropdownAnchorAlignment}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                    useKeyboardShortcuts={useKeyboardShortcuts}
                    shouldUseModalPaddingStyle={paymentButtonOptions.length <= 5}
                    sentryLabel={sentryLabel}
                />
            )}
        </KYCWall>
    );
}

export default SettlementButton;
