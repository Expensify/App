import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {setEndAddress, setStartAddress} from '@libs/actions/GPSDraftDetails';
import {addressFromGpsPoint} from '@libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GpsDraftDetails} from '@src/types/onyx';

function useUpdateGpsTripOnReconnect() {
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});

    const updateAddressToHumanReadable = async (gpsPoint: GpsDraftDetails['gpsPoints'][number] | undefined, setAddress: typeof setStartAddress) => {
        if (!gpsPoint) {
            return;
        }

        const address = await addressFromGpsPoint(gpsPoint);

        if (address !== null) {
            setAddress({value: address, type: 'address'});
        }
    };

    const updateAddressesToHumanReadable = () => {
        if (!gpsDraftDetails) {
            return;
        }

        const {gpsPoints, startAddress, endAddress} = gpsDraftDetails;

        if (startAddress.type === 'coordinates') {
            updateAddressToHumanReadable(gpsPoints.at(0), setStartAddress);
        }

        if (endAddress.type === 'coordinates') {
            updateAddressToHumanReadable(gpsPoints.at(-1), setEndAddress);
        }
    };

    // This is intentional to use async/await pattern for better readability
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useNetwork({onReconnect: updateAddressesToHumanReadable});
}

export default useUpdateGpsTripOnReconnect;
