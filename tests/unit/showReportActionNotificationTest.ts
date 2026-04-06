import {afterEach, beforeAll, beforeEach, describe, expect, it, jest} from '@jest/globals';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import * as Report from '@src/libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/ActiveClientManager', () => ({
    isClientTheLeader: jest.fn(() => true),
    isReady: jest.fn(() => Promise.resolve()),
    init: jest.fn(),
}));

const mockShowModifiedExpenseNotification = jest.fn();
const mockShowCommentNotification = jest.fn();
jest.mock('@libs/Notification/LocalNotification', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        showModifiedExpenseNotification: (...args: unknown[]) => mockShowModifiedExpenseNotification(...args),
        showCommentNotification: (...args: unknown[]) => mockShowCommentNotification(...args),
        showUpdateAvailableNotification: jest.fn(),
        clearReportNotifications: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        getTopmostReportId: jest.fn(() => 'other-report-id'),
        navigate: jest.fn(),
    },
}));

jest.mock('@libs/Visibility', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        isVisible: jest.fn(() => false),
        hasFocus: jest.fn(() => false),
    },
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_LOGIN = 'test@user.com';
const REPORT_ID = '100';
const OTHER_USER_ACCOUNT_ID = 2;
const REPORT_ATTRIBUTES = {someReportKey: {reportName: 'Test Report'}} as Record<string, unknown>;

describe('showReportActionNotification', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockShowModifiedExpenseNotification.mockClear();
        mockShowCommentNotification.mockClear();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        return Onyx.clear();
    });

    async function setupReport() {
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_LOGIN});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            reportID: REPORT_ID,
            participants: {
                [CURRENT_USER_ACCOUNT_ID]: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
        });
        await waitForBatchedUpdates();
    }

    it('passes reportAttributes to showModifiedExpenseNotification for MODIFIED_EXPENSE actions', async () => {
        await setupReport();

        const reportAction = {
            reportActionID: 'action1',
            actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
            actorAccountID: OTHER_USER_ACCOUNT_ID,
            created: '2026-01-01 00:00:00.000',
            message: [{type: 'COMMENT', html: 'expense modified', text: 'expense modified'}],
            person: [{type: 'TEXT', style: 'strong', text: 'Other User'}],
        };

        Report.showReportActionNotification(
            REPORT_ID,
            reportAction as Parameters<typeof Report.showReportActionNotification>[1],
            CURRENT_USER_ACCOUNT_ID,
            CURRENT_USER_LOGIN,
            REPORT_ATTRIBUTES as Parameters<typeof Report.showReportActionNotification>[4],
        );
        await waitForBatchedUpdates();

        expect(mockShowModifiedExpenseNotification).toHaveBeenCalledTimes(1);
        const callArgs = mockShowModifiedExpenseNotification.mock.calls.at(0)?.at(0) as Record<string, unknown>;
        expect(callArgs.reportAttributes).toBe(REPORT_ATTRIBUTES);
        expect(mockShowCommentNotification).not.toHaveBeenCalled();
    });

    it('passes undefined reportAttributes to showModifiedExpenseNotification when not provided', async () => {
        await setupReport();

        const reportAction = {
            reportActionID: 'action2',
            actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
            actorAccountID: OTHER_USER_ACCOUNT_ID,
            created: '2026-01-01 00:00:00.000',
            message: [{type: 'COMMENT', html: 'expense modified', text: 'expense modified'}],
            person: [{type: 'TEXT', style: 'strong', text: 'Other User'}],
        };

        Report.showReportActionNotification(REPORT_ID, reportAction as Parameters<typeof Report.showReportActionNotification>[1], CURRENT_USER_ACCOUNT_ID, CURRENT_USER_LOGIN, undefined);
        await waitForBatchedUpdates();

        expect(mockShowModifiedExpenseNotification).toHaveBeenCalledTimes(1);
        const callArgs = mockShowModifiedExpenseNotification.mock.calls.at(0)?.at(0) as Record<string, unknown>;
        expect(callArgs.reportAttributes).toBeUndefined();
        expect(mockShowCommentNotification).not.toHaveBeenCalled();
    });

    it('routes non-MODIFIED_EXPENSE actions to showCommentNotification', async () => {
        await setupReport();

        const reportAction = {
            reportActionID: 'action3',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: OTHER_USER_ACCOUNT_ID,
            created: '2026-01-01 00:00:00.000',
            message: [{type: 'COMMENT', html: 'hello', text: 'hello'}],
            person: [{type: 'TEXT', style: 'strong', text: 'Other User'}],
        };

        Report.showReportActionNotification(
            REPORT_ID,
            reportAction as Parameters<typeof Report.showReportActionNotification>[1],
            CURRENT_USER_ACCOUNT_ID,
            CURRENT_USER_LOGIN,
            REPORT_ATTRIBUTES as Parameters<typeof Report.showReportActionNotification>[4],
        );
        await waitForBatchedUpdates();

        expect(mockShowCommentNotification).toHaveBeenCalledTimes(1);
        expect(mockShowModifiedExpenseNotification).not.toHaveBeenCalled();
    });
});
