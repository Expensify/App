import {beforeEach, describe, expect, it, jest} from '@jest/globals';

import Navigation from '@libs/Navigation/Navigation';
import {getAllReportActions} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import * as Report from '@src/libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

const USER_ACCOUNT_ID = 1;
const USER_EMAIL = 'user@test.com';
const CONCIERGE_DM_ID = '1';
const THREAD_ID = '2';

describe('Concierge thread', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('opens the thread only once its parent report action is in Onyx', async () => {
        await TestHelper.signInWithTestUser(USER_ACCOUNT_ID, USER_EMAIL);
        const conciergeDM: OnyxTypes.Report = {
            reportID: CONCIERGE_DM_ID,
            type: CONST.REPORT.TYPE.CHAT,
            participants: {
                [USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [CONST.ACCOUNT_ID.CONCIERGE]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_DM_ID}`, conciergeDM);
        await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_DM_ID);
        await waitForBatchedUpdates();

        // The thread header builds its avatar from the parent report action, so record what Onyx holds when the thread opens.
        let parentReportActionWhenThreadOpened: OnyxTypes.ReportAction | undefined;
        (Navigation.navigate as jest.Mock).mockImplementation(() => {
            parentReportActionWhenThreadOpened = Object.values(getAllReportActions(CONCIERGE_DM_ID)).find((action) => action.childReportID === THREAD_ID);
        });

        Report.addComment({
            report: conciergeDM,
            notifyReportID: CONCIERGE_DM_ID,
            ancestors: [],
            text: 'How do I submit an expense?',
            timezoneParam: CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID: USER_ACCOUNT_ID,
            delegateAccountID: undefined,
            conciergeReportID: CONCIERGE_DM_ID,
            conciergeThreadReportID: THREAD_ID,
        });
        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(parentReportActionWhenThreadOpened?.actorAccountID).toBe(USER_ACCOUNT_ID);
        expect(parentReportActionWhenThreadOpened?.childReportID).toBe(THREAD_ID);
    });
});
