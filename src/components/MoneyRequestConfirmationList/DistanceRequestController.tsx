import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {setCustomUnitRateID, setMoneyRequestAmount, setMoneyRequestMerchant, setMoneyRequestPendingFields} from '@libs/actions/IOU';
import {setSplitShares} from '@libs/actions/IOU/Split';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';

type DistanceRequestControllerProps = {
    transactionID: string | undefined;
    transaction: OnyxEntry<Transaction>;
    policy: OnyxEntry<Policy>;
    isDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isPolicyExpenseChat: boolean;
    isMovingTransactionFromTrackExpense: boolean;
    isReadOnly: boolean;
    isTypeSplit: boolean;
    customUnitRateID: string;
    mileageRate: MileageRate;
    rate: number | undefined;
    unit: Unit | undefined;
    currency: string;
    distance: number;
    distanceRequestAmount: number;
    shouldCalculateDistanceAmount: boolean;
    isDistanceRequestWithPendingRoute: boolean;
    hasRoute: boolean;
    defaultMileageRateCustomUnitRateID: string | undefined;
    selectedParticipants: Participant[];
    selectedParticipantsProp: Participant[];
    setFormError: (error: TranslationPaths | '') => void;
    clearFormErrors: (errors: string[]) => void;
};

/**
 * Side-effect-only component that manages distance request effects:
 * validates distance rates on policy change, calculates distance amounts,
 * auto-selects the last saved distance rate, and updates the merchant.
 */
function DistanceRequestController({
    transactionID,
    transaction,
    policy,
    isDistanceRequest,
    isManualDistanceRequest,
    isPolicyExpenseChat,
    isMovingTransactionFromTrackExpense,
    isReadOnly,
    isTypeSplit,
    customUnitRateID,
    mileageRate,
    rate,
    unit,
    currency,
    distance,
    distanceRequestAmount,
    shouldCalculateDistanceAmount,
    isDistanceRequestWithPendingRoute,
    hasRoute,
    defaultMileageRateCustomUnitRateID,
    selectedParticipants,
    selectedParticipantsProp,
    setFormError,
    clearFormErrors,
}: DistanceRequestControllerProps) {
    const {translate, toLocaleDigit} = useLocalize();
    const {getCurrencySymbol} = useCurrencyListActions();
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const lastSelectedRate = policy?.id ? (lastSelectedDistanceRates?.[policy.id] ?? defaultMileageRateCustomUnitRateID) : defaultMileageRateCustomUnitRateID;
    const prevPolicy = usePrevious(policy);
    const isFirstUpdatedDistanceAmount = useRef(false);

    useEffect(() => {
        // We want this effect to run when the transaction is moving from Self DM to an expense chat, or when the policy changes
        const isPolicyChanged = prevPolicy?.id !== policy?.id;
        if (!transactionID || !isDistanceRequest || !isPolicyExpenseChat || (!isMovingTransactionFromTrackExpense && !isPolicyChanged)) {
            return;
        }

        const errorKey = 'iou.error.invalidRate';
        const policyRates = DistanceRequestUtils.getMileageRates(policy);

        // If the selected rate belongs to the policy, and for moving track expense if the units also matches, clear the error
        if (customUnitRateID && customUnitRateID in policyRates && (!isMovingTransactionFromTrackExpense || policyRates[customUnitRateID].unit === mileageRate.unit)) {
            clearFormErrors([errorKey]);
            return;
        }

        // If there is a distance rate in the policy that matches the rate and unit of the currently selected mileage rate, select it automatically
        const matchingRate = Object.values(policyRates).find((policyRate) => policyRate.rate === mileageRate.rate && policyRate.unit === mileageRate.unit);
        if (matchingRate?.customUnitRateID) {
            setCustomUnitRateID(transactionID, matchingRate.customUnitRateID, transaction, policy);
            clearFormErrors([errorKey]);
            return;
        }

        // If none of the above conditions are met, display the rate error
        setFormError(errorKey);
    }, [
        isDistanceRequest,
        isPolicyExpenseChat,
        transactionID,
        mileageRate.rate,
        mileageRate.unit,
        customUnitRateID,
        policy,
        isMovingTransactionFromTrackExpense,
        setFormError,
        clearFormErrors,
        transaction,
        prevPolicy?.id,
    ]);

    useEffect(() => {
        if (isFirstUpdatedDistanceAmount.current) {
            return;
        }
        if (!isDistanceRequest || !transactionID) {
            return;
        }
        if (isReadOnly) {
            return;
        }
        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);
        setMoneyRequestAmount(transactionID, amount, currency ?? '');
        isFirstUpdatedDistanceAmount.current = true;
    }, [distance, rate, isReadOnly, unit, transactionID, currency, isDistanceRequest]);

    useEffect(() => {
        if (!shouldCalculateDistanceAmount || !transactionID || isReadOnly) {
            return;
        }

        const amount = distanceRequestAmount;
        setMoneyRequestAmount(transactionID, amount, currency ?? '');

        // If it's a split request among individuals, set the split shares
        const participantAccountIDs: number[] = selectedParticipantsProp.map((participant) => participant.accountID ?? CONST.DEFAULT_NUMBER_ID);
        if (isTypeSplit && !isPolicyExpenseChat && amount && transaction?.currency) {
            setSplitShares(transaction, amount, currency, participantAccountIDs);
        }
    }, [shouldCalculateDistanceAmount, isReadOnly, distanceRequestAmount, transactionID, currency, isTypeSplit, isPolicyExpenseChat, selectedParticipantsProp, transaction]);

    useEffect(() => {
        if (
            !['-1', CONST.CUSTOM_UNITS.FAKE_P2P_ID].includes(customUnitRateID) ||
            !isDistanceRequest ||
            !isPolicyExpenseChat ||
            !transactionID ||
            !lastSelectedRate ||
            (isMovingTransactionFromTrackExpense && customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID) ||
            !selectedParticipants.some((participant) => participant.policyID === policy?.id)
        ) {
            return;
        }

        setCustomUnitRateID(transactionID, lastSelectedRate, transaction, policy);
    }, [customUnitRateID, transactionID, lastSelectedRate, isDistanceRequest, isPolicyExpenseChat, isMovingTransactionFromTrackExpense, transaction, policy, selectedParticipants]);

    useEffect(() => {
        if (!isDistanceRequest || !transactionID || isReadOnly) {
            return;
        }

        /*
         Set pending waypoints based on the route status. We should handle this dynamically to cover cases such as:
         When the user completes the initial steps of the IOU flow offline and then goes online on the confirmation page.
         In this scenario, the route will be fetched from the server, and the waypoints will no longer be pending.
        */
        setMoneyRequestPendingFields(transactionID, {waypoints: isDistanceRequestWithPendingRoute ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : null});

        const distanceMerchant = DistanceRequestUtils.getDistanceMerchant(
            hasRoute,
            distance,
            unit,
            rate ?? 0,
            currency ?? CONST.CURRENCY.USD,
            translate,
            toLocaleDigit,
            getCurrencySymbol,
            isManualDistanceRequest,
        );
        setMoneyRequestMerchant(transactionID, distanceMerchant, true);
    }, [
        isDistanceRequestWithPendingRoute,
        hasRoute,
        distance,
        unit,
        rate,
        currency,
        translate,
        toLocaleDigit,
        isDistanceRequest,
        transaction,
        transactionID,
        isReadOnly,
        getCurrencySymbol,
        isManualDistanceRequest,
    ]);

    return null;
}

DistanceRequestController.displayName = 'DistanceRequestController';

export default DistanceRequestController;
