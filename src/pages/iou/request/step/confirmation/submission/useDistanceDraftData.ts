import useOnyx from '@hooks/useOnyx';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

type UseDistanceDraftDataParams = {
    transaction: OnyxEntry<Transaction>;
    isGPSDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
};

function useDistanceDraftData({transaction, isGPSDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest}: UseDistanceDraftDataParams) {
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [odometerDraft] = useOnyx(ONYXKEYS.ODOMETER_DRAFT);

    const transactionDistance = isManualDistanceRequest || isOdometerDistanceRequest || isGPSDistanceRequest ? (transaction?.comment?.customUnit?.quantity ?? undefined) : undefined;
    const transactionDistanceUnit = transaction?.comment?.customUnit?.distanceUnit;
    const isModifiedGPSDistanceRequest = isGPSDistanceRequest && gpsDraftDetails?.modifiedDistance != null;
    const originalTransactionDistance =
        isModifiedGPSDistanceRequest && gpsDraftDetails.distanceInMeters && transactionDistanceUnit
            ? DistanceRequestUtils.convertDistanceUnit(gpsDraftDetails.distanceInMeters, transactionDistanceUnit)
            : transactionDistance;
    const modifiedTransactionDistance = isModifiedGPSDistanceRequest ? transactionDistance : undefined;

    return {
        gpsDraftDetails,
        recentWaypoints,
        odometerDraft,
        transactionDistance,
        isModifiedGPSDistanceRequest,
        originalTransactionDistance,
        modifiedTransactionDistance,
    };
}

export default useDistanceDraftData;
