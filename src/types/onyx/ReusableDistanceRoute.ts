import type {WaypointCollection} from './Transaction';

/** Model of a reusable distance route returned by OpenReuseRoutePage */
type ReusableDistanceRoute = {
    /** Transaction ID of the expense the route was taken from */
    transactionID: string;

    /** Ordered waypoints of the route */
    waypoints: WaypointCollection;

    /** Distance in meters of the map route the source expense was created with, which selects the same route alternative when the waypoints are routed again */
    routeDistanceMeters?: number;

    /** URL of the map receipt image */
    receiptSource?: string;

    /** Creation time of the source expense, drives the Last used badge */
    inserted: string;
};

export default ReusableDistanceRoute;
