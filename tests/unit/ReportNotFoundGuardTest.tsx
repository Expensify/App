import type * as ReactNavigationNative from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ReportNotFoundGuard from '@pages/inbox/ReportNotFoundGuard';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = '1';
const CHILD_TEST_ID = 'report-content';
const NOT_FOUND_TEST_ID = 'FullPageNotFoundView';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useRoute: () => ({key: 'report', name: 'Report', params: {reportID: REPORT_ID}}),
}));

// FullPageNotFoundView lazy-loads the ToddBehindCloud illustration; stub it so the blocking view renders synchronously.
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({}),
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

function renderGuard() {
    return render(
        <OnyxListItemProvider>
            <ReportNotFoundGuard>
                <View testID={CHILD_TEST_ID} />
            </ReportNotFoundGuard>
        </OnyxListItemProvider>,
    );
}

const isContentVisible = () => screen.queryByTestId(CHILD_TEST_ID) !== null;
const isNotFoundVisible = () => screen.queryByTestId(NOT_FOUND_TEST_ID) !== null;

/**
 * Regression tests for the ReportNotFoundGuard race in issue #92920.
 *
 * `isLoadingInitialReportActions` lives in a memory-only Onyx key that is not reset between in-app
 * navigations. A leaked `false` from a previous report can make the guard decide "not here" before the
 * report is fetched. The guard must only infer not-found after it has observed a real loading phase for
 * the current reportID.
 */
describe('ReportNotFoundGuard', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
        });
        await waitForBatchedUpdates();
    });

    it('does NOT show the not-found page when a stale "not loading" flag is leaked and the report is absent (the #92920 race)', async () => {
        // Simulate the leaked memory-only flag from a previous report, with the current report not yet in Onyx.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {isLoadingInitialReportActions: false});
        await waitForBatchedUpdates();

        renderGuard();
        await waitForBatchedUpdates();

        // No loading phase has been observed yet for this reportID, so the guard must wait instead of
        // showing "not here". Pre-fix this rendered the not-found page.
        expect(isContentVisible()).toBe(true);
        expect(isNotFoundVisible()).toBe(false);
    });

    it('shows the not-found page once a real loading phase has completed and the report is still absent (no regression)', async () => {
        // A genuine fetch is in flight for this reportID.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {isLoadingInitialReportActions: true});
        await waitForBatchedUpdates();

        renderGuard();
        await waitForBatchedUpdates();

        // While loading, the not-found page must not show.
        expect(isNotFoundVisible()).toBe(false);
        expect(isContentVisible()).toBe(true);

        // The fetch resolves with no report (genuinely inaccessible) -> not-found should now show.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {isLoadingInitialReportActions: false});
        await waitForBatchedUpdates();

        expect(isNotFoundVisible()).toBe(true);
        expect(isContentVisible()).toBe(false);
    });

    it('renders the report content when the report exists', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {isLoadingInitialReportActions: false});
        await waitForBatchedUpdates();

        renderGuard();
        await waitForBatchedUpdates();

        expect(isContentVisible()).toBe(true);
        expect(isNotFoundVisible()).toBe(false);
    });
});
