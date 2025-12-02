import Onyx from 'react-native-onyx';
import ContextMenuActions from '@pages/home/report/ContextMenu/ContextMenuActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';

jest.mock('@components/Icon/Expensicons');

describe('ContextMenuActions', () => {
    const currentUserAccountID = 5;
    const currentUserEmail = 'owner@expensify.com';

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('hides leave thread option for thread owner', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [currentUserAccountID]: {accountID: currentUserAccountID},
        });

        const childReport: Report = {
            ...createRandomReport(1, undefined),
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: 'parent-report-id',
            parentReportActionID: 'parent-action-id',
            ownerAccountID: currentUserAccountID,
        };

        const reportAction: ReportAction = {
            ...createRandomReportAction(1),
            childReportID: childReport.reportID,
            childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            actorAccountID: currentUserAccountID,
        };

        const leaveAction = ContextMenuActions.find((action) => 'textTranslateKey' in action && action.textTranslateKey === 'reportActionContextMenu.leaveThread');

        expect(
            leaveAction?.shouldShow({
                type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
                reportAction,
                childReportActions: {},
                isArchivedRoom: false,
                childReport,
                betas: [],
                menuTarget: undefined,
                isChronosReport: false,
                reportID: childReport.parentReportID,
                isPinnedChat: false,
                isUnreadChat: false,
                isThreadReportParentAction: false,
                isOffline: false,
                isMini: false,
                isProduction: true,
                moneyRequestAction: undefined,
                moneyRequestReport: undefined,
                moneyRequestPolicy: undefined,
                areHoldRequirementsMet: false,
                isDebugModeEnabled: false,
                iouTransaction: undefined,
                transactions: {},
            }),
        ).toBe(false);
    });
});
