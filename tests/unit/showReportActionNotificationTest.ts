import {afterEach, beforeAll, beforeEach, describe, expect, it} from '@jest/globals';

import type {LocalNotificationModule, LocalNotificationModifiedExpenseParams} from '@libs/Notification/LocalNotification/types';

import CONST from '@src/CONST';
import * as Report from '@src/libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';

import Onyx from 'react-native-onyx';
import {formatPhoneNumber} from 'tests/utils/TestHelper';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/ActiveClientManager', () => ({
    isClientTheLeader: jest.fn(() => true),
    isReady: jest.fn(() => Promise.resolve()),
    init: jest.fn(),
}));

const mockShowModifiedExpenseNotification = jest.fn<void, [LocalNotificationModifiedExpenseParams]>();
const mockShowCommentNotification = jest.fn<void, Parameters<LocalNotificationModule['showCommentNotification']>>();
jest.mock('@libs/Notification/LocalNotification', () => ({
    __esModule: true,
    default: {
        showModifiedExpenseNotification: (params: LocalNotificationModifiedExpenseParams) => {
            mockShowModifiedExpenseNotification(params);
        },
        showCommentNotification: (...args: Parameters<LocalNotificationModule['showCommentNotification']>) => {
            mockShowCommentNotification(...args);
        },
        showUpdateAvailableNotification: jest.fn(),
        clearReportNotifications: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getFocusedReportId: jest.fn(() => 'other-report-id'),
        navigate: jest.fn(),
    },
}));

jest.mock('@libs/Visibility', () => ({
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
const REPORT_ATTRIBUTES = createMock<ReportAttributesDerivedValue['reports']>({someReportKey: {reportName: 'Test Report'}});

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
            undefined,
            CURRENT_USER_ACCOUNT_ID,
            CURRENT_USER_LOGIN,
            formatPhoneNumber,
            REPORT_ATTRIBUTES,
        );
        await waitForBatchedUpdates();

        expect(mockShowModifiedExpenseNotification).toHaveBeenCalledTimes(1);
        const callArgs = mockShowModifiedExpenseNotification.mock.calls.at(0)?.at(0);
        if (!callArgs) {
            throw new Error('Modified expense notification arguments are missing');
        }
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

        Report.showReportActionNotification(
            REPORT_ID,
            reportAction as Parameters<typeof Report.showReportActionNotification>[1],
            undefined,
            CURRENT_USER_ACCOUNT_ID,
            CURRENT_USER_LOGIN,
            formatPhoneNumber,
            undefined,
        );
        await waitForBatchedUpdates();

        expect(mockShowModifiedExpenseNotification).toHaveBeenCalledTimes(1);
        const callArgs = mockShowModifiedExpenseNotification.mock.calls.at(0)?.at(0);
        if (!callArgs) {
            throw new Error('Modified expense notification arguments are missing');
        }
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
            undefined,
            CURRENT_USER_ACCOUNT_ID,
            CURRENT_USER_LOGIN,
            formatPhoneNumber,
            REPORT_ATTRIBUTES,
        );
        await waitForBatchedUpdates();

        expect(mockShowCommentNotification).toHaveBeenCalledTimes(1);
        expect(mockShowModifiedExpenseNotification).not.toHaveBeenCalled();
    });
});
