import {act, renderHook} from '@testing-library/react-native';
import useOdometerReadingsState from '@pages/iou/request/step/IOURequestStepDistance/hooks/useOdometerReadingsState';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import createRandomTransaction from '../../utils/collections/transaction';

const mockIsOdometerDraftPendingHydration = jest.fn(() => false);

jest.mock('@libs/actions/OdometerTransactionUtils', () => ({
    isOdometerDraftPendingHydration: () => mockIsOdometerDraftPendingHydration(),
}));

type Params = Parameters<typeof useOdometerReadingsState>[0];

const buildOdometerTransaction = (
    commentOverrides: Partial<OnyxTypes.Transaction['comment']> = {},
    iouRequestType: OnyxTypes.Transaction['iouRequestType'] = CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
): OnyxTypes.Transaction => {
    const transaction = createRandomTransaction(1);
    return {
        ...transaction,
        transactionID: 't1',
        iouRequestType,
        comment: {
            ...transaction.comment,
            odometerStart: 100,
            odometerEnd: 250,
            ...commentOverrides,
        },
    };
};

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

        // The sync-from-transaction effect runs synchronously after mount
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
                odometerDraft: {odometerStartReading: 999},
            }),
        );

        expect(result.current.hasInitializedRefs.current).toBe(false);
    });

    // After Next the transaction holds new readings but the draft is staler. The directional check reports NOT
    // pending, so the baseline snapshots from the transaction - re-entering no longer looks like an unsaved change
    it('captures the baseline from the transaction when the (staler) draft is not pending hydration', () => {
        mockIsOdometerDraftPendingHydration.mockReturnValue(false);
        const {result} = renderHook(() =>
            useOdometerReadingsState({
                ...baseParams,
                currentTransaction: buildOdometerTransaction({odometerStart: 120, odometerEnd: 300}),
                odometerDraft: {odometerStartReading: 100, odometerEndReading: 250},
            }),
        );

        expect(result.current.hasInitializedRefs.current).toBe(true);
        expect(result.current.initialStartReadingRef.current).toBe('120');
        expect(result.current.initialEndReadingRef.current).toBe('300');
    });

    // Transaction has readings but no image (user deleted it) while the draft still holds the image. The directional
    // check reports NOT pending, so the baseline snapshots the transaction's true no-image state, not an empty one
    it('captures a no-image baseline when a readings draft is hydrated but its image was removed', () => {
        mockIsOdometerDraftPendingHydration.mockReturnValue(false);
        const {result} = renderHook(() =>
            useOdometerReadingsState({
                ...baseParams,
                currentTransaction: buildOdometerTransaction(),
                odometerDraft: {odometerStartReading: 100, odometerEndReading: 250, odometerStartImage: 'data:image/png;base64,xxx'},
            }),
        );

        expect(result.current.hasInitializedRefs.current).toBe(true);
        expect(result.current.initialStartImageRef.current).toBeUndefined();
        expect(result.current.initialEndImageRef.current).toBeUndefined();
    });

    // The ADD-image flow relies on an EMPTY image baseline: neither draft nor transaction has an image at mount, so
    // a later add differs from this empty baseline (hasImageChanges => true) and lets the discard modal fire
    it('captures an empty image baseline when neither the draft nor the transaction has an image', () => {
        mockIsOdometerDraftPendingHydration.mockReturnValue(false);
        const {result} = renderHook(() =>
            useOdometerReadingsState({
                ...baseParams,
                currentTransaction: buildOdometerTransaction(),
                odometerDraft: {odometerStartReading: 100, odometerEndReading: 250},
            }),
        );

        expect(result.current.hasInitializedRefs.current).toBe(true);
        expect(result.current.initialStartImageRef.current).toBeUndefined();
        expect(result.current.initialEndImageRef.current).toBeUndefined();
    });

    // The SWAP-image flow relies on the baseline capturing the transaction's CURRENT image, so a later swap is
    // detected as a change. When the transaction already holds an image, the baseline must snapshot it, not undefined
    it('captures the transaction image into the baseline when the transaction already has one', () => {
        mockIsOdometerDraftPendingHydration.mockReturnValue(false);
        const startImage = {uri: 'start.jpg'};
        const endImage = {uri: 'end.jpg'};
        const {result} = renderHook(() =>
            useOdometerReadingsState({
                ...baseParams,
                currentTransaction: buildOdometerTransaction({odometerStartImage: startImage, odometerEndImage: endImage}),
                odometerDraft: {odometerStartReading: 100, odometerEndReading: 250},
            }),
        );

        expect(result.current.hasInitializedRefs.current).toBe(true);
        expect(result.current.initialStartImageRef.current).toEqual(startImage);
        expect(result.current.initialEndImageRef.current).toEqual(endImage);
    });

    it('skips initialization on a non-odometer transaction unless we are editing', () => {
        const transaction = buildOdometerTransaction({}, CONST.IOU.REQUEST_TYPE.DISTANCE);

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

    // Create flow at the unit level: a fresh mount snapshots an EMPTY baseline, so readings typed + committed
    // via Next later differ from it and leaving prompts. The screen stays mounted across Next -> back, so it survives
    it('captures an empty baseline on a fresh create mount with no readings yet', () => {
        const emptyTransaction = buildOdometerTransaction({odometerStart: undefined, odometerEnd: undefined});
        const {result} = renderHook(() => useOdometerReadingsState({...baseParams, currentTransaction: emptyTransaction}));

        expect(result.current.hasInitializedRefs.current).toBe(true);
        expect(result.current.initialStartReadingRef.current).toBe('');
        expect(result.current.initialEndReadingRef.current).toBe('');
        expect(result.current.initialStartImageRef.current).toBeUndefined();
        expect(result.current.initialEndImageRef.current).toBeUndefined();
    });
});
