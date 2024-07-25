import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

function getDistanceInMeters(transaction: OnyxInputOrEntry<Transaction>, unit: Unit | undefined) {
    if (transaction?.routes?.route0?.distance) {
        return transaction.routes.route0.distance;
    }
    if (transaction?.comment?.customUnit?.quantity && unit) {
        return DistanceRequestUtils.convertToDistanceInMeters(transaction.comment.customUnit.quantity, unit);
    }
    return 0;
}

export default getDistanceInMeters;
