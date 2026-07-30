import useNetwork from '@hooks/useNetwork';

import {updateGpsPoints, updateTrimmedEndPoint} from '@libs/actions/GPSDraftDetails';
import {addressFromGpsPoint, getGpsPoints} from '@libs/GPSDraftDetailsUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {GPSPoint, TrimmedGPSPoint} from '@src/types/onyx/GpsDraftDetails';

import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

function useUpdateGpsTripOnReconnect({gpsPoints}: {gpsPoints: GPSPoint[][]}) {
    // The trimmed end point is chosen in the Edit Stop screen. When trimmed while offline, its address is stored as
    // stringified coordinates, so on reconnect we fetch the human readable address to replace it.
    const updateTrimmedEndPointAddress = async (trimmedEndPoint: TrimmedGPSPoint | undefined) => {
        // If the address is already human readable, we don't need to update it
        if (!trimmedEndPoint || trimmedEndPoint.address?.type === 'address') {
            return;
        }

        const address = await addressFromGpsPoint(trimmedEndPoint);
        if (address == null) {
            return;
        }

        updateTrimmedEndPoint({...trimmedEndPoint, address: {value: address, type: 'address'}});
    };

    const updateAddressesToHumanReadable = async () => {
        const waypointUpdates: Array<Promise<{point: GPSPoint; segmentIndex: number; type: 'start' | 'end'}>> = [];

        for (const [segmentIndex, tripSegment] of gpsPoints.entries()) {
            for (const [pointIndex, point] of tripSegment.entries()) {
                // If the address is not a coordinates (already human readable), we don't need to update it
                if (point.address?.type === 'address') {
                    continue;
                }

                if (pointIndex === 0) {
                    waypointUpdates.push(
                        addressFromGpsPoint(point).then((address) => ({
                            point: {...point, address: address ? {value: address, type: 'address'} : point.address},
                            segmentIndex,
                            type: 'start',
                        })),
                    );
                } else if (pointIndex === tripSegment.length - 1) {
                    waypointUpdates.push(
                        addressFromGpsPoint(point).then((address) => ({
                            point: {...point, address: address ? {value: address, type: 'address'} : point.address},
                            segmentIndex,
                            type: 'end',
                        })),
                    );
                }
            }
        }

        const waypointAddresses = (await Promise.all(waypointUpdates)).filter((waypoints) => !!waypoints.point.address);

        // To avoid race conditions, we need to get the latest gpsDraftDetails, because reverse geocoding may even take a few seconds
        const gpsDraftDetailsPromiseResult = await OnyxUtils.get(ONYXKEYS.GPS_DRAFT_DETAILS).catch(() => undefined);
        const latestGpsDraftDetails = gpsDraftDetailsPromiseResult;

        const latestGpsPoints = getGpsPoints(latestGpsDraftDetails) ?? gpsPoints;
        const newGpsPoints = [...latestGpsPoints];

        for (const {point, segmentIndex, type} of waypointAddresses) {
            const segment = newGpsPoints.at(segmentIndex);
            if (!segment) {
                continue;
            }

            if (type === 'start') {
                const newSegment = [point, ...segment.slice(1)];
                newGpsPoints.splice(segmentIndex, 1, newSegment);
            } else if (type === 'end') {
                const newSegment = [...segment.slice(0, -1), point];
                newGpsPoints.splice(segmentIndex, 1, newSegment);
            }
        }

        updateGpsPoints(newGpsPoints);

        await updateTrimmedEndPointAddress(latestGpsDraftDetails?.trimmedEndPoint);
    };

    // This is intentional to use async/await pattern for better readability
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useNetwork({onReconnect: updateAddressesToHumanReadable});
}

export default useUpdateGpsTripOnReconnect;
