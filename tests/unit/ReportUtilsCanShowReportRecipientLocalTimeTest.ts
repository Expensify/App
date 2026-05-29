import {canShowReportRecipientLocalTime} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

const CURRENT_USER_ACCOUNT_ID = 1;
const RECIPIENT_ACCOUNT_ID = 2;
const PARTICIPANT_ACCOUNT_ID = 3;
const REPORT_ID = '1';

function buildReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        participants: {
            [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            [RECIPIENT_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        },
        ...overrides,
    } as Report;
}

function buildRecipientPersonalDetails(overrides: Partial<PersonalDetailsList[number]> = {}): PersonalDetailsList {
    return {
        [RECIPIENT_ACCOUNT_ID]: {
            accountID: RECIPIENT_ACCOUNT_ID,
            login: 'user@example.com',
            displayName: 'User',
            validated: true,
            timezone: {automatic: true, selected: 'America/New_York'},
            ...overrides,
        },
    };
}

describe('canShowReportRecipientLocalTime', () => {
    it('returns true for a validated 1:1 chat recipient with a selected timezone', () => {
        const report = buildReport();
        const personalDetails = buildRecipientPersonalDetails();

        expect(canShowReportRecipientLocalTime(personalDetails, report, CURRENT_USER_ACCOUNT_ID)).toBe(true);
    });

    it('returns false when recipient personal details are missing', () => {
        const report = buildReport();

        expect(canShowReportRecipientLocalTime(undefined, report, CURRENT_USER_ACCOUNT_ID)).toBe(false);
    });

    it('returns false when recipient is not validated', () => {
        const report = buildReport();
        const personalDetails = buildRecipientPersonalDetails({validated: false});

        expect(canShowReportRecipientLocalTime(personalDetails, report, CURRENT_USER_ACCOUNT_ID)).toBe(false);
    });

    it('returns false when recipient has no selected timezone', () => {
        const report = buildReport();
        const personalDetails = buildRecipientPersonalDetails({timezone: {automatic: true}});

        expect(canShowReportRecipientLocalTime(personalDetails, report, CURRENT_USER_ACCOUNT_ID)).toBe(false);
    });

    it('returns false for group chats with multiple other participants', () => {
        const report = buildReport({
            participants: {
                [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [RECIPIENT_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [PARTICIPANT_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
        });
        const personalDetails = buildRecipientPersonalDetails();

        expect(canShowReportRecipientLocalTime(personalDetails, report, CURRENT_USER_ACCOUNT_ID)).toBe(false);
    });

    it('returns false for policy rooms', () => {
        const report = buildReport({chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM});
        const personalDetails = buildRecipientPersonalDetails();

        expect(canShowReportRecipientLocalTime(personalDetails, report, CURRENT_USER_ACCOUNT_ID)).toBe(false);
    });

    it('returns false for policy expense chats', () => {
        const report = buildReport({chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT});
        const personalDetails = buildRecipientPersonalDetails();

        expect(canShowReportRecipientLocalTime(personalDetails, report, CURRENT_USER_ACCOUNT_ID)).toBe(false);
    });
});
