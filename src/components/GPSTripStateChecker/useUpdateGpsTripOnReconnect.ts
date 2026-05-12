import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import useNetwork from '@hooks/useNetwork';
import {updateGpsPoints} from '@libs/actions/GPSDraftDetails';
import {addressFromGpsPoint, getGpsPoints} from '@libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GPSPoint} from '@src/types/onyx/GpsDraftDetails';

function useUpdateGpsTripOnReconnect({gpsPoints}: {gpsPoints: GPSPoint[][]}) {
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
    };

    // This is intentional to use async/await pattern for better readability
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useNetwork({onReconnect: updateAddressesToHumanReadable});
}

export default useUpdateGpsTripOnReconnect;
