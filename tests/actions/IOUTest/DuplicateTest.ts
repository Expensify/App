/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {OnyxEntry, OnyxInputValue} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {duplicateExpenseTransaction, mergeDuplicates, resolveDuplicates} from '@libs/actions/IOU/Duplicate';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import {buildOptimisticIOUReport, buildOptimisticIOUReportAction} from '@libs/ReportUtils';
import {buildOptimisticTransaction, isTimeRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as API from '@src/libs/API';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OriginalMessageIOU, Report, ReportActions} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import type {TransactionCollectionDataSet} from '@src/types/onyx/Transaction';
import currencyList from '../../unit/currencyList.json';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomPolicyCategories from '../../utils/collections/policyCategory';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction, {createRandomDistanceRequestTransaction} from '../../utils/collections/transaction';
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

        const createMockIouAction = (transactionID: string, reportActionID: string, childReportID: string): ReportAction => ({
            reportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            created: '2024-01-01 12:00:00',
            originalMessage: {
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
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
    });

    describe('duplicateExpenseTransaction', () => {
        const mockOptimisticChatReportID = '789';
        const mockOptimisticIOUReportID = '987';
        const mockIsASAPSubmitBetaEnabled = false;

        const mockTransaction = createRandomTransaction(1);
        const mockPolicy = createRandomPolicy(1);
        const policyExpenseChat = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        const fakePolicyCategories = createRandomPolicyCategories(3);

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
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                allTransactionDrafts: {},
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
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                allTransactionDrafts: {},
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

        it('should create a duplicate distance expense with all fields duplicated', async () => {
            const randomDistanceTransaction = createRandomDistanceRequestTransaction(1, true);

            const DISTANCE_MI = 11.23;

            const mockDistanceTransaction = {
                ...randomDistanceTransaction,
                amount: randomDistanceTransaction.amount * -1,
                comment: {
                    ...randomDistanceTransaction.comment,
                    customUnit: {
                        ...randomDistanceTransaction.comment?.customUnit,
                        quantity: DISTANCE_MI,
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
                customUnitPolicyID: '',
                targetPolicy: mockPolicy,
                targetPolicyCategories: fakePolicyCategories,
                targetReport: policyExpenseChat,
                allTransactionDrafts: {},
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

            if (!duplicatedTransaction) {
                return;
            }

            expect(duplicatedTransaction?.transactionID).not.toBe(mockDistanceTransaction.transactionID);
            expect(duplicatedTransaction?.comment?.customUnit?.name).toEqual(CONST.CUSTOM_UNITS.NAME_DISTANCE);
            expect(duplicatedTransaction?.comment?.customUnit?.distanceUnit).toEqual(mockDistanceTransaction.comment?.customUnit?.distanceUnit);
            expect(duplicatedTransaction?.comment?.customUnit?.quantity).toEqual(DISTANCE_MI);
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
});
