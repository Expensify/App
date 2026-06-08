import type * as ReactNavigation from '@react-navigation/native';
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useDismissOnMoneyRequestReportRemoval from '@hooks/useDismissOnMoneyRequestReportRemoval';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockUseIsFocused = jest.fn().mockReturnValue(true);

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => mockUseIsFocused() as boolean,
    };
});

jest.mock('@navigation/Navigation', () => ({
    dismissModal: jest.fn(),
}));

const REPORT_A_ID = '1';
const REPORT_B_ID = '2';

function buildMoneyRequestReport(id: string, overrides?: Partial<Report>): Report {
    return {
        reportID: id,
        type: CONST.REPORT.TYPE.EXPENSE,
        chatType: undefined,
        ...overrides,
    } as Report;
}

function buildChatReport(id: string): Report {
    return {
        reportID: id,
        type: CONST.REPORT.TYPE.CHAT,
    } as Report;
}

describe('useDismissOnMoneyRequestReportRemoval', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(true);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('dismisses the modal when a focused money request report is removed', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, buildMoneyRequestReport(REPORT_A_ID));
        await waitForBatchedUpdates();

        const {rerender} = renderHook(({reportID}: {reportID: string}) => useDismissOnMoneyRequestReportRemoval(reportID), {
            initialProps: {reportID: REPORT_A_ID},
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, null);
        await waitForBatchedUpdates();
        rerender({reportID: REPORT_A_ID});

        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
    });

    it('does not dismiss the modal on first render even if the report is missing', async () => {
        renderHook(({reportID}: {reportID: string}) => useDismissOnMoneyRequestReportRemoval(reportID), {
            initialProps: {reportID: REPORT_A_ID},
        });
        await waitForBatchedUpdates();

        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('does not dismiss the modal when the screen is unfocused', async () => {
        mockUseIsFocused.mockReturnValue(false);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, buildMoneyRequestReport(REPORT_A_ID));
        await waitForBatchedUpdates();

        const {rerender} = renderHook(({reportID}: {reportID: string}) => useDismissOnMoneyRequestReportRemoval(reportID), {
            initialProps: {reportID: REPORT_A_ID},
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, null);
        await waitForBatchedUpdates();
        rerender({reportID: REPORT_A_ID});

        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('does not dismiss the modal when the previous report was not a money request report', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, buildChatReport(REPORT_A_ID));
        await waitForBatchedUpdates();

        const {rerender} = renderHook(({reportID}: {reportID: string}) => useDismissOnMoneyRequestReportRemoval(reportID), {
            initialProps: {reportID: REPORT_A_ID},
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, null);
        await waitForBatchedUpdates();
        rerender({reportID: REPORT_A_ID});

        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    // Regression for https://github.com/Expensify/App/pull/89150 — navigating between reports with the
    // prev/next arrows in the search/saved-search RHP should not dismiss the modal when the next report's
    // data has not yet loaded into Onyx.
    it('does not dismiss the modal when the route changes to a report whose data has not loaded yet', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, buildMoneyRequestReport(REPORT_A_ID));
        await waitForBatchedUpdates();

        const {rerender} = renderHook(({reportID}: {reportID: string}) => useDismissOnMoneyRequestReportRemoval(reportID), {
            initialProps: {reportID: REPORT_A_ID},
        });

        rerender({reportID: REPORT_B_ID});
        await waitForBatchedUpdates();

        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    // Reviewer scenario: while navigating with the arrows in a saved/canned search, the previous report's
    // status changes (e.g. open → processing) on the backend. The arrows must keep working — the modal must
    // not be dismissed in any of the intermediate render passes.
    it('keeps the arrows working when a report status changes mid-navigation in a saved search', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, buildMoneyRequestReport(REPORT_A_ID, {stateNum: CONST.REPORT.STATE_NUM.OPEN}));
        await waitForBatchedUpdates();

        const {rerender} = renderHook(({reportID}: {reportID: string}) => useDismissOnMoneyRequestReportRemoval(reportID), {
            initialProps: {reportID: REPORT_A_ID},
        });

        // Status change on the previous report (still defined, just mutated).
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED});
        await waitForBatchedUpdates();
        rerender({reportID: REPORT_A_ID});

        // Arrow forward — report B is not in Onyx yet.
        rerender({reportID: REPORT_B_ID});
        await waitForBatchedUpdates();

        // Report B data arrives.
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_B_ID}`, buildMoneyRequestReport(REPORT_B_ID, {stateNum: CONST.REPORT.STATE_NUM.OPEN}));
        await waitForBatchedUpdates();
        rerender({reportID: REPORT_B_ID});

        // Arrow back — report A is still around.
        rerender({reportID: REPORT_A_ID});
        await waitForBatchedUpdates();

        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('does not dismiss the modal when the report is updated but still present', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, buildMoneyRequestReport(REPORT_A_ID, {stateNum: CONST.REPORT.STATE_NUM.OPEN}));
        await waitForBatchedUpdates();

        const {rerender} = renderHook(({reportID}: {reportID: string}) => useDismissOnMoneyRequestReportRemoval(reportID), {
            initialProps: {reportID: REPORT_A_ID},
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED});
        await waitForBatchedUpdates();
        rerender({reportID: REPORT_A_ID});

        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });
});
