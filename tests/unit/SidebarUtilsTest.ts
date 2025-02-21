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
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
                [ONYXKEYS.SESSION]: {
                    accountID: 12345,
                },
                ...MOCK_REPORTS,
                ...MOCK_TRANSACTION_VIOLATIONS,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MOCK_REPORT.reportID}` as const]: MOCK_REPORT_ACTIONS,
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

    describe('getWelcomeMessage', () => {
        it('do not return pronouns in the welcome message text when it is group chat', async () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: 'group',
                type: 'chat',
            };
            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that report
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                        }),
                    )
                    .then(() => {
                        const result = SidebarUtils.getWelcomeMessage(MOCK_REPORT, undefined);
                        expect(result.messageText).toBe('This chat is with One and Two.');
                    })
            );
        });
    });

    describe('getOptionsData', () => {
        it('returns the last action message as an alternate text if the action is POLICYCHANGELOG_LEAVEROOM type', async () => {
            // When a report has last action of POLICYCHANGELOG_LEAVEROOM type
            const report: Report = {
                ...createRandomReport(1),
                chatType: 'policyAdmins',
                lastMessageHtml: 'removed 0 user',
                lastMessageText: 'removed 0 user',
                lastVisibleActionCreated: '2025-01-20 12:30:03.784',
                participants: {
                    '18921695': {
                        notificationPreference: 'always',
                    },
                },
            };
            const lastAction: ReportAction = {
                ...createRandomReportAction(2),
                message: [
                    {
                        type: 'COMMENT',
                        html: '<muted-text>removed <mention-user accountID=19010378></mention-user> from <a href="https://dev.new.expensify.com:8082/r/5345362886584843" target="_blank">#r1</a></muted-text>',
                        text: 'removed  from #r1',
                        isDeletedParentAction: false,
                        deleted: '',
                    },
                ],
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM,
                actorAccountID: 18921695,
                person: [
                    {
                        type: 'TEXT',
                        style: 'strong',
                        text: 'f50',
                    },
                ],
                originalMessage: undefined,
            };
            const reportActions: ReportActions = {[lastAction.reportActionID]: lastAction};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);

            const result = SidebarUtils.getOptionData({
                report,
                reportActions,
                reportNameValuePairs: {},
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
