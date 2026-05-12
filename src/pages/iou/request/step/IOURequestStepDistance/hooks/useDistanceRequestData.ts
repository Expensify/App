import type {OnyxEntry} from 'react-native-onyx';
import {setMoneyRequestAmount} from '@libs/actions/IOU';
import {setSplitShares} from '@libs/actions/IOU/Split';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import {getDistanceInMeters, isCustomUnitRateIDForP2P} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {Policy, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

type UseDistanceRequestDataParams = {
    /** The workspace policy used to derive the mileage rate, output currency, and default rate. */
    policy: OnyxEntry<Policy>;

    /** The current user's personal policy — only `outputCurrency` is read as a fallback. */
    personalPolicy: Pick<Policy, 'outputCurrency'> | undefined;

    /** The transaction whose distance, custom-unit rate ID, and rate are being primed. */
    transaction: OnyxEntry<Transaction>;

    /** The transaction's selected mileage-rate ID, used to look up the rate within the policy. */
    customUnitRateID: string | undefined;

    /** ID of the transaction being mutated. */
    transactionID: string;

    /** True for split flows — triggers per-participant share calculation against non-policy chats. */
    isSplitRequest: boolean;
};

// Sets `amount` and `split` share data before moving to the next step to avoid briefly showing `0.00` as the split share for participants
function useDistanceRequestData({policy, personalPolicy, transaction, customUnitRateID, transactionID, isSplitRequest}: UseDistanceRequestDataParams): (participants: Participant[]) => void {
    return (participants: Participant[]) => {
        // Get policy report based on transaction participants
        const isPolicyExpenseChat = participants?.some((participant) => participant.isPolicyExpenseChat);
        const policyCurrency = policy?.outputCurrency ?? personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;

        const mileageRates = DistanceRequestUtils.getMileageRates(policy);
        const defaultMileageRate = DistanceRequestUtils.getDefaultMileageRate(policy);
        const mileageRate: MileageRate | undefined = isCustomUnitRateIDForP2P(transaction)
            ? DistanceRequestUtils.getRateForP2P(policyCurrency, transaction)
            : ((customUnitRateID ? mileageRates?.[customUnitRateID] : undefined) ?? defaultMileageRate);

        const {unit, rate} = mileageRate ?? {};
        const distance = getDistanceInMeters(transaction, unit);
        const currency = mileageRate?.currency ?? policyCurrency;
        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);
        setMoneyRequestAmount(transactionID, amount, currency);

        const participantAccountIDs: number[] | undefined = participants?.map((participant) => Number(participant.accountID ?? CONST.DEFAULT_NUMBER_ID));
        if (isSplitRequest && amount && currency && !isPolicyExpenseChat) {
            setSplitShares(transaction, amount, currency ?? '', participantAccountIDs ?? []);
        }
    };
}

export default useDistanceRequestData;
