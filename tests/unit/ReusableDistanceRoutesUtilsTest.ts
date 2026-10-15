import type {ReusableDistanceRoute, Transaction} from '../../src/types/onyx';
import type {WaypointCollection} from '../../src/types/onyx/Transaction';

import CONST from '../../src/CONST';
import {getLocallyCreatedRouteOnyxData} from '../../src/libs/actions/ReusableDistanceRoutes';
import {filterRoutes, getAvailableReusableDistanceRoutes, getOrderedWaypoints, getRouteEndpoints, getRouteKey, getRouteThumbnailSource} from '../../src/libs/ReusableDistanceRoutesUtils';
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

    describe('getAvailableReusableDistanceRoutes', () => {
        const baseTransaction: Transaction = {
            transactionID: 'tx-1',
            amount: 100,
            created: '2026-09-01',
            currency: CONST.CURRENCY.USD,
            merchant: 'Test Merchant',
            reportID: '1',
        };

        it('excludes routes whose source transaction is pending creation without a receipt when online', () => {
            // Given a newly created route whose transaction is still pending creation without a server receipt
            const route = createRoute('tx-1', ['A', 'B']);
            const transactions: Record<string, Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}tx-1`]: {
                    ...baseTransaction,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            };

            // When resolving available routes while online
            const available = getAvailableReusableDistanceRoutes([route], transactions, false);

            // Then the pending route is excluded until creation completes
            expect(available).toEqual([]);
        });

        it('includes routes whose source transaction is pending creation when offline', () => {
            // Given a newly created route while offline
            const route = createRoute('tx-1', ['A', 'B']);
            const transactions: Record<string, Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}tx-1`]: {
                    ...baseTransaction,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            };

            // When resolving available routes while offline
            const available = getAvailableReusableDistanceRoutes([route], transactions, true);

            // Then the route is included for offline reuse
            expect(available).toEqual([route]);
        });

        it('populates receiptSource from the created transaction when missing on the route', () => {
            // Given a locally created route whose transaction has completed creation and received its receipt URL
            const route = createRoute('tx-1', ['A', 'B']);
            const receiptUrl = 'https://expensify.com/receipts/w_created.pdf';
            const transactions: Record<string, Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}tx-1`]: {
                    ...baseTransaction,
                    receipt: {source: receiptUrl},
                },
            };

            // When resolving available routes
            const available = getAvailableReusableDistanceRoutes([route], transactions, false);

            // Then the route receives the transaction receiptSource
            expect(available).toEqual([{...route, receiptSource: receiptUrl}]);
        });
    });

    describe('getLocallyCreatedRouteOnyxData', () => {
        it('deduplicates routes by route key and preserves existing receiptSource', () => {
            // Given an existing route with a receiptSource and a newly reused route with the same waypoints
            const existingRoute: ReusableDistanceRoute = {
                ...createRoute('tx-old', ['A', 'B']),
                receiptSource: 'https://expensify.com/receipts/w_old.pdf',
            };
            const newRoute = createRoute('tx-new', ['A', 'B']);

            // When building optimistic Onyx data for the locally created route
            const {optimisticData} = getLocallyCreatedRouteOnyxData(newRoute, [existingRoute]);

            // Then the list is deduplicated and preserves the existing receiptSource
            expect(optimisticData.at(0)?.value).toEqual([
                {
                    ...newRoute,
                    receiptSource: 'https://expensify.com/receipts/w_old.pdf',
                },
            ]);
        });

        it('falls back to the existing transaction receipt source when missing on the existing route entry', () => {
            // Given an existing locally created route whose receiptSource is stored on its transaction in Onyx
            const existingRoute = createRoute('tx-old', ['A', 'B']);
            const newRoute = createRoute('tx-new', ['A', 'B']);
            const transactions: Record<string, Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}tx-old`]: {
                    transactionID: 'tx-old',
                    amount: 100,
                    created: '2026-09-01',
                    currency: CONST.CURRENCY.USD,
                    merchant: 'Test Merchant',
                    reportID: '1',
                    receipt: {source: 'https://expensify.com/receipts/w_from_tx.pdf'},
                },
            };

            // When building optimistic Onyx data for the newly reused route
            const {optimisticData} = getLocallyCreatedRouteOnyxData(newRoute, [existingRoute], transactions);

            // Then the new route preserves the receiptSource from the previous transaction
            expect(optimisticData.at(0)?.value).toEqual([
                {
                    ...newRoute,
                    receiptSource: 'https://expensify.com/receipts/w_from_tx.pdf',
                },
            ]);
        });
    });
});
