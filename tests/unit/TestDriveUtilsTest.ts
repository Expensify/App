import getTestDriveAdminRoomReport from '@components/TestDrive/getTestDriveAdminRoomReport';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

const buildReport = (reportID: string, chatType?: string): Report =>
    ({
        reportID,
        type: CONST.REPORT.TYPE.CHAT,
        chatType,
    }) as Report;

describe('getTestDriveAdminRoomReport', () => {
    it('returns the first valid admin room report', () => {
        const taskParentReport = buildReport('1', CONST.REPORT.CHAT_TYPE.POLICY_ADMINS);
        const onboardingReport = buildReport('2', CONST.REPORT.CHAT_TYPE.POLICY_ADMINS);

        expect(getTestDriveAdminRoomReport(taskParentReport, onboardingReport)).toBe(taskParentReport);
    });

    it('falls back to the next admin room when earlier reports are missing or not admin rooms', () => {
        const workspaceChat = buildReport('1', CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        const onboardingAdminsReport = buildReport('2', CONST.REPORT.CHAT_TYPE.POLICY_ADMINS);

        expect(getTestDriveAdminRoomReport(undefined, workspaceChat, onboardingAdminsReport)).toBe(onboardingAdminsReport);
    });

    it('does not treat report 0 as a valid admin room target', () => {
        const invalidAdminRoom = buildReport(CONST.DEFAULT_NUMBER_ID.toString(), CONST.REPORT.CHAT_TYPE.POLICY_ADMINS);

        expect(getTestDriveAdminRoomReport(invalidAdminRoom)).toBeUndefined();
    });
});
