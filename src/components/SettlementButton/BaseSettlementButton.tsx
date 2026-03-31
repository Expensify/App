import React, {useContext} from 'react';
import type {GestureResponderEvent} from 'react-native';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import type {ContinueActionParams} from '@components/KYCWall/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import shouldPopoverUseScrollViewUtil from '@libs/shouldPopoverUseScrollView';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type SettlementButtonProps from './types';

type BaseSettlementButtonProps = Omit<SettlementButtonProps, 'onPress'> & {
    paymentButtonOptions: Array<DropdownOption<string>>;
    customText: string;
    secondaryText: string | undefined;
    defaultSelectedIndex: number;
    shouldUseSplitButton: boolean;
    shouldLimitWidth: boolean;
    handlePaymentSelection: (event: GestureResponderEvent | KeyboardEvent | undefined, selectedOption: string, triggerKYCFlow: (params: ContinueActionParams) => void) => void;
    lastPaymentPolicy: Policy | undefined;
    isExpenseReport: boolean;
    isInvoiceReport: boolean;
    onPress: SettlementButtonProps['onPress'];
};

function BaseSettlementButton({
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
    enablePaymentsRoute,
    iouReport,
    onPress,
    isDisabled = false,
    shouldStayNormalOnDisable = false,
    isLoading = false,
    pressOnEnter = false,
    style,
    disabledStyle,
    shouldShowPersonalBankAccountOption = false,
    enterKeyEventListenerPriority = 0,
    useKeyboardShortcuts = false,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    onlyShowPayElsewhere,
    wrapperStyle,
    shouldUseShortForm = false,
    hasOnlyHeldExpenses = false,
    sentryLabel,
    // Computed values from variant
    paymentButtonOptions,
    customText,
    secondaryText,
    defaultSelectedIndex,
    shouldUseSplitButton,
    shouldLimitWidth,
    handlePaymentSelection,
    lastPaymentPolicy,
    isExpenseReport,
    isInvoiceReport,
}: BaseSettlementButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const kycWallRef = useContext(KYCWallContext);
    const shouldPopoverUseScrollView = shouldPopoverUseScrollViewUtil(paymentButtonOptions);

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
                    containerStyles={paymentButtonOptions.length > 5 ? styles.settlementButtonListContainer : undefined}
                    wrapperStyle={shouldLimitWidth ? [wrapperStyle, styles.settlementButtonShortFormWidth] : wrapperStyle}
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

BaseSettlementButton.displayName = 'BaseSettlementButton';

export default BaseSettlementButton;
export type {BaseSettlementButtonProps};
