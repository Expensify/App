import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {policyChatRoomsSelector} from '@src/selectors/Report';
import type {Report} from '@src/types/onyx';

describe('policyChatRoomsSelector', () => {
    const REPORT_KEY_PREFIX = ONYXKEYS.COLLECTION.REPORT;
    const REPORT_NVP_KEY_PREFIX = ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS;
    const policyID = 'policy1';
    const otherPolicyID = 'policy2';
    const emptyArchivedSet = new Set<string>();

    const policyRoom = {reportID: '1', policyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM} as Report;
    const policyAdmins = {reportID: '2', policyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS} as Report;
    const policyExpenseChat = {reportID: '3', policyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT} as Report;
    const invoiceRoom = {reportID: '4', policyID, chatType: CONST.REPORT.CHAT_TYPE.INVOICE} as Report;
    const otherPolicyRoom = {reportID: '5', policyID: otherPolicyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM} as Report;
    const selfDM = {reportID: '6', policyID, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM} as Report;
    const groupChat = {reportID: '7', policyID, chatType: CONST.REPORT.CHAT_TYPE.GROUP} as Report;
    const expenseReport = {reportID: '8', policyID, type: CONST.REPORT.TYPE.EXPENSE} as Report;

    it('returns an empty array when policyID is undefined', () => {
        expect(policyChatRoomsSelector(undefined, emptyArchivedSet)({[`${REPORT_KEY_PREFIX}1`]: policyRoom})).toEqual([]);
    });

    it('returns an empty array when reports is undefined', () => {
        expect(policyChatRoomsSelector(policyID, emptyArchivedSet)(undefined)).toEqual([]);
    });

    it('returns an empty array when no reports match the policyID', () => {
        const reports = {[`${REPORT_KEY_PREFIX}5`]: otherPolicyRoom};
        expect(policyChatRoomsSelector(policyID, emptyArchivedSet)(reports)).toEqual([]);
    });

    it('includes chat rooms and policy expense chats for the given policy', () => {
        const reports = {
            [`${REPORT_KEY_PREFIX}1`]: policyRoom,
            [`${REPORT_KEY_PREFIX}2`]: policyAdmins,
            [`${REPORT_KEY_PREFIX}3`]: policyExpenseChat,
            [`${REPORT_KEY_PREFIX}4`]: invoiceRoom,
        };
        const result = policyChatRoomsSelector(policyID, emptyArchivedSet)(reports);
        expect(result).toHaveLength(4);
        expect(result.map((report) => report.reportID).sort()).toEqual(['1', '2', '3', '4']);
    });

    it('excludes reports that are not chat rooms or policy expense chats', () => {
        const reports = {
            [`${REPORT_KEY_PREFIX}6`]: selfDM,
            [`${REPORT_KEY_PREFIX}7`]: groupChat,
            [`${REPORT_KEY_PREFIX}8`]: expenseReport,
        };
        expect(policyChatRoomsSelector(policyID, emptyArchivedSet)(reports)).toEqual([]);
    });

    it('excludes reports belonging to a different policy', () => {
        const reports = {
            [`${REPORT_KEY_PREFIX}1`]: policyRoom,
            [`${REPORT_KEY_PREFIX}5`]: otherPolicyRoom,
        };
        const result = policyChatRoomsSelector(policyID, emptyArchivedSet)(reports);
        expect(result).toEqual([policyRoom]);
    });

    it('skips missing entries in the collection', () => {
        const reports = {
            [`${REPORT_KEY_PREFIX}1`]: policyRoom,
            [`${REPORT_KEY_PREFIX}_missing`]: undefined,
        };
        const result = policyChatRoomsSelector(policyID, emptyArchivedSet)(reports);
        expect(result).toEqual([policyRoom]);
    });

    it('excludes archived reports', () => {
        const reports = {
            [`${REPORT_KEY_PREFIX}1`]: policyRoom,
            [`${REPORT_KEY_PREFIX}2`]: policyAdmins,
        };
        const archivedSet = new Set([`${REPORT_NVP_KEY_PREFIX}1`]);
        const result = policyChatRoomsSelector(policyID, archivedSet)(reports);
        expect(result).toEqual([policyAdmins]);
    });

    it('excludes rooms the user has left (closed reports)', () => {
        const leftRoom = {
            reportID: '1',
            policyID,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
        } as Report;
        const reports = {
            [`${REPORT_KEY_PREFIX}1`]: leftRoom,
            [`${REPORT_KEY_PREFIX}2`]: policyAdmins,
        };
        const result = policyChatRoomsSelector(policyID, emptyArchivedSet)(reports);
        expect(result).toEqual([policyAdmins]);
    });
});
