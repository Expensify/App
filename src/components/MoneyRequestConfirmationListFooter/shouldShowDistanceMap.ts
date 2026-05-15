import type {OnyxEntry} from 'react-native-onyx';
import {isFetchingWaypointsFromServer} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ShouldShowDistanceMapParams = {
    transaction: OnyxEntry<Transaction>;
    isDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    isReadOnly: boolean;
};

function shouldShowDistanceMap({transaction, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest, iouType, isReadOnly}: ShouldShowDistanceMapParams): boolean {
    if (!isDistanceRequest || isManualDistanceRequest || isOdometerDistanceRequest) {
        return false;
    }
    const hasPendingWaypoints = transaction && isFetchingWaypointsFromServer(transaction);
    const hasErrors = !isEmptyObject(transaction?.errors) || !isEmptyObject(transaction?.errorFields?.route) || !isEmptyObject(transaction?.errorFields?.waypoints);
    return [hasErrors, hasPendingWaypoints, iouType !== CONST.IOU.TYPE.SPLIT, !isReadOnly].some(Boolean);
}

export default shouldShowDistanceMap;
