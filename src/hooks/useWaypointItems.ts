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
    const numberOfWaypoint = Object.keys(waypoints).length;
    const waypointItems: string[] = [];
    const waypointsByKeyForList: Record<string, {key: string; waypoint: Waypoint}> = {};

    for (let i = 0; i < numberOfWaypoint; i++) {
        const key = `waypoint${i}`;
        const waypoint = waypoints[key];

        const keyForList = waypoint?.keyForList ?? '';

        waypointItems.push(keyForList);
        waypointsByKeyForList[keyForList] = {key, waypoint};
    }

    const getWaypointKey = (keyForList: string) => waypointsByKeyForList[keyForList]?.key;
    const getWaypoint = (keyForList: string) => waypointsByKeyForList[keyForList]?.waypoint;
    const extractKey = (keyForList: string) => (keyForList ?? getWaypoint(keyForList)?.address ?? '') + getWaypointKey(keyForList);

    return {waypointItems, getWaypoint, getWaypointKey, extractKey};
}

export default useWaypointItems;
export type {UseWaypointItemsParams};
