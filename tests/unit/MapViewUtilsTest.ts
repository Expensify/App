import type {AlternateDirection, Coordinate} from '@components/MapView/MapViewTypes';
import utils from '@components/MapView/utils';

const SINGLE_SEGMENT: Coordinate[] = [
    [0, 0],
    [1, 1],
    [2, 2],
];

const SEGMENTED: Coordinate[][] = [
    [
        [0, 0],
        [1, 1],
    ],
    [
        [5, 5],
        [6, 6],
    ],
];

const buildAlternateDirection = (coordinates: Coordinate[] | Coordinate[][]): AlternateDirection => ({
    coordinates,
    isSelected: false,
    distanceInMeters: 1500,
});

describe('MapView utils', () => {
    describe('convertSegmentedRouteToSingleSegmentRoute', () => {
        it('returns a single segment route unchanged', () => {
            expect(utils.convertSegmentedRouteToSingleSegmentRoute(SINGLE_SEGMENT)).toBe(SINGLE_SEGMENT);
        });

        it('flattens a segmented route into a single list of coordinates', () => {
            expect(utils.convertSegmentedRouteToSingleSegmentRoute(SEGMENTED)).toEqual([
                [0, 0],
                [1, 1],
                [5, 5],
                [6, 6],
            ]);
        });

        it('passes through undefined and empty routes', () => {
            expect(utils.convertSegmentedRouteToSingleSegmentRoute(undefined)).toBeUndefined();
            expect(utils.convertSegmentedRouteToSingleSegmentRoute([])).toEqual([]);
        });
    });

    describe('getCoordinatesFromAllDirections', () => {
        it('concatenates the main and alternate direction coordinates', () => {
            expect(utils.getCoordinatesFromAllDirections(SINGLE_SEGMENT, buildAlternateDirection([[9, 9]]))).toEqual([
                [0, 0],
                [1, 1],
                [2, 2],
                [9, 9],
            ]);
        });

        it('flattens segmented coordinates on both directions', () => {
            expect(utils.getCoordinatesFromAllDirections(SEGMENTED, buildAlternateDirection([[[7, 7]], [[8, 8]]]))).toEqual([
                [0, 0],
                [1, 1],
                [5, 5],
                [6, 6],
                [7, 7],
                [8, 8],
            ]);
        });

        it('returns only the main direction when there is no alternate direction', () => {
            expect(utils.getCoordinatesFromAllDirections(SINGLE_SEGMENT, undefined)).toEqual(SINGLE_SEGMENT);
        });

        it('returns only the alternate direction when there is no main direction', () => {
            expect(utils.getCoordinatesFromAllDirections(undefined, buildAlternateDirection(SINGLE_SEGMENT))).toEqual(SINGLE_SEGMENT);
        });

        it('returns an empty list when there are no directions at all', () => {
            expect(utils.getCoordinatesFromAllDirections(undefined, undefined)).toEqual([]);
        });
    });

    describe('getDistanceSymbolCoordinates', () => {
        const WAYPOINTS: Coordinate[] = [
            [0, 0],
            [1, 0],
        ];

        /** Runs straight from the first waypoint to the second one, with most of its coordinates bunched up near the start. */
        const STRAIGHT_ROUTE: Coordinate[] = [
            [0, 0],
            [0.05, 0],
            [0.1, 0],
            [0.15, 0],
            [1, 0],
        ];

        /** Shares both waypoints with the straight route, but bulges north in between. */
        const BULGING_ROUTE: Coordinate[] = [
            [0, 0],
            [0.25, 0.2],
            [0.5, 0.3],
            [0.75, 0.2],
            [1, 0],
        ];

        it('anchors the symbol at the point of the route closest to the center when there is no alternate route', () => {
            const {northEast, southWest} = utils.getBounds(WAYPOINTS, STRAIGHT_ROUTE);
            const closestToCenter = utils.findClosestCoordinateOnLineFromCenter(utils.getBoundsCenter({northEast, southWest}), STRAIGHT_ROUTE);

            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, STRAIGHT_ROUTE, undefined)).toEqual({primary: closestToCenter, alternate: null});
        });

        it('anchors each symbol at its own share of its own route', () => {
            const {primary, alternate} = utils.getDistanceSymbolCoordinates(WAYPOINTS, STRAIGHT_ROUTE, BULGING_ROUTE);

            // A third of the way along the straight route. Four of its five coordinates sit in its first sixth, so an
            // anchor picked by the number of coordinates rather than by length would land far short of this.
            expect(primary?.at(0)).toBeCloseTo(0.33);
            expect(primary?.at(1)).toBe(0);

            // Two thirds of the way along the bulging route, so past its northernmost point and on its way back down.
            expect(alternate?.at(0)).toBeGreaterThan(0.5);
            expect(alternate?.at(1)).toBeGreaterThan(0);
            expect(alternate?.at(1)).toBeLessThan(0.3);
        });

        it('walks over the coordinates a route repeats', () => {
            const repeatedRoute: Coordinate[] = [
                [0, 0],
                [0, 0],
                [0.5, 0],
                [1, 0],
                [1, 0],
            ];

            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, repeatedRoute, BULGING_ROUTE).primary?.at(0)).toBeCloseTo(0.33);
        });

        it('anchors the symbol at the start of a route that has no length at all', () => {
            const zeroLengthRoute: Coordinate[] = [
                [0.5, 0],
                [0.5, 0],
                [0.5, 0],
            ];

            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, zeroLengthRoute, BULGING_ROUTE).primary).toEqual([0.5, 0]);
        });

        it('anchors the symbols away from the waypoints the two routes share', () => {
            const {primary, alternate} = utils.getDistanceSymbolCoordinates(WAYPOINTS, STRAIGHT_ROUTE, BULGING_ROUTE);

            for (const waypoint of WAYPOINTS) {
                expect(primary).not.toEqual(waypoint);
                expect(alternate).not.toEqual(waypoint);
            }
        });

        it('keeps the symbols apart even when both routes are identical', () => {
            const {primary, alternate} = utils.getDistanceSymbolCoordinates(WAYPOINTS, STRAIGHT_ROUTE, [...STRAIGHT_ROUTE]);

            expect(primary?.at(0)).toBeCloseTo(0.33);
            expect(alternate?.at(0)).toBeCloseTo(0.66);
        });

        it('returns no coordinates when there is nothing to anchor a symbol to', () => {
            expect(utils.getDistanceSymbolCoordinates([], STRAIGHT_ROUTE, BULGING_ROUTE)).toEqual({primary: null, alternate: null});
            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, undefined, BULGING_ROUTE)).toEqual({primary: null, alternate: null});
            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, [[0, 0]], BULGING_ROUTE)).toEqual({primary: null, alternate: null});
        });

        it('ignores an alternate route that is too short to be drawn', () => {
            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, STRAIGHT_ROUTE, [[0, 0]]).alternate).toBeNull();
        });
    });

    describe('isSingleSegmentRoute', () => {
        it('detects single segment, segmented and empty routes', () => {
            expect(utils.isSingleSegmentRoute(SINGLE_SEGMENT)).toBe(true);
            expect(utils.isSingleSegmentRoute(SEGMENTED)).toBe(false);
            expect(utils.isSingleSegmentRoute([])).toBe(true);
        });
    });
});
