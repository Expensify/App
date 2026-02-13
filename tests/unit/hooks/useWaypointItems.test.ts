import {renderHook} from '@testing-library/react-native';
import useWaypointItems from '@hooks/useWaypointItems';
import type {UseWaypointItemsParams} from '@hooks/useWaypointItems';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';

function createFilledWaypoints(): WaypointCollection {
    return {
        waypoint0: {
            keyForList: 'Santa Fe Regional Airport (SAF)_1769560145784',
            name: 'Santa Fe Regional Airport (SAF)',
            address: 'Santa Fe Regional Airport (SAF), Aviation Drive, Santa Fe, NM, USA',
            lat: 35.6182563,
            lng: -106.0845315,
        },
        waypoint1: {
            keyForList: 'Santa Fe Place Mall_1769560178099',
            name: 'Santa Fe Place Mall',
            address: 'Santa Fe Place Mall, Road, Santa Fe, NM, USA',
            lat: 35.6360956,
            lng: -106.0146848,
        },
        waypoint2: {
            name: 'Santa Fe Plaza',
            address: 'Santa Fe Plaza, Lincoln Avenue, Santa Fe, NM, USA',
            lat: 35.6874369,
            lng: -105.9385238,
            keyForList: 'Santa Fe Plaza_1769560186037',
        },
    };
}

function checkAllElement(waypointList: Waypoint[], result: UseWaypointItemsParams) {
    expect(result.waypointItems).toEqual(waypointList.map((w) => w.keyForList ?? ''));
    expect(result.waypointItems.map((i: string) => result.getWaypoint(i))).toEqual(waypointList.map((w: Waypoint) => w));
    expect(result.waypointItems.map((i: string) => result.getWaypointKey(i))).toEqual(waypointList.map((_, index: number) => `waypoint${index}`));
    expect(result.waypointItems.map((i: string) => result.extractKey(i))).toEqual(waypointList.map((w: Waypoint, index: number) => `${w.keyForList ?? ''}waypoint${index}`));
}

describe('useWaypointItems', () => {
    it('should generate initial waypoint items and helper functions correctly', async () => {
        const waypoint0 = {keyForList: 'start_waypoint'};
        const waypoint1 = {keyForList: 'stop_waypoint'};
        const initialWaypoints = {waypoint0, waypoint1};

        const {result} = renderHook(() => useWaypointItems(initialWaypoints));
        checkAllElement([waypoint0, waypoint1], result.current);
    });

    it('should generate waypoint items and helper functions correctly when one waypoint is empty and the other is an initial waypoint', async () => {
        const waypoint0 = {keyForList: 'start_waypoint'};
        const waypoint1 = {};
        const waypoints = {waypoint0, waypoint1};

        const {result} = renderHook(() => useWaypointItems(waypoints));
        checkAllElement([waypoint0, waypoint1], result.current);
    });

    it('should generate waypoint items and helper functions correctly when one waypoint is empty and the other is filled', async () => {
        const filledWaypoints = createFilledWaypoints();
        const waypoint0 = {};
        const waypoint1 = filledWaypoints.waypoint2;
        const waypoints = {waypoint0, waypoint1};

        const {result} = renderHook(() => useWaypointItems(waypoints));
        checkAllElement([waypoint0, waypoint1], result.current);
    });

    it('should generate waypoint items and helper functions correctly for filled waypoints', async () => {
        const waypoints = createFilledWaypoints();
        const {result} = renderHook(() => useWaypointItems(waypoints));
        checkAllElement([waypoints.waypoint0, waypoints.waypoint1, waypoints.waypoint2], result.current);
    });
});
