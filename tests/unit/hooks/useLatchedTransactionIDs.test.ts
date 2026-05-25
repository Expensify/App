import {renderHook} from '@testing-library/react-native';
import useLatchedTransactionIDs from '@hooks/useLatchedTransactionIDs';
import CONST from '@src/CONST';

const ADD = CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
const DELETE = CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

const stable = (id: string) => ({transactionID: id});
const optimistic = (id: string) => ({transactionID: id, pendingAction: ADD});
const pendingDelete = (id: string) => ({transactionID: id, pendingAction: DELETE});

describe('useLatchedTransactionIDs', () => {
    it('returns undefined on first render with empty input', () => {
        const {result} = renderHook(() => useLatchedTransactionIDs([]));
        expect(result.current).toBeUndefined();
    });

    it('returns undefined on first render with undefined input', () => {
        const {result} = renderHook(() => useLatchedTransactionIDs(undefined));
        expect(result.current).toBeUndefined();
    });

    it('does not engage the latch during normal hydration (no optimistic add)', () => {
        const {result, rerender} = renderHook(({txs}: {txs: Array<ReturnType<typeof stable>>}) => useLatchedTransactionIDs(txs), {
            initialProps: {txs: [stable('t1')]},
        });
        expect(result.current).toBeUndefined();
        rerender({txs: [stable('t1'), stable('t2')]});
        expect(result.current).toBeUndefined();
        rerender({txs: [stable('t1'), stable('t2'), stable('t3')]});
        expect(result.current).toBeUndefined();
    });

    it('engages the latch when an optimistic-add transaction appears, snapshotting only the stable IDs', () => {
        const {result, rerender} = renderHook(({txs}: {txs: Array<ReturnType<typeof stable> | ReturnType<typeof optimistic>>}) => useLatchedTransactionIDs(txs), {
            initialProps: {txs: [stable('t1')] as Array<ReturnType<typeof stable> | ReturnType<typeof optimistic>>},
        });
        expect(result.current).toBeUndefined();
        rerender({txs: [stable('t1'), optimistic('t2')]});
        expect(result.current).toEqual(new Set(['t1']));
    });

    it('keeps the latch held after the optimistic-add syncs (pendingAction clears)', () => {
        const {result, rerender} = renderHook(({txs}: {txs: Array<ReturnType<typeof stable> | ReturnType<typeof optimistic>>}) => useLatchedTransactionIDs(txs), {
            initialProps: {txs: [stable('t1'), optimistic('t2')] as Array<ReturnType<typeof stable> | ReturnType<typeof optimistic>>},
        });
        expect(result.current).toEqual(new Set(['t1']));
        rerender({txs: [stable('t1'), stable('t2')]});
        expect(result.current).toEqual(new Set(['t1']));
    });

    it('releases the latch when a latched tx is removed from the live set (post-duplicate delete)', () => {
        type Tx = ReturnType<typeof stable> | ReturnType<typeof optimistic>;
        const {result, rerender} = renderHook(({txs}: {txs: Tx[]}) => useLatchedTransactionIDs(txs), {
            initialProps: {txs: [stable('t1'), optimistic('t2')] as Tx[]},
        });
        expect(result.current).toEqual(new Set(['t1']));
        rerender({txs: [stable('t1'), stable('t2')]});
        expect(result.current).toEqual(new Set(['t1']));
        rerender({txs: [stable('t2')]});
        expect(result.current).toBeUndefined();
    });

    it('does not engage the latch on Pusher-pushed (non-optimistic) additions', () => {
        const {result, rerender} = renderHook(({txs}: {txs: Array<ReturnType<typeof stable>>}) => useLatchedTransactionIDs(txs), {
            initialProps: {txs: [stable('t1')]},
        });
        expect(result.current).toBeUndefined();
        rerender({txs: [stable('t1'), stable('t2')]});
        expect(result.current).toBeUndefined();
    });

    it('ignores pendingAction === DELETE for engagement', () => {
        const {result} = renderHook(() => useLatchedTransactionIDs([stable('t1'), pendingDelete('t2')]));
        expect(result.current).toBeUndefined();
    });

    it('excludes pendingAction === DELETE from the stable snapshot when engaging', () => {
        const {result} = renderHook(() => useLatchedTransactionIDs([stable('t1'), pendingDelete('t2'), optimistic('t3')]));
        expect(result.current).toEqual(new Set(['t1']));
    });

    it('does not release when a non-latched tx transitions to pendingDelete', () => {
        type Tx = ReturnType<typeof stable> | ReturnType<typeof optimistic> | ReturnType<typeof pendingDelete>;
        const {result, rerender} = renderHook(({txs}: {txs: Tx[]}) => useLatchedTransactionIDs(txs), {
            initialProps: {txs: [stable('t1'), pendingDelete('t2'), optimistic('t3')] as Tx[]},
        });
        expect(result.current).toEqual(new Set(['t1']));
        rerender({txs: [stable('t1'), stable('t3')]});
        expect(result.current).toEqual(new Set(['t1']));
    });

    it('releases when a latched tx transitions to pendingDelete (user deletes the original post-duplicate)', () => {
        type Tx = ReturnType<typeof stable> | ReturnType<typeof optimistic> | ReturnType<typeof pendingDelete>;
        const {result, rerender} = renderHook(({txs}: {txs: Tx[]}) => useLatchedTransactionIDs(txs), {
            initialProps: {txs: [stable('t1'), optimistic('t2')] as Tx[]},
        });
        expect(result.current).toEqual(new Set(['t1']));
        rerender({txs: [pendingDelete('t1'), stable('t2')]});
        expect(result.current).toBeUndefined();
    });

    it('releases the latch when resetKey changes (screen reused for a different report)', () => {
        type Tx = ReturnType<typeof stable> | ReturnType<typeof optimistic>;
        const {result, rerender} = renderHook(({txs, key}: {txs: Tx[]; key: string}) => useLatchedTransactionIDs(txs, key), {
            initialProps: {txs: [stable('t1'), optimistic('t2')] as Tx[], key: 'reportA'},
        });
        expect(result.current).toEqual(new Set(['t1']));
        rerender({txs: [stable('t9'), stable('t10')], key: 'reportB'});
        expect(result.current).toBeUndefined();
    });

    it('keeps the latch when resetKey is stable', () => {
        type Tx = ReturnType<typeof stable> | ReturnType<typeof optimistic>;
        const {result, rerender} = renderHook(({txs, key}: {txs: Tx[]; key: string}) => useLatchedTransactionIDs(txs, key), {
            initialProps: {txs: [stable('t1'), optimistic('t2')] as Tx[], key: 'reportA'},
        });
        expect(result.current).toEqual(new Set(['t1']));
        rerender({txs: [stable('t1'), stable('t2')], key: 'reportA'});
        expect(result.current).toEqual(new Set(['t1']));
    });
});
