import isEqual from 'lodash/isEqual';
import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import * as IOUUtils from '@libs/IOUUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as TransactionAction from '@userActions/Transaction';
import type {IOUAction} from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import useNetwork from './useNetwork';
import usePrevious from './usePrevious';

export default function useFetchRoute(transaction: OnyxEntry<Transaction>, waypoints: WaypointCollection | undefined, action: IOUAction) {
    const {isOffline} = useNetwork();
    const hasRouteError = !!transaction?.errorFields?.route;
    const hasRoute = TransactionUtils.hasRoute(transaction);
    const isRouteAbsentWithoutErrors = !hasRoute && !hasRouteError;
    const isLoadingRoute = transaction?.comment?.isLoading ?? false;
    const validatedWaypoints = TransactionUtils.getValidWaypoints(waypoints);
    const previousValidatedWaypoints = usePrevious(validatedWaypoints);
    const haveValidatedWaypointsChanged = !isEqual(previousValidatedWaypoints, validatedWaypoints);
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const shouldFetchRoute = isDistanceRequest && (isRouteAbsentWithoutErrors || haveValidatedWaypointsChanged) && !isLoadingRoute && Object.keys(validatedWaypoints).length > 1;

    useEffect(() => {
        if (isOffline || !shouldFetchRoute || !transaction?.transactionID) {
            return;
        }

        TransactionAction.getRoute(transaction.transactionID, validatedWaypoints, IOUUtils.shouldUseTransactionDraft(action));
    }, [shouldFetchRoute, transaction?.transactionID, validatedWaypoints, isOffline, action]);

    return {shouldFetchRoute, validatedWaypoints};
}
