import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportActionAvatars from '@components/ReportActionAvatars/useReportActionAvatars';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {
    createAdminRoom,
    createDomainRoom,
    createExpenseReport,
    createExpenseRequestReport,
    createGroupChat,
    createInvoiceReport,
    createInvoiceRoom,
    createPolicyExpenseChat,
    createPolicyExpenseChatThread,
    createRegularChat,
    createRegularTaskReport,
    createSelfDM,
    createWorkspaceTaskReport,
    createWorkspaceThread,
} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockPolicyID = '123456';
const invoiceReportRoomID = 123;
const invoiceReportID = 234;
const invoiceReportActionID = 345;

const mockPolicy = {...createRandomPolicy(Number(mockPolicyID), CONST.POLICY.TYPE.TEAM, 'TestPolicy'), policyID: mockPolicyID};
const mockInvoiceRoom = {...createInvoiceRoom(invoiceReportRoomID), policyID: mockPolicyID};
const mockInvoiceReport = {...createInvoiceReport(invoiceReportID), chatReportID: invoiceReportRoomID.toString(), policyID: mockPolicyID};
const mockReportAction = createRandomReportAction(invoiceReportActionID);

const wrapper = ({children}: {children: React.ReactNode}) => {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
};

describe('useReportActionAvatars', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    describe('isWorkspaceActor', () => {
        beforeEach(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockInvoiceRoom?.reportID}`, mockInvoiceRoom);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockInvoiceReport?.reportID}`, mockInvoiceReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, mockPolicy);
        });

        afterEach(() => {
            Onyx.clear();
        });

        test.each(
            Object.values(CONST.REPORT.ACTIONS.TYPE)
                .reduce((result, cur) => {
                    if (typeof cur === 'object') {
                        result.push(...Object.values(cur));
                    } else {
                        result.push(cur);
                    }
                    return result;
                }, [] as string[])
                .map((value) => [value === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, value]),
        )('With an invoice report, isWorkspaceActor should be %s when the actionName is "%s"', async (expected, actionName) => {
            const reportAction = {...mockReportAction, actionName: actionName as typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT};
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction.reportActionID}`, {[reportAction.reportActionID]: reportAction});

            const {
                result: {current: data},
            } = renderHook(({report, action}) => useReportActionAvatars({report, action}), {
                initialProps: {report: mockInvoiceReport, action: reportAction},
                wrapper,
            });

            expect(data.details.isWorkspaceActor).toEqual(expected);
        });
    });

    describe('avatarType for LHN reports (no action)', () => {
        const testPolicyID = '500';
        const chatReportForNonChatID = '600';

        beforeEach(async () => {
            /* eslint-disable @typescript-eslint/naming-convention */
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                1: {accountID: 1, login: 'user1@test.com', displayName: 'User One', avatar: ''},
                2: {accountID: 2, login: 'user2@test.com', displayName: 'User Two', avatar: ''},
            });
            /* eslint-enable @typescript-eslint/naming-convention */
            const policy = {...createRandomPolicy(Number(testPolicyID), CONST.POLICY.TYPE.TEAM, 'TestWorkspace'), id: testPolicyID};
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);

            // A non-thread chat report for expense/task/invoice reports to reference via chatReportID
            const chatReport: Report = {
                reportID: chatReportForNonChatID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                parentReportID: undefined,
                parentReportActionID: undefined,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportForNonChatID}`, chatReport);
        });

        afterEach(() => Onyx.clear());

        describe('should return SUBSCRIPT', () => {
            it('for a policy expense chat', async () => {
                const report: Report = {
                    ...createPolicyExpenseChat(701, false),
                    policyID: testPolicyID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            });

            it('for an expense report', async () => {
                const report: Report = {
                    ...createExpenseReport(702),
                    policyID: testPolicyID,
                    chatReportID: chatReportForNonChatID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            });

            it('for a workspace task report', async () => {
                const report: Report = {
                    ...createWorkspaceTaskReport(703, [1, 2], chatReportForNonChatID),
                    policyID: testPolicyID,
                    chatReportID: chatReportForNonChatID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            });

            it('for an invoice room', async () => {
                const report: Report = {
                    ...createInvoiceRoom(704),
                    policyID: testPolicyID,
                    invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 2},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            });

            it('for an invoice report', async () => {
                const invoiceRoom: Report = {
                    ...createInvoiceRoom(705),
                    policyID: testPolicyID,
                    invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 2},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceRoom.reportID}`, invoiceRoom);

                const report: Report = {
                    ...createInvoiceReport(706),
                    policyID: testPolicyID,
                    chatReportID: invoiceRoom.reportID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            });

            it('for an expense request (single expense thread)', async () => {
                // Parent expense report
                const parentExpenseReport: Report = {
                    ...createExpenseReport(710),
                    policyID: testPolicyID,
                    chatReportID: chatReportForNonChatID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentExpenseReport.reportID}`, parentExpenseReport);

                // Parent IOU action in the expense report (transaction thread origin)
                const parentAction = {
                    ...createRandomReportAction(711),
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU as typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentExpenseReport.reportID}`, {
                    [parentAction.reportActionID]: parentAction,
                });

                // Expense request thread report (child of expense report)
                const report: Report = {
                    ...createExpenseRequestReport(712, parentExpenseReport.reportID, parentAction.reportActionID),
                    policyID: testPolicyID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            });

            it('for an invoice room with business receiver', async () => {
                const report: Report = {
                    ...createInvoiceRoom(713),
                    policyID: testPolicyID,
                    invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: '2'},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            });

            it('for an own policy expense chat', async () => {
                const report: Report = {
                    ...createPolicyExpenseChat(714, true),
                    policyID: testPolicyID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            });
        });

        describe('should return SINGLE', () => {
            it('for a 1:1 DM chat', async () => {
                const report: Report = {
                    ...createRegularChat(801, [1, 2]),
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            });

            it('for a group chat', async () => {
                const report: Report = {
                    ...createGroupChat(802, [1, 2]),
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            });

            it('for a self DM', async () => {
                const report: Report = {
                    ...createSelfDM(803, 1),
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            });

            it('for an admin room', async () => {
                const report: Report = {
                    ...createAdminRoom(804),
                    policyID: testPolicyID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            });

            it('for a domain room', async () => {
                const report: Report = {
                    ...createDomainRoom(805),
                    policyID: testPolicyID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            });

            it('for an IOU report', async () => {
                const report: Report = {
                    reportID: '806',
                    type: CONST.REPORT.TYPE.IOU,
                    chatReportID: chatReportForNonChatID,
                    ownerAccountID: 1,
                    managerID: 2,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            });

            it('for a workspace thread', async () => {
                const report: Report = {
                    ...createWorkspaceThread(807),
                    policyID: testPolicyID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            });

            it('for a regular task (no workspace)', async () => {
                const report: Report = {
                    ...createRegularTaskReport(808, 1),
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            });

            it('for a policy expense chat that is a thread', async () => {
                const report: Report = {
                    ...createPolicyExpenseChatThread(815),
                    type: CONST.REPORT.TYPE.CHAT,
                    policyID: testPolicyID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

                const {result} = renderHook(() => useReportActionAvatars({report, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            });

            it('for an IOU report with single sender (not diagonal)', async () => {
                const personalChatReportID = '910';
                const reportPreviewActionID = '911';

                // Personal chat report (not workspace) — the IOU's parent chat
                const personalChat: Report = {
                    reportID: personalChatReportID,
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: undefined,
                    policyID: undefined,
                    parentReportID: undefined,
                    parentReportActionID: undefined,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${personalChatReportID}`, personalChat);

                // REPORT_PREVIEW action WITH childOwnerAccountID (single sender)
                const reportPreviewAction = {
                    ...createRandomReportAction(Number(reportPreviewActionID)),
                    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW as typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    childOwnerAccountID: 1,
                    childMoneyRequestCount: 2,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${personalChatReportID}`, {
                    [reportPreviewActionID]: reportPreviewAction,
                });

                // IOU report pointing to the chat and the REPORT_PREVIEW action
                const iouReport: Report = {
                    reportID: '912',
                    type: CONST.REPORT.TYPE.IOU,
                    chatReportID: personalChatReportID,
                    parentReportActionID: reportPreviewActionID,
                    ownerAccountID: 1,
                    managerID: 2,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);

                const {result} = renderHook(() => useReportActionAvatars({report: iouReport, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            });
        });

        describe('should return MULTIPLE (diagonal)', () => {
            it('for an IOU report with expenses from multiple users', async () => {
                const personalChatReportID = '900';
                const reportPreviewActionID = '901';

                // Personal chat report (not workspace) — the IOU's parent chat
                const personalChat: Report = {
                    reportID: personalChatReportID,
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: undefined,
                    policyID: undefined,
                    parentReportID: undefined,
                    parentReportActionID: undefined,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${personalChatReportID}`, personalChat);

                // REPORT_PREVIEW action in the chat — no childOwnerAccountID means multiple senders
                const reportPreviewAction = {
                    ...createRandomReportAction(Number(reportPreviewActionID)),
                    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                    childOwnerAccountID: undefined,
                    childManagerAccountID: undefined,
                    childMoneyRequestCount: 3,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${personalChatReportID}`, {
                    [reportPreviewActionID]: reportPreviewAction,
                });

                // IOU report pointing to the chat and the REPORT_PREVIEW action
                const iouReport: Report = {
                    reportID: '902',
                    type: CONST.REPORT.TYPE.IOU,
                    chatReportID: personalChatReportID,
                    parentReportActionID: reportPreviewActionID,
                    ownerAccountID: 1,
                    managerID: 2,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);

                const {result} = renderHook(() => useReportActionAvatars({report: iouReport, action: undefined}), {wrapper});
                expect(result.current.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE);
            });
        });
    });
});
