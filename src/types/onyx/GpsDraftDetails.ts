/**
 * Stores data from GPS trip (GPS distance request)
 */
type GpsDraftDetails = {
    /** Captured GPS points */
    gpsPoints: Array<{
        /** Latitude */
        lat: number;
        /** Longitude */
        long: number;
    }>;

    /** Sum of geodesic distances between all consecutive points from gpsPoints in meters */
    distanceInMeters: number;

    /** Start address derived from coordinates of the first point from gpsPoints */
    startAddress: {
        /** Start address string shown to the user */
        value: string;
        /** Is start address value a human readable address or stringified coordinates */
        type: 'coordinates' | 'address';
    };

    /** End address derived from coordinates of the last point from gpsPoints */
    endAddress: {
        /** End address string shown to the user */
        value: string;
        /** Is end address value a human readable address or stringified coordinates */
        type: 'coordinates' | 'address';
    };

    /** Is GPS trip in progress */
    isTracking: boolean;
};

export default GpsDraftDetails;
