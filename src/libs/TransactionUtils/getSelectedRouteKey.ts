import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';

// Resolve which of the transaction's routes is the selected one.
// This function is placed in a separate file to avoid circular dependencies.
//
// `comment.selectedRouteKey` is a frontend-only field: it is set when the user taps a route on the map and is
// cleared whenever the waypoints change. The BE never returns it — it only echoes the distance of the route the
// expense was created with, as `comment.customUnit.routeDistanceMeters`. So for an already-saved expense (e.g.
// after a fresh login, on the edit screen) the selection has to be recovered by matching that distance against
// the re-fetched routes.
//
// `routeDistanceMeters` is the route-calculated distance, not the displayed one, so this stays correct even when
// the user has a manual `customUnit.quantity` override on top of the route.
function getSelectedRouteKey(transaction: OnyxInputOrEntry<Transaction>): string {
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
