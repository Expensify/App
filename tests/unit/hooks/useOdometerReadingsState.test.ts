import {act, renderHook} from '@testing-library/react-native';
import useOdometerReadingsState from '@pages/iou/request/step/IOURequestStepDistance/hooks/useOdometerReadingsState';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const mockIsOdometerDraftPendingHydration = jest.fn(() => false);

jest.mock('@libs/actions/OdometerTransactionUtils', () => ({
    isOdometerDraftPendingHydration: (...args: unknown[]) => mockIsOdometerDraftPendingHydration(...(args as Parameters<typeof mockIsOdometerDraftPendingHydration>)),
}));

type Params = Parameters<typeof useOdometerReadingsState>[0];

const buildOdometerTransaction = (overrides: Partial<OnyxTypes.Transaction['comment']> = {}): OnyxTypes.Transaction =>
    ({
        transactionID: 't1',
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
        comment: {
            odometerStart: 100,
            odometerEnd: 250,
            ...overrides,
        },
    }) as unknown as OnyxTypes.Transaction;

const baseParams: Params = {
    currentTransaction: buildOdometerTransaction(),
    isEditing: false,
    selectedTab: CONST.TAB_REQUEST.DISTANCE_ODOMETER,
    isLoadingSelectedTab: false,
    hasVerifiedBlobs: true,
    odometerDraft: undefined,
};

describe('useOdometerReadingsState', () => {
    beforeEach(() => {
        mockIsOdometerDraftPendingHydration.mockReturnValue(false);
    });

    it('starts with empty form state, then hydrates startReading/endReading from the transaction', () => {
        const {result} = renderHook(() => useOdometerReadingsState(baseParams));

        // The sync-from-transaction effect runs synchronously after mount.
        expect(result.current.startReading).toBe('100');
        expect(result.current.endReading).toBe('250');
        expect(result.current.formError).toBe('');
        expect(result.current.startReadingRef.current).toBe('100');
        expect(result.current.endReadingRef.current).toBe('250');
    });

    it('captures initial baseline refs once blobs are verified and no draft is pending', () => {
        const {result} = renderHook(() => useOdometerReadingsState(baseParams));

        expect(result.current.hasInitializedRefs.current).toBe(true);
        expect(result.current.initialStartReadingRef.current).toBe('100');
        expect(result.current.initialEndReadingRef.current).toBe('250');
    });

    it('does not snapshot the baseline while blobs are still being verified', () => {
        const {result} = renderHook(() => useOdometerReadingsState({...baseParams, hasVerifiedBlobs: false}));

        expect(result.current.hasInitializedRefs.current).toBe(false);
        expect(result.current.initialStartReadingRef.current).toBe('');
    });

    it('does not snapshot the baseline while a save-for-later draft is still pending hydration', () => {
        mockIsOdometerDraftPendingHydration.mockReturnValue(true);
        const {result} = renderHook(() =>
            useOdometerReadingsState({
                ...baseParams,
                odometerDraft: {odometerStartReading: 999} as unknown as OnyxTypes.OdometerDraft,
            }),
        );

        expect(result.current.hasInitializedRefs.current).toBe(false);
    });

    it('skips initialization on a non-odometer transaction unless we are editing', () => {
        const transaction = {
            transactionID: 't1',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
            comment: {odometerStart: 100, odometerEnd: 250},
        } as unknown as OnyxTypes.Transaction;

        const {result} = renderHook(() => useOdometerReadingsState({...baseParams, currentTransaction: transaction, isEditing: false}));

        expect(result.current.hasInitializedRefs.current).toBe(false);
    });

    it('resets local state and the initial-refs flag via resetOdometerLocalState', () => {
        const {result} = renderHook(() => useOdometerReadingsState(baseParams));

        expect(result.current.hasInitializedRefs.current).toBe(true);

        act(() => {
            result.current.resetOdometerLocalState();
        });

        expect(result.current.startReading).toBe('');
        expect(result.current.endReading).toBe('');
        expect(result.current.startReadingRef.current).toBe('');
        expect(result.current.endReadingRef.current).toBe('');
        expect(result.current.initialStartReadingRef.current).toBe('');
        expect(result.current.initialEndReadingRef.current).toBe('');
        expect(result.current.hasInitializedRefs.current).toBe(false);
    });

    it('clears form state and bumps inputKey when user switches away from the odometer tab', () => {
        const {result, rerender} = renderHook((params: Params) => useOdometerReadingsState(params), {initialProps: baseParams});

        const initialKey = result.current.inputKey;
        expect(result.current.startReading).toBe('100');

        rerender({...baseParams, selectedTab: CONST.TAB_REQUEST.DISTANCE});

        expect(result.current.startReading).toBe('');
        expect(result.current.endReading).toBe('');
        expect(result.current.formError).toBe('');
        expect(result.current.inputKey).toBe(initialKey + 1);
    });

    it('does not run the tab-reset effect while the selected-tab Onyx key is still loading', () => {
        const initialProps: Params = {...baseParams, isLoadingSelectedTab: true, selectedTab: undefined};
        const {result, rerender} = renderHook((params: Params) => useOdometerReadingsState(params), {initialProps});

        const initialKey = result.current.inputKey;
        rerender({...baseParams, isLoadingSelectedTab: true, selectedTab: CONST.TAB_REQUEST.DISTANCE});

        expect(result.current.inputKey).toBe(initialKey);
    });
});
