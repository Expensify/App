import {de} from 'date-fns/locale/de';
import {ja} from 'date-fns/locale/ja';

import type {ReusableDistanceRoute, Transaction} from '../../src/types/onyx';
import type {WaypointCollection} from '../../src/types/onyx/Transaction';

import CONST from '../../src/CONST';
import {filterRoutes, formatLastUsed, getAvailableReusableDistanceRoutes, getOrderedWaypoints, getRouteEndpoints, getRouteThumbnailSource} from '../../src/libs/ReusableDistanceRoutesUtils';
import ONYXKEYS from '../../src/ONYXKEYS';

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
    it.each([
        ['German', de, '22. Jan.'],
        ['Japanese', ja, '1月22日'],
    ] as const)('formats the Last used date in %s', (languageName, locale, expected) => {
        // Given a source expense inserted late on a UTC calendar day
        const inserted = '2026-01-22 23:30:00';

        // When the badge asks for an explicit-locale date
        const label = formatLastUsed(inserted, locale);

        // Then the label uses that locale without moving to a different day
        expect(label).toBe(expected);
    });

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

    describe('getAvailableReusableDistanceRoutes', () => {
        const baseTransaction: Transaction = {
            transactionID: 'tx-1',
            amount: 100,
            created: '2026-09-01',
            currency: CONST.CURRENCY.USD,
            merchant: 'Test Merchant',
            reportID: '1',
        };

        it('excludes routes whose source transaction has pending distance receipt regeneration when online', () => {
            // Given a newly created route whose transaction has pending waypoints while online
            const route = createRoute('tx-1', ['A', 'B']);
            const transactions: Record<string, Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}tx-1`]: {
                    ...baseTransaction,
                    pendingFields: {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                },
            };

            // When resolving available routes while online
            const available = getAvailableReusableDistanceRoutes([route], transactions, false);

            // Then the pending route is excluded until the server generates the map image
            expect(available).toEqual([]);
        });

        it('includes routes whose source transaction has pending distance receipt regeneration when offline', () => {
            // Given a newly created route while offline
            const route = createRoute('tx-1', ['A', 'B']);
            const transactions: Record<string, Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}tx-1`]: {
                    ...baseTransaction,
                    pendingFields: {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                },
            };

            // When resolving available routes while offline
            const available = getAvailableReusableDistanceRoutes([route], transactions, true);

            // Then the route is included for offline reuse
            expect(available).toEqual([route]);
        });

        it('includes routes whose source transaction has completed distance receipt generation when online', () => {
            // Given a route whose transaction has no pending distance receipt regeneration
            const route = createRoute('tx-1', ['A', 'B']);
            const transactions: Record<string, Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}tx-1`]: baseTransaction,
            };

            // When resolving available routes while online
            const available = getAvailableReusableDistanceRoutes([route], transactions, false);

            // Then the route is included
            expect(available).toEqual([route]);
        });

        it('excludes routes with invalid waypoints or zero distance', () => {
            // Given routes with zero coordinates, zero resolved distance (no route found), fewer than two waypoints, or duplicate adjacent waypoints
            const zeroCoordinatesRoute: ReusableDistanceRoute = {
                ...createRoute('tx-1', ['Invalid Start', 'Invalid End']),
                waypoints: {
                    waypoint0: {address: 'Invalid Start', lat: 0, lng: 0},
                    waypoint1: {address: 'Invalid End', lat: 0, lng: 0},
                },
            };
            const noRouteFoundRoute: ReusableDistanceRoute = {
                ...createRoute('tx-2', ['Unreachable Start', 'Unreachable End']),
                distance: 0,
            };
            const singleWaypointRoute = createRoute('tx-3', ['Only One']);
            const duplicateWaypointsRoute = createRoute('tx-4', ['Same Address', 'Same Address']);
            const validRoute = createRoute('tx-5', ['Start', 'End']);

            // When resolving available routes
            const availableOnline = getAvailableReusableDistanceRoutes([zeroCoordinatesRoute, noRouteFoundRoute, singleWaypointRoute, duplicateWaypointsRoute, validRoute], undefined, false);
            const availableOffline = getAvailableReusableDistanceRoutes([zeroCoordinatesRoute, noRouteFoundRoute, singleWaypointRoute, duplicateWaypointsRoute, validRoute], undefined, true);

            // Then only the route with valid waypoints and a resolved distance is returned
            expect(availableOnline).toEqual([validRoute]);
            expect(availableOffline).toEqual([validRoute]);
        });

        it('excludes routes whose source transaction resolved to invalid waypoints after syncing', () => {
            // Given an optimistically saved offline route whose transaction later synced with zero coordinates
            const optimisticOfflineRoute: ReusableDistanceRoute = {
                transactionID: 'tx-1',
                distance: 0,
                inserted: '2026-09-01 12:00:00',
                waypoints: {
                    waypoint0: {address: 'Invalid Start'},
                    waypoint1: {address: 'Invalid End'},
                },
            };
            const transactions: Record<string, Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}tx-1`]: {
                    ...baseTransaction,
                    comment: {
                        waypoints: {
                            waypoint0: {address: 'Invalid Start', lat: 0, lng: 0},
                            waypoint1: {address: 'Invalid End', lat: 0, lng: 0},
                        },
                    },
                },
            };

            // When resolving available routes after the transaction synced
            const available = getAvailableReusableDistanceRoutes([optimisticOfflineRoute], transactions, false);

            // Then the route is excluded
            expect(available).toEqual([]);
        });
    });
});
