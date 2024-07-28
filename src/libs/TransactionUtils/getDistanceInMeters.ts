import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

function getDistanceInMeters(transaction: OnyxInputOrEntry<Transaction>, unit: Unit | undefined) {
    // If we are creating a new distance request, the distance is available in routes.route0.distance and it's already in meter.
    if (transaction?.routes?.route0?.distance) {
        return transaction.routes.route0.distance;
    }

    // If the request is completed, transaction.routes is cleared and comment.customUnit.quantity holds the new distance in the selected unit.
    // We need to convert it from the selected distance unit to meters.
    if (transaction?.comment?.customUnit?.quantity && unit) {
        return DistanceRequestUtils.convertToDistanceInMeters(transaction.comment.customUnit.quantity, unit);
    }
    return 0;
}

export default getDistanceInMeters;
