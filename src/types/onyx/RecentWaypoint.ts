type RecentWaypoint = {
    /** The name associated with the address of the waypoint */
    name?: string;

    /** The full address of the waypoint */
    address?: string;

    /** The lattitude of the waypoint */
    lat?: number;

    /** The longitude of the waypoint */
    lng?: number;

    /** Key used internally by React */
    keyForList?: string;
};

export default RecentWaypoint;
