import {renderHook} from '@testing-library/react-native';

import useDeliveredReportTransactions from '@hooks/useDeliveredReportTransactions';

import type {Transaction} from '@src/types/onyx';

const buildTransaction = (transactionID: string, reportID: string): Transaction => ({
    transactionID,
    reportID,
    amount: 100,
    created: '2023-10-01',
    currency: 'USD',
    merchant: '',
});

const reportATransactions = [buildTransaction('A1', 'reportA'), buildTransaction('A2', 'reportA')];
const reportBTransactions = [buildTransaction('B1', 'reportB'), buildTransaction('B2', 'reportB'), buildTransaction('B3', 'reportB')];

type HarnessProps = {
    reportID: string | undefined;
    transactions: Transaction[];
    arrivedTransactionCount: number;
    expectedTransactionCount: number;
};

function renderHarness(initialProps: HarnessProps) {
    return renderHook<Transaction[] | undefined, HarnessProps>((props) => useDeliveredReportTransactions(props), {initialProps});
}

describe('useDeliveredReportTransactions', () => {
    it('hands over the list once every transaction the report claims has arrived', () => {
        // Given a report that claims three expenses before any has arrived, so nothing is handed over yet
        const {rerender, result} = renderHarness({reportID: 'reportB', transactions: [], arrivedTransactionCount: 0, expectedTransactionCount: 3});
        expect(result.current).toBeUndefined();

        // When all three arrive
        rerender({reportID: 'reportB', transactions: reportBTransactions, arrivedTransactionCount: 3, expectedTransactionCount: 3});

        // Then the complete list is handed over
        expect(result.current).toEqual(reportBTransactions);
    });

    it('keeps handing the list over once delivered, since adding an expense raises the expected count before its transaction arrives', () => {
        // Given a report whose two expenses have arrived and been handed over
        const {rerender, result} = renderHarness({reportID: 'reportA', transactions: reportATransactions, arrivedTransactionCount: 2, expectedTransactionCount: 2});
        expect(result.current).toEqual(reportATransactions);

        // When an expense is added, raising the count before its transaction arrives
        rerender({reportID: 'reportA', transactions: reportATransactions, arrivedTransactionCount: 2, expectedTransactionCount: 3});

        // Then the list is still handed over, so the new expense shows up as an addition when it lands
        expect(result.current).toEqual(reportATransactions);
    });

    it('delivers a report that still shows a transaction whose move out of it failed, although the transaction names the report it was moving to', () => {
        // Given report A showing a transaction whose reject failed, which names the report it was sent to
        const rejectFailedTransaction = {...buildTransaction('A3', 'reportZ'), rejectFailedFromReportID: 'reportA'};
        const rows = [...reportATransactions, rejectFailedTransaction];

        // When every transaction A claims has arrived
        const {result} = renderHarness({reportID: 'reportA', transactions: rows, arrivedTransactionCount: 3, expectedTransactionCount: 3});

        // Then A's list is handed over
        expect(result.current).toEqual(rows);
    });

    it('withholds the incoming report while it hydrates, even though the previous one was already delivered', () => {
        // Given report A's list already handed over
        const {rerender, result} = renderHarness({reportID: 'reportA', transactions: reportATransactions, arrivedTransactionCount: 2, expectedTransactionCount: 2});
        expect(result.current).toEqual(reportATransactions);

        // When the carousel swaps to report B on the same screen, whose expenses read empty while they load
        rerender({reportID: 'reportB', transactions: [], arrivedTransactionCount: 0, expectedTransactionCount: 3});

        // Then B's list is withheld, since A's delivery says nothing about B
        expect(result.current).toBeUndefined();
    });

    it('counts arrivals before filtering, so a report holding a pending delete is still delivered', () => {
        // Given a report whose two expenses have both arrived, one pending deletion and filtered out by the caller
        const nonDeletedRows = reportATransactions.slice(0, 1);

        // When the report renders with the shorter, filtered list
        const {result} = renderHarness({reportID: 'reportA', transactions: nonDeletedRows, arrivedTransactionCount: 2, expectedTransactionCount: 2});

        // Then the list is handed over, since every expense the report claims has arrived
        expect(result.current).toEqual(nonDeletedRows);
    });
});
