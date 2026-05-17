import {renderHook} from '@testing-library/react-native';
import useDistanceRequestData from '@pages/iou/request/step/IOURequestStepDistance/hooks/useDistanceRequestData';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

const mockSetMoneyRequestAmount = jest.fn();
const mockSetSplitShares = jest.fn();

jest.mock('@libs/actions/IOU', () => ({
    setMoneyRequestAmount: (...args: unknown[]) => {
        mockSetMoneyRequestAmount(...args);
    },
}));

jest.mock('@libs/actions/IOU/Split', () => ({
    setSplitShares: (...args: unknown[]) => {
        mockSetSplitShares(...args);
    },
}));

jest.mock('@libs/DistanceRequestUtils', () => ({
    __esModule: true,
    default: {
        getMileageRates: () => ({rate1: {currency: 'USD', rate: 60, unit: 'mi'}}),
        getDefaultMileageRate: () => ({currency: 'USD', rate: 60, unit: 'mi'}),
        getRateForP2P: () => ({currency: 'USD', rate: 100, unit: 'mi'}),
        getDistanceRequestAmount: (distance: number, _unit: string, rate: number) => distance * rate,
    },
}));

jest.mock('@libs/TransactionUtils', () => ({
    getDistanceInMeters: () => 5,
    isCustomUnitRateIDForP2P: () => false,
}));

type Params = Parameters<typeof useDistanceRequestData>[0];

const baseParams: Params = {
    policy: {outputCurrency: 'USD'} as unknown as OnyxTypes.Policy,
    personalPolicy: {outputCurrency: 'USD'},
    transaction: {transactionID: 'txn1'} as unknown as OnyxTypes.Transaction,
    customUnitRateID: 'rate1',
    transactionID: 'txn1',
    isSplitRequest: false,
};

const personalParticipant: Participant = {accountID: 1, isPolicyExpenseChat: false};
const otherParticipant: Participant = {accountID: 2, isPolicyExpenseChat: false};
const policyParticipant: Participant = {accountID: 3, isPolicyExpenseChat: true};

describe('useDistanceRequestData', () => {
    beforeEach(() => {
        mockSetMoneyRequestAmount.mockClear();
        mockSetSplitShares.mockClear();
    });

    it('primes setMoneyRequestAmount with the policy mileage rate × distance', () => {
        const {result} = renderHook(() => useDistanceRequestData(baseParams));
        result.current([personalParticipant]);

        // distance(5) × rate(60) = 300
        expect(mockSetMoneyRequestAmount).toHaveBeenCalledWith('txn1', 300, 'USD');
    });

    it('does not call setSplitShares when not a split request', () => {
        const {result} = renderHook(() => useDistanceRequestData(baseParams));
        result.current([personalParticipant, otherParticipant]);

        expect(mockSetSplitShares).not.toHaveBeenCalled();
    });

    it('calls setSplitShares for split requests against non-policy chats', () => {
        const {result} = renderHook(() => useDistanceRequestData({...baseParams, isSplitRequest: true}));
        result.current([personalParticipant, otherParticipant]);

        expect(mockSetSplitShares).toHaveBeenCalledTimes(1);
        expect(mockSetSplitShares).toHaveBeenCalledWith(baseParams.transaction, 300, 'USD', [1, 2]);
    });

    it('skips setSplitShares for split requests against a policy expense chat', () => {
        const {result} = renderHook(() => useDistanceRequestData({...baseParams, isSplitRequest: true}));
        result.current([personalParticipant, policyParticipant]);

        expect(mockSetSplitShares).not.toHaveBeenCalled();
    });
});
