import type {WaypointCollection} from './Transaction';

/** Model of a reusable distance route returned by OpenReuseRoutePage */
type ReusableDistanceRoute = {
    /** Transaction ID of the expense the route was taken from */
    transactionID: string;

    /** Ordered waypoints of the route */
    waypoints: WaypointCollection;

    /** Distance of the route in the policy distance unit */
    distance: number;

    /** URL of the map receipt image */
    receiptSource?: string;

    /** Creation time of the source expense, drives the Last used badge */
    inserted: string;
};

export default ReusableDistanceRoute;
