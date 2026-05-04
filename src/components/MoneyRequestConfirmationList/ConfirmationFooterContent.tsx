import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import FormHelpMessage from '@components/FormHelpMessage';
import SettlementButton from '@components/SettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type ConfirmationFooterContentProps = {
    /** IOU type currently being confirmed (submit / split / track / pay / invoice) */
    iouType: IOUType;

    /** Click handler invoked when the user taps the primary confirmation button */
    confirm: (params: PaymentActionParams) => void;

    /** Currency the IOU is being created in, used by the Pay settlement button */
    iouCurrencyCode: string;

    /** Policy the IOU belongs to, when applicable */
    policyID: string | undefined;

    /** Report the IOU is being created on */
    reportID: string;

    /** Whether the confirmation has already been submitted (locks the button) */
    isConfirmed: boolean | undefined;

    /** Whether a confirmation request is currently in flight */
    isConfirming: boolean | undefined;

    /** Whether a SmartScan receipt is still being processed */
    isLoadingReceipt: boolean;

    /** Dropdown options for the primary CTA (e.g. Submit / Submit & Close) */
    splitOrRequestOptions: Array<DropdownOption<string>>;

    /** Inline error message displayed above the button, if any */
    errorMessage: string | undefined;

    /** Number of expenses that will be created on confirm (drives bulk copy) */
    expensesNumber: number;

    /** Optional callback to show a confirm-modal before removing an expense */
    showRemoveExpenseConfirmModal: (() => void) | undefined;

    /** Whether the product-training tooltip should anchor to the button */
    shouldShowProductTrainingTooltip: boolean;

    /** Renders the product-training tooltip content */
    renderProductTrainingTooltip: () => React.ReactElement;
};

function ConfirmationFooterContent({
    iouType,
    confirm,
    iouCurrencyCode,
    policyID,
    reportID,
    isConfirmed,
    isConfirming,
    isLoadingReceipt,
    splitOrRequestOptions,
    errorMessage,
    expensesNumber,
    showRemoveExpenseConfirmModal,
    shouldShowProductTrainingTooltip,
    renderProductTrainingTooltip,
}: ConfirmationFooterContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const shouldShowSettlementButton = iouType === CONST.IOU.TYPE.PAY;

    const button = shouldShowSettlementButton ? (
        <SettlementButton
            pressOnEnter
            onPress={confirm}
            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
            chatReportID={reportID}
            shouldShowPersonalBankAccountOption
            currency={iouCurrencyCode}
            policyID={policyID}
            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
            kycWallAnchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
            paymentMethodDropdownAnchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
            enterKeyEventListenerPriority={1}
            useKeyboardShortcuts
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Using || because we want undefined and false to both be treated as falsy for isLoading
            isLoading={isConfirmed || isConfirming}
            sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_PAY_BUTTON}
        />
    ) : (
        <>
            {expensesNumber > 1 && (
                <Button
                    large
                    text={translate('iou.removeThisExpense')}
                    onPress={showRemoveExpenseConfirmModal}
                    style={styles.mb3}
                    sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_REMOVE_EXPENSE_BUTTON}
                />
            )}
            <EducationalTooltip
                shouldRender={shouldShowProductTrainingTooltip}
                renderTooltipContent={renderProductTrainingTooltip}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                wrapperStyle={styles.productTrainingTooltipWrapper}
                shouldHideOnNavigate
                shiftVertical={-10}
            >
                <View>
                    <ButtonWithDropdownMenu
                        pressOnEnter
                        onPress={(event, value) => confirm({paymentType: value as PaymentMethodType})}
                        options={splitOrRequestOptions}
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                        enterKeyEventListenerPriority={1}
                        useKeyboardShortcuts
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Using || because we want undefined and false to both be treated as falsy for isLoading
                        isLoading={isConfirmed || isConfirming || isLoadingReceipt}
                        sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_SUBMIT_BUTTON}
                    />
                </View>
            </EducationalTooltip>
        </>
    );

    return (
        <>
            {!!errorMessage && (
                <FormHelpMessage
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message={errorMessage}
                />
            )}
            <View>{button}</View>
        </>
    );
}

export default ConfirmationFooterContent;
export type {ConfirmationFooterContentProps};
