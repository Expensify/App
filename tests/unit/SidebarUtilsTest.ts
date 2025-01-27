/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {TransactionViolationsCollectionDataSet} from '@src/types/onyx/TransactionViolation';

jest.mock('@libs/fileDownload/FileUtils', () => ({
    readFileAsync: jest.fn(),
}));

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
});
