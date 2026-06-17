import Onyx from 'react-native-onyx';
import {getIsP2PForAmount, getReportOrReportDraftForAmount} from '@pages/iou/request/step/AmountSubmission';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 5;
const OTHER_USER_ACCOUNT_ID = 10;

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    navigationRef: {
        getCurrentRoute: jest.fn(() => undefined),
    },
}));

describe('AmountSubmission', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('getReportOrReportDraftForAmount', () => {
        it('returns undefined when reportID is undefined', () => {
            expect(getReportOrReportDraftForAmount(undefined)).toBeUndefined();
        });

        it('returns undefined when reportID is an empty string', () => {
            expect(getReportOrReportDraftForAmount('')).toBeUndefined();
        });

        it('returns the report from COLLECTION.REPORT when it exists', async () => {
            const reportID = 'report-1';
            const testReport: Report = {...createRandomReport(1, undefined), reportID};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, testReport);
            await waitForBatchedUpdates();

            const result = getReportOrReportDraftForAmount(reportID);
            expect(result?.reportID).toBe(reportID);
        });

        it('falls back to COLLECTION.REPORT_DRAFT when not in REPORT', async () => {
            const reportID = 'draft-1';
            const draftReport: Report = {...createRandomReport(2, undefined), reportID};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, draftReport);
            await waitForBatchedUpdates();

            const result = getReportOrReportDraftForAmount(reportID);
            expect(result?.reportID).toBe(reportID);
        });

        it('prefers COLLECTION.REPORT over COLLECTION.REPORT_DRAFT when both have the reportID', async () => {
            const reportID = 'both-1';
            const realReport: Report = {...createRandomReport(3, undefined), reportID, reportName: 'real'};
            const draftReport: Report = {...createRandomReport(4, undefined), reportID, reportName: 'draft'};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, realReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, draftReport);
            await waitForBatchedUpdates();

            const result = getReportOrReportDraftForAmount(reportID);
            expect(result?.reportName).toBe('real');
        });

        it('returns undefined when neither collection has the reportID', () => {
            expect(getReportOrReportDraftForAmount('nonexistent')).toBeUndefined();
        });
    });

    describe('getIsP2PForAmount', () => {
        it('returns true for a P2P chat with another participant', () => {
            const p2pChat: Report = {
                ...createRandomReport(11, undefined),
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [OTHER_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const result = getIsP2PForAmount({chatReportForP2P: p2pChat, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            expect(result).toBe(true);
        });

        it('returns false for a self-DM', () => {
            const selfDMChat: Report = createRandomReport(12, CONST.REPORT.CHAT_TYPE.SELF_DM);

            const result = getIsP2PForAmount({chatReportForP2P: selfDMChat, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            expect(result).toBe(false);
        });

        it('returns false for a policy expense chat', () => {
            const policyExpenseChat: Report = createRandomReport(13, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

            const result = getIsP2PForAmount({chatReportForP2P: policyExpenseChat, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            expect(result).toBe(false);
        });

        it('returns false when chatReportForP2P is undefined', () => {
            const result = getIsP2PForAmount({chatReportForP2P: undefined, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            expect(result).toBe(false);
        });

        it('returns false when the chat report only contains the current user as participant', () => {
            const soloReport: Report = {
                ...createRandomReport(14, undefined),
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const result = getIsP2PForAmount({chatReportForP2P: soloReport, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            expect(result).toBe(false);
        });
    });
});
