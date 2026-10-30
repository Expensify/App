/* eslint-disable @typescript-eslint/naming-convention -- Test assertions use FullStory's external snake_case keys. */
import CONST from '@src/CONST';
import {getChatFSClass, normalizeFullstoryPropertiesForNative} from '@src/libs/Fullstory/common';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {createMockReport} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('FullstoryCommon', () => {
    afterEach(async () => {
        await Onyx.clear();
    });

    it('masks self DMs before considering allowed report types', () => {
        // Given a self DM with an otherwise allowed report type
        const report = createMockReport({chatType: CONST.REPORT.CHAT_TYPE.SELF_DM, type: CONST.REPORT.TYPE.IOU});
        // When the shared Fullstory classifier evaluates the report
        const fsClass = getChatFSClass(report);
        // Then self DM privacy takes priority
        expect(fsClass).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('unmasks allowed chat and report types but masks an unknown type with ordinary participants', () => {
        // Given allowed chat and report types alongside a valid unknown string type
        const allowedChat = createMockReport({chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS});
        const allowedReport = createMockReport({type: CONST.REPORT.TYPE.EXPENSE});
        const unknownReport = createMockReport({type: 'custom', participants: {'123': {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}}});
        // When the shared classifier checks each report
        // Then only the unknown report with ordinary participants stays masked
        expect(getChatFSClass(allowedChat)).toBe(CONST.FULLSTORY.CLASS.UNMASK);
        expect(getChatFSClass(allowedReport)).toBe(CONST.FULLSTORY.CLASS.UNMASK);
        expect(getChatFSClass(unknownReport)).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('unmasks an unknown type when its Onyx parent is an invoice', async () => {
        // Given an allowed parent stored under its real Onyx collection key
        const parentReport = createMockReport({reportID: 'parent', type: CONST.REPORT.TYPE.INVOICE});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`, parentReport);
        await waitForBatchedUpdates();
        const childReport = createMockReport({
            type: 'custom',
            parentReportID: parentReport.reportID,
            participants: {'123': {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
        });
        // When the shared classifier reads the parent through its subscription
        const fsClass = getChatFSClass(childReport);
        // Then the allowed parent unmasks the child
        expect(fsClass).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it('unmasks Concierge chats and missing reports', () => {
        // Given a chat with Concierge and an absent report
        const conciergeReport = createMockReport({participants: {[CONST.ACCOUNT_ID.CONCIERGE]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}}});
        // When the shared classifier evaluates both
        // Then both remain unmasked
        expect(getChatFSClass(conciergeReport)).toBe(CONST.FULLSTORY.CLASS.UNMASK);
        expect(getChatFSClass(undefined)).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });
    it('normalizes FullStory properties for native V1 APIs', () => {
        const freeTrialEndDate = new Date('2099-05-31T23:59:59Z');

        expect(
            normalizeFullstoryPropertiesForNative(
                {
                    account_type: 'business',
                    workspace_count: 3,
                    paid_member: true,
                    free_trial_end_date: freeTrialEndDate,
                    displayName: 'Jane Doe',
                    email: 'jane@example.com',
                    optional_value: undefined,
                },
                {
                    preserveKeys: ['displayName', 'email'],
                },
            ),
        ).toEqual({
            account_type_str: 'business',
            workspace_count_real: 3,
            paid_member_bool: true,
            free_trial_end_date_date: freeTrialEndDate.toISOString(),
            displayName: 'Jane Doe',
            email: 'jane@example.com',
        });
    });
});

describe('getChatFSClass', () => {
    const participantAccountID = 42;
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it.each([undefined, null])('unmasks an absent report (%s)', (report) => {
        // Given no report while Onyx is loading.
        // When Fullstory classifies the chat element.
        const result = getChatFSClass(report);

        // Then absence keeps the default unmasked class.
        expect(result).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it('masks a self DM before considering its financial type', () => {
        // Given a self DM whose type would otherwise be unmasked.
        const report = createMock<Report>({chatType: CONST.REPORT.CHAT_TYPE.SELF_DM, type: CONST.REPORT.TYPE.EXPENSE});

        // When Fullstory classifies it.
        const result = getChatFSClass(report);

        // Then the privacy rule for self DMs takes precedence.
        expect(result).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it.each([CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, CONST.REPORT.CHAT_TYPE.INVOICE])(
        'unmasks allowed chat type %s without Concierge',
        (chatType) => {
            // Given a workspace chat with an ordinary participant.
            const report = createMock<Report>({chatType, participants: {[participantAccountID]: {}}});

            // When Fullstory classifies it.
            const result = getChatFSClass(report);

            // Then the allowed chat type takes precedence over participant masking.
            expect(result).toBe(CONST.FULLSTORY.CLASS.UNMASK);
        },
    );

    it.each([CONST.REPORT.TYPE.IOU, CONST.REPORT.TYPE.EXPENSE, CONST.REPORT.TYPE.INVOICE])('unmasks financial report type %s', (type) => {
        // Given a financial report without Concierge.
        const report = createMock<Report>({type, participants: {[participantAccountID]: {}}});

        // When Fullstory classifies it.
        const result = getChatFSClass(report);

        // Then all three financial report types remain visible.
        expect(result).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it.each([CONST.REPORT.TYPE.IOU, CONST.REPORT.TYPE.EXPENSE, CONST.REPORT.TYPE.INVOICE])('unmasks a child of financial report type %s', async (type) => {
        // Given a parent delivered through the real report collection subscription.
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}123`, createMock<Report>({reportID: '123', type}));
        await waitForBatchedUpdates();
        const report = createMock<Report>({parentReportID: '123', participants: {[participantAccountID]: {}}});

        // When Fullstory classifies the child.
        const result = getChatFSClass(report);

        // Then the parent classification precedes participant masking.
        expect(result).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it.each(['unknown', '', undefined])('falls back to participants for type %s', async (type) => {
        // Given neither the report nor its parent has a financial type.
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}123`, createMock<Report>({reportID: '123', type}));
        await waitForBatchedUpdates();
        const report = createMock<Report>({type, parentReportID: '123', participants: {[participantAccountID]: {}}});

        // When Fullstory classifies it without Concierge.
        const result = getChatFSClass(report);

        // Then an unrecognized, empty or absent type cannot bypass masking.
        expect(result).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('unmasks participants that include Concierge', () => {
        // Given an ordinary chat with Concierge and another participant.
        const report = createMock<Report>({participants: {[CONST.ACCOUNT_ID.CONCIERGE]: {}, [participantAccountID]: {}}});

        // When Fullstory classifies it.
        const result = getChatFSClass(report);

        // Then Concierge allows the chat to be visible.
        expect(result).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it.each([{}, {participants: {}}])('unmasks a report with no participants (%j)', (fields) => {
        // Given a report without participant data.
        const report = createMock<Report>(fields);

        // When Fullstory classifies it.
        const result = getChatFSClass(report);

        // Then the final default remains unmasked.
        expect(result).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });
});
