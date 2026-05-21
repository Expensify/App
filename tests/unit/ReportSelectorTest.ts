import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {policyChatRoomsSelector} from '@src/selectors/Report';
import type {Report} from '@src/types/onyx';

describe('policyChatRoomsSelector', () => {
    const R = ONYXKEYS.COLLECTION.REPORT;
    const policyID = 'policy1';
    const otherPolicyID = 'policy2';

    const policyRoom = {reportID: '1', policyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM} as Report;
    const policyAdmins = {reportID: '2', policyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS} as Report;
    const policyExpenseChat = {reportID: '3', policyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT} as Report;
    const invoiceRoom = {reportID: '4', policyID, chatType: CONST.REPORT.CHAT_TYPE.INVOICE} as Report;
    const otherPolicyRoom = {reportID: '5', policyID: otherPolicyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM} as Report;
    const selfDM = {reportID: '6', policyID, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM} as Report;
    const groupChat = {reportID: '7', policyID, chatType: CONST.REPORT.CHAT_TYPE.GROUP} as Report;
    const expenseReport = {reportID: '8', policyID, type: CONST.REPORT.TYPE.EXPENSE} as Report;

    it('returns an empty array when policyID is undefined', () => {
        expect(policyChatRoomsSelector(undefined)({[`${R}1`]: policyRoom})).toEqual([]);
    });

    it('returns an empty array when reports is undefined', () => {
        expect(policyChatRoomsSelector(policyID)(undefined)).toEqual([]);
    });

    it('returns an empty array when no reports match the policyID', () => {
        const reports = {[`${R}5`]: otherPolicyRoom};
        expect(policyChatRoomsSelector(policyID)(reports)).toEqual([]);
    });

    it('includes chat rooms and policy expense chats for the given policy', () => {
        const reports = {
            [`${R}1`]: policyRoom,
            [`${R}2`]: policyAdmins,
            [`${R}3`]: policyExpenseChat,
            [`${R}4`]: invoiceRoom,
        };
        const result = policyChatRoomsSelector(policyID)(reports);
        expect(result).toHaveLength(4);
        expect(result.map((report) => report.reportID).sort()).toEqual(['1', '2', '3', '4']);
    });

    it('excludes reports that are not chat rooms or policy expense chats', () => {
        const reports = {
            [`${R}6`]: selfDM,
            [`${R}7`]: groupChat,
            [`${R}8`]: expenseReport,
        };
        expect(policyChatRoomsSelector(policyID)(reports)).toEqual([]);
    });

    it('excludes reports belonging to a different policy', () => {
        const reports = {
            [`${R}1`]: policyRoom,
            [`${R}5`]: otherPolicyRoom,
        };
        const result = policyChatRoomsSelector(policyID)(reports);
        expect(result).toEqual([policyRoom]);
    });

    it('skips missing entries in the collection', () => {
        const reports = {
            [`${R}1`]: policyRoom,
            [`${R}_missing`]: undefined,
        };
        const result = policyChatRoomsSelector(policyID)(reports);
        expect(result).toEqual([policyRoom]);
    });
});
