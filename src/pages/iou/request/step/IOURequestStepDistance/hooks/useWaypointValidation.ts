import {isZeroCoordinatesWaypoint} from '@libs/TransactionUtils';

import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';

import isEmpty from 'lodash/isEmpty';

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

function getWaypointValidationErrors(waypoints: WaypointCollection | undefined, validatedWaypoints: WaypointCollection): UseWaypointValidationResult {
    const nonEmptyWaypointsCount = Object.keys(waypoints ?? {}).filter((key) => !isWaypointEmpty(waypoints?.[key])).length;
    const isWaypointsNullIslandError = Object.values(waypoints ?? {}).some(isZeroCoordinatesWaypoint);
    const validatedCount = Object.keys(validatedWaypoints).length;
    const duplicateWaypointsError = !isWaypointsNullIslandError && nonEmptyWaypointsCount >= 2 && validatedCount !== nonEmptyWaypointsCount;
    const atLeastTwoDifferentWaypointsError = isWaypointsNullIslandError || validatedCount < 2;

    return {nonEmptyWaypointsCount, isWaypointsNullIslandError, duplicateWaypointsError, atLeastTwoDifferentWaypointsError};
}

function useWaypointValidation({waypoints, validatedWaypoints}: UseWaypointValidationParams): UseWaypointValidationResult {
    return getWaypointValidationErrors(waypoints, validatedWaypoints);
}

export {getWaypointValidationErrors, isWaypointEmpty};
export default useWaypointValidation;
