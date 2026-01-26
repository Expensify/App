import {useCallback, useMemo} from 'react';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';

type UseWaypointItemsParams = {
    /** List of keyForList of WaypointCollection */
    waypointItems: string[];

    /** Retrieves a waypoint by its keyForList */
    getWaypoint: (keyForList: string) => Waypoint | undefined;

    /** Retrieves the waypoint key based on keyForList */
    getWaypointKey: (keyForList: string) => string | undefined;

    /** Function to extract key used for draggable list */
    extractKey: (keyForList: string) => string;
};

/**
 * Hook that generates waypoint items based on its `keyForList` for the draggable list,
 * and provides helper functions to retrieve a waypoint or its key.
 */
function useWaypointItems(waypoints: WaypointCollection): UseWaypointItemsParams {
    const {waypointItems, waypointByKeyForList} = useMemo(() => {
        const numberOfWaypoint = Object.keys(waypoints).length;
        const items: string[] = [];
        const waypointsByKey: Record<string, {key: string; waypoint: Waypoint}> = {};

        for (let i = 0; i < numberOfWaypoint; i++) {
            const key = `waypoint${i}`;
            const waypoint = waypoints[key];

            const keyForList = waypoint?.keyForList ?? Math.random().toString(36).substring(2, 8);
            items.push(keyForList);
            waypointsByKey[keyForList] = {key, waypoint};
        }

        return {waypointItems: items, waypointByKeyForList: waypointsByKey};
    }, [waypoints]);

    const getWaypointKey = useCallback((keyForList: string) => waypointByKeyForList[keyForList]?.key, [waypointByKeyForList]);
    const getWaypoint = useCallback((keyForList: string) => waypointByKeyForList[keyForList]?.waypoint, [waypointByKeyForList]);
    const extractKey = useCallback((keyForList: string) => (keyForList ?? getWaypoint(keyForList)?.address ?? '') + getWaypointKey(keyForList), [getWaypoint, getWaypointKey]);

    return {waypointItems, getWaypoint, getWaypointKey, extractKey};
}

export default useWaypointItems;
