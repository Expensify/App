/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {translateLocal} from '@libs/Localize';
import {getOriginalMessage, getReportActionMessageText} from '@libs/ReportActionsUtils';
import {formatReportLastMessageText, getAllReportErrors, getDisplayNameForParticipant, getMoneyRequestSpendBreakdown} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, ReportActions, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {TransactionViolationsCollectionDataSet} from '@src/types/onyx/TransactionViolation';
import {actionR14932 as mockIOUAction} from '../../__mocks__/reportData/actions';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import {createSidebarReportsCollection, createSidebarTestData} from '../utils/collections/sidebarReports';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import {localeCompare} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock DraftCommentUtils
jest.mock('@libs/DraftCommentUtils', () => ({
    hasValidDraftComment: jest.fn(),
    getDraftComment: jest.fn(),
    isValidDraftComment: jest.fn(),
    prepareDraftComment: jest.fn(),
}));

describe('SidebarUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        IntlStore.load(CONST.LOCALES.EN);
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    afterAll(async () => {
        Onyx.clear();
        await waitForBatchedUpdates();
    });

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

            const MOCK_TRANSACTIONS = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION.transactionID}` as const]: MOCK_TRANSACTION,
            } as OnyxCollection<Transaction>;

            const MOCK_TRANSACTION_VIOLATIONS: TransactionViolationsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION.transactionID}` as const]: [
                    {
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                        showInReview: true,
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

            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));

            const {reason} =
                SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(
                    MOCK_REPORT,
                    chatReportR14932,
                    MOCK_REPORT_ACTIONS,
                    false,
                    {},
                    MOCK_TRANSACTIONS,
                    MOCK_TRANSACTION_VIOLATIONS as OnyxCollection<TransactionViolations>,
                    isReportArchived.current,
                ) ?? {};

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
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const reportErrors = getAllReportErrors(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            const {reason} =
                SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(
                    MOCK_REPORT,
                    chatReportR14932,
                    MOCK_REPORT_ACTIONS,
                    false,
                    reportErrors,
                    MOCK_TRANSACTIONS,
                    MOCK_TRANSACTION_VIOLATIONS,
                    isReportArchived.current,
                ) ?? {};

            expect(reason).toBe(CONST.RBR_REASONS.HAS_ERRORS);
        });

        it('returns correct reason when report has violations', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const {reason} =
                SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(
                    MOCK_REPORT,
                    chatReportR14932,
                    MOCK_REPORT_ACTIONS,
                    true,
                    {},
                    MOCK_TRANSACTIONS,
                    MOCK_TRANSACTION_VIOLATIONS,
                    isReportArchived.current,
                ) ?? {};

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
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const reportErrors = getAllReportErrors(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            const {reason} =
                SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(
                    MOCK_REPORT,
                    chatReportR14932,
                    MOCK_REPORT_ACTIONS,
                    false,
                    reportErrors,
                    MOCK_TRANSACTIONS,
                    MOCK_TRANSACTION_VIOLATIONS,
                    isReportArchived.current,
                ) ?? {};

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
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};
            const reportErrors = getAllReportErrors(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const {reason} =
                SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(
                    MOCK_REPORT,
                    chatReportR14932,
                    MOCK_REPORT_ACTIONS,
                    false,
                    reportErrors,
                    MOCK_TRANSACTIONS,
                    MOCK_TRANSACTION_VIOLATIONS,
                    isReportArchived.current,
                ) ?? {};

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
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};
            const reportErrors = getAllReportErrors(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const {reportAction} =
                SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(
                    MOCK_REPORT,
                    chatReportR14932,
                    MOCK_REPORT_ACTIONS,
                    false,
                    reportErrors,
                    MOCK_TRANSACTIONS,
                    MOCK_TRANSACTION_VIOLATIONS,
                    isReportArchived.current,
                ) ?? {};

            expect(reportAction).toMatchObject<ReportAction>(MOCK_REPORT_ACTION);
        });

        it('returns null when report has no errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const result = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(
                MOCK_REPORT,
                chatReportR14932,
                MOCK_REPORT_ACTIONS,
                false,
                {},
                MOCK_TRANSACTIONS,
                MOCK_TRANSACTION_VIOLATIONS,
                isReportArchived.current,
            );

            expect(result).toBeNull();
        });

        it('returns isPinned true only when report.isPinned is true', () => {
            const MOCK_REPORT_PINNED: OnyxEntry<Report> = {
                reportID: '1',
                isPinned: true,
            };
            const MOCK_REPORT_UNPINNED: OnyxEntry<Report> = {
                reportID: '2',
                isPinned: false,
            };

            const optionDataPinned = SidebarUtils.getOptionData({
                report: MOCK_REPORT_PINNED,
                reportAttributes: undefined,
                reportNameValuePairs: {},
                personalDetails: {},
                policy: undefined,
                parentReportAction: undefined,
                oneTransactionThreadReport: undefined,
                card: undefined,
                localeCompare,
            });
            const optionDataUnpinned = SidebarUtils.getOptionData({
                report: MOCK_REPORT_UNPINNED,
                reportAttributes: undefined,
                reportNameValuePairs: {},
                personalDetails: {},
                policy: undefined,
                parentReportAction: undefined,
                oneTransactionThreadReport: undefined,
                card: undefined,
                localeCompare,
            });

            expect(optionDataPinned?.isPinned).toBe(true);
            expect(optionDataUnpinned?.isPinned).toBe(false);
        });

        it('returns null when report is archived', async () => {
            const MOCK_REPORT: Report = {
                reportID: '5',
            };

            const reportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${MOCK_REPORT.reportID}`, reportNameValuePairs);

            await waitForBatchedUpdates();

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
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const result = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(
                MOCK_REPORT,
                chatReportR14932,
                MOCK_REPORT_ACTIONS,
                false,
                {},
                MOCK_TRANSACTIONS,
                MOCK_TRANSACTION_VIOLATIONS,
                isReportArchived.current,
            );

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

            const MOCK_TRANSACTIONS = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION.transactionID}` as const]: MOCK_TRANSACTION,
            } as OnyxCollection<Transaction>;

            const MOCK_TRANSACTION_VIOLATIONS: TransactionViolationsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION.transactionID}` as const]: [
                    {
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                        showInReview: true,
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

            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const result = SidebarUtils.shouldShowRedBrickRoad(
                MOCK_REPORT,
                chatReportR14932,
                MOCK_REPORT_ACTIONS,
                false,
                {},
                MOCK_TRANSACTIONS,
                MOCK_TRANSACTION_VIOLATIONS as OnyxCollection<TransactionViolations>,
                isReportArchived.current,
            );

            expect(result).toBe(true);
        });

        it('returns true when report has transaction thread notice type violation', async () => {
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

            const MOCK_TRANSACTIONS = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION.transactionID}` as const]: MOCK_TRANSACTION,
            } as OnyxCollection<Transaction>;

            const MOCK_TRANSACTION_VIOLATIONS: TransactionViolationsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION.transactionID}` as const]: [
                    {
                        type: CONST.VIOLATION_TYPES.NOTICE,
                        name: CONST.VIOLATIONS.MODIFIED_AMOUNT,
                        showInReview: true,
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

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const result = SidebarUtils.shouldShowRedBrickRoad(
                MOCK_REPORT,
                chatReportR14932,
                MOCK_REPORT_ACTIONS,
                false,
                {},
                MOCK_TRANSACTIONS,
                MOCK_TRANSACTION_VIOLATIONS as OnyxCollection<TransactionViolations>,
                isReportArchived.current,
            );

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
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};
            const reportErrors = getAllReportErrors(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const result = SidebarUtils.shouldShowRedBrickRoad(
                MOCK_REPORT,
                chatReportR14932,
                MOCK_REPORT_ACTIONS,
                false,
                reportErrors,
                MOCK_TRANSACTIONS,
                MOCK_TRANSACTION_VIOLATIONS,
                isReportArchived.current,
            );

            expect(result).toBe(true);
        });

        it('returns true when report has violations', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const result = SidebarUtils.shouldShowRedBrickRoad(
                MOCK_REPORT,
                chatReportR14932,
                MOCK_REPORT_ACTIONS,
                true,
                {},
                MOCK_TRANSACTIONS,
                MOCK_TRANSACTION_VIOLATIONS,
                isReportArchived.current,
            );

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
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};
            const reportErrors = getAllReportErrors(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const result = SidebarUtils.shouldShowRedBrickRoad(
                MOCK_REPORT,
                chatReportR14932,
                MOCK_REPORT_ACTIONS,
                false,
                reportErrors,
                MOCK_TRANSACTIONS,
                MOCK_TRANSACTION_VIOLATIONS,
                isReportArchived.current,
            );

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
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};
            const reportErrors = getAllReportErrors(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const result = SidebarUtils.shouldShowRedBrickRoad(
                MOCK_REPORT,
                chatReportR14932,
                MOCK_REPORT_ACTIONS,
                false,
                reportErrors,
                MOCK_TRANSACTIONS,
                MOCK_TRANSACTION_VIOLATIONS,
                isReportArchived.current,
            );

            expect(result).toBe(true);
        });

        it('returns false when report has no errors', () => {
            const MOCK_REPORT: Report = {
                reportID: '1',
            };
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const result = SidebarUtils.shouldShowRedBrickRoad(
                MOCK_REPORT,
                chatReportR14932,
                MOCK_REPORT_ACTIONS,
                false,
                {},
                MOCK_TRANSACTIONS,
                MOCK_TRANSACTION_VIOLATIONS,
                isReportArchived.current,
            );

            expect(result).toBe(false);
        });

        it('returns false when report is archived', () => {
            const MOCK_REPORT: Report = {
                reportID: '5',
                errorFields: {
                    export: {
                        error: 'Some error occurred',
                    },
                },
            };
            // This report with reportID 5 is already archived from previous tests
            // where we set reportNameValuePairs with private_isArchived
            const MOCK_REPORT_ACTIONS: OnyxEntry<ReportActions> = {};
            const MOCK_TRANSACTIONS = {};
            const MOCK_TRANSACTION_VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
            const result = SidebarUtils.shouldShowRedBrickRoad(
                MOCK_REPORT,
                chatReportR14932,
                MOCK_REPORT_ACTIONS,
                false,
                {},
                MOCK_TRANSACTIONS,
                MOCK_TRANSACTION_VIOLATIONS,
                isReportArchived.current,
            );

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
                        const result = SidebarUtils.getWelcomeMessage(MOCK_REPORT, undefined, localeCompare);
                        expect(result.messageText).toBe('This chat is with One and Two.');
                    })
            );
        });

        it('returns a welcome message for an archived chat room', () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            return (
                waitForBatchedUpdates()
                    // Given a "chat room" report (ie. a policy announce room) is stored in Onyx
                    .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT.reportID}`, MOCK_REPORT))

                    // And that report is archived
                    .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${MOCK_REPORT.reportID}`, {private_isArchived: new Date().toString()}))

                    // When the welcome message is retrieved
                    .then(() => {
                        // Simulate how components call getWelcomeMessage() by using the hook useReportIsArchived() to see if the report is archived
                        const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
                        return SidebarUtils.getWelcomeMessage(MOCK_REPORT, undefined, localeCompare, isReportArchived.current);
                    })

                    // Then the welcome message should indicate the report is archived
                    .then((result) => expect(result.messageText).toBe("You missed the party in Report (archived), there's nothing to see here."))
            );
        });

        it('returns a welcome message for a non-archived chat room', () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            return (
                waitForBatchedUpdates()
                    // Given a "chat room" report (ie. a policy announce room) is stored in Onyx
                    .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT.reportID}`, MOCK_REPORT))

                    // When the welcome message is retrieved
                    .then(() => {
                        // Simulate how components call getWelcomeMessage() by using the hook useReportIsArchived() to see if the report is archived
                        const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
                        return SidebarUtils.getWelcomeMessage(MOCK_REPORT, undefined, localeCompare, isReportArchived.current);
                    })

                    // Then the welcome message should explain the purpose of the room
                    .then((result) => expect(result.messageText).toBe('This chat is with everyone in Unavailable workspace. Use it for the most important announcements.'))
            );
        });
    });

    describe('getOptionData', () => {
        it('returns the last action message as an alternate text if the action is POLICY_CHANGE_LOG.LEAVE_ROOM type', async () => {
            // When a report has last action of POLICY_CHANGE_LOG.LEAVE_ROOM type
            const report: Report = {
                ...createRandomReport(4),
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
                reportAttributes: undefined,
                reportNameValuePairs: {},
                personalDetails: {},
                policy: undefined,
                parentReportAction: undefined,
                oneTransactionThreadReport: undefined,
                card: undefined,
                localeCompare,
            });

            // Then the alternate text should be equal to the message of the last action prepended with the last actor display name.
            expect(result?.alternateText).toBe(`${lastAction.person?.[0].text}: ${getReportActionMessageText(lastAction)}`);
        });

        it('returns @Hidden as an alternate text if the last action mentioned account has no name', async () => {
            // When a report has last action with mention of an account that has no name
            const report: Report = {
                ...createRandomReport(4),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                lastMessageText: '@unexisting@gmail.com',
                lastVisibleActionCreated: '2025-01-20 12:30:03.784',
            };

            const mentionedAccountID = 19797552;
            const lastAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT> = {
                ...createRandomReportAction(2),
                message: [
                    {
                        html: `<mention-user accountID="${mentionedAccountID}"/>`,
                        text: '@unexisting@gmal.com',
                        type: 'COMMENT',
                        whisperedTo: [],
                    },
                ],
                originalMessage: {
                    html: `<mention-user accountID="${mentionedAccountID}"/>`,
                    whisperedTo: [],
                    lastModified: '2025-05-01 13:23:25.209',
                    mentionedAccountIDs: [mentionedAccountID],
                },
                pendingAction: undefined,
                previousMessage: undefined,
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID: 119086,
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
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[mentionedAccountID]: {accountID: mentionedAccountID, firstName: '', lastName: ''}});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);

            const result = SidebarUtils.getOptionData({
                report,
                reportAttributes: undefined,
                reportNameValuePairs: {},
                personalDetails: {},
                policy: undefined,
                parentReportAction: undefined,
                oneTransactionThreadReport: undefined,
                card: undefined,
                localeCompare,
            });

            // Then the alternate text should show @Hidden.
            expect(result?.alternateText).toBe(`f50: @Hidden`);
        });

        describe('Alternative text', () => {
            afterEach(async () => {
                Onyx.clear();
                await waitForBatchedUpdates();
            });
            it('The text should not contain the policy name at prefix if the report is not related to a workspace', async () => {
                const policy: Policy = {
                    ...createRandomPolicy(1),
                    role: CONST.POLICY.ROLE.ADMIN,
                    pendingAction: null,
                };
                const report: Report = {
                    ...createRandomReport(1),
                    chatType: undefined,
                    policyID: CONST.POLICY.ID_FAKE,
                };
                const reportNameValuePairs = {};

                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}2`, {
                    ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                    role: CONST.POLICY.ROLE.ADMIN,
                    pendingAction: null,
                });

                const optionData = SidebarUtils.getOptionData({
                    report,
                    reportAttributes: undefined,
                    reportNameValuePairs,
                    personalDetails: {},
                    policy,
                    parentReportAction: undefined,
                    lastMessageTextFromReport: 'test message',
                    oneTransactionThreadReport: undefined,
                    card: undefined,
                    localeCompare,
                });

                expect(optionData?.alternateText).toBe(`test message`);
            });
            it("The text should not contain the last actor's name at prefix if the report is archived.", async () => {
                const policy: Policy = {
                    ...createRandomPolicy(1),
                    role: CONST.POLICY.ROLE.ADMIN,
                    pendingAction: null,
                };
                const report: Report = {
                    ...createRandomReport(2),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    policyID: policy.id,
                    policyName: policy.name,
                    type: CONST.REPORT.TYPE.CHAT,
                    lastActorAccountID: 1,
                };
                const reportNameValuePairs = {
                    private_isArchived: DateUtils.getDBTime(),
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

                const optionData = SidebarUtils.getOptionData({
                    report,
                    reportAttributes: undefined,
                    reportNameValuePairs,
                    personalDetails: LHNTestUtils.fakePersonalDetails,
                    policy,
                    parentReportAction: undefined,
                    lastMessageTextFromReport: 'test message',
                    oneTransactionThreadReport: undefined,
                    card: undefined,
                    localeCompare,
                });

                expect(optionData?.alternateText).toBe(`test message`);
            });
            it('The text should not contain the policy name at prefix if we only have a workspace', async () => {
                const policy: Policy = {
                    ...createRandomPolicy(1),
                    role: CONST.POLICY.ROLE.ADMIN,
                    pendingAction: null,
                };
                const report: Report = {
                    ...createRandomReport(2),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    policyID: policy.id,
                    policyName: policy.name,
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const reportNameValuePairs = {};

                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

                const optionData = SidebarUtils.getOptionData({
                    report,
                    reportAttributes: undefined,
                    reportNameValuePairs,
                    personalDetails: {},
                    policy,
                    parentReportAction: undefined,
                    lastMessageTextFromReport: 'test message',
                    oneTransactionThreadReport: undefined,
                    card: undefined,
                    localeCompare,
                });

                expect(optionData?.alternateText).toBe(`test message`);
            });

            it("For policy expense chat whose last action is a report preview linked to an expense report with non-reimbursable transaction the LHN text should be in the format 'spent $total'", async () => {
                const policy: Policy = {
                    ...createRandomPolicy(1),
                    role: CONST.POLICY.ROLE.ADMIN,
                    pendingAction: null,
                };
                const policyExpenseChat: Report = {
                    ...createRandomReport(2),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    policyID: policy.id,
                    policyName: policy.name,
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const reportNameValuePairs = {};
                const lastReportPreviewAction = {
                    action: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                    childReportName: 'Expense Report 2025-07-10',
                    childReportID: '5186125925096828',
                    created: '2025-07-10 17:45:31.448',
                    reportActionID: '7425617950691586420',
                    shouldShow: true,
                    message: [
                        {
                            type: 'COMMENT',
                            html: 'a owes ETB 5.00',
                            text: 'a owes ETB 5.00',
                            isEdited: false,
                            whisperedTo: [],
                            isDeletedParentAction: false,
                            deleted: '',
                            reactions: [],
                        },
                    ],
                    originalMessage: {
                        linkedReportID: '5186125925096828',
                        actionableForAccountIDs: [20232605],
                        isNewDot: true,
                        lastModified: '2025-07-10 17:45:53.635',
                    },
                    person: [
                        {
                            type: 'TEXT',
                            style: 'strong',
                            text: 'f100',
                        },
                    ],
                    parentReportID: policyExpenseChat.reportID,
                };

                const policyExpenseChatActions: ReportActions = {[lastReportPreviewAction.reportActionID]: lastReportPreviewAction};
                const iouReport = {
                    reportName: 'Expense Report 2025-07-10',
                    reportID: '5186125925096828',
                    policyID: policy.id,
                    type: 'expense',
                    currency: 'ETB',
                    ownerAccountID: 20232605,
                    total: -500,
                    nonReimbursableTotal: 0,
                    parentReportID: policyExpenseChat.reportID,
                    parentReportActionID: lastReportPreviewAction.reportActionID,
                    chatReportID: policyExpenseChat.reportID,
                } as Report;
                const iouAction = {
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        amount: -200,
                        currency: 'ETB',
                        type: 'track',
                        participantAccountIDs: [20232605],
                        IOUReportID: '5186125925096828',
                    },
                    reportActionID: '8964283462949622660',
                    shouldShow: true,
                    created: '2025-07-10 17:45:34.865',
                    message: [
                        {
                            type: 'COMMENT',
                            html: 'tracked ETB 2.00',
                            text: 'tracked ETB 2.00',
                            isEdited: false,
                            whisperedTo: [],
                            isDeletedParentAction: false,
                            deleted: '',
                            reactions: [],
                        },
                    ],
                    parentReportID: iouReport.reportID,
                };
                const iouReportActions: ReportActions = {[iouAction.reportActionID]: iouAction};
                const transaction = {
                    transactionID: '4766156517568983315',
                    amount: -300,
                    currency: 'ETB',
                    reportID: iouReport.reportID,
                    reimbursable: false,
                    isLoading: false,
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat.reportID}`, policyExpenseChatActions);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`, iouReportActions);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);

                const optionData = SidebarUtils.getOptionData({
                    report: policyExpenseChat,
                    reportAttributes: undefined,
                    reportNameValuePairs,
                    personalDetails: {},
                    policy,
                    parentReportAction: undefined,
                    oneTransactionThreadReport: undefined,
                    card: undefined,
                    localeCompare,
                });
                const {totalDisplaySpend} = getMoneyRequestSpendBreakdown(iouReport);
                const formattedAmount = convertToDisplayString(totalDisplaySpend, iouReport.currency);

                expect(optionData?.alternateText).toBe(
                    formatReportLastMessageText(
                        translateLocal('iou.payerSpentAmount', {payer: getDisplayNameForParticipant({accountID: iouReport.ownerAccountID}) ?? '', amount: formattedAmount}),
                    ),
                );
            });

            it('The text should contain the policy name at prefix if we have multiple workspace and the report is related to a workspace', async () => {
                const policy: Policy = {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    role: CONST.POLICY.ROLE.ADMIN,
                    pendingAction: null,
                };
                const report: Report = {
                    ...createRandomReport(3),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    policyID: '1',
                    policyName: policy.name,
                };
                const reportNameValuePairs = {};

                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}2`, {
                    ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                    role: CONST.POLICY.ROLE.ADMIN,
                    pendingAction: null,
                });

                const optionData = SidebarUtils.getOptionData({
                    report,
                    reportAttributes: undefined,
                    reportNameValuePairs,
                    personalDetails: {},
                    policy,
                    parentReportAction: undefined,
                    lastMessageTextFromReport: 'test message',
                    oneTransactionThreadReport: undefined,
                    card: undefined,
                    localeCompare,
                });

                expect(optionData?.alternateText).toBe(`${policy.name} ${CONST.DOT_SEPARATOR} test message`);
            });
            it('returns the last action message as an alternate text if the action is INVITE_TO_ROOM type', async () => {
                // When a report has last action of INVITE_TO_ROOM type
                const policy: Policy = {
                    ...createRandomPolicy(1),
                    role: CONST.POLICY.ROLE.ADMIN,
                    pendingAction: null,
                };
                const session = {
                    authToken: 'sensitive-auth-token',
                    encryptedAuthToken: 'sensitive-encrypted-token',
                    email: 'user@example.com',
                    accountID: 12345,
                };
                const report: Report = {
                    ...createRandomReport(4),
                    chatType: 'policyRoom',
                    lastMessageHtml: 'invited 1 user',
                    lastMessageText: 'invited 1 user',
                    lastVisibleActionCreated: '2025-01-20 12:30:03.784',
                    participants: {
                        '12345': {
                            notificationPreference: 'daily',
                            role: 'admin',
                        },
                    },
                    policyID: '1',
                };
                const lastAction: ReportAction = {
                    ...createRandomReportAction(2),
                    message: [
                        {
                            type: 'COMMENT',
                            html: '<muted-text>invited <mention-user accountID=19268914></mention-user></muted-text>',
                            text: 'invited',
                            isEdited: false,
                            whisperedTo: [],
                            isDeletedParentAction: false,
                            deleted: '',
                        },
                    ],
                    originalMessage: {
                        lastModified: '2025-03-04 10:32:10.416',
                        targetAccountIDs: [19268914],
                    },
                    actorAccountID: 12345,
                    actionName: CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM,
                };
                const reportActions: ReportActions = {[lastAction.reportActionID]: lastAction};
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);
                await Onyx.set(ONYXKEYS.SESSION, session);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);
                const result = SidebarUtils.getOptionData({
                    report,
                    reportAttributes: undefined,
                    reportNameValuePairs: {},
                    personalDetails: {},
                    policy: undefined,
                    parentReportAction: undefined,
                    oneTransactionThreadReport: undefined,
                    card: undefined,
                    localeCompare,
                });

                // Then the alternate text should be equal to the message of the last action prepended with the last actor display name.
                expect(result?.alternateText).toBe(`You invited 1 member`);
            });
            it('returns the last action message as an alternate text if the action is MOVED type', async () => {
                const report: Report = {
                    ...createRandomReport(4),
                    chatType: 'policyExpenseChat',
                    pendingAction: null,
                    isOwnPolicyExpenseChat: true,
                };
                const lastAction: ReportAction = {
                    ...createRandomReportAction(2),
                    message: [
                        {
                            type: 'COMMENT',
                            html: "moved this report to the <a href='https://new.expensify.com/r/1325702002189143' target='_blank' rel='noreferrer noopener'>Three&#039;s Workspace</a> workspace",
                            text: "moved this report to the Three's Workspace workspace",
                        },
                    ],
                    originalMessage: {
                        whisperedTo: [],
                    },
                    actionName: CONST.REPORT.ACTIONS.TYPE.MOVED,
                    created: DateUtils.getDBTime(),
                    lastModified: DateUtils.getDBTime(),
                    shouldShow: true,
                    pendingAction: null,
                };
                const reportActions: ReportActions = {[lastAction.reportActionID]: lastAction};
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);
                const result = SidebarUtils.getOptionData({
                    report,
                    reportAttributes: undefined,
                    reportNameValuePairs: {},
                    personalDetails: {},
                    policy: undefined,
                    parentReportAction: undefined,
                    oneTransactionThreadReport: undefined,
                    card: undefined,
                    localeCompare,
                });

                expect(result?.alternateText).toBe(`You: ${getReportActionMessageText(lastAction)}`);
            });

            it('returns the last action message as an alternate text if the expense report is the one expense report', async () => {
                const IOUTransactionID = `${ONYXKEYS.COLLECTION.TRANSACTION}TRANSACTION_IOU` as const;

                iouReportR14932.reportID = '5';
                chatReportR14932.reportID = '6';

                const report: Report = {
                    ...createRandomReport(1),
                    chatType: 'policyExpenseChat',
                    pendingAction: null,
                    isOwnPolicyExpenseChat: true,
                    parentReportID: iouReportR14932.reportID,
                    parentReportActionID: mockIOUAction.reportActionID,
                    lastActorAccountID: undefined,
                };

                const linkedCreateAction: ReportAction = {
                    ...mockIOUAction,
                    originalMessage: {...getOriginalMessage(mockIOUAction), IOUTransactionID},
                    childReportID: report.reportID,
                    reportActionID: '3',
                };

                const lastAction: ReportAction = {
                    ...createRandomReportAction(1),
                    message: [
                        {
                            type: 'COMMENT',
                            html: 'test action',
                            text: 'test action',
                        },
                    ],
                    originalMessage: {
                        whisperedTo: [],
                    },

                    created: DateUtils.getDBTime(),
                    lastModified: DateUtils.getDBTime(),
                    shouldShow: true,
                    pendingAction: null,
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    actorAccountID: undefined,
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportR14932.reportID}`, iouReportR14932);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportR14932.reportID}`, chatReportR14932);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {[lastAction.reportActionID]: lastAction});
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportR14932.reportID}`, {[linkedCreateAction.reportActionID]: linkedCreateAction});

                const result = SidebarUtils.getOptionData({
                    report: {...iouReportR14932, lastActorAccountID: undefined},
                    reportAttributes: undefined,
                    reportNameValuePairs: {},
                    personalDetails: {},
                    policy: undefined,
                    parentReportAction: undefined,
                    oneTransactionThreadReport: undefined,
                    card: undefined,
                    localeCompare,
                });

                expect(result?.alternateText).toBe(`You: ${getReportActionMessageText(lastAction)}`);
            });

            it('uses the 2nd-last visible message as alternateText when the latest action is a deleted IOU', async () => {
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
                const lastAction: ReportAction = {
                    ...createRandomReportAction(1),
                    message: [
                        {
                            type: 'COMMENT',
                            html: 'test action',
                            text: 'test action',
                        },
                    ],
                    originalMessage: {
                        whisperedTo: [],
                    },

                    shouldShow: true,
                    pendingAction: null,
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    actorAccountID: undefined,
                    created: '2025-07-25 07:38:54.211',
                };
                const deletedAction: ReportAction = {
                    ...createRandomReportAction(2),
                    actionName: 'IOU',
                    actorAccountID: 20337430,
                    automatic: false,
                    isAttachmentOnly: false,
                    originalMessage: {
                        amount: 100,
                        comment: '',
                        currency: 'VND',
                        IOUTransactionID: '7823889167761419930',
                        IOUReportID: '0',
                        type: 'track',
                        participantAccountIDs: [20337430, 0],
                        lastModified: '2025-07-25 07:39:02.550',
                        deleted: '2025-07-25 07:39:02.550',
                        html: '',
                    },
                    message: [
                        {
                            type: '',
                            text: '',
                            isDeletedParentAction: true,
                        },
                    ],
                    reportActionID: '869069913568459256',
                    shouldShow: true,
                    created: '2025-07-25 07:38:54.311',
                    person: [
                        {
                            style: 'strong',
                            text: '123',
                            type: 'TEXT',
                        },
                    ],
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_21.png',
                    childReportID: '3044322706237838',
                    lastModified: '2025-07-25 07:39:02.550',
                    childCommenterCount: 1,
                    childLastVisibleActionCreated: '2025-07-25 07:38:47.598',
                    childOldestFourAccountIDs: '20337430',
                    childStateNum: 0,
                    childStatusNum: 0,
                    childType: 'chat',
                    childVisibleActionCount: 1,
                    timestamp: 1753429134,
                    reportActionTimestamp: 1753429134311,
                    whisperedToAccountIDs: [],
                    childReportNotificationPreference: 'always',
                };
                const MOCK_REPORT_ACTIONS: ReportActions = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    [lastAction.reportActionID]: lastAction,
                    [deletedAction.reportActionID]: deletedAction,
                };

                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {
                        accountID: 12345,
                    },
                    ...MOCK_REPORTS,

                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MOCK_REPORT.reportID}` as const]: MOCK_REPORT_ACTIONS,
                });

                const result = SidebarUtils.getOptionData({
                    report: MOCK_REPORT,
                    reportAttributes: undefined,
                    reportNameValuePairs: {},
                    personalDetails: {},
                    policy: undefined,
                    parentReportAction: undefined,
                    oneTransactionThreadReport: undefined,
                    card: undefined,
                    localeCompare,
                });

                expect(result?.alternateText).toContain(`${getReportActionMessageText(lastAction)}`);
            });
        });
    });

    describe('sortReportsToDisplayInLHN', () => {
        describe('categorizeReportsForLHN', () => {
            it('should categorize reports into correct groups', () => {
                // Given hasValidDraftComment is mocked to return true for report '2'
                const {hasValidDraftComment} = require('@libs/DraftCommentUtils') as {hasValidDraftComment: jest.Mock};
                hasValidDraftComment.mockImplementation((reportID: string) => reportID === '2');

                const {reports, reportNameValuePairs, reportAttributes} = createSidebarTestData();

                // When the reports are categorized
                const result = SidebarUtils.categorizeReportsForLHN(reports, reportNameValuePairs, reportAttributes);

                // Then the reports are categorized into the correct groups
                expect(result.pinnedAndGBRReports).toHaveLength(1);
                expect(result.pinnedAndGBRReports.at(0)?.reportID).toBe('0');
                expect(result.errorReports).toHaveLength(1);
                expect(result.errorReports.at(0)?.reportID).toBe('1');
                expect(result.draftReports).toHaveLength(1);
                expect(result.draftReports.at(0)?.reportID).toBe('2');
                expect(result.nonArchivedReports).toHaveLength(1);
                expect(result.nonArchivedReports.at(0)?.reportID).toBe('3');
                expect(result.archivedReports).toHaveLength(1);
                expect(result.archivedReports.at(0)?.reportID).toBe('4');
            });

            it('should handle reports with requiresAttention flag', () => {
                // Given the reports are created
                const reports = createSidebarReportsCollection([
                    {
                        reportName: 'Attention Report',
                        isPinned: false,
                        hasErrorsOtherThanFailedReceipt: false,
                    },
                ]);

                const reportAttributes = {
                    '0': {
                        requiresAttention: true,
                        reportName: 'Test Report',
                        isEmpty: false,
                        brickRoadStatus: undefined,
                        reportErrors: {} as Record<string, string | null>,
                    },
                };

                // When the reports are categorized
                const result = SidebarUtils.categorizeReportsForLHN(reports, undefined, reportAttributes);

                // Then the reports are categorized into the correct groups
                expect(result.pinnedAndGBRReports).toHaveLength(1);
                expect(result.pinnedAndGBRReports.at(0)?.reportID).toBe('0');
            });

            it('should process reports with empty reportID', () => {
                // Given the reports are created
                const reports = createSidebarReportsCollection([
                    {
                        reportName: 'Valid Report',
                        isPinned: false,
                        hasErrorsOtherThanFailedReceipt: false,
                    },
                ]);

                // Given a report with empty reportID
                reports['1'] = {
                    ...createRandomReport(1),
                    reportID: '',
                    reportName: 'Invalid Report',
                    isPinned: false,
                    hasErrorsOtherThanFailedReceipt: false,
                };

                // When the reports are categorized
                const result = SidebarUtils.categorizeReportsForLHN(reports);

                // Then the reports are categorized into the correct groups
                expect(result.pinnedAndGBRReports).toHaveLength(0);
                expect(result.errorReports).toHaveLength(0);
                expect(result.draftReports).toHaveLength(0);
                expect(result.nonArchivedReports).toHaveLength(2);
                expect(result.nonArchivedReports.at(0)?.reportID).toBe('0');
                expect(result.nonArchivedReports.at(1)?.reportID).toBe('');
                expect(result.archivedReports).toHaveLength(0);
            });

            it('should handle empty reports object', () => {
                // Given the reports are empty
                const result = SidebarUtils.categorizeReportsForLHN({});

                // Then the reports are categorized into the correct groups
                expect(result.pinnedAndGBRReports).toHaveLength(0);
                expect(result.errorReports).toHaveLength(0);
                expect(result.draftReports).toHaveLength(0);
                expect(result.nonArchivedReports).toHaveLength(0);
                expect(result.archivedReports).toHaveLength(0);
            });
        });

        describe('sortCategorizedReports', () => {
            const mockLocaleCompare = (a: string, b: string) => a.localeCompare(b);

            it('should sort reports correctly in default mode', () => {
                // Given the reports are created
                const categories = {
                    pinnedAndGBRReports: [
                        {reportID: '1', displayName: 'Zebra', lastVisibleActionCreated: '2024-01-01 10:00:00'},
                        {reportID: '2', displayName: 'Alpha', lastVisibleActionCreated: '2024-01-02 10:00:00'},
                    ],
                    errorReports: [
                        {reportID: '3', displayName: 'Charlie', lastVisibleActionCreated: '2024-01-03 10:00:00'},
                        {reportID: '4', displayName: 'Beta', lastVisibleActionCreated: '2024-01-04 10:00:00'},
                    ],
                    draftReports: [
                        {reportID: '5', displayName: 'Echo', lastVisibleActionCreated: '2024-01-05 10:00:00'},
                        {reportID: '6', displayName: 'Delta', lastVisibleActionCreated: '2024-01-06 10:00:00'},
                    ],
                    nonArchivedReports: [
                        {reportID: '7', displayName: 'Hotel', lastVisibleActionCreated: '2024-01-07 10:00:00'},
                        {reportID: '8', displayName: 'Golf', lastVisibleActionCreated: '2024-01-08 10:00:00'},
                    ],
                    archivedReports: [
                        {reportID: '9', displayName: 'India', lastVisibleActionCreated: '2024-01-09 10:00:00'},
                        {reportID: '10', displayName: 'Juliet', lastVisibleActionCreated: '2024-01-10 10:00:00'},
                    ],
                };

                // When the reports are sorted
                const result = SidebarUtils.sortCategorizedReports(categories, true, mockLocaleCompare);

                // Then the pinned reports are sorted by display name
                expect(result.pinnedAndGBRReports.at(0)?.displayName).toBe('Alpha');
                expect(result.pinnedAndGBRReports.at(1)?.displayName).toBe('Zebra');

                // Then the error reports are sorted by display name
                expect(result.errorReports.at(0)?.displayName).toBe('Beta');
                expect(result.errorReports.at(1)?.displayName).toBe('Charlie');

                // Then the draft reports are sorted by display name
                expect(result.draftReports.at(0)?.displayName).toBe('Delta');
                expect(result.draftReports.at(1)?.displayName).toBe('Echo');

                // Then the non-archived reports are sorted by date (most recent first) in default mode
                expect(result.nonArchivedReports.at(0)?.lastVisibleActionCreated).toBe('2024-01-08 10:00:00');
                expect(result.nonArchivedReports.at(1)?.lastVisibleActionCreated).toBe('2024-01-07 10:00:00');

                // Then the archived reports are sorted by date (most recent first) in default mode
                expect(result.archivedReports.at(0)?.lastVisibleActionCreated).toBe('2024-01-10 10:00:00');
                expect(result.archivedReports.at(1)?.lastVisibleActionCreated).toBe('2024-01-09 10:00:00');
            });

            it('should sort reports correctly in focus mode (GSD)', () => {
                // Given the reports are created
                const categories = {
                    pinnedAndGBRReports: [
                        {reportID: '1', displayName: 'Zebra', lastVisibleActionCreated: '2024-01-01 10:00:00'},
                        {reportID: '2', displayName: 'Alpha', lastVisibleActionCreated: '2024-01-02 10:00:00'},
                    ],
                    errorReports: [
                        {reportID: '3', displayName: 'Charlie', lastVisibleActionCreated: '2024-01-03 10:00:00'},
                        {reportID: '4', displayName: 'Beta', lastVisibleActionCreated: '2024-01-04 10:00:00'},
                    ],
                    draftReports: [
                        {reportID: '5', displayName: 'Echo', lastVisibleActionCreated: '2024-01-05 10:00:00'},
                        {reportID: '6', displayName: 'Delta', lastVisibleActionCreated: '2024-01-06 10:00:00'},
                    ],
                    nonArchivedReports: [
                        {reportID: '7', displayName: 'Hotel', lastVisibleActionCreated: '2024-01-07 10:00:00'},
                        {reportID: '8', displayName: 'Golf', lastVisibleActionCreated: '2024-01-08 10:00:00'},
                    ],
                    archivedReports: [
                        {reportID: '9', displayName: 'India', lastVisibleActionCreated: '2024-01-09 10:00:00'},
                        {reportID: '10', displayName: 'Juliet', lastVisibleActionCreated: '2024-01-10 10:00:00'},
                    ],
                };

                // When the reports are sorted
                const result = SidebarUtils.sortCategorizedReports(categories, false, mockLocaleCompare);

                // Then the pinned reports are sorted by display name in focus mode
                expect(result.pinnedAndGBRReports.at(0)?.displayName).toBe('Alpha');
                expect(result.pinnedAndGBRReports.at(1)?.displayName).toBe('Zebra');

                // Then the error reports are sorted by display name
                expect(result.errorReports.at(0)?.displayName).toBe('Beta');
                expect(result.errorReports.at(1)?.displayName).toBe('Charlie');

                // Then the draft reports are sorted by display name
                expect(result.draftReports.at(0)?.displayName).toBe('Delta');
                expect(result.draftReports.at(1)?.displayName).toBe('Echo');

                // Then the non-archived reports are sorted by display name
                expect(result.nonArchivedReports.at(0)?.displayName).toBe('Golf');
                expect(result.nonArchivedReports.at(1)?.displayName).toBe('Hotel');

                // Then the archived reports are sorted by display name
                expect(result.archivedReports.at(0)?.displayName).toBe('India');
                expect(result.archivedReports.at(1)?.displayName).toBe('Juliet');
            });

            it('should handle reports with missing display names', () => {
                // Given the reports are created
                const categories = {
                    pinnedAndGBRReports: [
                        {reportID: '1', displayName: '', lastVisibleActionCreated: '2024-01-01 10:00:00'},
                        {reportID: '2', displayName: 'Alpha', lastVisibleActionCreated: '2024-01-02 10:00:00'},
                    ],
                    errorReports: [],
                    draftReports: [],
                    nonArchivedReports: [],
                    archivedReports: [],
                };

                // When the reports are sorted
                const result = SidebarUtils.sortCategorizedReports(categories, true, mockLocaleCompare);

                // Then the pinned reports are sorted by display name
                expect(result.pinnedAndGBRReports).toHaveLength(2);
            });

            it('should handle reports with missing dates', () => {
                // Given the reports are created
                const categories = {
                    pinnedAndGBRReports: [],
                    errorReports: [],
                    draftReports: [],
                    nonArchivedReports: [
                        {reportID: '1', displayName: 'Alpha', lastVisibleActionCreated: undefined},
                        {reportID: '2', displayName: 'Beta', lastVisibleActionCreated: '2024-01-02 10:00:00'},
                    ],
                    archivedReports: [],
                };

                // When the reports are sorted
                const result = SidebarUtils.sortCategorizedReports(categories, true, mockLocaleCompare);

                // Then the non-archived reports are sorted by display name
                expect(result.nonArchivedReports.at(0)?.displayName).toBe('Alpha');
                expect(result.nonArchivedReports.at(1)?.displayName).toBe('Beta');
            });
        });

        describe('combineReportCategories', () => {
            it('should combine categories in correct order', () => {
                // Given the reports are created
                const pinnedAndGBRReports = [
                    {reportID: '1', displayName: 'Pinned 1'},
                    {reportID: '2', displayName: 'Pinned 2'},
                ];
                const errorReports = [
                    {reportID: '3', displayName: 'Error 1'},
                    {reportID: '4', displayName: 'Error 2'},
                ];
                const draftReports = [
                    {reportID: '5', displayName: 'Draft 1'},
                    {reportID: '6', displayName: 'Draft 2'},
                ];
                const nonArchivedReports = [
                    {reportID: '7', displayName: 'Normal 1'},
                    {reportID: '8', displayName: 'Normal 2'},
                ];
                const archivedReports = [
                    {reportID: '9', displayName: 'Archived 1'},
                    {reportID: '10', displayName: 'Archived 2'},
                ];

                // When the reports are combined
                const result = SidebarUtils.combineReportCategories(pinnedAndGBRReports, errorReports, draftReports, nonArchivedReports, archivedReports);

                // Then the reports are combined in the correct order
                expect(result).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
            });

            it('should filter out reports with undefined reportID', () => {
                // Given the reports are created
                const pinnedAndGBRReports = [
                    {reportID: '1', displayName: 'Pinned 1'},
                    {reportID: undefined, displayName: 'Invalid'},
                ];
                const errorReports = [{reportID: '2', displayName: 'Error 1'}];
                const draftReports: Array<{reportID?: string; displayName: string; lastVisibleActionCreated?: string}> = [];
                const nonArchivedReports: Array<{reportID?: string; displayName: string; lastVisibleActionCreated?: string}> = [];
                const archivedReports: Array<{reportID?: string; displayName: string; lastVisibleActionCreated?: string}> = [];

                // When the reports are combined
                const result = SidebarUtils.combineReportCategories(pinnedAndGBRReports, errorReports, draftReports, nonArchivedReports, archivedReports);

                // Then the reports are combined in the correct order
                expect(result).toEqual(['1', '2']);
            });

            it('should handle empty categories', () => {
                // Given the reports are empty
                const result = SidebarUtils.combineReportCategories([], [], [], [], []);

                // Then the reports are combined in the correct order
                expect(result).toEqual([]);
            });
        });

        describe('sortReportsToDisplayInLHN', () => {
            it('should sort reports correctly', () => {
                // Given the reports are created
                const reports = createSidebarReportsCollection([
                    {
                        reportName: 'Pinned Report',
                        isPinned: true,
                        hasErrorsOtherThanFailedReceipt: false,
                    },
                    {
                        reportName: 'Error Report',
                        isPinned: false,
                        hasErrorsOtherThanFailedReceipt: true,
                    },
                    {
                        reportName: 'Normal Report',
                        isPinned: false,
                        hasErrorsOtherThanFailedReceipt: false,
                    },
                ]);

                const mockLocaleCompare = (a: string, b: string) => a.localeCompare(b);
                const priorityMode = CONST.PRIORITY_MODE.DEFAULT;

                // When the reports are sorted
                const result = SidebarUtils.sortReportsToDisplayInLHN(reports, priorityMode, mockLocaleCompare);

                // Then the reports are sorted in the correct order
                expect(result).toEqual(['0', '1', '2']); // Pinned first, Error second, Normal third
            });

            it('should handle different priority modes correctly', () => {
                // Given the reports are created
                const reports = createSidebarReportsCollection([
                    {
                        reportName: 'Alpha',
                        isPinned: false,
                        hasErrorsOtherThanFailedReceipt: false,
                        lastVisibleActionCreated: '2024-01-01 10:00:00',
                    },
                    {
                        reportName: 'Beta',
                        isPinned: false,
                        hasErrorsOtherThanFailedReceipt: false,
                        lastVisibleActionCreated: '2024-01-02 10:00:00',
                    },
                ]);

                const mockLocaleCompare = (a: string, b: string) => a.localeCompare(b);

                // When the reports are sorted in default mode
                const defaultResult = SidebarUtils.sortReportsToDisplayInLHN(reports, CONST.PRIORITY_MODE.DEFAULT, mockLocaleCompare);

                // When the reports are sorted in GSD mode
                const gsdResult = SidebarUtils.sortReportsToDisplayInLHN(reports, CONST.PRIORITY_MODE.GSD, mockLocaleCompare);

                // Then the reports are sorted in the correct order
                expect(defaultResult).toEqual(['1', '0']); // Most recent first (index 1 has later date)
                expect(gsdResult).toEqual(['0', '1']); // Alphabetical (Alpha comes before Beta)
            });
        });
    });
});
