import {act, renderHook} from '@testing-library/react-native';

import useHomeTodoAutoAdvance from '@hooks/useHomeTodoAutoAdvance';

import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useRoute: () => ({key: 'report-route', name: 'Report', params: {}}),
    useNavigation: () => ({getState: () => ({key: 'navigator'})}),
    useIsFocused: () => true,
}));
jest.mock('@libs/Growl', () => ({success: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@libs/Navigation/helpers/openReportInPlace', () => jest.fn());
jest.mock('@userActions/HomeTodoReview', () => ({
    clearHomeTodoReview: jest.fn(),
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_USER_ACCOUNT_ID = 2;
const REPORT_ID = '100';

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

const renderAutoAdvance = () =>
    renderHook(() =>
        useHomeTodoAutoAdvance({
            reportID: REPORT_ID,
            searchKey: CONST.SEARCH.SEARCH_KEYS.APPROVE,
            reportIDs: [REPORT_ID],
        }),
    );

describe('useHomeTodoAutoAdvance', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
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
                    value: {approved: createApprovedAction('approved', '2026-11-17 10:00:00.000')},
                },
            ]);
            await waitForBatchedUpdates();
        });

        // Then the review confirms the approval and returns Home, since no other report needs it
        expect(Growl.success).toHaveBeenCalledTimes(1);
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
        expect(Growl.success).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });
});
