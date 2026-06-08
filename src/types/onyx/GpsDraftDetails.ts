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
};

export default GpsDraftDetails;
export type {GPSPoint, GPSPointAddress};
