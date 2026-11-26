/* eslint-disable @typescript-eslint/naming-convention -- Test assertions use FullStory's external snake_case keys. */
import CONST from '@src/CONST';
import {getChatFSClass, normalizeFullstoryPropertiesForNative} from '@src/libs/Fullstory/common';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('FullstoryCommon', () => {
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

    it('unmasks a support ticket without Concierge', () => {
        // Given a support ticket opened from Concierge with "Talk to a human", whose participants are the user and a support agent
        const report = createMock<Report>({type: CONST.REPORT.TYPE.SUPPORT_TICKET, participants: {[participantAccountID]: {}, 43: {}}});

        // When Fullstory classifies it
        const result = getChatFSClass(report);

        // Then it's unmasked like a Concierge chat, since it's the user's conversation with Expensify support
        expect(result).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it('unmasks a thread inside a support ticket', async () => {
        // Given a thread whose parent is a support ticket, delivered through the real report collection subscription
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}456`, createMock<Report>({reportID: '456', type: CONST.REPORT.TYPE.SUPPORT_TICKET}));
        await waitForBatchedUpdates();
        const report = createMock<Report>({parentReportID: '456', participants: {[participantAccountID]: {}, 43: {}}});

        // When Fullstory classifies the thread
        const result = getChatFSClass(report);

        // Then it follows the support ticket and stays unmasked
        expect(result).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it('unmasks participants that include Concierge', () => {
        // Given an ordinary chat with Concierge and another participant.
        const report = createMock<Report>({participants: {[CONST.ACCOUNT_ID.CONCIERGE]: {}, [participantAccountID]: {}}});

        // When Fullstory classifies it.
        const result = getChatFSClass(report);

        // Then Concierge allows the chat to be visible.
        expect(result).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it('unmasks the user DM with a custom agent', async () => {
        // Given a DM whose other participant is flagged as a custom agent, which acts as an Expensify system user like Concierge.
        const agentAccountID = 99;
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[agentAccountID]: {accountID: agentAccountID, isCustomAgent: true}});
        await waitForBatchedUpdates();
        const report = createMock<Report>({type: CONST.REPORT.TYPE.CHAT, participants: {[agentAccountID]: {}, [participantAccountID]: {}}});

        // When Fullstory classifies it.
        const result = getChatFSClass(report);

        // Then the agent allows the chat to be visible, the same as Concierge.
        expect(result).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it.each([undefined, CONST.REPORT.CHAT_TYPE.GROUP, CONST.REPORT.CHAT_TYPE.POLICY_ROOM])('masks a chat of type %s between people that a custom agent is in', async (chatType) => {
        // Given a DM-like chat, a group or a room where two people talk and a custom agent was added.
        const agentAccountID = 99;
        const coworkerAccountID = 43;
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[agentAccountID]: {accountID: agentAccountID, isCustomAgent: true}});
        await waitForBatchedUpdates();
        const report = createMock<Report>({
            type: CONST.REPORT.TYPE.CHAT,
            chatType,
            participants: {[agentAccountID]: {}, [participantAccountID]: {}, [coworkerAccountID]: {}},
        });

        // When Fullstory classifies it.
        const result = getChatFSClass(report);

        // Then it stays masked, because the agent only makes the user's DM with it visible, not a conversation between people.
        expect(result).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('masks a chat whose participants have personal details but no custom agent', async () => {
        // Given a DM whose participants are known people, none flagged as a custom agent.
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[participantAccountID]: {accountID: participantAccountID, isCustomAgent: false}});
        await waitForBatchedUpdates();
        const report = createMock<Report>({participants: {[participantAccountID]: {}}});

        // When Fullstory classifies it.
        const result = getChatFSClass(report);

        // Then the chat stays masked, because only Concierge or an agent makes a private chat visible.
        expect(result).toBe(CONST.FULLSTORY.CLASS.MASK);
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
