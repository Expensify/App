import {act, renderHook} from '@testing-library/react-native';

import useReportTransactionShiftRange from '@components/MoneyRequestReportView/useReportTransactionShiftRange';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import createRandomTransaction from '../utils/collections/transaction';

const REPORT_ID = '777';

function buildTransaction(transactionID: string, overrides: Partial<OnyxTypes.Transaction> = {}): OnyxTypes.Transaction {
    return {...createRandomTransaction(Number(transactionID)), transactionID, reportID: REPORT_ID, ...overrides};
}

const rows = [buildTransaction('1'), buildTransaction('2'), buildTransaction('3'), buildTransaction('4')];

/** Drives the hook the way the list does, holding the selection the component reads from context. */
function renderShiftRange(initialTransactions: OnyxTypes.Transaction[] = rows) {
    const state = {selectedTransactionIDs: [] as string[], transactions: initialTransactions, reportID: REPORT_ID};
    const setSelectedTransactions = jest.fn((transactionIDs: string[]) => {
        state.selectedTransactionIDs = transactionIDs;
    });
    const clearSelectedTransactions = jest.fn(() => {
        state.selectedTransactionIDs = [];
    });

    const rendered = renderHook(() =>
        useReportTransactionShiftRange({
            reportID: state.reportID,
            transactions: state.transactions,
            selectedTransactionIDs: state.selectedTransactionIDs,
            setSelectedTransactions,
            clearSelectedTransactions,
        }),
    );

    /** The hook reads the selection from its params, so a commit has to be handed back before the next gesture. */
    const settle = () => rendered.rerender({});

    return {...rendered, state, settle, setSelectedTransactions, clearSelectedTransactions};
}

describe('MoneyRequestReport shift+click', () => {
    it('selects the rows between the clicked one and the last one clicked plainly', () => {
        const {result, state, settle} = renderShiftRange();

        act(() => result.current.toggleTransaction('2'));
        settle();
        act(() => result.current.toggleTransaction('4', true));

        expect(state.selectedTransactionIDs).toEqual(['2', '3', '4']);
    });

    it('gives back the rows a shrinking range no longer covers', () => {
        const {result, state, settle} = renderShiftRange();

        act(() => result.current.toggleTransaction('1'));
        settle();
        act(() => result.current.toggleTransaction('4', true));
        settle();
        act(() => result.current.toggleTransaction('2', true));

        expect(state.selectedTransactionIDs).toEqual(['1', '2']);
    });

    it('leaves a row being deleted out of the range it spans', () => {
        const withDeleted = [rows.at(0), buildTransaction('2', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}), rows.at(2)].filter((row) => !!row);
        const {result, state, settle} = renderShiftRange(withDeleted);

        act(() => result.current.toggleTransaction('1'));
        settle();
        act(() => result.current.toggleTransaction('3', true));

        expect(state.selectedTransactionIDs).toEqual(['1', '3']);
    });

    it('runs a cold shift+click from the top of the list, since nothing is selected for it to anchor on', () => {
        const {result, state} = renderShiftRange();

        act(() => result.current.toggleTransaction('3', true));

        expect(state.selectedTransactionIDs).toEqual(['1', '2', '3']);
    });

    it('toggles one row off without disturbing the rest', () => {
        const {result, state, settle} = renderShiftRange();

        act(() => result.current.toggleTransaction('1'));
        settle();
        act(() => result.current.toggleTransaction('3', true));
        settle();
        act(() => result.current.toggleTransaction('2'));

        expect(state.selectedTransactionIDs).toEqual(['1', '3']);
    });

    it('narrows a group selected from its header, since the header records it as a block', () => {
        const {result, state, settle} = renderShiftRange();

        act(() => result.current.toggleGroup(['1', '2', '3']));
        settle();
        expect(state.selectedTransactionIDs).toEqual(['1', '2', '3']);

        act(() => result.current.toggleTransaction('2', true));

        expect(state.selectedTransactionIDs).toEqual(['1', '2']);
    });

    it('drops the block when a group is deselected, so a later shift+click cannot collapse onto it', () => {
        const {result, state, settle} = renderShiftRange();

        act(() => result.current.toggleGroup(['1', '2', '3']));
        settle();
        act(() => result.current.toggleGroup(['1', '2', '3']));
        settle();
        expect(state.selectedTransactionIDs).toEqual([]);

        // Cold again, so the click runs from the top rather than collapsing the block the group had seeded
        act(() => result.current.toggleTransaction('3', true));

        expect(state.selectedTransactionIDs).toEqual(['1', '2', '3']);
    });

    it('collapses a Select All onto the span the next shift+click lands in', () => {
        const {result, state, settle} = renderShiftRange();

        act(() => result.current.toggleAll(['1', '2', '3', '4']));
        settle();
        expect(state.selectedTransactionIDs).toEqual(['1', '2', '3', '4']);

        act(() => result.current.toggleTransaction('2', true));

        expect(state.selectedTransactionIDs).toEqual(['1', '2']);
    });

    it('clears through the clearing action rather than an empty write, and forgets the session with it', () => {
        const {result, state, settle, clearSelectedTransactions} = renderShiftRange();

        act(() => result.current.toggleAll(['1', '2', '3', '4']));
        settle();
        act(() => result.current.toggleAll(['1', '2', '3', '4']));
        settle();
        expect(clearSelectedTransactions).toHaveBeenCalledWith(true);

        // The full-list block went with it, so the next click runs from the top rather than collapsing onto itself
        act(() => result.current.toggleTransaction('3', true));

        expect(state.selectedTransactionIDs).toEqual(['1', '2', '3']);
    });

    it('forgets the session when the list is reused for the next report, so a range cannot shrink across the change', () => {
        const {result, state, settle, rerender} = renderShiftRange();

        // Given a range painted across every row, which is what a shrink would give back
        act(() => result.current.toggleTransaction('1'));
        settle();
        act(() => result.current.toggleTransaction('4', true));
        settle();
        expect(state.selectedTransactionIDs).toEqual(['1', '2', '3', '4']);

        // When the list is handed the next report
        state.reportID = '888';
        rerender({});

        // Then the click that would have shrunk that range keeps every row, since the session it would shrink is gone
        act(() => result.current.toggleTransaction('2', true));

        expect(state.selectedTransactionIDs).toEqual(['1', '2', '3', '4']);
    });
});
