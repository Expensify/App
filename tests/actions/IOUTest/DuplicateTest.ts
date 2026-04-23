/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {OnyxEntry, OnyxInputValue} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getReportPreviewAction} from '@libs/actions/IOU';
import {bulkDuplicateExpenses, bulkDuplicateReports, duplicateExpenseTransaction, duplicateReport, mergeDuplicates, resolveDuplicates} from '@libs/actions/IOU/Duplicate';
import type {BulkDuplicateReportsParams, DuplicateReportParams} from '@libs/actions/IOU/Duplicate';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {addComment, openReport} from '@libs/actions/Report';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, getReportAction} from '@libs/ReportActionsUtils';
import {buildOptimisticIOUReport, buildOptimisticIOUReportAction, buildTransactionThread} from '@libs/ReportUtils';
import {buildOptimisticTransaction, isTimeRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as API from '@src/libs/API';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OriginalMessageIOU, Policy, PolicyTagLists, RecentWaypoint, Report, ReportActions} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import type {TransactionCollectionDataSet} from '@src/types/onyx/Transaction';
import currencyList from '../../unit/currencyList.json';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomPolicyCategories from '../../utils/collections/policyCategory';
import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import {getGlobalFetchMock, getOnyxData} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const topMostReportID = '23423423';
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => topMostReportID),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenByKey: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    getActiveRoute: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@src/libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        notifyNewAction: jest.fn(),
    };
});
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();
describe('actions/Duplicate', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    describe('mergeDuplicates', () => {
        let writeSpy: jest.SpyInstance;

        beforeEach(() => {
            jest.clearAllMocks();
            global.fetch = getGlobalFetchMock();
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            writeSpy = jest.spyOn(API, 'write').mockImplementation((command, params, options) => {
                // Apply optimistic data for testing
                if (options?.optimisticData) {
                    for (const update of options.optimisticData) {
                        if (update.onyxMethod === Onyx.METHOD.MERGE) {
                            Onyx.merge(update.key, update.value);
                        } else if (update.onyxMethod === Onyx.METHOD.SET) {
                            Onyx.set(update.key, update.value);
                        }
                    }
                }
                return Promise.resolve();
            });
            return Onyx.clear();
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        const createMockTransaction = (id: string, reportID: string, amount = 100): Transaction => ({
            ...createRandomTransaction(Number(id)),
            transactionID: id,
            reportID,
            amount,
            created: '2024-01-01 12:00:00',
            currency: 'EUR',
            merchant: 'Test Merchant',
            modifiedMerchant: 'Updated Merchant',
            comment: {comment: 'Updated comment'},
            category: 'Travel',
            tag: 'UpdatedProject',
            billable: true,
            reimbursable: false,
        });

        const createMockReport = (reportID: string, total = 300): Report => ({
            ...createRandomReport(Number(reportID), undefined),
            reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            total,
        });

        const createMockViolations = () => [
            {name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.VIOLATION},
            {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
        ];

        const createMockIouAction = (transactionID: string, reportActionID: string, childReportID: string, IOUReportID?: string): ReportAction => ({
            reportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            created: '2024-01-01 12:00:00',
            originalMessage: {
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUReportID,
            } as OriginalMessageIOU,
            message: [{type: 'TEXT', text: 'Test IOU message'}],
            childReportID,
        });

        it('should merge duplicate transactions successfully', async () => {
            // Given: Set up test data with main transaction and duplicates
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const duplicate1ID = 'dup456';
            const duplicate2ID = 'dup789';
            const duplicateTransactionIDs = [duplicate1ID, duplicate2ID];
            const childReportID = 'child123';

            const mainTransaction = createMockTransaction(mainTransactionID, reportID, 150);
            const duplicateTransaction1 = createMockTransaction(duplicate1ID, reportID, 100);
            const duplicateTransaction2 = createMockTransaction(duplicate2ID, reportID, 50);
            const expenseReport = createMockReport(reportID, 300);

            const mainViolations = createMockViolations();
            const duplicate1Violations = createMockViolations();
            const duplicate2Violations = createMockViolations();

            const iouAction1 = createMockIouAction(duplicate1ID, 'action456', childReportID);
            const iouAction2 = createMockIouAction(duplicate2ID, 'action789', childReportID);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`, duplicateTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate2ID}`, duplicateTransaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`, duplicate1Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate2ID}`, duplicate2Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                action456: iouAction1,
                action789: iouAction2,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`, {});
            await waitForBatchedUpdates();

            const mergeParams = {
                transactionID: mainTransactionID,
                transactionIDList: duplicateTransactionIDs,
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call mergeDuplicates
            mergeDuplicates(mergeParams);
            await waitForBatchedUpdates();

            // Then: Verify main transaction was updated
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                billable: true,
                comment: {comment: 'Updated comment'},
                category: 'Travel',
                created: '2024-01-01 12:00:00',
                currency: CONST.CURRENCY.EUR,
                modifiedMerchant: 'Updated Merchant',
                reimbursable: false,
                tag: 'UpdatedProject',
            });

            // Then: Verify duplicate transactions were removed
            const removedDuplicate1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`);
            const removedDuplicate2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate2ID}`);
            expect(removedDuplicate1).toBeFalsy();
            expect(removedDuplicate2).toBeFalsy();

            // Then: Verify violations were filtered to remove DUPLICATED_TRANSACTION
            const updatedMainViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`);
            const updatedDup1Violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`);
            const updatedDup2Violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate2ID}`);

            expect(updatedMainViolations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]);
            expect(updatedDup1Violations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]);
            expect(updatedDup2Violations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]);

            // Then: Verify expense report total was updated
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
            expect(updatedReport?.total).toBe(150); // 300 - 100 - 50 = 150

            // Then: Verify IOU actions were marked as deleted
            const updatedReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
            expect(getOriginalMessage(updatedReportActions?.action456)).toHaveProperty('deleted');
            expect(getOriginalMessage(updatedReportActions?.action789)).toHaveProperty('deleted');

            // Then: Verify API was called with correct parameters
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.MERGE_DUPLICATES,
                expect.objectContaining(mergeParams),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([]),
                    failureData: expect.arrayContaining([]),
                }),
            );
        });

        it('should handle empty duplicate transaction list', async () => {
            // Given: Set up test data with only main transaction
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const mainTransaction = createMockTransaction(mainTransactionID, reportID);
            const expenseReport = createMockReport(reportID, 150);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, []);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {});
            await waitForBatchedUpdates();

            const mergeParams = {
                transactionID: mainTransactionID,
                transactionIDList: [],
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call mergeDuplicates with empty duplicate list
            mergeDuplicates(mergeParams);
            await waitForBatchedUpdates();

            // Then: Verify main transaction was still updated
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                billable: true,
                comment: {comment: 'Updated comment'},
                category: 'Travel',
                modifiedMerchant: 'Updated Merchant',
            });

            // Then: Verify expense report total remained unchanged (no duplicates to subtract)
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
            expect(updatedReport?.total).toBe(150);
        });

        it('should handle missing expense report gracefully', async () => {
            // Given: Set up test data without expense report
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const duplicate1ID = 'dup456';
            const duplicateTransactionIDs = [duplicate1ID];

            const mainTransaction = createMockTransaction(mainTransactionID, reportID);
            const duplicateTransaction = createMockTransaction(duplicate1ID, reportID, 50);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`, duplicateTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, []);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`, []);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {});
            await waitForBatchedUpdates();

            const mergeParams = {
                transactionID: mainTransactionID,
                transactionIDList: duplicateTransactionIDs,
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call mergeDuplicates without expense report
            mergeDuplicates(mergeParams);
            await waitForBatchedUpdates();

            // Then: Verify function completed without errors
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                category: 'Travel',
                modifiedMerchant: 'Updated Merchant',
            });

            // Then: Verify API was still called
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.MERGE_DUPLICATES, expect.objectContaining({}), expect.objectContaining({}));
        });

        it('should delete the thread reports of the duplicated transactions and update the comment count of the preview report', async () => {
            // Given: Set up test data with main transaction and duplicates
            const chatReportID = 'report123';
            const reportID = 'report456';
            const mainTransactionID = 'main123';
            const duplicate1ID = 'dup456';
            const duplicate2ID = 'dup789';
            const duplicateTransactionIDs = [duplicate1ID, duplicate2ID];
            const previewActionID = 'action123';
            const iouAction1ID = 'action456';
            const iouAction2ID = 'action789';

            const chatReport: Report = {
                ...createRandomReport(0, undefined),
                policyID: CONST.POLICY.ID_FAKE,
                parentReportID: undefined,
                parentReportActionID: undefined,
                reportID: chatReportID,
                type: 'chat',
            };
            let previewAction: OnyxEntry<ReportAction> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                reportActionID: previewActionID,
                childMoneyRequestCount: 3,
                childVisibleActionCount: 0,
                originalMessage: {linkedReportID: reportID},
            };
            const expenseReport: Report = {
                ...createMockReport(reportID, 300),
                chatReportID: chatReport.reportID,
                parentReportID: chatReport.reportID,
                parentReportActionID: previewAction.reportActionID,
            };
            const mainTransaction = createMockTransaction(mainTransactionID, reportID, 100);
            const duplicateTransaction1 = createMockTransaction(duplicate1ID, reportID, 100);
            const duplicateTransaction2 = createMockTransaction(duplicate2ID, reportID, 100);

            const mainViolations = createMockViolations();
            const duplicate1Violations = createMockViolations();
            const duplicate2Violations = createMockViolations();

            let iouAction1 = createMockIouAction(duplicate1ID, iouAction1ID, '', reportID) as OnyxEntry<ReportAction>;
            let iouAction2 = createMockIouAction(duplicate2ID, iouAction2ID, '', reportID) as OnyxEntry<ReportAction>;

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`, duplicateTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate2ID}`, duplicateTransaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`, duplicate1Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate2ID}`, duplicate2Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                [previewActionID]: previewAction,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [iouAction1ID]: iouAction1,
                [iouAction2ID]: iouAction2,
            });
            await waitForBatchedUpdates();

            const transactionThreadReport1 = buildTransactionThread(iouAction1, expenseReport);
            const transactionThreadReport2 = buildTransactionThread(iouAction2, expenseReport);

            expect(transactionThreadReport1.participants).toEqual({
                [RORY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN},
            });
            expect(transactionThreadReport2.participants).toEqual({
                [RORY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN},
            });

            const participantAccountIDs = Object.keys(transactionThreadReport1.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);
            jest.advanceTimersByTime(10);
            const allPersonalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
            const participants = userLogins.map((login, index) => ({
                login,
                accountID: participantAccountIDs.at(index),
            }));
            openReport({
                reportID: transactionThreadReport1.reportID,
                introSelected: undefined,
                personalDetails: allPersonalDetails,
                participants,
                betas: undefined,
                newReportObject: transactionThreadReport1,
                parentReportActionID: iouAction1?.reportActionID,
            });
            openReport({
                reportID: transactionThreadReport2.reportID,
                introSelected: undefined,
                personalDetails: allPersonalDetails,
                participants,
                betas: undefined,
                newReportObject: transactionThreadReport1,
                parentReportActionID: iouAction2?.reportActionID,
            });
            await waitForBatchedUpdates();

            let transactionThreadReportActions1: OnyxEntry<ReportActions>;
            let transactionThreadReportActions2: OnyxEntry<ReportActions>;
            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport1.reportID}`,
                callback: (val) => (transactionThreadReportActions1 = val),
            });
            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport2.reportID}`,
                callback: (val) => (transactionThreadReportActions2 = val),
            });
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport1.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report).toBeTruthy();
                        resolve();
                    },
                });
            });
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport2.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report).toBeTruthy();
                        resolve();
                    },
                });
            });

            jest.advanceTimersByTime(10);

            // When a comment is added
            const addCommentToThread = async (thread: Report, iouActionID: string, message: string) => {
                const updatedIouAction = getReportAction(expenseReport.reportID, iouActionID);
                const updatedPreviewAction = getReportAction(chatReport.reportID, previewActionID);
                const ancestors = [];
                ancestors.push(...(updatedIouAction ? [{report: expenseReport, reportAction: updatedIouAction, shouldDisplayNewMarker: false}] : []));
                ancestors.push(...(updatedPreviewAction ? [{report: chatReport, reportAction: updatedPreviewAction, shouldDisplayNewMarker: false}] : []));
                addComment({
                    report: thread,
                    notifyReportID: thread.reportID,
                    ancestors,
                    text: message,
                    timezoneParam: CONST.DEFAULT_TIME_ZONE,
                    currentUserAccountID: RORY_ACCOUNT_ID,
                });
                await waitForBatchedUpdates();
            };
            await addCommentToThread(transactionThreadReport1, iouAction1ID, 'Testing a comment');
            await addCommentToThread(transactionThreadReport1, iouAction1ID, 'Testing a comment1');
            await addCommentToThread(transactionThreadReport2, iouAction2ID, 'Testing a comment2');

            // Then the report should have 3 actions
            expect(Object.values(transactionThreadReportActions1 ?? {}).length).toBe(3);
            // And the report should have 2 actions
            expect(Object.values(transactionThreadReportActions2 ?? {}).length).toBe(2);

            iouAction1 = getReportAction(expenseReport.reportID, iouAction1ID);
            iouAction2 = getReportAction(expenseReport.reportID, iouAction2ID);
            previewAction = getReportAction(chatReport.reportID, previewActionID);
            expect(iouAction1?.childVisibleActionCount).toBe(2);
            expect(iouAction2?.childVisibleActionCount).toBe(1);
            expect(previewAction?.childVisibleActionCount).toBe(3);

            await waitForBatchedUpdates();

            const mergeParams = {
                transactionID: mainTransactionID,
                transactionIDList: duplicateTransactionIDs,
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 100,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call mergeDuplicates
            mergeDuplicates(mergeParams);
            await waitForBatchedUpdates();

            // Then we expect the reportPreview to update with new childVisibleActionCount
            previewAction = getReportPreviewAction(chatReport?.reportID, expenseReport?.reportID) ?? undefined;
            expect(previewAction).toBeTruthy();
            expect(previewAction?.childVisibleActionCount).toEqual(0);
            expect(previewAction?.childCommenterCount).toEqual(0);

            // Then the transaction thread report should be ready to be deleted
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport1.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.reportID).toBeFalsy();
                        resolve();
                    },
                });
            });

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport2.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.reportID).toBeFalsy();
                        resolve();
                    },
                });
            });

            // Then the transaction thread report should be deleted in the success onyx data
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.MERGE_DUPLICATES,
                expect.objectContaining(mergeParams),
                expect.objectContaining({
                    successData: expect.arrayContaining([
                        expect.objectContaining({key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport1.reportID}`, value: null}),
                        expect.objectContaining({key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport2.reportID}`, value: null}),
                    ]),
                }),
            );
        });

        it('should create an optimistic transaction thread report when transactionThreadReportID is provided', async () => {
            // Given: Set up test data with main transaction and a duplicate, plus an IOU action for the main transaction
            const reportID = 'report123';
            const chatReportID = 'chatReport123';
            const mainTransactionID = 'main123';
            const duplicate1ID = 'dup456';
            const duplicateTransactionIDs = [duplicate1ID];
            const optimisticTransactionThreadReportID = 'optimisticThread999';

            const mainTransaction = createMockTransaction(mainTransactionID, reportID, 150);
            const duplicateTransaction1 = createMockTransaction(duplicate1ID, reportID, 100);
            const expenseReport: Report = {
                ...createMockReport(reportID, 250),
                chatReportID,
                parentReportID: chatReportID,
            };

            const mainViolations = createMockViolations();
            const duplicate1Violations = createMockViolations();

            // Create an IOU action for the main transaction so getIOUActionForReportID can find it
            const mainIouAction = createMockIouAction(mainTransactionID, 'mainAction123', '', reportID);
            const dupIouAction = createMockIouAction(duplicate1ID, 'action456', '', reportID);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`, duplicateTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`, duplicate1Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                mainAction123: mainIouAction,
                action456: dupIouAction,
            });
            await waitForBatchedUpdates();

            const mergeParams = {
                transactionID: mainTransactionID,
                transactionIDList: duplicateTransactionIDs,
                transactionThreadReportID: optimisticTransactionThreadReportID,
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call mergeDuplicates with transactionThreadReportID
            mergeDuplicates(mergeParams);
            await waitForBatchedUpdates();

            // Then: Verify the optimistic transaction thread report was created
            const optimisticThreadReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThreadReportID}`);
            expect(optimisticThreadReport).toBeTruthy();
            expect(optimisticThreadReport?.pendingFields?.createChat).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            // Then: Verify API was called with the transactionThreadReportID and createdReportActionIDForThread
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.MERGE_DUPLICATES,
                expect.objectContaining({
                    transactionThreadReportID: optimisticTransactionThreadReportID,
                    createdReportActionIDForThread: expect.any(String),
                }),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThreadReportID}`,
                        }),
                    ]),
                }),
            );
        });
    });

    describe('resolveDuplicates', () => {
        let writeSpy: jest.SpyInstance;

        beforeEach(() => {
            jest.clearAllMocks();
            global.fetch = getGlobalFetchMock();
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            writeSpy = jest.spyOn(API, 'write').mockImplementation((command, params, options) => {
                // Apply optimistic data for testing
                if (options?.optimisticData) {
                    for (const update of options.optimisticData) {
                        if (update.onyxMethod === Onyx.METHOD.MERGE) {
                            Onyx.merge(update.key, update.value);
                        } else if (update.onyxMethod === Onyx.METHOD.SET) {
                            Onyx.set(update.key, update.value);
                        }
                    }
                }
                return Promise.resolve();
            });
            return Onyx.clear();
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        const createMockTransaction = (id: string, reportID: string, amount = 100): Transaction => ({
            ...createRandomTransaction(Number(id)),
            transactionID: id,
            reportID,
            amount,
            created: '2024-01-01 12:00:00',
            currency: 'EUR',
            merchant: 'Test Merchant',
            modifiedMerchant: 'Updated Merchant',
            comment: {comment: 'Updated comment'},
            category: 'Travel',
            tag: 'UpdatedProject',
            billable: true,
            reimbursable: false,
        });

        const createMockViolations = () => [
            {name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.VIOLATION},
            {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
        ];

        const createMockIouAction = (transactionID: string, reportActionID: string, childReportID: string) => ({
            reportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            },
            message: [{type: 'TEXT', text: 'Test IOU message'}],
            childReportID,
        });

        it('should resolve duplicate transactions successfully', async () => {
            // Given: Set up test data with main transaction and duplicates
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const duplicate1ID = 'dup456';
            const duplicate2ID = 'dup789';
            const duplicateTransactionIDs = [duplicate1ID, duplicate2ID];
            const childReportID1 = 'child456';
            const childReportID2 = 'child789';
            const mainChildReportID = 'mainChild123';

            const mainTransaction = createMockTransaction(mainTransactionID, reportID, 150);
            const duplicateTransaction1 = createMockTransaction(duplicate1ID, reportID, 100);
            const duplicateTransaction2 = createMockTransaction(duplicate2ID, reportID, 50);

            const mainViolations = createMockViolations();
            const duplicate1Violations = createMockViolations();
            const duplicate2Violations = createMockViolations();

            const iouAction1 = createMockIouAction(duplicate1ID, 'action456', childReportID1);
            const iouAction2 = createMockIouAction(duplicate2ID, 'action789', childReportID2);
            const mainIouAction = createMockIouAction(mainTransactionID, 'mainAction123', mainChildReportID);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`, duplicateTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate2ID}`, duplicateTransaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`, duplicate1Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate2ID}`, duplicate2Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                action456: iouAction1,
                action789: iouAction2,
                mainAction123: mainIouAction,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID1}`, {});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID2}`, {});
            await waitForBatchedUpdates();

            const resolveParams = {
                transactionID: mainTransactionID,
                transactionIDList: duplicateTransactionIDs,
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call resolveDuplicates
            resolveDuplicates(resolveParams);
            await waitForBatchedUpdates();

            // Then: Verify main transaction was updated
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                billable: true,
                comment: {comment: 'Updated comment'},
                category: 'Travel',
                created: '2024-01-01 12:00:00',
                currency: CONST.CURRENCY.EUR,
                modifiedMerchant: 'Updated Merchant',
                reimbursable: false,
                tag: 'UpdatedProject',
            });

            // Then: Verify duplicate transactions still exist (unlike mergeDuplicates)
            const duplicateTransaction1Updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`);
            const duplicateTransaction2Updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate2ID}`);
            expect(duplicateTransaction1Updated).not.toBeNull();
            expect(duplicateTransaction2Updated).not.toBeNull();

            // Then: Verify violations were updated - main transaction should not have DUPLICATED_TRANSACTION or HOLD
            const updatedMainViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`);
            expect(updatedMainViolations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]);

            // Then: Verify duplicate transactions have HOLD violation added but DUPLICATED_TRANSACTION removed
            const updatedDup1Violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`);
            const updatedDup2Violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate2ID}`);

            expect(updatedDup1Violations).toEqual(
                expect.arrayContaining([
                    {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION},
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                ]),
            );
            expect(updatedDup2Violations).toEqual(
                expect.arrayContaining([
                    {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION},
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                ]),
            );

            // Then: Verify hold report actions were created in child report threads
            const childReportActions1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID1}`);
            const childReportActions2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID2}`);

            // Should have hold actions added
            expect(Object.keys(childReportActions1 ?? {})).toHaveLength(1);
            expect(Object.keys(childReportActions2 ?? {})).toHaveLength(1);

            // Then: Verify dismissed violation action was created in main transaction thread
            const mainChildReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mainChildReportID}`);
            expect(Object.keys(mainChildReportActions ?? {})).toHaveLength(1);

            // Then: Verify API was called with correct parameters
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.RESOLVE_DUPLICATES,
                expect.objectContaining({
                    transactionID: mainTransactionID,
                    transactionIDList: duplicateTransactionIDs,
                    reportActionIDList: expect.arrayContaining([]),
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    dismissedViolationReportActionID: expect.anything(),
                }),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([]),
                    failureData: expect.arrayContaining([]),
                }),
            );
        });

        it('should return early when transactionID is undefined', async () => {
            // Given: Params with undefined transactionID
            const resolveParams = {
                transactionID: undefined,
                transactionIDList: ['dup456'],
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID: 'report123',
            };

            // When: Call resolveDuplicates with undefined transactionID
            resolveDuplicates(resolveParams);
            await waitForBatchedUpdates();

            // Then: Verify API was not called
            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('should handle empty duplicate transaction list', async () => {
            // Given: Set up test data with only main transaction
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const mainChildReportID = 'mainChild123';

            const mainTransaction = createMockTransaction(mainTransactionID, reportID);
            const mainViolations = createMockViolations();
            const mainIouAction = createMockIouAction(mainTransactionID, 'mainAction123', mainChildReportID);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                mainAction123: mainIouAction,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mainChildReportID}`, {});
            await waitForBatchedUpdates();

            const resolveParams = {
                transactionID: mainTransactionID,
                transactionIDList: [],
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call resolveDuplicates with empty duplicate list
            resolveDuplicates(resolveParams);
            await waitForBatchedUpdates();

            // Then: Verify main transaction was still updated
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                billable: true,
                category: 'Travel',
                modifiedMerchant: 'Updated Merchant',
            });

            // Then: Verify main transaction violations were still filtered
            const updatedMainViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`);
            expect(updatedMainViolations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]);

            // Then: Verify API was called
            // eslint-disable-next-line
            expect(API.write).toHaveBeenCalledWith(WRITE_COMMANDS.RESOLVE_DUPLICATES, expect.objectContaining({}), expect.objectContaining({}));
        });

        it('should handle missing IOU actions gracefully', async () => {
            // Given: Set up test data without IOU actions
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const duplicate1ID = 'dup456';
            const duplicateTransactionIDs = [duplicate1ID];

            const mainTransaction = createMockTransaction(mainTransactionID, reportID);
            const duplicateTransaction = createMockTransaction(duplicate1ID, reportID);
            const mainViolations = createMockViolations();
            const duplicateViolations = createMockViolations();

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`, duplicateTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`, duplicateViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {});
            await waitForBatchedUpdates();

            const resolveParams = {
                transactionID: mainTransactionID,
                transactionIDList: duplicateTransactionIDs,
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call resolveDuplicates without IOU actions
            resolveDuplicates(resolveParams);
            await waitForBatchedUpdates();

            // Then: Verify function completed without errors
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                category: 'Travel',
                modifiedMerchant: 'Updated Merchant',
            });

            // Then: Verify violations were still processed
            const updatedDuplicateViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`);
            expect(updatedDuplicateViolations).toEqual(
                expect.arrayContaining([
                    {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION},
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                ]),
            );

            // Then: Verify API was called
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.RESOLVE_DUPLICATES, expect.objectContaining({}), expect.objectContaining({}));
        });

        it('should handle cross-report duplicates by finding IOU actions in each transaction own report', async () => {
            // Given: Duplicate transactions that belong to different reports
            const reportA = 'reportA';
            const reportB = 'reportB';
            const mainTransactionID = 'mainTx';
            const crossReportDuplicateID = 'crossDupTx';
            const childReportIDMain = 'childMain';
            const childReportIDCross = 'childCross';

            // Main transaction lives in reportA
            const mainTransaction = createMockTransaction(mainTransactionID, reportA, 100);
            // Duplicate transaction lives in reportB (cross-report duplicate)
            const crossDuplicateTransaction = createMockTransaction(crossReportDuplicateID, reportB, 100);

            const mainViolations = createMockViolations();
            const crossDuplicateViolations = createMockViolations();

            // IOU actions live in their respective transaction reports
            const mainIouAction = createMockIouAction(mainTransactionID, 'actionMain', childReportIDMain);
            const crossIouAction = createMockIouAction(crossReportDuplicateID, 'actionCross', childReportIDCross);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${crossReportDuplicateID}`, crossDuplicateTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${crossReportDuplicateID}`, crossDuplicateViolations);
            // Each IOU action is stored under its own report's report actions
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportA}`, {
                actionMain: mainIouAction,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportB}`, {
                actionCross: crossIouAction,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportIDCross}`, {});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportIDMain}`, {});
            await waitForBatchedUpdates();

            const resolveParams = {
                transactionID: mainTransactionID,
                transactionIDList: [crossReportDuplicateID],
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 100,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID: reportA,
            };

            // When: Call resolveDuplicates with cross-report duplicates
            resolveDuplicates(resolveParams);
            await waitForBatchedUpdates();

            // Then: The cross-report duplicate transaction should be put on hold
            const updatedCrossDuplicate = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${crossReportDuplicateID}`);
            expect(updatedCrossDuplicate?.comment?.hold).toBeDefined();

            // Then: Hold report action should be created in the cross-report duplicate's child report thread
            const crossChildReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportIDCross}`);
            expect(Object.keys(crossChildReportActions ?? {})).toHaveLength(1);

            // Then: The cross-report duplicate should have HOLD violation but no DUPLICATED_TRANSACTION
            const updatedCrossViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${crossReportDuplicateID}`);
            expect(updatedCrossViolations).toEqual(
                expect.arrayContaining([
                    {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION},
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                ]),
            );
            expect(updatedCrossViolations).not.toEqual(expect.arrayContaining([{name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.VIOLATION}]));

            // Then: Verify API was called with correct parameters
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.RESOLVE_DUPLICATES,
                expect.objectContaining({
                    transactionID: mainTransactionID,
                    transactionIDList: [crossReportDuplicateID],
                }),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([]),
                    failureData: expect.arrayContaining([]),
                }),
            );
        });
    });

    describe('duplicateExpenseTransaction', () => {
        let writeSpy: jest.SpyInstance;
        let recentWaypoints: RecentWaypoint[] = [];
        let targetPolicyTags: OnyxEntry<PolicyTagLists>;

        const mockOptimisticChatReportID = '789';
        const mockOptimisticIOUReportID = '987';
        const mockIsASAPSubmitBetaEnabled = false;
        const mockPersonalDetails = {
            [RORY_ACCOUNT_ID]: {
                accountID: RORY_ACCOUNT_ID,
                login: RORY_EMAIL,
                displayName: 'Rory',
            },
        };

        const mockTransaction = createRandomTransaction(1);
        const mockPolicy = createRandomPolicy(1);
        const policyExpenseChat = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        const fakePolicyCategories = createRandomPolicyCategories(3);

        beforeEach(async () => {
            jest.clearAllMocks();
            global.fetch = getGlobalFetchMock();
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            writeSpy = jest.spyOn(API, 'write').mockImplementation((command, params, options) => {
                // Apply optimistic data for testing
                if (options?.optimisticData) {
                    for (const update of options.optimisticData) {
                        if (update.onyxMethod === Onyx.METHOD.MERGE) {
                            Onyx.merge(update.key, update.value);
                        } else if (update.onyxMethod === Onyx.METHOD.SET) {
                            Onyx.set(update.key, update.value);
                        }
                    }
                }
                return Promise.resolve();
            });
            recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];
            await getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}`,
                waitForCollectionCallback: true,
                callback: (value) => {
                    targetPolicyTags = value?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${mockPolicy.id}`] ?? {};
                },
            });
            return Onyx.clear();
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        it('should create a duplicate expense successfully', async () => {
            const {waypoints, ...restOfComment} = mockTransaction.comment ?? {};
            const mockCashExpenseTransaction = {
                ...mockTransaction,
                amount: mockTransaction.amount * -1,
                comment: {
                    ...restOfComment,
                },
            };

            await Onyx.clear();

            duplicateExpenseTransaction({
                transaction: mockCashExpenseTransaction,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: mockPersonalDetails,
                betas: [CONST.BETAS.ALL],
                recentWaypoints,
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            let duplicatedTransaction: OnyxEntry<Transaction>;

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    duplicatedTransaction = Object.values(allTransactions ?? {}).find((t) => !!t);
                },
            });

            // Verify that a duplicated transaction was created
            expect(duplicatedTransaction).toBeDefined();
            expect(duplicatedTransaction?.transactionID).toBeDefined();
            // The duplicated transaction should have a different transactionID than the original
            expect(duplicatedTransaction?.transactionID).not.toBe(mockCashExpenseTransaction.transactionID);
        });

        it('should create a duplicate time expense successfully', async () => {
            const transactionID = 'time-1';
            const HOURLY_RATE = 9.99;
            const HOURS_WORKED = 15;
            const AMOUNT_CENTS = Math.round(HOURS_WORKED * HOURLY_RATE * 100);

            const mockTimeExpenseTransaction = {
                ...mockTransaction,
                transactionID,
                amount: AMOUNT_CENTS,
                comment: {
                    type: 'time' as const,
                    units: {
                        unit: 'h' as const,
                        count: HOURS_WORKED,
                        rate: HOURLY_RATE,
                    },
                },
            };

            await Onyx.clear();

            duplicateExpenseTransaction({
                transaction: mockTimeExpenseTransaction,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: mockPersonalDetails,
                betas: [CONST.BETAS.ALL],
                recentWaypoints,
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            let duplicatedTransaction: OnyxEntry<Transaction>;

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    const transactions = Object.values(allTransactions ?? {}).filter((t) => !!t);
                    expect(transactions).toHaveLength(1);
                    duplicatedTransaction = transactions.at(0);
                },
            });

            expect(duplicatedTransaction?.transactionID).not.toBe(transactionID);
            expect(duplicatedTransaction?.comment?.units?.count).toEqual(HOURS_WORKED);
            expect(duplicatedTransaction?.comment?.units?.rate).toEqual(HOURLY_RATE);
            expect(duplicatedTransaction?.comment?.units?.unit).toBe('h');
            expect(duplicatedTransaction?.comment?.type).toBe('time');
            expect(isTimeRequest(duplicatedTransaction)).toBeTruthy();
        });

        it('should create a duplicate expense successfully (previously with transaction drafts)', async () => {
            const {waypoints, ...restOfComment} = mockTransaction.comment ?? {};
            const mockCashExpenseTransaction = {
                ...mockTransaction,
                amount: mockTransaction.amount * -1,
                comment: {
                    ...restOfComment,
                },
            };

            await Onyx.clear();

            duplicateExpenseTransaction({
                transaction: mockCashExpenseTransaction,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
                recentWaypoints: [],
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            let duplicatedTransaction: OnyxEntry<Transaction>;

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    duplicatedTransaction = Object.values(allTransactions ?? {}).find((t) => !!t);
                },
            });

            // Verify that a duplicated transaction was created
            expect(duplicatedTransaction).toBeDefined();
            expect(duplicatedTransaction?.transactionID).toBeDefined();
            // The duplicated transaction should have a different transactionID than the original
            expect(duplicatedTransaction?.transactionID).not.toBe(mockCashExpenseTransaction.transactionID);
        });

        it('should create a duplicate expense successfully (previously with undefined transaction drafts)', async () => {
            const {waypoints, ...restOfComment} = mockTransaction.comment ?? {};
            const mockCashExpenseTransaction = {
                ...mockTransaction,
                amount: mockTransaction.amount * -1,
                comment: {
                    ...restOfComment,
                },
            };

            await Onyx.clear();

            duplicateExpenseTransaction({
                transaction: mockCashExpenseTransaction,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                isSelfTourViewed: false,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
                recentWaypoints: [],
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            let duplicatedTransaction: OnyxEntry<Transaction>;

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    duplicatedTransaction = Object.values(allTransactions ?? {}).find((t) => !!t);
                },
            });

            // Verify that a duplicated transaction was created
            expect(duplicatedTransaction).toBeDefined();
            expect(duplicatedTransaction?.transactionID).toBeDefined();
            expect(duplicatedTransaction?.transactionID).not.toBe(mockCashExpenseTransaction.transactionID);
        });

        it('should create a duplicate time expense successfully (previously with transaction drafts)', async () => {
            const transactionID = 'time-2';
            const HOURLY_RATE = 12.5;
            const HOURS_WORKED = 8;
            const AMOUNT_CENTS = Math.round(HOURS_WORKED * HOURLY_RATE * 100);

            const mockTimeExpenseTransaction = {
                ...mockTransaction,
                transactionID,
                amount: AMOUNT_CENTS,
                comment: {
                    type: 'time' as const,
                    units: {
                        unit: 'h' as const,
                        count: HOURS_WORKED,
                        rate: HOURLY_RATE,
                    },
                },
            };

            await Onyx.clear();

            duplicateExpenseTransaction({
                transaction: mockTimeExpenseTransaction,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                isSelfTourViewed: false,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
                recentWaypoints: [],
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            let duplicatedTransaction: OnyxEntry<Transaction>;

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    const transactions = Object.values(allTransactions ?? {}).filter((t) => !!t);
                    expect(transactions).toHaveLength(1);
                    duplicatedTransaction = transactions.at(0);
                },
            });

            expect(duplicatedTransaction?.transactionID).not.toBe(transactionID);
            expect(duplicatedTransaction?.comment?.units?.count).toEqual(HOURS_WORKED);
            expect(duplicatedTransaction?.comment?.units?.rate).toEqual(HOURLY_RATE);
            expect(duplicatedTransaction?.comment?.units?.unit).toBe('h');
            expect(duplicatedTransaction?.comment?.type).toBe('time');
            expect(isTimeRequest(duplicatedTransaction)).toBeTruthy();
        });

        it('should return early when transaction is undefined', async () => {
            await Onyx.clear();

            duplicateExpenseTransaction({
                transaction: undefined,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
                recentWaypoints: [],
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            // Verify API was NOT called since transaction is undefined
            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('should call trackExpense when no targetPolicy is provided', async () => {
            const {waypoints, ...restOfComment} = mockTransaction.comment ?? {};
            const mockCashExpenseTransaction = {
                ...mockTransaction,
                amount: mockTransaction.amount * -1,
                comment: {
                    ...restOfComment,
                },
            };

            await Onyx.clear();

            duplicateExpenseTransaction({
                transaction: mockCashExpenseTransaction,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                customUnitPolicyID: '',
                targetPolicy: undefined,
                targetPolicyCategories: undefined,
                targetReport: undefined,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
                recentWaypoints: [],
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            // Verify API was called with TRACK_EXPENSE (trackExpense path, not requestMoney)
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.TRACK_EXPENSE, expect.objectContaining({}), expect.objectContaining({}));
        });

        it('should call createDistanceRequest for distance transactions', async () => {
            const mockDistanceTransaction = {
                ...mockTransaction,
                amount: mockTransaction.amount * -1,
                comment: {
                    type: 'customUnit' as const,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    },
                },
            };

            await Onyx.clear();

            duplicateExpenseTransaction({
                transaction: mockDistanceTransaction,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: mockPersonalDetails,
                betas: [CONST.BETAS.ALL],
                recentWaypoints,
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            // Verify API was called with CREATE_DISTANCE_REQUEST
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST, expect.objectContaining({}), expect.objectContaining({}));
        });

        it('should call submitPerDiemExpense for per diem transactions', async () => {
            const mockPerDiemTransaction = {
                ...mockTransaction,
                amount: mockTransaction.amount * -1,
                comment: {
                    type: 'customUnit' as const,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                        customUnitID: 'unit-123',
                        customUnitRateID: 'rate-456',
                        subRates: [{id: 'subrate-1', quantity: 1, name: 'Full Day', rate: 100, currency: 'USD'}],
                        attributes: {
                            dates: {
                                start: '2024-01-01',
                                end: '2024-01-02',
                            },
                        },
                    },
                },
            };

            await Onyx.clear();

            duplicateExpenseTransaction({
                transaction: mockPerDiemTransaction,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
                recentWaypoints: [],
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            // Verify API was called with CREATE_PER_DIEM_REQUEST
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST, expect.objectContaining({}), expect.objectContaining({}));
        });

        it('should not pass linkedTrackedExpenseReportAction.childReportID as transactionThreadReportID to the API', async () => {
            // Given a transaction with linkedTrackedExpenseReportAction set
            // This simulates a split expense that was removed from a report, where the
            // linkedTrackedExpenseReportAction.childReportID points to an already-existing report
            const existingLinkedReportActionChildReportID = 'existing-linked-child-789';

            const {waypoints, ...restOfComment} = mockTransaction.comment ?? {};
            const mockTransactionWithLinkedAction = {
                ...mockTransaction,
                amount: mockTransaction.amount * -1,
                linkedTrackedExpenseReportAction: {
                    reportActionID: 'linked-action-123',
                    childReportID: existingLinkedReportActionChildReportID,
                    actionName: 'IOU',
                    created: '2024-01-01 00:00:00',
                } as ReportAction,
                comment: {
                    ...restOfComment,
                },
            };

            // Seed Onyx with a report whose reportID matches linkedTrackedExpenseReportAction.childReportID.
            // This simulates the real-world scenario where the original expense's transaction thread
            // report already exists in the user's local data. Without this seed, buildTransactionThread
            // would find no existing report in Onyx and generate a fresh ID regardless, causing the
            // test to pass even without the fix. With this seed, buildTransactionThread calls
            // getReportOrDraftReport(existingTransactionThreadReportID), finds this report, and
            // reuses its ID as transactionThreadReportID — which is exactly the collision the fix prevents.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${existingLinkedReportActionChildReportID}`, {
                reportID: existingLinkedReportActionChildReportID,
                reportName: 'Existing Transaction Thread',
                type: CONST.REPORT.TYPE.CHAT,
            });
            await waitForBatchedUpdates();

            // When duplicating the transaction
            duplicateExpenseTransaction({
                transaction: mockTransactionWithLinkedAction,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
                recentWaypoints,
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            // Then the API should have been called with REQUEST_MONEY
            const requestMoneyCall = writeSpy.mock.calls.find((call: [string, Record<string, unknown>]) => call[0] === WRITE_COMMANDS.REQUEST_MONEY);
            expect(requestMoneyCall).toBeDefined();

            // And the transactionThreadReportID in the API call should NOT be the childReportID
            // from the original transaction's linkedTrackedExpenseReportAction.
            // If it were, the backend would try to create a report with an ID that already exists,
            // causing a unique constraint violation.
            const apiParams = requestMoneyCall?.[1] as Record<string, unknown>;
            expect(apiParams?.transactionThreadReportID).not.toBe(existingLinkedReportActionChildReportID);
        });

        it('should call trackExpense API when targetPolicy is not provided', async () => {
            const {waypoints, ...restOfComment} = mockTransaction.comment ?? {};
            const mockCashExpenseTransaction = {
                ...mockTransaction,
                amount: mockTransaction.amount * -1,
                comment: {
                    ...restOfComment,
                },
            };

            await Onyx.clear();

            // When duplicating the transaction without targetPolicy
            duplicateExpenseTransaction({
                transaction: mockCashExpenseTransaction,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                customUnitPolicyID: '',
                targetPolicy: undefined,
                targetPolicyCategories: undefined,
                targetReport: undefined,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
                recentWaypoints,
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            // Then the API should have been called with TRACK_EXPENSE instead of REQUEST_MONEY
            const trackExpenseCall = writeSpy.mock.calls.find((call: [string, Record<string, unknown>]) => call[0] === WRITE_COMMANDS.TRACK_EXPENSE);
            const requestMoneyCall = writeSpy.mock.calls.find((call: [string, Record<string, unknown>]) => call[0] === WRITE_COMMANDS.REQUEST_MONEY);

            expect(trackExpenseCall).toBeDefined();
            expect(requestMoneyCall).toBeUndefined();

            // Then a transaction should be created successfully
            let duplicatedTransaction: OnyxEntry<Transaction>;

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    duplicatedTransaction = Object.values(allTransactions ?? {}).find((t) => !!t);
                },
            });

            expect(duplicatedTransaction).toBeDefined();
            expect(duplicatedTransaction?.transactionID).not.toBe(mockCashExpenseTransaction.transactionID);
        });

        it('should preserve all transaction fields when duplicating Cash expense', async () => {
            // Given a transaction with all fields populated using mockTransaction values
            const {waypoints, ...restOfComment} = mockTransaction.comment ?? {};
            const mockCashExpense: Transaction = {
                ...mockTransaction,
                amount: mockTransaction.amount * -1,
                comment: {
                    ...restOfComment,
                },
            };

            await Onyx.clear();

            // When duplicating the transaction
            duplicateExpenseTransaction({
                transaction: mockCashExpense,
                optimisticChatReportID: mockOptimisticChatReportID,
                optimisticIOUReportID: mockOptimisticIOUReportID,
                isASAPSubmitBetaEnabled: mockIsASAPSubmitBetaEnabled,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
                recentWaypoints,
                targetPolicyTags,
            });

            await waitForBatchedUpdates();

            // The duplicated transaction should have all fields preserved
            let duplicatedTransaction: OnyxEntry<Transaction>;

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    duplicatedTransaction = Object.values(allTransactions ?? {}).find((t) => !!t);
                },
            });

            expect(duplicatedTransaction).toBeDefined();
            expect(duplicatedTransaction?.transactionID).not.toBe(mockCashExpense.transactionID);
            expect(duplicatedTransaction?.category).toBe(mockTransaction.category);
            expect(duplicatedTransaction?.tag).toBe(mockTransaction.tag);
            expect(duplicatedTransaction?.billable).toBe(mockTransaction.billable);
            expect(duplicatedTransaction?.reimbursable).toBe(mockTransaction.reimbursable);
            expect(duplicatedTransaction?.currency).toBe(mockTransaction.currency);
            expect(Math.abs(duplicatedTransaction?.amount ?? 0)).toBe(Math.abs(mockTransaction.amount));
        });
    });

    describe('resolveDuplicate', () => {
        test('Resolving duplicates of two transaction by keeping one of them should properly set the other one on hold even if the transaction thread reports do not exist in onyx', () => {
            // Given two duplicate transactions
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction1 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transaction2 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
            };
            const iouActions: ReportAction[] = [];
            for (const transaction of [transaction1, transaction2]) {
                iouActions.push(
                    buildOptimisticIOUReportAction({
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        comment: '',
                        participants: [],
                        transactionID: transaction.transactionID,
                    }),
                );
            }
            const actions: OnyxInputValue<ReportActions> = {};
            for (const iouAction of iouActions) {
                actions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouAction.reportActionID}`] = iouAction;
            }
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions};

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    // When resolving duplicates with transaction thread reports no existing in onyx
                    resolveDuplicates({
                        ...transaction1,
                        receiptID: 1,
                        category: '',
                        comment: '',
                        billable: false,
                        reimbursable: true,
                        tag: '',
                        transactionIDList: [transaction2.transactionID],
                    });
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`,
                            callback: (transaction) => {
                                Onyx.disconnect(connection);
                                // Then the duplicate transaction should correctly be set on hold.
                                expect(transaction?.comment?.hold).toBeDefined();
                                resolve();
                            },
                        });
                    });
                });
        });
    });

    describe('duplicateReport', () => {
        let writeSpy: jest.SpyInstance;

        const mockPolicy = createRandomPolicy(1);
        const mockPolicyCategories = createRandomPolicyCategories(3);
        const mockPersonalDetails = {
            [RORY_ACCOUNT_ID]: {
                accountID: RORY_ACCOUNT_ID,
                login: RORY_EMAIL,
                displayName: 'Rory',
            },
        };
        const mockOwnerPersonalDetails = {
            accountID: RORY_ACCOUNT_ID,
            login: RORY_EMAIL,
            displayName: 'Rory',
        };

        const mockTranslate = ((path: string, ...args: string[]) => {
            if (path === 'common.copyOfReportName') {
                return `Copy of ${args.at(0)}`;
            }
            return path;
        }) as DuplicateReportParams['translate'];

        const createCashTransaction = (id: string, overrides: Partial<Transaction> = {}): Transaction => ({
            ...createRandomTransaction(Number(id)),
            transactionID: id,
            amount: -500,
            merchant: 'Test Merchant',
            modifiedMerchant: '',
            currency: CONST.CURRENCY.USD,
            cardNumber: '',
            cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            managedCard: false,
            bank: '',
            receipt: {},
            ...overrides,
        });

        const POLICY_EXPENSE_CHAT_REPORT_ID = 'policyExpenseChatReport';

        const getDefaultParams = (sourceTransactions: Transaction[], overrides: Partial<DuplicateReportParams> = {}): DuplicateReportParams => ({
            sourceReport: undefined,
            sourceReportTransactions: sourceTransactions,
            sourceReportName: 'Original Report',
            targetPolicy: mockPolicy,
            targetPolicyCategories: mockPolicyCategories,
            targetPolicyTags: {},
            parentChatReport: {
                reportID: POLICY_EXPENSE_CHAT_REPORT_ID,
                policyID: mockPolicy.id,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.CHAT,
            },
            ownerPersonalDetails: mockOwnerPersonalDetails,
            isASAPSubmitBetaEnabled: false,
            betas: [CONST.BETAS.ALL],
            personalDetails: mockPersonalDetails,
            quickAction: undefined,
            policyRecentlyUsedCurrencies: [],
            draftTransactionIDs: [],
            isSelfTourViewed: false,
            transactionViolations: {},
            translate: mockTranslate,
            recentWaypoints: [],
            ...overrides,
        });

        const countWriteCommandCalls = (command: string) => writeSpy.mock.calls.filter((call: unknown[]) => call.at(0) === command).length;

        beforeEach(async () => {
            jest.clearAllMocks();
            global.fetch = getGlobalFetchMock();
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            writeSpy = jest.spyOn(API, 'write').mockImplementation((command, params, options) => {
                if (options?.optimisticData) {
                    for (const update of options.optimisticData) {
                        if (update.onyxMethod === Onyx.METHOD.MERGE) {
                            Onyx.merge(update.key, update.value);
                        } else if (update.onyxMethod === Onyx.METHOD.SET) {
                            Onyx.set(update.key, update.value);
                        }
                    }
                }
                return Promise.resolve();
            });
            await Onyx.clear();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${POLICY_EXPENSE_CHAT_REPORT_ID}`, {
                reportID: POLICY_EXPENSE_CHAT_REPORT_ID,
                policyID: mockPolicy.id,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.CHAT,
            });
            await waitForBatchedUpdates();
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        it('should create a new report and duplicate all eligible transactions', async () => {
            const tx1 = createCashTransaction('tx1');
            const tx2 = createCashTransaction('tx2', {merchant: 'Coffee Shop'});

            duplicateReport(getDefaultParams([tx1, tx2]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(2);

            const createReportCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.CREATE_APP_REPORT) as unknown[] | undefined;
            expect(createReportCall?.at(1)).toEqual(expect.objectContaining({reportName: 'Copy of Original Report'}));

            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('should filter out credit card import transactions', async () => {
            const cashTx = createCashTransaction('cash1');
            const cardTx = createCashTransaction('card1', {
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.CARD,
            });
            const cashTx2 = createCashTransaction('cash2');

            duplicateReport(getDefaultParams([cashTx, cardTx, cashTx2]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(2);
        });

        it('should filter out accountant (Expensiworks) transactions', async () => {
            const normalTx = createCashTransaction('normal1');
            const accountantTx = createCashTransaction('acct1', {
                accountant: {accountID: 999, login: 'accountant@test.com'},
            });

            duplicateReport(getDefaultParams([normalTx, accountantTx]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(1);
        });

        it('should filter out scanning transactions', async () => {
            const normalTx = createCashTransaction('normal1');
            const scanningTx = createCashTransaction('scan1', {
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                receipt: {
                    source: 'receipt.jpg',
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
            });

            duplicateReport(getDefaultParams([normalTx, scanningTx]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(1);
        });

        it('should route distance transactions through createDistanceRequest', async () => {
            const cashTx = createCashTransaction('cash1');
            const distanceTx = createCashTransaction('dist1', {
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    },
                },
            });

            duplicateReport(getDefaultParams([cashTx, distanceTx]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST)).toBe(1);
        });

        it('should route per diem transactions through submitPerDiemExpense', async () => {
            const cashTx = createCashTransaction('cash1');
            const perDiemTx = createCashTransaction('pd1', {
                iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                        customUnitID: 'unit1',
                        customUnitRateID: 'rate1',
                        subRates: [{id: 'sub1', quantity: 1, name: 'Full Day', rate: 100}],
                        attributes: {dates: {start: '2024-01-01', end: '2024-01-02'}},
                    },
                },
            });

            duplicateReport(getDefaultParams([cashTx, perDiemTx]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST)).toBe(1);
        });

        it('should not duplicate expenses when no target policy exists', async () => {
            const tx1 = createCashTransaction('tx1');
            const tx2 = createCashTransaction('tx2');

            duplicateReport(getDefaultParams([tx1, tx2], {targetPolicy: undefined}));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(0);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(0);

            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('should still create the report when all transactions are ineligible', async () => {
            const cardTx = createCashTransaction('card1', {
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.CARD,
            });
            const accountantTx = createCashTransaction('acct1', {
                accountant: {accountID: 999, login: 'accountant@test.com'},
            });

            duplicateReport(getDefaultParams([cardTx, accountantTx]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(0);

            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('should set duplicated transaction dates to today', async () => {
            const oldDate = '2023-06-15';
            const tx = createCashTransaction('tx1', {created: oldDate});

            duplicateReport(getDefaultParams([tx]));
            await waitForBatchedUpdates();

            const requestMoneyCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as [string, Record<string, unknown>] | undefined;
            expect(requestMoneyCall).toBeDefined();

            const today = new Date().toISOString().slice(0, 10);
            expect(requestMoneyCall?.at(1)).toEqual(expect.objectContaining({created: today}));
        });

        it('should clear receipt data from duplicated transactions', async () => {
            const txWithReceipt = createCashTransaction('tx1', {
                receipt: {source: 'https://example.com/receipt.jpg', state: CONST.IOU.RECEIPT_STATE.OPEN},
            });

            duplicateReport(getDefaultParams([txWithReceipt]));
            await waitForBatchedUpdates();

            const requestMoneyCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as [string, Record<string, unknown>] | undefined;
            expect(requestMoneyCall).toBeDefined();
            expect(requestMoneyCall?.at(1)).toEqual(expect.objectContaining({receipt: undefined}));
        });

        it('should use modifiedMerchant when available', async () => {
            const tx = createCashTransaction('tx1', {
                merchant: 'Original Merchant',
                modifiedMerchant: 'Modified Merchant',
            });

            duplicateReport(getDefaultParams([tx]));
            await waitForBatchedUpdates();

            const requestMoneyCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as [string, Record<string, unknown>] | undefined;
            expect(requestMoneyCall).toBeDefined();
            expect(requestMoneyCall?.at(1)).toEqual(expect.objectContaining({merchant: 'Modified Merchant'}));
        });

        it('should pass the same reportPreviewReportActionID to all expense calls', async () => {
            const tx1 = createCashTransaction('tx1');
            const tx2 = createCashTransaction('tx2');
            const tx3 = createCashTransaction('tx3');

            duplicateReport(getDefaultParams([tx1, tx2, tx3]));
            await waitForBatchedUpdates();

            const requestMoneyCalls = writeSpy.mock.calls.filter((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as Array<[string, Record<string, unknown>]>;
            expect(requestMoneyCalls).toHaveLength(3);

            const firstPreviewID = requestMoneyCalls.at(0)?.[1]?.reportPreviewReportActionID;
            expect(firstPreviewID).toBeDefined();
            for (const call of requestMoneyCalls) {
                expect(call[1].reportPreviewReportActionID).toBe(firstPreviewID);
            }
        });

        it('should target the same chat report for all expense calls', async () => {
            const tx1 = createCashTransaction('tx1');
            const tx2 = createCashTransaction('tx2');

            duplicateReport(getDefaultParams([tx1, tx2]));
            await waitForBatchedUpdates();

            const requestMoneyCalls = writeSpy.mock.calls.filter((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as Array<[string, Record<string, unknown>]>;
            expect(requestMoneyCalls).toHaveLength(2);

            const firstChatReportID = requestMoneyCalls.at(0)?.[1]?.chatReportID;
            const secondChatReportID = requestMoneyCalls.at(1)?.[1]?.chatReportID;
            expect(firstChatReportID).toBeDefined();
            expect(firstChatReportID).toBe(secondChatReportID);
        });

        it('should filter out partial (incomplete) transactions', async () => {
            const normalTx = createCashTransaction('normal1');
            const partialTx = createCashTransaction('partial1', {
                amount: 0,
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            });

            duplicateReport(getDefaultParams([normalTx, partialTx]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(1);
        });

        it('should handle mixed eligible and ineligible transactions correctly', async () => {
            const cashTx = createCashTransaction('cash1');
            const cardTx = createCashTransaction('card1', {transactionType: CONST.SEARCH.TRANSACTION_TYPE.CARD});
            const accountantTx = createCashTransaction('acct1', {accountant: {accountID: 999, login: 'a@test.com'}});
            const cashTx2 = createCashTransaction('cash2');
            const scanningTx = createCashTransaction('scan1', {
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                receipt: {source: 'r.jpg', state: CONST.IOU.RECEIPT_STATE.SCANNING},
            });

            duplicateReport(getDefaultParams([cashTx, cardTx, accountantTx, cashTx2, scanningTx]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(2);
        });

        it('should strip waypoints and use stored distance for split distance expenses', async () => {
            const splitDistanceTx = createCashTransaction('splitDist1', {
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    originalTransactionID: 'origTx1',
                    source: 'split',
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 42,
                    },
                },
            });

            duplicateReport(getDefaultParams([splitDistanceTx]));
            await waitForBatchedUpdates();

            const distanceCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.CREATE_DISTANCE_REQUEST) as [string, Record<string, unknown>] | undefined;
            expect(distanceCall).toBeDefined();
            expect(distanceCall?.at(1)).toEqual(expect.objectContaining({waypoints: 'null'}));
        });

        it('should preserve waypoints for non-split distance expenses', async () => {
            const distanceTx = createCashTransaction('dist1', {
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    },
                    waypoints: {
                        waypoint0: {lat: 37.7749, lng: -122.4194, address: 'San Francisco'},
                        waypoint1: {lat: 34.0522, lng: -118.2437, address: 'Los Angeles'},
                    },
                },
            });

            duplicateReport(getDefaultParams([distanceTx]));
            await waitForBatchedUpdates();

            const distanceCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.CREATE_DISTANCE_REQUEST) as [string, Record<string, unknown>] | undefined;
            expect(distanceCall).toBeDefined();

            const waypoints = distanceCall?.[1]?.waypoints;
            expect(waypoints).toBeDefined();
            expect(waypoints).not.toBe('null');
        });

        it('should correctly route a report with mixed cash, distance, and per diem transactions', async () => {
            const cashTx = createCashTransaction('cash1');
            const distanceTx = createCashTransaction('dist1', {
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    },
                },
            });
            const perDiemTx = createCashTransaction('pd1', {
                iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                        customUnitID: 'unit1',
                        customUnitRateID: 'rate1',
                        subRates: [{id: 'sub1', quantity: 1, name: 'Full Day', rate: 100}],
                        attributes: {dates: {start: '2024-01-01', end: '2024-01-02'}},
                    },
                },
            });
            const cashTx2 = createCashTransaction('cash2');

            duplicateReport(getDefaultParams([cashTx, distanceTx, perDiemTx, cashTx2]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(2);
            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST)).toBe(1);
        });

        it('should preserve transaction fields like category, tag, and currency', async () => {
            const tx = createCashTransaction('tx1', {
                category: 'Travel',
                tag: 'Business',
                currency: 'EUR',
                amount: -1500,
                billable: true,
            });

            duplicateReport(getDefaultParams([tx]));
            await waitForBatchedUpdates();

            const requestMoneyCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as [string, Record<string, unknown>] | undefined;
            expect(requestMoneyCall).toBeDefined();
            expect(requestMoneyCall?.at(1)).toEqual(
                expect.objectContaining({
                    category: 'Travel',
                    tag: 'Business',
                    currency: 'EUR',
                    amount: 1500,
                    billable: true,
                }),
            );
        });

        it('should strip originalTransactionID and source when duplicating split distance expenses', async () => {
            const splitDistanceTx = createCashTransaction('splitDist1', {
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    originalTransactionID: 'origParent123',
                    source: 'split',
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 10,
                    },
                },
            });

            duplicateReport(getDefaultParams([splitDistanceTx]));
            await waitForBatchedUpdates();

            const distanceCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.CREATE_DISTANCE_REQUEST) as [string, Record<string, unknown>] | undefined;
            expect(distanceCall).toBeDefined();

            const allTransactions = await getOnyxValue(ONYXKEYS.COLLECTION.TRANSACTION);
            const duplicatedTransactions = (Object.values(allTransactions ?? {}) as Array<Transaction | null>).filter(
                (tx): tx is Transaction => !!tx && tx.transactionID !== splitDistanceTx.transactionID,
            );
            expect(duplicatedTransactions.length).toBeGreaterThan(0);
            for (const tx of duplicatedTransactions) {
                expect(tx.comment?.originalTransactionID).toBeFalsy();
                expect(tx.comment?.source).not.toBe('split');
            }
        });

        it('should clear modifiedAmount from duplicated transactions', async () => {
            const tx = createCashTransaction('tx1', {
                modifiedAmount: 999,
            });

            duplicateReport(getDefaultParams([tx]));
            await waitForBatchedUpdates();

            const requestMoneyCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as [string, Record<string, unknown>] | undefined;
            expect(requestMoneyCall).toBeDefined();
            expect(requestMoneyCall?.[1]?.modifiedAmount).toBeUndefined();
        });

        it('should not create any expense calls for an empty transactions array', async () => {
            duplicateReport(getDefaultParams([]));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(0);
            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST)).toBe(0);
            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST)).toBe(0);
        });

        it('should pass shouldPlaySound false to individual expense calls', async () => {
            const tx1 = createCashTransaction('tx1');
            const tx2 = createCashTransaction('tx2');

            duplicateReport(getDefaultParams([tx1, tx2]));
            await waitForBatchedUpdates();

            const requestMoneyCalls = writeSpy.mock.calls.filter((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as Array<[string, Record<string, unknown>]>;
            expect(requestMoneyCalls).toHaveLength(2);

            for (const call of requestMoneyCalls) {
                expect(call[1]).not.toEqual(expect.objectContaining({shouldPlaySound: true}));
            }
        });
    });

    describe('bulkDuplicateExpenses', () => {
        let writeSpy: jest.SpyInstance;

        const mockPolicy = createRandomPolicy(1);
        const fakePolicyCategories = createRandomPolicyCategories(3);
        const policyExpenseChat = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

        beforeEach(async () => {
            jest.clearAllMocks();
            global.fetch = getGlobalFetchMock();
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            writeSpy = jest.spyOn(API, 'write').mockImplementation((command, params, options) => {
                if (options?.optimisticData) {
                    for (const update of options.optimisticData) {
                        if (update.onyxMethod === Onyx.METHOD.MERGE) {
                            Onyx.merge(update.key, update.value);
                        } else if (update.onyxMethod === Onyx.METHOD.SET) {
                            Onyx.set(update.key, update.value);
                        }
                    }
                }
                return Promise.resolve();
            });
            return Onyx.clear();
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        it('should create a single IOU report for multiple bulk-duplicated expenses', async () => {
            const tx1: Transaction = {
                ...createRandomTransaction(1),
                transactionID: 'bulk_1',
                amount: -500,
                currency: 'USD',
            };
            const tx2: Transaction = {
                ...createRandomTransaction(2),
                transactionID: 'bulk_2',
                amount: -300,
                currency: 'USD',
            };
            const tx3: Transaction = {
                ...createRandomTransaction(3),
                transactionID: 'bulk_3',
                amount: -200,
                currency: 'USD',
            };
            delete (tx1 as Partial<Transaction>).comment;
            delete (tx2 as Partial<Transaction>).comment;
            delete (tx3 as Partial<Transaction>).comment;

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}bulk_1`]: tx1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}bulk_2`]: tx2,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}bulk_3`]: tx3,
            };

            bulkDuplicateExpenses({
                transactionIDs: ['bulk_1', 'bulk_2', 'bulk_3'],
                allTransactions,
                sourcePolicyIDMap: {},
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetPolicyTags: {},
                targetReport: policyExpenseChat,
                personalDetails: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                isASAPSubmitBetaEnabled: false,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                transactionDrafts: undefined,
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                recentWaypoints: [],
            });

            await waitForBatchedUpdates();

            const requestMoneyCalls = writeSpy.mock.calls.filter((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY);
            expect(requestMoneyCalls).toHaveLength(3);

            const iouReportIDs = new Set(
                requestMoneyCalls.map((call: unknown[]) => {
                    const params = call.at(1) as Record<string, unknown>;
                    return params.iouReportID;
                }),
            );
            expect(iouReportIDs.size).toBe(1);
        });
    });

    describe('bulkDuplicateReports', () => {
        let writeSpy: jest.SpyInstance;

        const SOURCE_POLICY_ID = 'sourcePolicy1';
        const DEFAULT_POLICY_ID = 'defaultPolicy1';
        const OTHER_POLICY_ID = 'otherPolicy1';

        const sourcePolicy = {
            ...createRandomPolicy(100, CONST.POLICY.TYPE.TEAM, 'Source WS'),
            id: SOURCE_POLICY_ID,
            role: CONST.POLICY.ROLE.USER,
            pendingAction: undefined,
            employeeList: {[RORY_EMAIL]: {email: RORY_EMAIL, role: CONST.POLICY.ROLE.USER}},
        };

        const defaultPolicy = {
            ...createRandomPolicy(200, CONST.POLICY.TYPE.TEAM, 'Default WS'),
            id: DEFAULT_POLICY_ID,
            role: CONST.POLICY.ROLE.USER,
            pendingAction: undefined,
            employeeList: {[RORY_EMAIL]: {email: RORY_EMAIL, role: CONST.POLICY.ROLE.USER}},
        };

        const inaccessiblePolicy = {
            ...createRandomPolicy(300, CONST.POLICY.TYPE.TEAM, 'Inaccessible WS'),
            id: OTHER_POLICY_ID,
            role: undefined,
            pendingAction: undefined,
            employeeList: {},
        } as unknown as Policy;

        const ACTIVE_PEC_REPORT_ID = 'activePEC';
        const activePolicyExpenseChat: Report = {
            reportID: ACTIVE_PEC_REPORT_ID,
            policyID: DEFAULT_POLICY_ID,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            ownerAccountID: RORY_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.CHAT,
        };

        const mockTranslate = ((path: string, ...args: string[]) => {
            if (path === 'common.copyOfReportName') {
                return `Copy of ${args.at(0)}`;
            }
            return path;
        }) as BulkDuplicateReportsParams['translate'];

        const createCashTransaction = (id: string, reportID: string, overrides: Partial<Transaction> = {}): Transaction => ({
            ...createRandomTransaction(Number(id.replaceAll(/\D/g, '')) || 1),
            transactionID: id,
            reportID,
            amount: -500,
            merchant: 'Test Merchant',
            modifiedMerchant: '',
            currency: CONST.CURRENCY.USD,
            cardNumber: '',
            cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            managedCard: false,
            bank: '',
            receipt: {},
            ...overrides,
        });

        const getDefaultBulkParams = (reportIDs: string[], overrides: Partial<BulkDuplicateReportsParams> = {}): BulkDuplicateReportsParams => ({
            selectedReports: reportIDs.map((id) => ({
                reportID: id,
                policyID: undefined,
                action: CONST.SEARCH.ACTION_TYPES.DONE,
                allActions: [CONST.SEARCH.ACTION_TYPES.DONE],
                total: 0,
                chatReportID: undefined,
            })),
            allReports: {},
            searchData: undefined,
            allPolicies: {
                [`${ONYXKEYS.COLLECTION.POLICY}${SOURCE_POLICY_ID}`]: sourcePolicy,
                [`${ONYXKEYS.COLLECTION.POLICY}${DEFAULT_POLICY_ID}`]: defaultPolicy,
                [`${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`]: inaccessiblePolicy,
            } as BulkDuplicateReportsParams['allPolicies'],
            allPolicyCategories: {},
            allPolicyTags: {},
            defaultExpensePolicy: defaultPolicy,
            activePolicyExpenseChat,
            ownerPersonalDetails: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL, displayName: 'Rory'},
            currentUserLogin: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            betas: [CONST.BETAS.ALL],
            personalDetails: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL, displayName: 'Rory'}},
            quickAction: undefined,
            policyRecentlyUsedCurrencies: [],
            draftTransactionIDs: [],
            isSelfTourViewed: false,
            transactionViolations: {},
            translate: mockTranslate,
            recentWaypoints: [],
            ...overrides,
        });

        const countWriteCommandCalls = (command: string) => writeSpy.mock.calls.filter((call: unknown[]) => call.at(0) === command).length;

        beforeEach(async () => {
            jest.clearAllMocks();
            global.fetch = getGlobalFetchMock();
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            writeSpy = jest.spyOn(API, 'write').mockImplementation((command, params, options) => {
                if (options?.optimisticData) {
                    for (const update of options.optimisticData) {
                        if (update.onyxMethod === Onyx.METHOD.MERGE) {
                            Onyx.merge(update.key, update.value);
                        } else if (update.onyxMethod === Onyx.METHOD.SET) {
                            Onyx.set(update.key, update.value);
                        }
                    }
                }
                return Promise.resolve();
            });
            await Onyx.clear();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`, activePolicyExpenseChat);
            await waitForBatchedUpdates();
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        it('should duplicate multiple reports, calling CREATE_APP_REPORT for each', async () => {
            const report1: Report = {
                reportID: 'rpt1',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report 1',
                chatReportID: ACTIVE_PEC_REPORT_ID,
            };
            const report2: Report = {
                reportID: 'rpt2',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report 2',
                chatReportID: ACTIVE_PEC_REPORT_ID,
            };

            const tx1 = createCashTransaction('tx1', 'rpt1');
            const tx2 = createCashTransaction('tx2', 'rpt2');
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`, tx1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx2`, tx2);

            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}rpt2`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`]: activePolicyExpenseChat,
            };

            bulkDuplicateReports(getDefaultBulkParams(['rpt1', 'rpt2'], {allReports}));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(2);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(2);
        });

        it('should use source policy when accessible, and fall back to default policy when not', async () => {
            const chatForSource: Report = {
                reportID: 'chatSource',
                policyID: SOURCE_POLICY_ID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                ownerAccountID: RORY_ACCOUNT_ID,
            };
            const report1: Report = {
                reportID: 'rpt1',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Source Policy Report',
                chatReportID: 'chatSource',
            };
            const report2: Report = {
                reportID: 'rpt2',
                policyID: OTHER_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Inaccessible Policy Report',
                chatReportID: 'chatOther',
            };

            const tx1 = createCashTransaction('tx1', 'rpt1');
            const tx2 = createCashTransaction('tx2', 'rpt2');
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`, tx1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx2`, tx2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}chatSource`, chatForSource);

            const sourceCategories = {Travel: {name: 'Travel', enabled: true, areCommentsRequired: false, externalID: '', origin: ''}};
            const defaultCategories = {Office: {name: 'Office', enabled: true, areCommentsRequired: false, externalID: '', origin: ''}};

            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}rpt2`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}chatSource`]: chatForSource,
                [`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`]: activePolicyExpenseChat,
            };

            bulkDuplicateReports(
                getDefaultBulkParams(['rpt1', 'rpt2'], {
                    allReports,
                    allPolicyCategories: {
                        [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${SOURCE_POLICY_ID}`]: sourceCategories,
                        [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${DEFAULT_POLICY_ID}`]: defaultCategories,
                    },
                }),
            );
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(2);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(2);

            const createReportCalls = writeSpy.mock.calls.filter((call: unknown[]) => call.at(0) === WRITE_COMMANDS.CREATE_APP_REPORT) as Array<[string, Record<string, unknown>]>;
            expect(createReportCalls).toHaveLength(2);

            const reportNames = createReportCalls.map((call) => call[1].reportName);
            expect(reportNames).toContain('Copy of Source Policy Report');
            expect(reportNames).toContain('Copy of Inaccessible Policy Report');
        });

        it('should filter out pending-delete transactions', async () => {
            const report1: Report = {
                reportID: 'rpt1',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report 1',
                chatReportID: ACTIVE_PEC_REPORT_ID,
            };

            const normalTx = createCashTransaction('tx1', 'rpt1');
            const deletedTx = createCashTransaction('tx2', 'rpt1', {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`, normalTx);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx2`, deletedTx);

            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`]: activePolicyExpenseChat,
            };

            bulkDuplicateReports(getDefaultBulkParams(['rpt1'], {allReports}));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(1);
        });

        it('should fall back to activePolicyExpenseChat when source chat report is missing', async () => {
            const report1: Report = {
                reportID: 'rpt1',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Orphan Report',
                chatReportID: 'nonexistentChat',
            };

            const tx1 = createCashTransaction('tx1', 'rpt1');
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`, tx1);

            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`]: activePolicyExpenseChat,
            };

            bulkDuplicateReports(getDefaultBulkParams(['rpt1'], {allReports}));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);

            const requestMoneyCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as [string, Record<string, unknown>] | undefined;
            expect(requestMoneyCall).toBeDefined();
            expect(requestMoneyCall?.[1]?.chatReportID).toBe(ACTIVE_PEC_REPORT_ID);
        });

        it('should use activePolicyExpenseChat when source policy is inaccessible', async () => {
            const report1: Report = {
                reportID: 'rpt1',
                policyID: OTHER_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Cross Policy Report',
                chatReportID: 'chatOther',
            };
            const chatOther: Report = {
                reportID: 'chatOther',
                policyID: OTHER_POLICY_ID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                ownerAccountID: RORY_ACCOUNT_ID,
            };

            const tx1 = createCashTransaction('tx1', 'rpt1');
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`, tx1);

            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}chatOther`]: chatOther,
                [`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`]: activePolicyExpenseChat,
            };

            bulkDuplicateReports(getDefaultBulkParams(['rpt1'], {allReports}));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);

            const requestMoneyCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as [string, Record<string, unknown>] | undefined;
            expect(requestMoneyCall).toBeDefined();
            expect(requestMoneyCall?.[1]?.chatReportID).toBe(ACTIVE_PEC_REPORT_ID);
        });

        it('should skip reports with no transactions available', async () => {
            const report1: Report = {
                reportID: 'rpt1',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Real Report',
                chatReportID: ACTIVE_PEC_REPORT_ID,
            };

            const tx1 = createCashTransaction('tx1', 'rpt1');
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`, tx1);

            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`]: activePolicyExpenseChat,
            };

            bulkDuplicateReports(getDefaultBulkParams(['rpt1', 'nonexistent1', 'nonexistent2'], {allReports}));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(1);
        });

        it('should create empty reports for reports with no transactions', async () => {
            const report1: Report = {
                reportID: 'rpt1',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Empty Report',
                chatReportID: ACTIVE_PEC_REPORT_ID,
            };

            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`]: activePolicyExpenseChat,
            };

            bulkDuplicateReports(getDefaultBulkParams(['rpt1'], {allReports}));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(0);
        });

        it('should group transactions correctly per report when duplicating multiple reports', async () => {
            const report1: Report = {
                reportID: 'rpt1',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report 1',
                chatReportID: ACTIVE_PEC_REPORT_ID,
            };
            const report2: Report = {
                reportID: 'rpt2',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report 2',
                chatReportID: ACTIVE_PEC_REPORT_ID,
            };

            const tx1 = createCashTransaction('tx1', 'rpt1', {merchant: 'Merchant A'});
            const tx2 = createCashTransaction('tx2', 'rpt1', {merchant: 'Merchant B'});
            const tx3 = createCashTransaction('tx3', 'rpt2', {merchant: 'Merchant C'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`, tx1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx2`, tx2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx3`, tx3);

            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}rpt2`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`]: activePolicyExpenseChat,
            };

            bulkDuplicateReports(getDefaultBulkParams(['rpt1', 'rpt2'], {allReports}));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(2);
            expect(countWriteCommandCalls(WRITE_COMMANDS.REQUEST_MONEY)).toBe(3);
        });

        it('should resolve categories and tags from source policy when accessible, default policy otherwise', async () => {
            const chatForSource: Report = {
                reportID: 'chatSource',
                policyID: SOURCE_POLICY_ID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                ownerAccountID: RORY_ACCOUNT_ID,
            };
            const report1: Report = {
                reportID: 'rpt1',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Source Report',
                chatReportID: 'chatSource',
            };
            const report2: Report = {
                reportID: 'rpt2',
                policyID: OTHER_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Other Report',
                chatReportID: 'chatOther',
            };

            const tx1 = createCashTransaction('tx1', 'rpt1', {category: 'Travel'});
            const tx2 = createCashTransaction('tx2', 'rpt2', {category: 'Office'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`, tx1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx2`, tx2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}chatSource`, chatForSource);

            const sourceTags: PolicyTagLists = {
                Department: {
                    name: 'Department',
                    orderWeight: 0,
                    required: false,
                    tags: {Engineering: {name: 'Engineering', enabled: true, errors: null, rules: undefined}},
                },
            };

            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}rpt2`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}chatSource`]: chatForSource,
                [`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`]: activePolicyExpenseChat,
            };

            bulkDuplicateReports(
                getDefaultBulkParams(['rpt1', 'rpt2'], {
                    allReports,
                    allPolicyTags: {
                        [`${ONYXKEYS.COLLECTION.POLICY_TAGS}${SOURCE_POLICY_ID}`]: sourceTags,
                    },
                }),
            );
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(2);
        });

        it('should handle parentReportID fallback when chatReportID is undefined', async () => {
            const parentChat: Report = {
                reportID: 'parentChat',
                policyID: SOURCE_POLICY_ID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                ownerAccountID: RORY_ACCOUNT_ID,
            };
            const report1: Report = {
                reportID: 'rpt1',
                policyID: SOURCE_POLICY_ID,
                ownerAccountID: RORY_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report with parentReportID',
                parentReportID: 'parentChat',
            };

            const tx1 = createCashTransaction('tx1', 'rpt1');
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`, tx1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}parentChat`, parentChat);

            const allReports = {
                [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}parentChat`]: parentChat,
                [`${ONYXKEYS.COLLECTION.REPORT}${ACTIVE_PEC_REPORT_ID}`]: activePolicyExpenseChat,
            };

            bulkDuplicateReports(getDefaultBulkParams(['rpt1'], {allReports}));
            await waitForBatchedUpdates();

            expect(countWriteCommandCalls(WRITE_COMMANDS.CREATE_APP_REPORT)).toBe(1);

            const requestMoneyCall = writeSpy.mock.calls.find((call: unknown[]) => call.at(0) === WRITE_COMMANDS.REQUEST_MONEY) as [string, Record<string, unknown>] | undefined;
            expect(requestMoneyCall).toBeDefined();
            expect(requestMoneyCall?.[1]?.chatReportID).toBe('parentChat');
        });
    });
});
