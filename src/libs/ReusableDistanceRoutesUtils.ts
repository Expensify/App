import CONST from '@src/CONST';
import type {ReusableDistanceRoute} from '@src/types/onyx';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';

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
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
                return `${Math.round(lat * 1e5)},${Math.round(lng * 1e5)}`;
            }
            return waypoint.address ?? '';
        })
        .join(';');
}

const routeThumbnailCache = new Map<string, string>();

function getCachedRouteThumbnail(routeKey: string): string | undefined {
    return routeThumbnailCache.get(routeKey);
}

function setCachedRouteThumbnail(routeKey: string, thumbnailSource: string) {
    if (!routeKey || !thumbnailSource) {
        return;
    }
    routeThumbnailCache.set(routeKey, thumbnailSource);
}

function setCachedRouteThumbnailIfEmpty(routeKey: string, thumbnailSource: string) {
    if (!routeKey || !thumbnailSource || routeThumbnailCache.has(routeKey)) {
        return;
    }
    routeThumbnailCache.set(routeKey, thumbnailSource);
}

function clearRouteThumbnailCache() {
    routeThumbnailCache.clear();
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

/**
 * Builds the raw image URL for the source expense receipt (fallback when .1024.jpg is not ready).
 */
function getRawRouteThumbnailSource(receiptSource: string | undefined): string | undefined {
    if (!receiptSource) {
        return undefined;
    }
    const resolvedSource = tryResolveUrlFromApiRoot(receiptSource);
    if (resolvedSource.toLowerCase().endsWith('.pdf')) {
        return undefined;
    }
    return resolvedSource;
}

export {
    clearRouteThumbnailCache,
    filterRoutes,
    formatLastUsed,
    getCachedRouteThumbnail,
    getOrderedWaypoints,
    getRawRouteThumbnailSource,
    getRouteEndpoints,
    getRouteKey,
    getRouteThumbnailSource,
    normalizeRouteWaypoints,
    setCachedRouteThumbnail,
    setCachedRouteThumbnailIfEmpty,
};
