import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReusableDistanceRoute, Transaction} from '@src/types/onyx';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';

import type {OnyxCollection} from 'react-native-onyx';

import DateUtils from './DateUtils';
import tokenizedSearch from './tokenizedSearch';
import {getWaypointIndex, hasPendingDistanceReceiptRegeneration} from './TransactionUtils';
import tryResolveUrlFromApiRoot from './tryResolveUrlFromApiRoot';

/**
 * Returns the route waypoints as a list ordered by their waypoint index
 */
function getOrderedWaypoints(route: ReusableDistanceRoute): Waypoint[] {
    return Object.keys(route.waypoints)
        .map(getWaypointIndex)
        .sort((a, b) => a - b)
        .map((index) => route.waypoints[`waypoint${index}`])
        .filter((waypoint): waypoint is Waypoint => !!waypoint);
}

/**
 * Makes waypoint keys contiguous and adds a unique keyForList, which the waypoint editor
 * uses to map rows to indexes. Stored waypoints have neither.
 */
function normalizeRouteWaypoints(route: ReusableDistanceRoute): WaypointCollection {
    return getOrderedWaypoints(route).reduce((acc: WaypointCollection, waypoint, index) => {
        acc[`waypoint${index}`] = {
            ...waypoint,
            keyForList: waypoint.keyForList ?? `${waypoint.name ?? 'waypoint'}_${route.transactionID}_${index}`,
        };
        return acc;
    }, {});
}

/**
 * Returns the addresses of the first and last waypoint of the route for the card Start and End rows
 */
function getRouteEndpoints(route: ReusableDistanceRoute): {start: string; end: string} {
    const orderedWaypoints = getOrderedWaypoints(route);
    return {
        start: orderedWaypoints.at(0)?.address ?? '',
        end: orderedWaypoints.at(-1)?.address ?? '',
    };
}

/**
 * Matches the search text against every waypoint address of the route, including intermediate stops
 */
function filterRoutes(routes: ReusableDistanceRoute[], searchValue: string): ReusableDistanceRoute[] {
    return tokenizedSearch(routes, searchValue, (route) => getOrderedWaypoints(route).map((waypoint) => waypoint.address ?? ''));
}

/**
 * Formats the inserted timestamp of the source expense for the Last used badge
 */
function formatLastUsed(inserted: string): string {
    return DateUtils.formatWithUTCTimeZone(inserted, CONST.DATE.MONTH_DAY_ABBR_FORMAT, undefined);
}

/**
 * Resolves the reusable routes that can be shown. While online, routes whose source expense still has a pending map
 * receipt (just created, or its waypoints/distance edited) are left out until the server generates the new map image,
 * the same check the report preview uses before loading a distance receipt.
 */
function getAvailableReusableDistanceRoutes(routes: ReusableDistanceRoute[] | undefined, transactions: OnyxCollection<Transaction> | undefined, isOffline: boolean): ReusableDistanceRoute[] {
    if (!routes?.length || isOffline) {
        return routes ?? [];
    }
    return routes.filter((route) => !hasPendingDistanceReceiptRegeneration(transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${route.transactionID}`]));
}

/**
 * Builds the large thumbnail URL for the source expense receipt.
 */
function getRouteThumbnailSource(receiptSource: string | undefined): string | undefined {
    if (!receiptSource) {
        return undefined;
    }
    const resolvedSource = tryResolveUrlFromApiRoot(receiptSource);
    if (resolvedSource.toLowerCase().endsWith('.pdf')) {
        return `${resolvedSource.slice(0, -'.pdf'.length)}.jpg.1024.jpg`;
    }
    return `${resolvedSource}.1024.jpg`;
}

export {filterRoutes, formatLastUsed, getAvailableReusableDistanceRoutes, getOrderedWaypoints, getRouteEndpoints, getRouteThumbnailSource, normalizeRouteWaypoints};
