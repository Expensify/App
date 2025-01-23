/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getReportActionMessageText} from '@libs/ReportActionsUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {TransactionViolationsCollectionDataSet} from '@src/types/onyx/TransactionViolation';

describe('SidebarUtils', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    describe('getReasonAndReportActionThatHasRedBrickRoad', () => {
        it('returns correct reason when report has transaction thread violations', async () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
                ownerAccountID: 12345,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                policyID: '6',
            };

            const MOCK_REPORTS: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT.reportID}` as const]: MOCK_REPORT,
            };

            const MOCK_REPORT_ACTIONS: ReportActions = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    actorAccountID: 12345,
                    created: '2024-08-08 18:20:44.171',
                },
            };

            const MOCK_TRANSACTION = {
                transactionID: '1',
                amount: 10,
                modifiedAmount: 10,
                reportID: MOCK_REPORT.reportID,
            };

            const MOCK_TRANSACTION_VIOLATIONS: TransactionViolationsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION.transactionID}` as const]: [
                    {
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    },
                ],
            };

            await Onyx.multiSet({
                ...MOCK_REPORTS,
                ...MOCK_TRANSACTION_VIOLATIONS,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MOCK_REPORT.reportID}` as const]: MOCK_REPORT_ACTIONS,
                [ONYXKEYS.SESSION]: {
                    accountID: 12345,
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION.transactionID}` as const]: MOCK_TRANSACTION,
            });

            const {reason} =
                SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS as OnyxCollection<TransactionViolations>) ?? {};

            expect(reason).toBe(CONST.RBR_REASONS.HAS_TRANSACTION_THREAD_VIOLATIONS);
        });

        it('returns correct reason when report has errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
                errorFields: {
                    someField: {
                        error: 'Some error occurred',
                    },
                },
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const {reason} = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS) ?? {};

            expect(reason).toBe(CONST.RBR_REASONS.HAS_ERRORS);
        });

        it('returns correct reason when report has violations', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const {reason} = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, true, MOCK_TRANSACTION_VIOLATIONS) ?? {};

            expect(reason).toBe(CONST.RBR_REASONS.HAS_VIOLATIONS);
        });

        it('returns correct reason when report has report action errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    actorAccountID: 12345,
                    created: '2024-08-08 18:20:44.171',
                    message: [
                        {
                            type: '',
                            text: '',
                        },
                    ],
                    errors: {
                        someError: 'Some error occurred',
                    },
                },
            };
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const {reason} = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS) ?? {};

            expect(reason).toBe(CONST.RBR_REASONS.HAS_ERRORS);
        });

        it('returns correct reason when report has export errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
                errorFields: {
                    export: {
                        error: 'Some error occurred',
                    },
                },
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const {reason} = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS) ?? {};

            expect(reason).toBe(CONST.RBR_REASONS.HAS_ERRORS);
        });

        it('returns correct report action when report has report action errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTION = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                actorAccountID: 12345,
                created: '2024-08-08 18:20:44.171',
                message: [
                    {
                        type: '',
                        text: '',
                    },
                ],
                errors: {
                    someError: 'Some error occurred',
                },
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': MOCK_REPORT_ACTION,
            };
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const {reportAction} = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS) ?? {};

            expect(reportAction).toMatchObject<ReportAction>(MOCK_REPORT_ACTION);
        });

        it('returns null when report has no errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const result = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS);

            expect(result).toBeNull();
        });
    });

    describe('shouldShowRedBrickRoad', () => {
        it('returns true when report has transaction thread violations', async () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
                ownerAccountID: 12345,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                policyID: '6',
            };

            const MOCK_REPORTS: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT.reportID}` as const]: MOCK_REPORT,
            };

            const MOCK_REPORT_ACTIONS: ReportActions = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    actorAccountID: 12345,
                    created: '2024-08-08 18:20:44.171',
                },
            };

            const MOCK_TRANSACTION = {
                transactionID: '1',
                amount: 10,
                modifiedAmount: 10,
                reportID: MOCK_REPORT.reportID,
            };

            const MOCK_TRANSACTION_VIOLATIONS: TransactionViolationsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION.transactionID}` as const]: [
                    {
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    },
                ],
            };

            await Onyx.multiSet({
                ...MOCK_REPORTS,
                ...MOCK_TRANSACTION_VIOLATIONS,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MOCK_REPORT.reportID}` as const]: MOCK_REPORT_ACTIONS,
                [ONYXKEYS.SESSION]: {
                    accountID: 12345,
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION.transactionID}` as const]: MOCK_TRANSACTION,
            });

            const result = SidebarUtils.shouldShowRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS as OnyxCollection<TransactionViolations>);

            expect(result).toBe(true);
        });

        it('returns true when report has errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
                errorFields: {
                    someField: {
                        error: 'Some error occurred',
                    },
                },
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const result = SidebarUtils.shouldShowRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS);

            expect(result).toBe(true);
        });

        it('returns true when report has violations', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const result = SidebarUtils.shouldShowRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, true, MOCK_TRANSACTION_VIOLATIONS);

            expect(result).toBe(true);
        });

        it('returns true when report has report action errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    actorAccountID: 12345,
                    created: '2024-08-08 18:20:44.171',
                    message: [
                        {
                            type: '',
                            text: '',
                        },
                    ],
                    errors: {
                        someError: 'Some error occurred',
                    },
                },
            };
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const result = SidebarUtils.shouldShowRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS);

            expect(result).toBe(true);
        });

        it('returns true when report has export errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
                errorFields: {
                    export: {
                        error: 'Some error occurred',
                    },
                },
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const result = SidebarUtils.shouldShowRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS);

            expect(result).toBe(true);
        });

        it('returns false when report has no errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const result = SidebarUtils.shouldShowRedBrickRoad(MOCK_REPORT, MOCK_REPORT_ACTIONS, false, MOCK_TRANSACTION_VIOLATIONS);

            expect(result).toBe(false);
        });
    });

    describe('getOptionsData', () => {
        it('returns the last action message as an alternate text if the action is POLICYCHANGELOG_LEAVEROOM type', async () => {
            // When a report has last action of POLICYCHANGELOG_LEAVEROOM type
            const report: Report = {
                chatType: 'policyAdmins',
                currency: 'USD',
                description: '',
                errorFields: {},
                hasOutstandingChildRequest: false,
                hasOutstandingChildTask: false,
                isCancelledIOU: false,
                isOwnPolicyExpenseChat: false,
                isPinned: false,
                isWaitingOnBankAccount: false,
                lastActorAccountID: 18921695,
                lastMessageHtml: 'removed 0 user',
                lastMessageText: 'removed 0 user',
                lastReadSequenceNumber: 0,
                lastReadTime: '2025-01-20 12:30:03.787',
                lastVisibleActionCreated: '2025-01-20 12:30:03.784',
                lastVisibleActionLastModified: '2025-01-20 12:30:03.784',
                nonReimbursableTotal: 0,
                oldPolicyName: '',
                ownerAccountID: 0,
                participants: {
                    '18921695': {
                        notificationPreference: 'always',
                    },
                },
                permissions: ['read', 'write'],
                policyAvatar: '',
                policyID: '6327584AE2AD92E6',
                policyName: 'Arch Workspace 1',
                private_isArchived: '',
                reportID: '2336337065760599',
                reportName: '#admins',
                stateNum: 0,
                statusNum: 0,
                total: 0,
                type: 'chat',
                unheldNonReimbursableTotal: 0,
                unheldTotal: 0,
                welcomeMessage: '',
                writeCapability: 'all',
                managerID: 0,
                privateNotes: {
                    '18921695': {
                        note: '',
                    },
                },
            };
            const lastAction: ReportAction = {
                reportActionID: '8984164670214153383',
                message: [
                    {
                        type: 'COMMENT',
                        html: '<muted-text>removed <mention-user accountID=19010378></mention-user> from <a href="https://dev.new.expensify.com:8082/r/5345362886584843" target="_blank">#r1</a></muted-text>',
                        text: 'removed  from #r1',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                        deleted: '',
                    },
                ],
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM,
                created: '2025-01-20 12:30:03.784',
                actorAccountID: 18921695,
                person: [
                    {
                        type: 'TEXT',
                        style: 'strong',
                        text: 'f50',
                    },
                ],
            };
            const reportActions: ReportActions = {[lastAction.reportActionID]: lastAction};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);

            const result = SidebarUtils.getOptionData({
                report,
                reportActions,
                hasViolations: false,
                personalDetails: {},
                policy: undefined,
                parentReportAction: undefined,
                preferredLocale: CONST.LOCALES.EN,
            });

            // Then the alternate text should be equal to the message of the last action prepended with the last actor display name.
            expect(result?.alternateText).toBe(`${lastAction.person?.[0].text}: ${getReportActionMessageText(lastAction)}`);
        });
    });
});
