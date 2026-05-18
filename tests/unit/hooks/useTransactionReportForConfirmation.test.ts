import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTransactionReportForConfirmation from '@components/MoneyRequestConfirmationList/hooks/useTransactionReportForConfirmation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const reportID = 'REPORT_TXN_TEST';

describe('useTransactionReportForConfirmation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('returns the narrowed report shape (only `type`) when the report exists', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
            reportID,
            type: CONST.REPORT.TYPE.IOU,
            reportName: 'should-not-be-included',
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useTransactionReportForConfirmation(reportID));
        await waitFor(() => expect(result.current).toBeDefined());
        expect(result.current?.type).toBe(CONST.REPORT.TYPE.IOU);
        // Selector narrows to only `type`
        expect((result.current as {reportName?: string} | undefined)?.reportName).toBeUndefined();
    });

    it('returns undefined when the report is not in Onyx', async () => {
        const {result} = renderHook(() => useTransactionReportForConfirmation(reportID));
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when transactionReportID is undefined', async () => {
        const {result} = renderHook(() => useTransactionReportForConfirmation(undefined));
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
    });
});
