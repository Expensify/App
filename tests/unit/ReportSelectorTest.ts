import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {createMoveExpenseReportNVPSelector, getStableReportSelector, policyChatRoomsSelector, policyExpenseChatSelector} from '@src/selectors/Report';
import type {Report} from '@src/types/onyx';

describe('policyChatRoomsSelector', () => {
    const REPORT_KEY_PREFIX = ONYXKEYS.COLLECTION.REPORT;
    const REPORT_NVP_KEY_PREFIX = ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS;
    const policyID = 'policy1';
    const otherPolicyID = 'policy2';
    const emptyReportNameValuePairs = {};

    const policyRoom = {reportID: '1', policyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM} as Report;
    const policyAdmins = {reportID: '2', policyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS} as Report;
    const policyExpenseChat = {reportID: '3', policyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT} as Report;
    const invoiceRoom = {reportID: '4', policyID, chatType: CONST.REPORT.CHAT_TYPE.INVOICE} as Report;
    const otherPolicyRoom = {reportID: '5', policyID: otherPolicyID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM} as Report;
    const selfDM = {reportID: '6', policyID, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM} as Report;
    const groupChat = {reportID: '7', policyID, chatType: CONST.REPORT.CHAT_TYPE.GROUP} as Report;
    const expenseReport = {reportID: '8', policyID, type: CONST.REPORT.TYPE.EXPENSE} as Report;

    it('returns an empty array when policyID is undefined', () => {
        expect(policyChatRoomsSelector(undefined, emptyReportNameValuePairs)({[`${REPORT_KEY_PREFIX}1`]: policyRoom})).toEqual([]);
    });

    it('returns an empty array when reports is undefined', () => {
        expect(policyChatRoomsSelector(policyID, emptyReportNameValuePairs)(undefined)).toEqual([]);
    });

    it('returns an empty array when no reports match the policyID', () => {
        const reports = {[`${REPORT_KEY_PREFIX}5`]: otherPolicyRoom};
        expect(policyChatRoomsSelector(policyID, emptyReportNameValuePairs)(reports)).toEqual([]);
    });

    it('includes chat rooms and policy expense chats for the given policy', () => {
        const reports = {
            [`${REPORT_KEY_PREFIX}1`]: policyRoom,
            [`${REPORT_KEY_PREFIX}2`]: policyAdmins,
            [`${REPORT_KEY_PREFIX}3`]: policyExpenseChat,
            [`${REPORT_KEY_PREFIX}4`]: invoiceRoom,
        };
        const result = policyChatRoomsSelector(policyID, emptyReportNameValuePairs)(reports);
        expect(result).toHaveLength(4);
        expect(result.map((report) => report.reportID).sort()).toEqual(['1', '2', '3', '4']);
    });

    it('excludes reports that are not chat rooms or policy expense chats', () => {
        const reports = {
            [`${REPORT_KEY_PREFIX}6`]: selfDM,
            [`${REPORT_KEY_PREFIX}7`]: groupChat,
            [`${REPORT_KEY_PREFIX}8`]: expenseReport,
        };
        expect(policyChatRoomsSelector(policyID, emptyReportNameValuePairs)(reports)).toEqual([]);
    });

    it('excludes reports belonging to a different policy', () => {
        const reports = {
            [`${REPORT_KEY_PREFIX}1`]: policyRoom,
            [`${REPORT_KEY_PREFIX}5`]: otherPolicyRoom,
        };
        const result = policyChatRoomsSelector(policyID, emptyReportNameValuePairs)(reports);
        expect(result).toEqual([policyRoom]);
    });

    it('skips missing entries in the collection', () => {
        const reports = {
            [`${REPORT_KEY_PREFIX}1`]: policyRoom,
            [`${REPORT_KEY_PREFIX}_missing`]: undefined,
        };
        const result = policyChatRoomsSelector(policyID, emptyReportNameValuePairs)(reports);
        expect(result).toEqual([policyRoom]);
    });

    it('excludes archived reports', () => {
        const reports = {
            [`${REPORT_KEY_PREFIX}1`]: policyRoom,
            [`${REPORT_KEY_PREFIX}2`]: policyAdmins,
        };
        const archivedReportNameValuePairs = {[`${REPORT_NVP_KEY_PREFIX}1`]: {private_isArchived: '2024-01-01'}};
        const result = policyChatRoomsSelector(policyID, archivedReportNameValuePairs)(reports);
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
        const result = policyChatRoomsSelector(policyID, emptyReportNameValuePairs)(reports);
        expect(result).toEqual([policyAdmins]);
    });
});

describe('createMoveExpenseReportNVPSelector', () => {
    const currentReport = {reportID: '1'} as Report;
    const outstandingReport = {reportID: '2'} as Report;
    const nonArchivedOutstandingReport = {reportID: '3'} as Report;
    const archivedAt = '2024-01-01';
    const outstandingReportsByPolicyID = {
        policy1: {
            [`${ONYXKEYS.COLLECTION.REPORT}${outstandingReport.reportID}`]: outstandingReport,
            [`${ONYXKEYS.COLLECTION.REPORT}${nonArchivedOutstandingReport.reportID}`]: nonArchivedOutstandingReport,
        },
    };

    it('selects archived NVPs for current and outstanding reports only', () => {
        const currentReportNVPKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${currentReport.reportID}`;
        const outstandingReportNVPKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${outstandingReport.reportID}`;
        const unrelatedReportNVPKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}4`;
        const reportNameValuePairs = {
            [currentReportNVPKey]: {private_isArchived: archivedAt},
            [outstandingReportNVPKey]: {private_isArchived: archivedAt},
            [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${nonArchivedOutstandingReport.reportID}`]: {},
            [unrelatedReportNVPKey]: {private_isArchived: archivedAt},
        };

        expect(createMoveExpenseReportNVPSelector(outstandingReportsByPolicyID, currentReport.reportID)(reportNameValuePairs)).toEqual({
            [currentReportNVPKey]: {private_isArchived: archivedAt},
            [outstandingReportNVPKey]: {private_isArchived: archivedAt},
        });
    });
});

describe('getStableReportSelector', () => {
    const {READ, WRITE, SHARE} = CONST.REPORT.PERMISSIONS;

    it('returns the same permissions reference for content-equal but referentially-new arrays', () => {
        // Onyx merge replaces arrays wholesale even when content is identical, so consecutive
        // report pushes deliver new `permissions` instances. The projection must intern them,
        // otherwise its shallow equality breaks and subscribed subtrees re-render for no reason.
        const first = getStableReportSelector({reportID: '1', permissions: [READ, WRITE]} as Report);
        const second = getStableReportSelector({reportID: '1', permissions: [READ, WRITE]} as Report);
        expect(second?.permissions).toBe(first?.permissions);
    });

    it('shares the interned permissions instance across different reports', () => {
        const first = getStableReportSelector({reportID: '1', permissions: [READ, WRITE]} as Report);
        const second = getStableReportSelector({reportID: '2', permissions: [READ, WRITE]} as Report);
        expect(second?.permissions).toBe(first?.permissions);
    });

    it('returns a different permissions reference when content differs', () => {
        const first = getStableReportSelector({reportID: '1', permissions: [READ, WRITE]} as Report);
        const second = getStableReportSelector({reportID: '1', permissions: [READ, WRITE, SHARE]} as Report);
        expect(second?.permissions).not.toBe(first?.permissions);
        expect(second?.permissions).toEqual([READ, WRITE, SHARE]);
    });

    it('passes undefined permissions through', () => {
        expect(getStableReportSelector({reportID: '1'} as Report)?.permissions).toBeUndefined();
    });
});
describe('policyExpenseChatSelector', () => {
    const REPORT_KEY_PREFIX = ONYXKEYS.COLLECTION.REPORT;
    const ownerAccountID = 1;
    const policyID = 'policy1';

    const policyExpenseChat = {
        reportID: '1',
        policyID,
        ownerAccountID,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        type: CONST.REPORT.TYPE.CHAT,
    } as Report;

    it('returns undefined when ownerAccountID is undefined', () => {
        const reports = {[`${REPORT_KEY_PREFIX}1`]: policyExpenseChat};
        expect(policyExpenseChatSelector(undefined, policyID)(reports)).toBeUndefined();
    });

    it('returns undefined when policyID is undefined', () => {
        const reports = {[`${REPORT_KEY_PREFIX}1`]: policyExpenseChat};
        expect(policyExpenseChatSelector(ownerAccountID, undefined)(reports)).toBeUndefined();
    });

    it('returns the matching policy expense chat', () => {
        const reports = {[`${REPORT_KEY_PREFIX}1`]: policyExpenseChat};
        expect(policyExpenseChatSelector(ownerAccountID, policyID)(reports)?.reportID).toBe('1');
    });

    it('skips thread reports', () => {
        const threadReport = {
            ...policyExpenseChat,
            reportID: '2',
            parentReportID: '1',
            parentReportActionID: 'action1',
        } as Report;
        const reports = {[`${REPORT_KEY_PREFIX}2`]: threadReport};
        expect(policyExpenseChatSelector(ownerAccountID, policyID)(reports)).toBeUndefined();
    });

    it('skips reports with different ownerAccountID', () => {
        const otherOwnerReport = {...policyExpenseChat, reportID: '3', ownerAccountID: 999} as Report;
        const reports = {[`${REPORT_KEY_PREFIX}3`]: otherOwnerReport};
        expect(policyExpenseChatSelector(ownerAccountID, policyID)(reports)).toBeUndefined();
    });

    it('skips reports with different policyID', () => {
        const otherPolicyReport = {...policyExpenseChat, reportID: '4', policyID: 'other'} as Report;
        const reports = {[`${REPORT_KEY_PREFIX}4`]: otherPolicyReport};
        expect(policyExpenseChatSelector(ownerAccountID, policyID)(reports)).toBeUndefined();
    });

    it('returns the policy expense chat even when mixed with task reports', () => {
        const taskReport = {
            ...policyExpenseChat,
            reportID: '10',
            type: CONST.REPORT.TYPE.TASK,
            parentReportID: '1',
            parentReportActionID: 'action1',
        } as Report;
        const reports = {
            [`${REPORT_KEY_PREFIX}10`]: taskReport,
            [`${REPORT_KEY_PREFIX}1`]: policyExpenseChat,
        };
        expect(policyExpenseChatSelector(ownerAccountID, policyID)(reports)?.reportID).toBe('1');
    });

    it('returns undefined when reports is undefined', () => {
        expect(policyExpenseChatSelector(ownerAccountID, policyID)(undefined)).toBeUndefined();
    });
});
