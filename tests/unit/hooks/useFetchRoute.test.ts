import {renderHook} from '@testing-library/react-native';

import useFetchRoute from '@hooks/useFetchRoute';

import {getRoute} from '@libs/actions/Transaction';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import createMock from '../../utils/createMock';

jest.mock('@hooks/useNetwork', () => () => ({
    isOffline: false,
}));

jest.mock('@libs/actions/Transaction', () => ({
    getRoute: jest.fn(),
}));

const mockWaypoints = {
    waypoint0: {address: '123 Main St', lat: 10, lng: 20},
    waypoint1: {address: '456 Oak St', lat: 30, lng: 40},
};

describe('useFetchRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call getRoute for a reused route when commuter exclusion preview is stale', () => {
        // Given a reused route transaction and a policy with HOME_AND_OFFICE commuter exclusions
        const policy = createMock<OnyxTypes.Policy>({
            id: 'policy1',
            commuterExclusions: {
                method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE,
            },
        });
        const transaction = createMock<OnyxTypes.Transaction>({
            transactionID: 'txn1',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            isReusedRoute: true,
            comment: {
                customUnit: {quantity: 100, routeDistanceMeters: 1000},
            },
            routes: null,
            commuterExclusionPreview: null,
        });

        // When useFetchRoute runs
        const {result} = renderHook(() => useFetchRoute(transaction, mockWaypoints, CONST.IOU.ACTION.CREATE, CONST.TRANSACTION.STATE.CURRENT, policy));

        // Then it should fetch the route for the policy to get the commuter exclusion result
        expect(result.current.shouldFetchRoute).toBe(true);
        expect(getRoute).toHaveBeenCalledWith('txn1', mockWaypoints, CONST.TRANSACTION.STATE.CURRENT, 'policy1');
    });

    it('should not call getRoute for a reused route when matching commuter exclusion preview is already present', () => {
        // Given a reused route transaction that already has the commuter exclusion preview for the policy
        const policy = createMock<OnyxTypes.Policy>({
            id: 'policy1',
            commuterExclusions: {
                method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE,
            },
        });
        const transaction = createMock<OnyxTypes.Transaction>({
            transactionID: 'txn1',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            isReusedRoute: true,
            comment: {
                customUnit: {quantity: 100, routeDistanceMeters: 1000},
            },
            routes: null,
            commuterExclusionPreview: {
                policyID: 'policy1',
                reimbursableDistanceInMeters: 800,
            },
        });

        // When useFetchRoute runs
        const {result} = renderHook(() => useFetchRoute(transaction, mockWaypoints, CONST.IOU.ACTION.CREATE, CONST.TRANSACTION.STATE.CURRENT, policy));

        // Then it should not fetch the route again
        expect(result.current.shouldFetchRoute).toBe(false);
        expect(getRoute).not.toHaveBeenCalled();
    });

    it('should not call getRoute for a reused route when the policy does not use commuter exclusions', () => {
        // Given a reused route transaction and a policy without commuter exclusions
        const policy = createMock<OnyxTypes.Policy>({
            id: 'policy1',
        });
        const transaction = createMock<OnyxTypes.Transaction>({
            transactionID: 'txn1',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            isReusedRoute: true,
            comment: {
                customUnit: {quantity: 100, routeDistanceMeters: 1000},
            },
            routes: null,
            commuterExclusionPreview: null,
        });

        // When useFetchRoute runs
        const {result} = renderHook(() => useFetchRoute(transaction, mockWaypoints, CONST.IOU.ACTION.CREATE, CONST.TRANSACTION.STATE.CURRENT, policy));

        // Then it should not fetch the route because the reused route already has its distance
        expect(result.current.shouldFetchRoute).toBe(false);
        expect(getRoute).not.toHaveBeenCalled();
    });
});
