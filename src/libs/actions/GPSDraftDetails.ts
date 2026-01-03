import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GpsDraftDetails} from '@src/types/onyx';

function resetGPSDraftDetails() {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, null);
}

function setStartAddress(startAddress: GpsDraftDetails['startAddress']) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        startAddress,
    });
}

function setEndAddress(endAddress: GpsDraftDetails['endAddress']) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        endAddress,
    });
}

function initGpsDraft() {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: [],
        isTracking: true,
        distanceInMeters: 0,
        startAddress: {value: '', type: 'coordinates'},
        endAddress: {value: '', type: 'coordinates'},
    });
}

function setIsTracking(isTracking: boolean) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        isTracking,
    });
}

/**
 * This implementation is for testing purposes only to display the correct state of the GPS screen
 * as if user has tracked location for some time. It will be changed in a follow-up PR to proper
 * implementation
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function addGpsPoints(gpsPoints: GpsDraftDetails['gpsPoints']) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: [{lat: 123.234, long: 20.23534}],
    });
}

export {resetGPSDraftDetails, initGpsDraft, setStartAddress, setEndAddress, addGpsPoints, setIsTracking};
