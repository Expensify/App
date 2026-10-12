import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {exportReportToCSV} from '@libs/actions/Report';
import fileDownload from '@libs/fileDownload';
import {translate} from '@libs/Localize';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Transaction} from '@src/types/onyx';

import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';

import createRandomTransaction from '../utils/collections/transaction';

const translateForTest: LocalizedTranslate = (path, ...parameters) => translate(CONST.LOCALES.EN, path, ...parameters);

const REPORT_ID = 'report1';

jest.mock('@libs/fileDownload');
jest.mock('@libs/Network/enhanceParameters', () => ({
    __esModule: true,
    default: (_: string, params: Record<string, unknown>) => params,
}));

const mockFileDownload = jest.mocked(fileDownload);

describe('exportReportToCSV', () => {
    let appendSpy: jest.SpyInstance;

    beforeAll(() => {
        // exportReportToCSV translates the downloaded file's name, which needs the real en locale loaded.
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        appendSpy = jest.spyOn(FormData.prototype, 'append');
    });

    afterEach(() => {
        appendSpy.mockRestore();
    });

    it('requests the export by report id when the selected transactions cover every non-deleted transaction on the report', () => {
        // Given a report whose only transaction is the one passed in the export's transaction ID list
        const transaction: Transaction = {...createRandomTransaction(1), reportID: REPORT_ID};

        // When the report is exported to CSV using the report's currently loaded transactions
        exportReportToCSV({reportID: REPORT_ID, transactionIDList: [transaction.transactionID]}, jest.fn(), translateForTest, [transaction]);

        // Then the download is requested for the report id itself, since the selection matches the whole report and the backend can export by report
        expect(appendSpy).toHaveBeenCalledWith('reportID', REPORT_ID);
        expect(mockFileDownload).toHaveBeenCalledTimes(1);
    });

    it('falls back to reportID -1 when the selected transactions do not cover every non-deleted transaction on the report', () => {
        // Given a report with two transactions, but only one of them selected for export
        const selectedTransaction: Transaction = {...createRandomTransaction(1), reportID: REPORT_ID};
        const unselectedTransaction: Transaction = {...createRandomTransaction(2), reportID: REPORT_ID};

        // When only the selected transaction is exported
        exportReportToCSV({reportID: REPORT_ID, transactionIDList: [selectedTransaction.transactionID]}, jest.fn(), translateForTest, [selectedTransaction, unselectedTransaction]);

        // Then the backend is asked to export by the explicit transaction ID list instead of by report id, since exporting by report id would incorrectly pull in the unselected transaction too
        expect(appendSpy).toHaveBeenCalledWith('reportID', '-1');
    });

    it('does not count a pending-delete transaction against a full-report match', () => {
        // Given a report with one active transaction and one pending-delete transaction, and only the active transaction selected
        const activeTransaction: Transaction = {...createRandomTransaction(1), reportID: REPORT_ID};
        const deletedTransaction: Transaction = {...createRandomTransaction(2), reportID: REPORT_ID, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};

        // When the active transaction is exported
        exportReportToCSV({reportID: REPORT_ID, transactionIDList: [activeTransaction.transactionID]}, jest.fn(), translateForTest, [activeTransaction, deletedTransaction]);

        // Then the download is still requested for the report id itself, since the pending-delete transaction shouldn't be counted as part of the report's active transactions
        expect(appendSpy).toHaveBeenCalledWith('reportID', REPORT_ID);
    });
});
