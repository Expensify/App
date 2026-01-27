import {useState} from 'react';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type UseWaypointItemsParams = {
    /** List of keyForList of WaypointCollection */
    waypointItems: string[];

    /** Retrieves a waypoint by its keyForList */
    getWaypoint: (keyForList: string) => Waypoint | undefined;

    /** Retrieves the waypoint key based on keyForList */
    getWaypointKey: (keyForList: string) => string | undefined;

    /** Function to extract key used for draggable list */
    extractKey: (keyForList: string) => string;

    updateWaypointsOrder: (items: string[]) => void;
};

/**
 * Hook that generates waypoint items based on its `keyForList` for the draggable list,
 * and provides helper functions to retrieve a waypoint or its key.
 */

function useWaypointItems(waypoints: WaypointCollection): UseWaypointItemsParams {
    const [firstWaypointRandomID] = useState(() => Math.random().toString(36).substring(2, 8));
    const [secondWaypointRandomID] = useState(() => Math.random().toString(36).substring(2, 8));
    const orderOfWaypointItems = [] as string[];

    const numberOfWaypoint = Object.keys(waypoints).length;
    const waypointItems: string[] = [];
    const waypointByKeyForList: Record<string, {key: string; waypoint: Waypoint}> = {};

    for (let i = 0; i < numberOfWaypoint; i++) {
        const key = `waypoint${i}`;
        const waypoint = waypoints[key];

        const keyForList = waypoint?.keyForList ?? orderOfWaypointItems.at(i) ?? (i === 0 ? firstWaypointRandomID : secondWaypointRandomID);

        waypointItems.push(keyForList);
        waypointByKeyForList[keyForList] = {key, waypoint};
    }

    const getWaypointKey = (keyForList: string) => waypointByKeyForList[keyForList]?.key;
    const getWaypoint = (keyForList: string) => waypointByKeyForList[keyForList]?.waypoint;
    const extractKey = (keyForList: string) => (keyForList ?? getWaypoint(keyForList)?.address ?? '') + getWaypointKey(keyForList);
    const updateWaypointsOrder = (items: string[]) => {
        if (numberOfWaypoint !== 2 || Object.values(waypoints).every((w) => !isEmptyObject(w))) {
            return;
        }

        orderOfWaypointItems[0] = items.at(1) === firstWaypointRandomID ? secondWaypointRandomID : firstWaypointRandomID;
        orderOfWaypointItems[1] = orderOfWaypointItems.at(0) === firstWaypointRandomID ? secondWaypointRandomID : firstWaypointRandomID;
    };

    return {waypointItems, getWaypoint, getWaypointKey, extractKey, updateWaypointsOrder};
}

export default useWaypointItems;
