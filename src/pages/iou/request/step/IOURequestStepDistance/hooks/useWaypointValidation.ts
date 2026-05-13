import isEmpty from 'lodash/isEmpty';
import {isWaypointNullIsland} from '@libs/TransactionUtils';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';

const isWaypointEmpty = (waypoint?: Waypoint): boolean => {
    if (!waypoint) {
        return true;
    }
    const {keyForList, ...waypointWithoutKey} = waypoint;
    return isEmpty(waypointWithoutKey);
};

type UseWaypointValidationParams = {
    /** All waypoints in the editor, including any optimistic ones the user is dragging. */
    waypoints: WaypointCollection;

    /** Waypoints that have been geocoded successfully — output of `useFetchRoute`. */
    validatedWaypoints: WaypointCollection;
};

type UseWaypointValidationResult = {
    /** Count of waypoints that have at least one filled-in field beyond `keyForList`. */
    nonEmptyWaypointsCount: number;

    /** True when at least one waypoint has coordinates (0, 0). */
    isWaypointsNullIslandError: boolean;

    /** True when two or more non-empty waypoints geocoded to the same location. */
    duplicateWaypointsError: boolean;

    /** True when fewer than two distinct waypoints have been validated. */
    atLeastTwoDifferentWaypointsError: boolean;
};

function useWaypointValidation({waypoints, validatedWaypoints}: UseWaypointValidationParams): UseWaypointValidationResult {
    const nonEmptyWaypointsCount = Object.keys(waypoints).filter((key) => !isWaypointEmpty(waypoints[key])).length;
    const isWaypointsNullIslandError = Object.values(waypoints).some(isWaypointNullIsland);
    const duplicateWaypointsError = nonEmptyWaypointsCount >= 2 && Object.keys(validatedWaypoints).length !== nonEmptyWaypointsCount;
    const atLeastTwoDifferentWaypointsError = Object.keys(validatedWaypoints).length < 2;

    return {nonEmptyWaypointsCount, isWaypointsNullIslandError, duplicateWaypointsError, atLeastTwoDifferentWaypointsError};
}

export {isWaypointEmpty};
export default useWaypointValidation;
