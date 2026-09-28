import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import FormHelpMessage from '@components/FormHelpMessage';
import type {ReceiptOptions} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';
import SettlementButton from '@components/SettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy, Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import type {MoneyRequestConfirmationListProps} from './types';

import useConfirmationCtaText from './hooks/useConfirmationCtaText';
import useReceiptTraining from './hooks/useReceiptTraining';

/**
 * A Sentry label aggregates every interaction that shares it, so the confirmation CTA reports one series per IOU flow
 * instead of blending submit, split, track and invoice into a single INP measurement. Flows absent from this map fall
 * back to CONFIRMATION_SUBMIT_BUTTON.
 */
const CONFIRMATION_SENTRY_LABEL_BY_IOU_TYPE: Partial<Record<IOUType, string>> = {
    [CONST.IOU.TYPE.SPLIT]: CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_SPLIT_BUTTON,
    [CONST.IOU.TYPE.SPLIT_EXPENSE]: CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_SPLIT_BUTTON,
    [CONST.IOU.TYPE.TRACK]: CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_TRACK_BUTTON,
    [CONST.IOU.TYPE.INVOICE]: CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_INVOICE_BUTTON,
};

type ConfirmationFooterContentProps = {
    /** The IOU flow being confirmed. Picks the settlement button for pay and the Sentry label for the CTA. */
    iouType: MoneyRequestConfirmationListProps['iouType'];

    /** Validates and submits, with the payment method the button chose */
    confirm: (params?: PaymentActionParams) => void;

    /** Currency of the expense */
    iouCurrencyCode: string;

    /** Policy ID the confirmation was opened with */
    policyID: string | undefined;

    /** Report the expense is submitted to */
    reportID: string;

    /** Whether the expense is confirmed */
    isConfirmed: boolean | undefined;

    /** Whether the expense is in the process of being confirmed */
    isConfirming: boolean | undefined;

    /** The receipt being confirmed. Its path picks the CTA label and its loading state disables the button. */
    receiptOptions: ReceiptOptions;

    /** Form error rendered above the button */
    errorMessage: string | undefined;

    /** How many receipts this confirmation submits. Above one, the CTA reads as plural and a remove-this-expense button appears. */
    expensesNumber: number;

    /** Opens the modal that drops this receipt out of a multi-receipt confirmation */
    showRemoveExpenseConfirmModal: (() => void) | undefined;

    /** Transaction being confirmed */
    transaction: OnyxEntry<Transaction>;

    /** The resolved policy */
    policy: OnyxEntry<Policy>;

    /** Amount of the expense */
    iouAmount: number;

    /** Whether the expense is a split */
    isTypeSplit: boolean;

    /** Display amount shown in the CTA label */
    formattedAmount: string;

    /** Whether the expense is a per diem expense */
    isPerDiemRequest: boolean;

    /** Whether the distance route is still being calculated */
    isDistanceRequestWithPendingRoute: boolean;
};

function ConfirmationFooterContent({
    iouType,
    confirm,
    iouCurrencyCode,
    policyID,
    reportID,
    isConfirmed,
    isConfirming,
    receiptOptions,
    errorMessage,
    expensesNumber,
    showRemoveExpenseConfirmModal,
    transaction,
    policy,
    iouAmount,
    isTypeSplit,
    formattedAmount,
    isPerDiemRequest,
    isDistanceRequestWithPendingRoute,
}: ConfirmationFooterContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {receiptPath = '', isLoadingReceipt = false} = receiptOptions;

    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip} = useReceiptTraining({transaction});

    const splitOrRequestOptions = useConfirmationCtaText({
        expensesNumber,
        isTypeInvoice: iouType === CONST.IOU.TYPE.INVOICE,
        isTypeSplit,
        isTypeRequest: iouType === CONST.IOU.TYPE.SUBMIT,
        iouAmount,
        iouType,
        policy,
        formattedAmount,
        receiptPath,
        isDistanceRequestWithPendingRoute,
        isPerDiemRequest,
    });

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
            size={CONST.BUTTON_SIZE.LARGE}
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
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={showRemoveExpenseConfirmModal}
                    style={styles.mb3}
                    sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_REMOVE_EXPENSE_BUTTON}
                >
                    <Button.Text>{translate('iou.removeThisExpense')}</Button.Text>
                </Button>
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
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        pressOnEnter
                        onPress={(event, value) => confirm({paymentType: value as PaymentMethodType})}
                        options={splitOrRequestOptions}
                        size={CONST.BUTTON_SIZE.LARGE}
                        enterKeyEventListenerPriority={1}
                        useKeyboardShortcuts
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Using || because we want undefined and false to both be treated as falsy for isLoading
                        isLoading={isConfirmed || isConfirming || isLoadingReceipt}
                        sentryLabel={CONFIRMATION_SENTRY_LABEL_BY_IOU_TYPE[iouType] ?? CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_SUBMIT_BUTTON}
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
