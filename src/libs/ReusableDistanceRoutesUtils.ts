import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReusableDistanceRoute, Transaction} from '@src/types/onyx';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';

import type {OnyxCollection} from 'react-native-onyx';

import DateUtils from './DateUtils';
import tokenizedSearch from './tokenizedSearch';
import {getWaypointIndex} from './TransactionUtils';
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
 * Generates a stable key for a route based on its ordered waypoint coordinates or addresses.
 */
function getRouteKey(route: ReusableDistanceRoute): string {
    const orderedWaypoints = getOrderedWaypoints(route);
    return orderedWaypoints
        .map((waypoint) => {
            const lat = typeof waypoint.lat === 'number' ? waypoint.lat : Number(waypoint.lat);
            const lng = typeof waypoint.lng === 'number' ? waypoint.lng : Number(waypoint.lng);
            if (waypoint.lat != null && waypoint.lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
                return `${Math.round(lat * 1e5)},${Math.round(lng * 1e5)}`;
            }
            return waypoint.address ?? '';
        })
        .join(';');
}

/**
 * Resolves the available reusable routes. When online, excludes routes whose source transaction is
 * still pending creation without a generated map receipt image.
 */
function getAvailableReusableDistanceRoutes(routes: ReusableDistanceRoute[] | undefined, transactions: OnyxCollection<Transaction> | undefined, isOffline: boolean): ReusableDistanceRoute[] {
    if (!routes?.length) {
        return [];
    }

    const availableRoutes: ReusableDistanceRoute[] = [];
    for (const route of routes) {
        const sourceTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${route.transactionID}`];
        const transactionReceiptSource = typeof sourceTransaction?.receipt?.source === 'string' ? sourceTransaction.receipt.source : undefined;
        const receiptSource = route.receiptSource ?? transactionReceiptSource;
        const isPendingCreation = sourceTransaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;

        if (!isOffline && isPendingCreation && !receiptSource) {
            continue;
        }

        availableRoutes.push(receiptSource && !route.receiptSource ? {...route, receiptSource} : route);
    }

    return availableRoutes;
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

export {filterRoutes, formatLastUsed, getAvailableReusableDistanceRoutes, getOrderedWaypoints, getRouteEndpoints, getRouteKey, getRouteThumbnailSource, normalizeRouteWaypoints};
