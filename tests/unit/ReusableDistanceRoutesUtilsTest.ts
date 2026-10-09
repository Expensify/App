import type {ReusableDistanceRoute} from '../../src/types/onyx';
import type {WaypointCollection} from '../../src/types/onyx/Transaction';

import {
    clearRouteThumbnailCache,
    filterRoutes,
    getCachedRouteThumbnail,
    getOrderedWaypoints,
    getRouteEndpoints,
    getRouteKey,
    setCachedRouteThumbnail,
} from '../../src/libs/ReusableDistanceRoutesUtils';

const createRoute = (transactionID: string, addresses: string[]): ReusableDistanceRoute => ({
    transactionID,
    distance: 3.5,
    inserted: '2026-09-01 12:00:00',
    waypoints: addresses.reduce<WaypointCollection>((acc, address, index) => {
        acc[`waypoint${index}`] = {address, lat: 37.7 + index, lng: -122.4 - index};
        return acc;
    }, {}),
});

describe('ReusableDistanceRoutesUtils', () => {
    describe('filterRoutes', () => {
        const routes = [
            createRoute('1', ['Expensify Lounge, San Francisco, CA', 'Marina Green East Beach, San Francisco, CA']),
            createRoute('2', ['Home, Portland, OR', 'Office, Portland, OR']),
            createRoute('3', ['Start, Austin, TX', 'Mid Stop, Dallas, TX', 'End, Houston, TX']),
        ];

        it('returns all routes when the search value is empty', () => {
            expect(filterRoutes(routes, '')).toEqual(routes);
            expect(filterRoutes(routes, '   ')).toEqual(routes);
        });

        it('matches against the first waypoint address', () => {
            expect(filterRoutes(routes, 'Expensify Lounge')).toEqual([routes.at(0)]);
        });

        it('matches against the last waypoint address', () => {
            expect(filterRoutes(routes, 'Marina')).toEqual([routes.at(0)]);
        });

        it('matches against intermediate stop addresses', () => {
            expect(filterRoutes(routes, 'Dallas')).toEqual([routes.at(2)]);
        });

        it('is case-insensitive', () => {
            expect(filterRoutes(routes, 'portland')).toEqual([routes.at(1)]);
            expect(filterRoutes(routes, 'HOUSTON')).toEqual([routes.at(2)]);
        });

        it('returns an empty list when nothing matches', () => {
            expect(filterRoutes(routes, 'Chicago')).toEqual([]);
        });
    });

    describe('getOrderedWaypoints', () => {
        it('orders waypoints by their numeric index, not by key insertion or alphabetical order', () => {
            const route = createRoute('1', ['A', 'B', 'C']);
            const scrambled: WaypointCollection = {
                waypoint2: route.waypoints.waypoint2,
                waypoint0: route.waypoints.waypoint0,
                waypoint1: route.waypoints.waypoint1,
            };
            const ordered = getOrderedWaypoints({...route, waypoints: scrambled});
            expect(ordered.map((waypoint) => waypoint.address)).toEqual(['A', 'B', 'C']);
        });
    });

    describe('getRouteEndpoints', () => {
        it('returns the first and last waypoint addresses', () => {
            const route = createRoute('1', ['Start, Austin, TX', 'Mid Stop, Dallas, TX', 'End, Houston, TX']);
            expect(getRouteEndpoints(route)).toEqual({start: 'Start, Austin, TX', end: 'End, Houston, TX'});
        });
    });

    describe('getRouteKey', () => {
        it('generates a stable key based on rounded coordinates', () => {
            // Given two routes with identical waypoints but different transaction IDs
            const route1 = createRoute('1', ['A', 'B']);
            const route2 = createRoute('2', ['A', 'B']);

            // When getting the route key for both routes
            const key1 = getRouteKey(route1);
            const key2 = getRouteKey(route2);

            // Then both keys should match despite differing transaction IDs
            expect(key1).toBe(key2);
        });

        it('falls back to address when coordinates are missing', () => {
            // Given a route whose waypoints lack lat/lng coordinates
            const route: ReusableDistanceRoute = {
                transactionID: '1',
                distance: 5,
                inserted: '2026-09-01 12:00:00',
                waypoints: {
                    waypoint0: {address: 'Start Address'},
                    waypoint1: {address: 'End Address'},
                },
            };

            // When generating the route key
            const key = getRouteKey(route);

            // Then the key uses the waypoint addresses
            expect(key).toBe('Start Address;End Address');
        });
    });

    describe('routeThumbnailCache', () => {
        beforeEach(() => {
            clearRouteThumbnailCache();
        });

        it('stores and retrieves cached thumbnail sources by route key', () => {
            // Given a route key and a thumbnail URL
            const routeKey = '3770000,-12240000;3780000,-12250000';
            const thumbnailSource = 'https://expensify.com/receipts/w_test.png.1024.jpg';

            // When caching the thumbnail
            setCachedRouteThumbnail(routeKey, thumbnailSource);

            // Then the cached source is retrievable
            expect(getCachedRouteThumbnail(routeKey)).toBe(thumbnailSource);
        });

        it('clears the thumbnail cache', () => {
            // Given a populated thumbnail cache
            const routeKey = 'route-key';
            setCachedRouteThumbnail(routeKey, 'https://expensify.com/receipts/w_test.png.1024.jpg');

            // When clearing the cache
            clearRouteThumbnailCache();

            // Then no thumbnail is found
            expect(getCachedRouteThumbnail(routeKey)).toBeUndefined();
        });
    });
});
