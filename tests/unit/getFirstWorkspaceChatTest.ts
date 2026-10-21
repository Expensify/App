import {getFirstWorkspaceChat, getWorkspaceChats} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

const POLICY_ID = 'ABC123';
const ACCOUNT_ID = 1;

const reports: OnyxCollection<Report> = {
    [`${ONYXKEYS.COLLECTION.REPORT}1`]: {reportID: '1', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM, policyID: POLICY_ID, ownerAccountID: ACCOUNT_ID},
    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {reportID: '2', chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID: 'OTHER', ownerAccountID: ACCOUNT_ID},
    [`${ONYXKEYS.COLLECTION.REPORT}3`]: {reportID: '3', chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID: POLICY_ID, ownerAccountID: ACCOUNT_ID},
    [`${ONYXKEYS.COLLECTION.REPORT}4`]: {reportID: '4', chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID: POLICY_ID, ownerAccountID: ACCOUNT_ID},
};

describe('getFirstWorkspaceChat', () => {
    it('returns the same chat as the first result of getWorkspaceChats', () => {
        // Given reports where only some are the user's workspace chats for the policy
        // When the first workspace chat is looked up
        const firstChat = getFirstWorkspaceChat(POLICY_ID, [ACCOUNT_ID], reports);

        // Then it matches what callers used to read from getWorkspaceChats().at(0), so their behavior does not change
        expect(firstChat).toBe(getWorkspaceChats(POLICY_ID, [ACCOUNT_ID], reports).at(0));
        expect(firstChat?.reportID).toBe('3');
    });

    it('returns undefined without a policy ID', () => {
        // Given no active policy
        // When the first workspace chat is looked up
        const firstChat = getFirstWorkspaceChat(undefined, [ACCOUNT_ID], reports);

        // Then nothing is returned, like getWorkspaceChats returns an empty list in that case
        expect(firstChat).toBeUndefined();
    });

    it('returns undefined when no report is a workspace chat of the user', () => {
        // Given workspace chats owned by someone else
        // When the first workspace chat is looked up for the user
        const firstChat = getFirstWorkspaceChat(POLICY_ID, [999], reports);

        // Then nothing is returned
        expect(firstChat).toBeUndefined();
    });
});
