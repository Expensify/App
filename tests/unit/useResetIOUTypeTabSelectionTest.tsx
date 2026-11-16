/** Covers valid tab names through reset and the actual odometer hydrator. */
import {act, renderHook} from '@testing-library/react-native';

import type * as UseDefaultParticipantsModule from '@hooks/useDefaultParticipants';
import type * as UseOnyxModule from '@hooks/useOnyx';
import useResetIOUType from '@hooks/useResetIOUType';

import {initMoneyRequest} from '@userActions/IOU/MoneyRequest';
import {hydrateOdometerDraftIntoTransaction} from '@userActions/OdometerTransactionUtils';
import {setTransactionReport} from '@userActions/Transaction';

import CONST from '@src/CONST';
import mockOnyxKeys from '@src/ONYXKEYS';
import type {OdometerDraft, Transaction} from '@src/types/onyx';

import type * as NativeModule from '@react-navigation/native';

import {Keyboard} from 'react-native';

import createMock from '../utils/createMock';

type ResetIOUProps = Parameters<typeof useResetIOUType>[0];
const mockParticipants: ReturnType<typeof UseDefaultParticipantsModule.default>['participants'] = [{accountID: 2, selected: true}];
const mockOdometerDraft = createMock<OdometerDraft>({});

jest.mock('@hooks/useOnyx', () => (key: Parameters<typeof UseOnyxModule.default>[0]) => {
    if (key === mockOnyxKeys.ODOMETER_DRAFT) {
        return [mockOdometerDraft];
    }
    return [undefined];
});
jest.mock('@hooks/useDefaultParticipants', () => () => ({participants: mockParticipants}));
jest.mock('@hooks/usePersonalPolicy', () => () => ({id: 'personal'}));
jest.mock('@react-navigation/native', () => ({...jest.requireActual<typeof NativeModule>('@react-navigation/native'), useFocusEffect: jest.fn<void, []>()}));
jest.mock('@libs/IOUUtils', () => ({resolveEarlyReportID: jest.fn(() => 'early-report')}));
jest.mock('@libs/TransactionUtils', () => ({getIsFromGlobalCreate: () => true}));
jest.mock('@userActions/IOU/MoneyRequest', () => ({initMoneyRequest: jest.fn<ReturnType<typeof initMoneyRequest>, Parameters<typeof initMoneyRequest>>()}));
jest.mock('@userActions/Transaction', () => ({setTransactionReport: jest.fn<ReturnType<typeof setTransactionReport>, Parameters<typeof setTransactionReport>>()}));
jest.mock('@userActions/OdometerTransactionUtils', () => ({
    hydrateOdometerDraftIntoTransaction: jest.fn<ReturnType<typeof hydrateOdometerDraftIntoTransaction>, Parameters<typeof hydrateOdometerDraftIntoTransaction>>(),
    isOdometerDraftPendingHydration: () => true,
}));

function renderTabReset(overrides: Partial<ResetIOUProps> = {}) {
    const transaction = createMock<Transaction>({transactionID: 'transaction', reportID: 'old-report', iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL});
    return renderHook(() => useResetIOUType({reportID: '1', report: undefined, transaction, transactionRequestType: CONST.IOU.REQUEST_TYPE.MANUAL, ...overrides}));
}

describe('useResetIOUType tab selection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
    });
    afterEach(() => jest.restoreAllMocks());

    it.each([CONST.IOU.REQUEST_TYPE.SCAN, CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER])('preserves initialization, report and hydration effects for %s', (tab) => {
        // Given a manual draft and global-create participants that resolve a destination report.
        const {result} = renderTabReset();

        // When a valid changed tab reaches the actual callback.
        act(() => result.current(tab));

        // Then the changed tab resets the draft, while only odometer names hydrate its fields.
        expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
        expect(initMoneyRequest).toHaveBeenCalledWith(
            expect.objectContaining({newIouRequestType: tab, currentIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL, defaultParticipants: mockParticipants, reportID: '1'}),
        );
        expect(setTransactionReport).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, {reportID: 'early-report'}, true);
        const earlierCallOrder1 = jest.mocked(Keyboard.dismiss).mock.invocationCallOrder.at(0);
        const laterCallOrder1 = jest.mocked(initMoneyRequest).mock.invocationCallOrder.at(0);
        if (earlierCallOrder1 === undefined || laterCallOrder1 === undefined) {
            throw new Error('Expected both invocation order values');
        }
        expect(earlierCallOrder1).toBeLessThan(laterCallOrder1);
        const earlierCallOrder2 = jest.mocked(initMoneyRequest).mock.invocationCallOrder.at(0);
        const laterCallOrder2 = jest.mocked(setTransactionReport).mock.invocationCallOrder.at(0);
        if (earlierCallOrder2 === undefined || laterCallOrder2 === undefined) {
            throw new Error('Expected both invocation order values');
        }
        expect(earlierCallOrder2).toBeLessThan(laterCallOrder2);
        if (tab === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER) {
            expect(hydrateOdometerDraftIntoTransaction).toHaveBeenCalledWith('transaction', mockOdometerDraft, undefined);
            const earlierCallOrder3 = jest.mocked(setTransactionReport).mock.invocationCallOrder.at(0);
            const laterCallOrder3 = jest.mocked(hydrateOdometerDraftIntoTransaction).mock.invocationCallOrder.at(0);
            if (earlierCallOrder3 === undefined || laterCallOrder3 === undefined) {
                throw new Error('Expected both invocation order values');
            }
            expect(earlierCallOrder3).toBeLessThan(laterCallOrder3);
        } else {
            expect(hydrateOdometerDraftIntoTransaction).not.toHaveBeenCalled();
        }
    });

    it('does not reset an unchanged request type', () => {
        // Given the draft already uses the selected request type.
        const valid = renderTabReset();

        // When the callback receives the current request type.
        act(() => valid.result.current(CONST.IOU.REQUEST_TYPE.MANUAL));

        // Then equality precedes keyboard, initialization, destination and hydration effects.
        expect(Keyboard.dismiss).not.toHaveBeenCalled();
        expect(initMoneyRequest).not.toHaveBeenCalled();
        expect(setTransactionReport).not.toHaveBeenCalled();
        expect(hydrateOdometerDraftIntoTransaction).not.toHaveBeenCalled();
    });

    it('retains the per-diem keyboard exception without skipping initialization', () => {
        // Given the page opts into keeping the keyboard behavior for per-diem selection.
        const {result} = renderTabReset({skipKeyboardDismissForPerDiem: true});

        // When the selected tab becomes per diem.
        act(() => result.current(CONST.IOU.REQUEST_TYPE.PER_DIEM));

        // Then only keyboard dismissal is excluded, with the reset still observable.
        expect(Keyboard.dismiss).not.toHaveBeenCalled();
        expect(initMoneyRequest).toHaveBeenCalledWith(expect.objectContaining({newIouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM}));
        expect(setTransactionReport).toHaveBeenCalledTimes(1);
        expect(hydrateOdometerDraftIntoTransaction).not.toHaveBeenCalled();
    });
});
