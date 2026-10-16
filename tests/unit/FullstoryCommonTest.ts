import CONST from '@src/CONST';
import {getChatFSClass, normalizeFullstoryPropertiesForNative} from '@src/libs/Fullstory/common';
import ONYXKEYS from '@src/ONYXKEYS';

/* eslint-disable @typescript-eslint/naming-convention -- Test assertions use FullStory's external snake_case keys. */
import Onyx from 'react-native-onyx';

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
