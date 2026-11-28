import {act, renderHook} from '@testing-library/react-native';

import useHomeTodoAutoAdvance from '@hooks/useHomeTodoAutoAdvance';

import DateUtils from '@libs/DateUtils';
import Growl from '@libs/Growl';
import openReportInPlace from '@libs/Navigation/helpers/openReportInPlace';
import Navigation from '@libs/Navigation/Navigation';
import {filterReportIDsNeedingTodoAction} from '@libs/TodosUtils';
import type * as TodosUtils from '@libs/TodosUtils';

import {clearHomeTodoReview} from '@userActions/HomeTodoReview';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

let mockIsFocused = true;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useRoute: () => ({key: 'report-route', name: 'Report', params: {}}),
    useNavigation: () => ({getState: () => ({key: 'navigator'})}),
    useIsFocused: () => mockIsFocused,
}));
jest.mock('@libs/Growl', () => ({success: jest.fn(), celebrate: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@libs/Navigation/helpers/openReportInPlace', () => jest.fn());
jest.mock('@libs/TodosUtils', () => {
    const actual = jest.requireActual<typeof TodosUtils>('@libs/TodosUtils');
    return {...actual, filterReportIDsNeedingTodoAction: jest.fn(actual.filterReportIDsNeedingTodoAction)};
});
jest.mock('@userActions/HomeTodoReview', () => ({
    clearHomeTodoReview: jest.fn(),
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_USER_ACCOUNT_ID = 2;
const REPORT_ID = '100';
const NEXT_REPORT_ID = '200';

const submittedReport: Report = {
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    managerID: CURRENT_USER_ACCOUNT_ID,
};

const createApprovedAction = (reportActionID: string, created: string): ReportAction => ({
    reportActionID,
    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
    actorAccountID: CURRENT_USER_ACCOUNT_ID,
    created,
});

// A moment after the report opened, so the action stays newer than the review's baseline even within one millisecond
const ACTION_DELAY_MS = 1000;
const getActionCreatedAfterOpen = () => DateUtils.getDBTime(Date.now() + ACTION_DELAY_MS);

const renderAutoAdvance = (reportIDs = [REPORT_ID]) =>
    renderHook(() =>
        useHomeTodoAutoAdvance({
            reportID: REPORT_ID,
            searchKey: CONST.SEARCH.SEARCH_KEYS.APPROVE,
            reportIDs,
        }),
    );

const removeReport = async () => {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, null);
        await waitForBatchedUpdates();
    });
};

describe('useHomeTodoAutoAdvance', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsFocused = true;
        await Onyx.clear();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: CURRENT_USER_ACCOUNT_ID,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, submittedReport);
            await waitForBatchedUpdates();
        });
    });

    it('advances when the user approves before the report actions are cached', async () => {
        // Given a report awaiting the user's approval whose actions have not loaded, as when it opens offline
        renderAutoAdvance();
        await act(waitForBatchedUpdates);

        // When the optimistic approval creates the report's actions together with the approved state
        await act(async () => {
            await Onyx.update([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                    value: {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                    value: {approved: createApprovedAction('approved', getActionCreatedAfterOpen())},
                },
            ]);
            await waitForBatchedUpdates();
        });

        // Then the review celebrates the finished row and returns Home, since no other report needs it
        expect(Growl.celebrate).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.HOME);
    });

    it('advances when the new approval lands in a render before the approved state', async () => {
        // Given a report awaiting the user's approval with an approval from an earlier cycle already loaded
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                older: createApprovedAction('older', '2026-11-01 10:00:00.000'),
            });
            await waitForBatchedUpdates();
        });
        renderAutoAdvance();
        await act(waitForBatchedUpdates);

        // When the user's new approval reaches the screen before the report's approved state, as the optimistic data
        // of a real action can
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                approved: createApprovedAction('approved', getActionCreatedAfterOpen()),
            });
            await waitForBatchedUpdates();
        });
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            });
            await waitForBatchedUpdates();
        });

        // Then the review still celebrates the finished row and returns Home, since no other report needs it
        expect(Growl.celebrate).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.HOME);
    });

    it('does not advance on an older approval that loads after the report opened', async () => {
        // Given a report awaiting the user's approval whose actions have not loaded
        renderAutoAdvance();
        await act(waitForBatchedUpdates);

        // When its actions load with an approval the user made in an earlier cycle
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                older: createApprovedAction('older', '2026-11-01 10:00:00.000'),
            });
            await waitForBatchedUpdates();
        });

        // And an admin then moves the report to another approver, taking it off the user's list without a new action
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                managerID: OTHER_USER_ACCOUNT_ID,
            });
            await waitForBatchedUpdates();
        });

        // Then the review stays on the report, because the user took no new action on it
        expect(Growl.celebrate).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });
    it('opens the next report when the open report is removed from another screen', async () => {
        // Given the review's report is covered by another screen and a second report still needs the user's approval
        mockIsFocused = false;
        jest.mocked(filterReportIDsNeedingTodoAction).mockReturnValueOnce([NEXT_REPORT_ID]);
        renderAutoAdvance([REPORT_ID, NEXT_REPORT_ID]);
        await act(waitForBatchedUpdates);

        // When the report is removed, as when its last expense is deleted from the Inbox
        await removeReport();

        // Then the review shows the next report in its place, so the user doesn't come back to a missing report
        expect(openReportInPlace).toHaveBeenCalledWith(NEXT_REPORT_ID, 'report-route', 'navigator');
        expect(Growl.success).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('returns Home once the user comes back to a removed report with nothing left to review', async () => {
        // Given the review's only report is covered by another screen
        mockIsFocused = false;
        const {rerender} = renderAutoAdvance();
        await act(waitForBatchedUpdates);

        // When the report is removed from another screen, and the user later comes back to the review
        await removeReport();
        expect(Navigation.goBack).not.toHaveBeenCalled();
        mockIsFocused = true;
        rerender(undefined);
        await act(waitForBatchedUpdates);

        // Then the review ends and returns Home instead of showing the missing report
        expect(clearHomeTodoReview).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.HOME);
        expect(Growl.celebrate).not.toHaveBeenCalled();
    });

    it('leaves a report removed while on screen to the report screen', async () => {
        // Given the review's report is on screen, with a second report in the review
        renderAutoAdvance([REPORT_ID, NEXT_REPORT_ID]);
        await act(waitForBatchedUpdates);

        // When the report is removed while the user looks at it
        await removeReport();

        // Then the review doesn't navigate, because the report screen already closes a removed report
        expect(openReportInPlace).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });
});
