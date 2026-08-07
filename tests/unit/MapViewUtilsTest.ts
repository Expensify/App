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

    describe('isSingleSegmentRoute', () => {
        it('detects single segment, segmented and empty routes', () => {
            expect(utils.isSingleSegmentRoute(SINGLE_SEGMENT)).toBe(true);
            expect(utils.isSingleSegmentRoute(SEGMENTED)).toBe(false);
            expect(utils.isSingleSegmentRoute([])).toBe(true);
        });
    });
});
