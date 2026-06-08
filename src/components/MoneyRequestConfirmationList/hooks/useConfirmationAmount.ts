import type {OnyxEntry} from 'react-native-onyx';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import {computePerDiemExpenseAmount} from '@libs/actions/IOU/PerDiem';
import type {getAttendees} from '@libs/TransactionUtils';
import {isScanning, isScanRequest as isScanRequestUtil} from '@libs/TransactionUtils';
import type * as OnyxTypes from '@src/types/onyx';

type SubRates = NonNullable<NonNullable<NonNullable<OnyxTypes.Transaction['comment']>['customUnit']>['subRates']>;

type UseConfirmationAmountParams = {
    /** Transaction whose amount we're computing */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Total IOU amount entered by the user */
    iouAmount: number;

    /** Currency the IOU is being created in */
    iouCurrencyCode: string | undefined;

    /** Currently selected attendees, used to compute the per-attendee amount */
    iouAttendees: ReturnType<typeof getAttendees>;

    /** Whether the transaction is a distance request */
    isDistanceRequest: boolean;

    /** Whether the distance request route is still pending */
    isDistanceRequestWithPendingRoute: boolean;

    /** Whether the distance amount needs to be (re)calculated this render */
    shouldCalculateDistanceAmount: boolean;

    /** Pre-computed distance amount in the smallest currency unit */
    distanceRequestAmount: number;

    /** Currency reported by the active mileage rate */
    distanceCurrency: string | undefined;

    /** Whether the transaction is a per-diem request */
    isPerDiemRequest: boolean;

    /** Currency the transaction had on the previous render, used to detect changes */
    prevCurrency: string | undefined;

    /** Currency the transaction has on the current render */
    currency: string | undefined;

    /** Per-diem sub-rates from the previous render, used to detect rate changes */
    prevSubRates: SubRates;
};

/**
 * Computes the display amount and per-attendee amount for the confirmation flow.
 *
 * Handles the three amount sources — distance (recalculated from the route), per-diem
 * (summed from sub-rates), and plain IOU amount — and formats them for display,
 * including the pending-route and scanning special cases.
 */
function useConfirmationAmount({
    transaction,
    iouAmount,
    iouCurrencyCode,
    iouAttendees,
    isDistanceRequest,
    isDistanceRequestWithPendingRoute,
    shouldCalculateDistanceAmount,
    distanceRequestAmount,
    distanceCurrency,
    isPerDiemRequest,
    prevCurrency,
    currency,
    prevSubRates,
}: UseConfirmationAmountParams) {
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const isScanRequest = isScanRequestUtil(transaction);

    const subRates = transaction?.comment?.customUnit?.subRates ?? [];
    const shouldCalculatePerDiemAmount = isPerDiemRequest && (iouAmount === 0 || JSON.stringify(prevSubRates) !== JSON.stringify(subRates) || prevCurrency !== currency);

    let amountToBeUsed = iouAmount;
    if (shouldCalculateDistanceAmount) {
        amountToBeUsed = distanceRequestAmount;
    } else if (shouldCalculatePerDiemAmount) {
        amountToBeUsed = computePerDiemExpenseAmount({subRates});
    }

    const displayCurrency = isDistanceRequest ? distanceCurrency : iouCurrencyCode;

    let formattedAmount = convertToDisplayString(amountToBeUsed, displayCurrency);
    if (isDistanceRequestWithPendingRoute) {
        formattedAmount = '';
    } else if (isScanning(transaction)) {
        formattedAmount = translate('iou.receiptStatusTitle');
    }

    const attendeeCount = iouAttendees?.length && iouAttendees.length > 0 ? iouAttendees.length : 1;
    const formattedAmountPerAttendee = isDistanceRequestWithPendingRoute || isScanRequest ? '' : convertToDisplayString(amountToBeUsed / attendeeCount, displayCurrency);

    return {amountToBeUsed, formattedAmount, formattedAmountPerAttendee, isScanRequest};
}

export default useConfirmationAmount;
