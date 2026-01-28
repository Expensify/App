import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {setEndAddress, setStartAddress} from '@libs/actions/GPSDraftDetails';
import {addressFromGpsPoint} from '@libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GpsDraftDetails} from '@src/types/onyx';

function useUpdateGpsTripOnReconnect() {
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});

    const updateStartAddressToHumanReadable = async (gpsPoints: GpsDraftDetails['gpsPoints']) => {
        const firstPoint = gpsPoints.at(0);
        if (!firstPoint) {
            return;
        }

        const startAddress = await addressFromGpsPoint(firstPoint);

        if (startAddress !== null) {
            setStartAddress({value: startAddress, type: 'address'});
        }
    };

    const updateEndAddressToHumanReadable = async (gpsPoints: GpsDraftDetails['gpsPoints']) => {
        const lastPoint = gpsPoints.at(-1);
        if (!lastPoint) {
            return;
        }

        const endAddress = await addressFromGpsPoint(lastPoint);

        if (endAddress !== null) {
            setEndAddress({value: endAddress, type: 'address'});
        }
    };

    const updateAddressesToHumanReadable = () => {
        if (!gpsDraftDetails) {
            return;
        }

        const {gpsPoints, startAddress, endAddress} = gpsDraftDetails;

        if (startAddress.type === 'coordinates') {
            updateStartAddressToHumanReadable(gpsPoints);
        }

        if (endAddress.type === 'coordinates') {
            updateEndAddressToHumanReadable(gpsPoints);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useNetwork({onReconnect: updateAddressesToHumanReadable});
}

export default useUpdateGpsTripOnReconnect;
