import type {Unit} from './Policy';

/** Address derived from coordinates of a GPS point */
type GPSPointAddress = {
    /**  Address string shown to the user */
    value: string;
    /** Is address value a human readable address or stringified coordinates */
    type: 'coordinates' | 'address';
};

/** A single GPS point with its coordinates and address */
type GPSPoint = {
    /** Latitude */
    lat: number;
    /** Longitude */
    long: number;
    /** Address derived from coordinates of the point */
    address?: GPSPointAddress;
};

/** User selected point to be used as the stop location for the recorded GPS trip */
type TrimmedGPSPoint = GPSPoint & {
    /** Index of the segment that the point belongs to */
    segmentIndex: number;
    /** Index of the preceding GPS point in the segment */
    precedingPointIndex: number;
};

/**
 * Stores data from GPS trip (GPS distance request)
 */
type GpsDraftDetails = {
    /** Captured GPS points in segments */
    gpsPoints: GPSPoint[][];

    /** Sum of geodesic distances between all consecutive points from gpsPoints in meters */
    distanceInMeters: number;

    /** Is GPS trip in progress */
    isTracking: boolean;

    /** reportID of the ongoing GPS trip */
    reportID: string;

    /** Distance unit of the ongoing GPS trip */
    unit: Unit;

    /**
     * Distance the user trimmed to in the Edit Stop screen.
     * When set, this is the distance shown to the user and used when creating the expense.
     * The original gpsPoints and distanceInMeters are kept intact.
     */
    modifiedDistance?: number;

    /**
     * The interpolated endpoint chosen in the Edit Stop screen.
     * When set, this replaces the last GPS point as the stop location for the recorded GPS trip.
     */
    trimmedEndPoint?: TrimmedGPSPoint;
};

export default GpsDraftDetails;
export type {GPSPoint, GPSPointAddress, TrimmedGPSPoint};
