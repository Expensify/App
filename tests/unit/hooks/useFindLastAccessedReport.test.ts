import {renderHook, waitFor} from '@testing-library/react-native';

import useFindLastAccessedReport from '@hooks/useFindLastAccessedReport';

import DateUtils from '@libs/DateUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../../utils/LHNTestUtils';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_ACCOUNT_ID = 1;

function buildOwnedReport(reportID: string, lastReadTime: string): Report {
    return {
        ...LHNTestUtils.getFakeReport(),
        reportID,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        lastReadTime,
    };
}

describe('useFindLastAccessedReport', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'user@test.com'});
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('should resolve the most recently read report that is not archived when enabled', async () => {
        // Given two reports where the most recently read one is archived
        const olderReport = buildOwnedReport('2001', '2024-02-01 04:56:47.233');
        const archivedReport = buildOwnedReport('2002', '2024-03-01 04:56:47.233');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${olderReport.reportID}`, olderReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${archivedReport.reportID}`, archivedReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReport.reportID}`, {private_isArchived: DateUtils.getDBTime()});
        await waitForBatchedUpdatesWithAct();

        // When the hook resolves the last accessed report
        const {result, unmount} = renderHook(() => useFindLastAccessedReport({openOnAdminRoom: false}));

        // Then the archived report is skipped, which proves the name-value pairs are still read while enabled
        await waitFor(() => expect(result.current.lastAccessedReportID).toBe(olderReport.reportID));
        unmount();
    });

    it('should not resolve a report or re-render on name-value pair and report writes when disabled', async () => {
        // Given a stored report and a disabled hook
        const report = buildOwnedReport('2003', '2024-02-01 04:56:47.233');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
        await waitForBatchedUpdatesWithAct();

        let renderCount = 0;
        const {result, unmount} = renderHook(() => {
            renderCount++;
            return useFindLastAccessedReport({openOnAdminRoom: false, enabled: false});
        });
        await waitForBatchedUpdatesWithAct();
        const renderCountBeforeWrites = renderCount;

        // When name-value pairs and reports change
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {private_isArchived: DateUtils.getDBTime()});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}2004`, buildOwnedReport('2004', '2024-04-01 04:56:47.233'));
        await waitForBatchedUpdatesWithAct();

        // Then the hook stays idle, because a disabled caller must not pay for collection writes
        expect(result.current.lastAccessedReportID).toBeUndefined();
        expect(renderCount).toBe(renderCountBeforeWrites);
        unmount();
    });
});
