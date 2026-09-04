import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';

import type {ReadonlyDeep} from 'type-fest';

// Kept in its own file to avoid circular dependencies. `comment.selectedRouteKey` is frontend-only —
// only the selected route's distance survives a save, echoed as `comment.customUnit.routeDistanceMeters`
// (route distance, not displayed), so a saved pick is recovered by matching it.
function getSelectedRouteKey(transaction: ReadonlyDeep<OnyxInputOrEntry<Transaction>>): string {
    const routes = transaction?.routes;

    // A local pick wins over the BE value: it is the user's pending, not-yet-saved intent. The existence check
    // guards against a key pointing at a route that a re-fetch no longer returned.
    const selectedRouteKey = transaction?.comment?.selectedRouteKey;
    if (selectedRouteKey && routes?.[selectedRouteKey]) {
        return selectedRouteKey;
    }

    const routeDistanceMeters = transaction?.comment?.customUnit?.routeDistanceMeters;
    if (!routeDistanceMeters || !routes) {
        return CONST.TRANSACTION.DEFAULT_ROUTE_KEY;
    }

    // Whichever route is closest to the saved distance is the one the expense was created with
    let closestRouteKey: string | undefined;
    let smallestDifference = Number.POSITIVE_INFINITY;
    for (const [key, route] of Object.entries(routes)) {
        const distance = route?.distance;
        if (!distance) {
            continue;
        }

        const difference = Math.abs(distance - routeDistanceMeters);
        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestRouteKey = key;
        }
    }

    return closestRouteKey ?? CONST.TRANSACTION.DEFAULT_ROUTE_KEY;
}

export default getSelectedRouteKey;
