import {getRoute} from '@libs/actions/Transaction';
import {getValidWaypoints, hasRoute as hasRouteTransactionUtils, isDistanceTypeRequest, isMapDistanceRequest as isMapDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import type {Policy, Transaction} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type TransactionState from '@src/types/utils/TransactionStateType';

import type {OnyxEntry} from 'react-native-onyx';

import {deepEqual} from 'fast-equals';
import {useEffect} from 'react';

import useNetwork from './useNetwork';
import usePrevious from './usePrevious';

export default function useFetchRoute(
    transaction: OnyxEntry<Transaction>,
    waypoints: WaypointCollection | undefined,
    action: IOUAction,
    transactionState: TransactionState = CONST.TRANSACTION.STATE.CURRENT,
    policy?: OnyxEntry<Policy>,
) {
    const {isOffline} = useNetwork();
    const hasRouteError = !!transaction?.errorFields?.route;
    const hasRoute = hasRouteTransactionUtils(transaction);
    const isRouteAbsentWithoutErrors = !hasRoute && !hasRouteError;
    const isLoadingRoute = transaction?.comment?.isLoading ?? false;
    const validatedWaypoints = getValidWaypoints(waypoints);
    const previousValidatedWaypoints = usePrevious(validatedWaypoints);
    const haveValidatedWaypointsChanged = !deepEqual(previousValidatedWaypoints, validatedWaypoints);
    const isMapDistanceRequest = isMapDistanceRequestTransactionUtils(transaction) || isDistanceTypeRequest(transaction);

    // Only the backend can tell whether a trip is a commute under the home and office method, and it answers on the
    // route response, so a route we already hold can be missing that answer: it was fetched before a workspace was
    // picked, or the member has since switched workspace. Requiring a route (and no route error) keeps this to the
    // states where the response is known to land back on this transaction, so it cannot drive a fetch per render.
    const homeAndOfficeExclusionPolicyID = policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE ? policy.id : undefined;
    const isCommuterExclusionPreviewStale =
        !!homeAndOfficeExclusionPolicyID && hasRoute && !hasRouteError && transaction?.commuterExclusionPreview?.policyID !== homeAndOfficeExclusionPolicyID;
    const shouldFetchRoute =
        isMapDistanceRequest &&
        (isRouteAbsentWithoutErrors || haveValidatedWaypointsChanged || isCommuterExclusionPreviewStale) &&
        !isLoadingRoute &&
        Object.keys(validatedWaypoints).length > 1;

    useEffect(() => {
        if (isOffline || !shouldFetchRoute || !transaction?.transactionID) {
            return;
        }

        getRoute(transaction.transactionID, validatedWaypoints, transactionState, policy?.id);
    }, [shouldFetchRoute, transaction?.transactionID, validatedWaypoints, isOffline, action, transactionState, policy?.id]);

    return {shouldFetchRoute, validatedWaypoints};
}
