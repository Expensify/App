import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

/** Model of recent endpoint used in distance expense */
type RecentWaypoint = {
    /** The name associated with the address of the waypoint */
    name?: string;

    /** The full address of the waypoint */
    address?: string;

    /** The lattitude of the waypoint */
    lat?: number;

    /** The longitude of the waypoint */
    lng?: number;

    /** A unique key for waypoint is required for correct draggable list rendering */
    keyForList?: string;

    pendingAction?: OnyxCommon.PendingAction | null;
};

export default RecentWaypoint;
