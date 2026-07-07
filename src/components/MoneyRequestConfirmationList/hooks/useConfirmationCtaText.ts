import type {OnyxEntry} from 'react-native-onyx';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import useLocalize from '@hooks/useLocalize';
import {hasInvoicingDetails} from '@userActions/Policy/Policy';
import type {IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type UseConfirmationCtaTextParams = {
    /** Number of expenses being created on confirm (drives bulk copy) */
    expensesNumber: number;

    /** Whether the current IOU type is invoice */
    isTypeInvoice: boolean;

    /** Whether the current IOU type is track-expense */
    isTypeTrackExpense: boolean;

    /** Whether the current IOU type is split */
    isTypeSplit: boolean;

    /** Whether the current IOU type is request */
    isTypeRequest: boolean;

    /** Total IOU amount */
    iouAmount: number;

    /** IOU type being confirmed (used as the dropdown option `value`) */
    iouType: IOUType;

    /** Policy the IOU belongs to, used to detect missing invoice company info */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Pre-formatted amount string (with currency symbol) */
    formattedAmount: string;

    /** Path or remote ID of an attached receipt */
    receiptPath: string | number;

    /** Whether the distance request route is still pending */
    isDistanceRequestWithPendingRoute: boolean;

    /** Whether the transaction is a per-diem request */
    isPerDiemRequest: boolean;
};

/**
 * Computes the primary confirm button label for the Money Request confirmation flow.
 *
 * Picks between create / split / invoice / next variants based on the IOU type and
 * bulk-expense count, returning a single-entry DropdownOption array shaped for the
 * ButtonWithDropdownMenu consumer.
 */
function useConfirmationCtaText({
    expensesNumber,
    isTypeInvoice,
    isTypeTrackExpense,
    isTypeSplit,
    isTypeRequest,
    iouAmount,
    policy,
    iouType,
    formattedAmount,
    receiptPath,
    isDistanceRequestWithPendingRoute,
    isPerDiemRequest,
}: UseConfirmationCtaTextParams): Array<DropdownOption<string>> {
    const {translate} = useLocalize();

    let text;
    if (expensesNumber > 1) {
        text = translate('iou.createExpenses', expensesNumber);
    } else if (isTypeInvoice) {
        if (hasInvoicingDetails(policy)) {
            text = translate('iou.sendInvoice', formattedAmount);
        } else {
            text = translate('common.next');
        }
    } else if (isTypeTrackExpense) {
        text = translate('iou.createExpense');
    } else if (isTypeSplit && iouAmount === 0) {
        text = translate('iou.splitExpense');
    } else if ((receiptPath && isTypeRequest) || isDistanceRequestWithPendingRoute || isPerDiemRequest) {
        text = translate('iou.createExpense');
    } else if (isTypeSplit) {
        text = translate('iou.splitExpense');
    } else {
        text = translate('iou.createExpense');
    }
    return [
        {
            text: text[0].toUpperCase() + text.slice(1),
            value: iouType,
        },
    ];
}

export default useConfirmationCtaText;
