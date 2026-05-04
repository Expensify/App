import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getDistanceInMeters, hasRoute as hasRouteUtil} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

const mileageRateSelector = (policy: OnyxEntry<OnyxTypes.Policy>) => DistanceRequestUtils.getDefaultMileageRate(policy);
const policyDraftSelector = (draft: OnyxEntry<OnyxTypes.Policy>) => draft && ({customUnits: draft.customUnits} as OnyxEntry<OnyxTypes.Policy>);

type UseDistanceRequestStateParams = {
    /** Transaction being confirmed */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Policy the IOU belongs to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Policy ID, used to subscribe to the right policy / policy-draft Onyx keys */
    policyID: string | undefined;

    /** Destination policy when moving an expense off a track-expense */
    policyForMovingExpenses: OnyxEntry<OnyxTypes.Policy>;

    /** Whether we're moving a transaction off a track-expense flow */
    isMovingTransactionFromTrackExpense: boolean;

    /** Whether the transaction is a distance request */
    isDistanceRequest: boolean;

    /** Current IOU amount, used to decide whether to seed the calculated amount */
    iouAmount: number;

    /** Currency the IOU is being created in, used as a fallback when the rate has none */
    iouCurrencyCode: string;
};

/**
 * Resolves the distance-request state for the Money Request confirmation flow.
 *
 * Subscribes (via narrow Onyx selectors) to the policy / policy-draft custom units to
 * derive the default mileage rate, computes the distance, calculated amount, and
 * active currency, and reports whether the route is still pending. Returns
 * `shouldCalculateDistanceAmount`, which becomes true on first mount with a zero
 * `iouAmount` so consumers can persist the calculated amount once.
 */
function useDistanceRequestState({
    transaction,
    policy,
    policyID,
    policyForMovingExpenses,
    isMovingTransactionFromTrackExpense,
    isDistanceRequest,
    iouAmount,
    iouCurrencyCode,
}: UseDistanceRequestStateParams) {
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`, {
        selector: policyDraftSelector,
    });
    const [defaultMileageRateDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`, {
        selector: mileageRateSelector,
    });
    const [defaultMileageRateReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: mileageRateSelector,
    });

    const defaultMileageRate = defaultMileageRateDraft ?? defaultMileageRateReal;
    const defaultRate = defaultMileageRate?.customUnitRateID;

    const mileageRate = DistanceRequestUtils.getRate({
        transaction,
        policy,
        ...(isMovingTransactionFromTrackExpense && {policyForMovingExpenses}),
        isMovingTransactionFromTrackExpense,
        policyDraft,
    });
    const distanceRate = mileageRate.rate;
    const distanceUnit = mileageRate.unit;
    const calculateFromTransactionData = isMovingTransactionFromTrackExpense && !distanceRate;
    const unit = calculateFromTransactionData ? transaction?.comment?.customUnit?.distanceUnit : distanceUnit;
    const rate = calculateFromTransactionData ? Math.abs(iouAmount) / (transaction?.comment?.customUnit?.quantity ?? 1) : distanceRate;
    const currency = calculateFromTransactionData ? iouCurrencyCode : (mileageRate.currency ?? CONST.CURRENCY.USD);
    const prevRate = usePrevious(rate);
    const prevUnit = usePrevious(unit);
    const prevCurrency = usePrevious(currency);

    const distance = getDistanceInMeters(transaction, unit);
    const prevDistance = usePrevious(distance);
    const shouldCalculateDistanceAmount = isDistanceRequest && (iouAmount === 0 || prevRate !== rate || prevDistance !== distance || prevCurrency !== currency || prevUnit !== unit);

    const hasRoute = hasRouteUtil(transaction, isDistanceRequest);
    const isDistanceRequestWithPendingRoute = isDistanceRequest && (!hasRoute || !rate) && !isMovingTransactionFromTrackExpense;

    const distanceRequestAmount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);

    return {
        policyDraft,
        defaultMileageRate,
        defaultRate,
        mileageRate,
        distanceRate,
        distanceUnit,
        calculateFromTransactionData,
        unit,
        rate,
        currency,
        prevRate,
        prevUnit,
        prevCurrency,
        distance,
        prevDistance,
        shouldCalculateDistanceAmount,
        hasRoute,
        isDistanceRequestWithPendingRoute,
        distanceRequestAmount,
    };
}

export default useDistanceRequestState;
