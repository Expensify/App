import {renderHook} from '@testing-library/react-native';

import useGPSWaypointMarkers from '@pages/iou/request/step/IOURequestStepDistanceGPS/useGPSWaypointMarkers';

import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';
import type {GPSPoint} from '@src/types/onyx/GpsDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';

const point = (lat: number, long: number): GPSPoint => ({lat, long});

const makeDraft = (gpsPoints: GPSPoint[][], isTracking: boolean): GpsDraftDetails => ({
    gpsPoints,
    distanceInMeters: 100,
    isTracking,
    reportID: '1',
    unit: 'mi' as Unit,
});

const markerTypesFor = (gpsPoints: GPSPoint[][], isTracking: boolean): Array<string | undefined> => {
    const {result} = renderHook(() => useGPSWaypointMarkers({gpsDraftDetails: makeDraft(gpsPoints, isTracking)}));
    return result.current.map(({markerType}) => markerType);
};

describe('useGPSWaypointMarkers', () => {
    it('marks the first and last point of a stopped trip', () => {
        expect(markerTypesFor([[point(0, 0), point(0, 1)]], false)).toEqual(['START_WAYPOINT', 'STOP_WAYPOINT']);
    });

    it('hides the end marker while the trip is still recording', () => {
        expect(markerTypesFor([[point(0, 0), point(0, 1)]], true)).toEqual(['START_WAYPOINT']);
    });

    it('marks the stop of a stopped trip whose first segment holds a single point', () => {
        expect(markerTypesFor([[point(0, 0)], [point(1, 0), point(1, 1)]], false)).toEqual(['START_WAYPOINT', 'WAYPOINT', 'STOP_WAYPOINT']);
    });

    it('hides the end marker of a resumed trip that is still recording', () => {
        expect(markerTypesFor([[point(0, 0)], [point(1, 0), point(1, 1)]], true)).toEqual(['START_WAYPOINT', 'WAYPOINT']);
    });

    it('keeps the first point of a resumed segment visible while it is the only one recorded', () => {
        expect(markerTypesFor([[point(0, 0), point(0, 1)], [point(1, 0)]], true)).toEqual(['START_WAYPOINT', 'WAYPOINT', 'WAYPOINT']);
    });

    it('hides the end marker when a resumed segment has not recorded anything yet', () => {
        expect(markerTypesFor([[point(0, 0), point(0, 1)], []], true)).toEqual(['START_WAYPOINT']);
    });

    it('shows only a start marker for a trip that recorded a single point', () => {
        expect(markerTypesFor([[point(0, 0)]], false)).toEqual(['START_WAYPOINT']);
    });
});
