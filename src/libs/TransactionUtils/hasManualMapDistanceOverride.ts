import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import getSelectedRouteKey from './getSelectedRouteKey';

function getRouteDistanceMetersMatchingQuantity(transaction: OnyxEntry<Transaction>): number | undefined {
    const quantity = transaction?.comment?.customUnit?.quantity;
    const unit = transaction?.comment?.customUnit?.distanceUnit;
    if (typeof quantity !== 'number' || !unit) {
        return undefined;
    }

    // Compare at two decimals: a typed value never has more, and route quantities are stored rounded.
    const roundedQuantity = roundToTwoDecimalPlaces(quantity);
    const selectedRouteDistanceMeters = transaction?.routes?.[getSelectedRouteKey(transaction)]?.distance;
    const savedRouteDistanceMeters = transaction?.comment?.customUnit?.routeDistanceMeters;
    return [selectedRouteDistanceMeters, savedRouteDistanceMeters].find(
        (distanceMeters): distanceMeters is number => !!distanceMeters && roundedQuantity === roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(distanceMeters, unit)),
    );
}

function hasManualMapDistanceOverride(transaction: OnyxEntry<Transaction>): boolean {
    if (transaction?.iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE_MAP) {
        return false;
    }

    const quantity = transaction?.comment?.customUnit?.quantity;
    const unit = transaction?.comment?.customUnit?.distanceUnit;
    // A route reused offline that was itself saved offline seeds a quantity of 0, which is not a typed distance.
    if (typeof quantity !== 'number' || quantity <= 0 || !unit) {
        return false;
    }

    // Offline the route is still pending, so a quantity can only have come from the Manual tab, unless a reused route
    // seeded it from the saved route, whose distance can be in another unit and must not be sent.
    const selectedRouteDistanceMeters = transaction?.routes?.[getSelectedRouteKey(transaction)]?.distance;
    if (!selectedRouteDistanceMeters && !transaction?.comment?.customUnit?.routeDistanceMeters) {
        return !transaction?.isReusedRoute;
    }

    return getRouteDistanceMetersMatchingQuantity(transaction) === undefined;
}

export default hasManualMapDistanceOverride;
export {getRouteDistanceMetersMatchingQuantity};
