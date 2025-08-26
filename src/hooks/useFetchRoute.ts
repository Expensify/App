import {deepEqual} from 'fast-equals';
import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getRoute} from '@libs/actions/Transaction';
import {getValidWaypoints, hasRoute as hasRouteTransactionUtils, isDistanceRequest, isManualDistanceRequest} from '@libs/TransactionUtils';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type TransactionState from '@src/types/utils/TransactionStateType';
import useNetwork from './useNetwork';
import usePrevious from './usePrevious';

export default function useFetchRoute(
    transaction: OnyxEntry<Transaction>,
    waypoints: WaypointCollection | undefined,
    action: IOUAction,
    transactionState: TransactionState = CONST.TRANSACTION.STATE.CURRENT,
) {
    const {isOffline} = useNetwork();
    const hasRouteError = !!transaction?.errorFields?.route;
    const hasRoute = hasRouteTransactionUtils(transaction);
    const isRouteAbsentWithoutErrors = !hasRoute && !hasRouteError;
    const isLoadingRoute = transaction?.comment?.isLoading ?? false;
    const validatedWaypoints = getValidWaypoints(waypoints);
    const previousValidatedWaypoints = usePrevious(validatedWaypoints);
    const haveValidatedWaypointsChanged = !deepEqual(previousValidatedWaypoints, validatedWaypoints);
    const isMapDistanceRequest = isDistanceRequest(transaction) && !isManualDistanceRequest(transaction);
    const shouldFetchRoute = isMapDistanceRequest && (isRouteAbsentWithoutErrors || haveValidatedWaypointsChanged) && !isLoadingRoute && Object.keys(validatedWaypoints).length > 1;

    useEffect(() => {
        if (isOffline || !shouldFetchRoute || !transaction?.transactionID) {
            return;
        }

        getRoute(transaction.transactionID, validatedWaypoints, transactionState);
    }, [shouldFetchRoute, transaction?.transactionID, validatedWaypoints, isOffline, action, transactionState]);

    return {shouldFetchRoute, validatedWaypoints};
}
