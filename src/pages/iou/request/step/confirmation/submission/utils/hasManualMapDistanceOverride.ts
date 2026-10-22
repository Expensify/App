import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getSelectedRouteKey, isMapDistanceRequest} from '@libs/TransactionUtils';

import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

function hasManualMapDistanceOverride(transaction: OnyxEntry<Transaction>): boolean {
    if (!isMapDistanceRequest(transaction)) {
        return false;
    }

    const quantity = transaction?.comment?.customUnit?.quantity;
    const unit = transaction?.comment?.customUnit?.distanceUnit;
    // A route reused offline that was itself saved offline seeds a quantity of 0, which is not a typed distance.
    if (typeof quantity !== 'number' || quantity <= 0 || !unit) {
        return false;
    }

    const selectedRouteDistanceMeters = transaction?.routes?.[getSelectedRouteKey(transaction)]?.distance;
    const savedRouteDistanceMeters = transaction?.comment?.customUnit?.routeDistanceMeters;

    // Offline the route is still pending, so a quantity can only have come from the Manual tab.
    if (!selectedRouteDistanceMeters && !savedRouteDistanceMeters) {
        return true;
    }

    // Route quantities are stored rounded, so compare against the rounded route and not with a tolerance.
    const matchesRoute = (distanceMeters: number | undefined) => !!distanceMeters && quantity === roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(distanceMeters, unit));
    return !matchesRoute(selectedRouteDistanceMeters) && !matchesRoute(savedRouteDistanceMeters);
}

export default hasManualMapDistanceOverride;
