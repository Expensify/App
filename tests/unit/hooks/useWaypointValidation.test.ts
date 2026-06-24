import {renderHook} from '@testing-library/react-native';
import useWaypointValidation, {isWaypointEmpty} from '@pages/iou/request/step/IOURequestStepDistance/hooks/useWaypointValidation';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';

jest.mock('@libs/TransactionUtils', () => ({
    isWaypointNullIsland: (waypoint: Waypoint | undefined) => waypoint?.lat === 0 && waypoint?.lng === 0,
}));

const startWaypoint: Waypoint = {keyForList: 'start', address: '1 Main St', lat: 40.7128, lng: -74.006};
const stopWaypoint: Waypoint = {keyForList: 'stop', address: '500 Broadway', lat: 40.722, lng: -73.997};
const nullIslandWaypoint: Waypoint = {keyForList: 'null', address: 'Atlantic Ocean', lat: 0, lng: 0};
const emptyWaypoint: Waypoint = {keyForList: 'empty'};

describe('useWaypointValidation', () => {
    it('reports atLeastTwoDifferentWaypointsError when only the empty start/stop placeholders are present', () => {
        const waypoints: WaypointCollection = {waypoint0: emptyWaypoint, waypoint1: emptyWaypoint};
        const validatedWaypoints: WaypointCollection = {};
        const {result} = renderHook(() => useWaypointValidation({waypoints, validatedWaypoints}));

        expect(result.current.nonEmptyWaypointsCount).toBe(0);
        expect(result.current.atLeastTwoDifferentWaypointsError).toBe(true);
        expect(result.current.duplicateWaypointsError).toBe(false);
        expect(result.current.isWaypointsNullIslandError).toBe(false);
    });

    it('clears all error flags when two distinct waypoints validate successfully', () => {
        const waypoints: WaypointCollection = {waypoint0: startWaypoint, waypoint1: stopWaypoint};
        const validatedWaypoints: WaypointCollection = {waypoint0: startWaypoint, waypoint1: stopWaypoint};
        const {result} = renderHook(() => useWaypointValidation({waypoints, validatedWaypoints}));

        expect(result.current.nonEmptyWaypointsCount).toBe(2);
        expect(result.current.atLeastTwoDifferentWaypointsError).toBe(false);
        expect(result.current.duplicateWaypointsError).toBe(false);
        expect(result.current.isWaypointsNullIslandError).toBe(false);
    });

    it('reports duplicateWaypointsError when two non-empty waypoints geocode to the same location', () => {
        const waypoints: WaypointCollection = {waypoint0: startWaypoint, waypoint1: startWaypoint};
        // Geocoding deduped them down to a single validated entry.
        const validatedWaypoints: WaypointCollection = {waypoint0: startWaypoint};
        const {result} = renderHook(() => useWaypointValidation({waypoints, validatedWaypoints}));

        expect(result.current.nonEmptyWaypointsCount).toBe(2);
        expect(result.current.duplicateWaypointsError).toBe(true);
        expect(result.current.atLeastTwoDifferentWaypointsError).toBe(true);
    });

    it('reports isWaypointsNullIslandError when any waypoint sits at coordinates (0, 0)', () => {
        const waypoints: WaypointCollection = {waypoint0: startWaypoint, waypoint1: nullIslandWaypoint};
        const validatedWaypoints: WaypointCollection = {waypoint0: startWaypoint, waypoint1: nullIslandWaypoint};
        const {result} = renderHook(() => useWaypointValidation({waypoints, validatedWaypoints}));

        expect(result.current.isWaypointsNullIslandError).toBe(true);
    });
});

describe('isWaypointEmpty', () => {
    it('treats undefined as empty', () => {
        expect(isWaypointEmpty(undefined)).toBe(true);
    });

    it('treats a waypoint with only keyForList as empty', () => {
        expect(isWaypointEmpty({keyForList: 'foo'})).toBe(true);
    });

    it('treats a waypoint with an address as non-empty', () => {
        expect(isWaypointEmpty(startWaypoint)).toBe(false);
    });
});
