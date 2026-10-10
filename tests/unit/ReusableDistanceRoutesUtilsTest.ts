import type {ReusableDistanceRoute} from '../../src/types/onyx';
import type {WaypointCollection} from '../../src/types/onyx/Transaction';

import {
    clearRouteThumbnailCache,
    filterRoutes,
    getCachedRouteThumbnail,
    getOrderedWaypoints,
    getRouteEndpoints,
    getRouteKey,
    getRouteThumbnailSource,
    setCachedRouteThumbnail,
    setCachedRouteThumbnailIfEmpty,
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

        it('matches keys when coordinates are strings versus numbers', () => {
            // Given a route with numeric coordinates and another with string coordinates
            const routeNumeric = createRoute('1', ['A', 'B']);
            const routeString = {
                ...routeNumeric,
                transactionID: '2',
                waypoints: {
                    waypoint0: {...routeNumeric.waypoints.waypoint0, lat: '37.7', lng: '-122.4'},
                    waypoint1: {...routeNumeric.waypoints.waypoint1, lat: '38.7', lng: '-123.4'},
                },
            };

            // When getting route keys for both
            const numericKey = getRouteKey(routeNumeric);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixture verifies string coordinate runtime handling
            const stringKey = getRouteKey(routeString as unknown as ReusableDistanceRoute);

            // Then both keys match
            expect(stringKey).toBe(numericKey);
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

    describe('getRouteThumbnailSource', () => {
        it('appends 1024.jpg suffix for image receipts', () => {
            // Given an image receipt URL
            const receiptSource = 'https://expensify.com/receipts/w_test.png';

            // When getting the thumbnail source
            const thumbnail = getRouteThumbnailSource(receiptSource);

            // Then .1024.jpg is appended
            expect(thumbnail).toBe('https://expensify.com/receipts/w_test.png.1024.jpg');
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

        it('does not overwrite existing cache when using setCachedRouteThumbnailIfEmpty', () => {
            // Given an existing cached thumbnail
            const routeKey = 'route-key';
            const initialSource = 'https://expensify.com/receipts/w_first.png.1024.jpg';
            const newSource = 'https://expensify.com/receipts/w_second.png.1024.jpg';
            setCachedRouteThumbnail(routeKey, initialSource);

            // When attempting to set if empty
            setCachedRouteThumbnailIfEmpty(routeKey, newSource);

            // Then the initial source is preserved
            expect(getCachedRouteThumbnail(routeKey)).toBe(initialSource);
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
