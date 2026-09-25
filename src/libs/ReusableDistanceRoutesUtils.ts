import DateUtils from '@libs/DateUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {getWaypointIndex} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';

import CONST from '@src/CONST';
import type {ReusableDistanceRoute} from '@src/types/onyx';
import type {Waypoint} from '@src/types/onyx/Transaction';

/**
 * Returns the route waypoints as a list ordered by their waypoint index
 */
function getOrderedWaypoints(route: ReusableDistanceRoute): Waypoint[] {
    return Object.keys(route.waypoints)
        .map(getWaypointIndex)
        .sort((a, b) => a - b)
        .map((index) => route.waypoints[`waypoint${index}`]);
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
 * Builds the large thumbnail URL for the source expense receipt. Map receipts are stored as PDF, and
 * resized copies of a PDF live under a .jpg key, same convention as ReceiptUtils.getThumbnailAndImageURIs.
 */
function getRouteThumbnailSource(receiptSource: string | undefined): string | undefined {
    if (!receiptSource) {
        return undefined;
    }
    const resolvedSource = tryResolveUrlFromApiRoot(receiptSource);
    if (resolvedSource.endsWith('.pdf')) {
        return `${resolvedSource.slice(0, -'.pdf'.length)}.jpg.1024.jpg`;
    }
    return `${resolvedSource}.1024.jpg`;
}

export {getOrderedWaypoints, getRouteEndpoints, filterRoutes, formatLastUsed, getRouteThumbnailSource};
