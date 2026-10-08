import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {isMapDistanceRequest} from '@libs/TransactionUtils';

import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

function hasManualMapDistanceOverride(transaction: OnyxEntry<Transaction>): boolean {
    if (!isMapDistanceRequest(transaction)) {
        return false;
    }

    const quantity = transaction?.comment?.customUnit?.quantity;
    const unit = transaction?.comment?.customUnit?.distanceUnit;
    if (typeof quantity !== 'number' || !unit) {
        return false;
    }

    // Offline the route is still pending, so a quantity can only have come from the Manual tab.
    const routeDistanceMeters = transaction?.comment?.customUnit?.routeDistanceMeters ?? transaction?.routes?.route0?.distance;
    if (typeof routeDistanceMeters !== 'number' || routeDistanceMeters <= 0) {
        return true;
    }

    const routeQuantity = DistanceRequestUtils.convertDistanceUnit(routeDistanceMeters, unit);
    return Math.abs(quantity - routeQuantity) > 0.01;
}

export default hasManualMapDistanceOverride;
