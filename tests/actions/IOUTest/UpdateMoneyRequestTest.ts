import {
    getUpdateTrackExpenseParams,
    updateMoneyRequestAmountAndCurrency,
    updateMoneyRequestAttendees,
    updateMoneyRequestBillable,
    updateMoneyRequestCategory,
    updateMoneyRequestDate,
    updateMoneyRequestDistance,
    updateMoneyRequestMerchant,
    updateMoneyRequestReimbursable,
    updateMoneyRequestTag,
} from '@libs/actions/IOU/UpdateMoneyRequest';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import type * as PolicyUtils from '@libs/PolicyUtils';
import {getOriginalMessage, isActionOfType} from '@libs/ReportActionsUtils';
import {buildOptimisticIOUReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists, RecentlyUsedTags, RecentWaypoint, Report, SearchResults} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {format} from 'date-fns';
import Onyx from 'react-native-onyx';

import type {MockFetch} from '../../utils/TestHelper';

import currencyList from '../../unit/currencyList.json';
import createPersonalDetails from '../../utils/collections/personalDetails';
import createRandomPolicy, {createCategoryTaxExpenseRules} from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import {getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const topMostReportID = '23423423';
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
    navigateBackToLastSuperWideRHPScreen: jest.fn(),
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
        isReady: jest.fn(() => true),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@src/libs/actions/Report', () => {
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        notifyNewAction: jest.fn(),
    };
});
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
jest.mock('@libs/deferredLayoutWrite', () => ({
    registerDeferredWrite: (_key: string, callback: () => void) => callback(),
    flushDeferredWrite: jest.fn(),
    cancelDeferredWrite: jest.fn(),
    hasDeferredWrite: () => false,
    getOptimisticWatchKey: () => undefined,
    deferOrExecuteWrite: (apiWrite: () => void) => apiWrite(),
    reserveDeferredWriteChannel: jest.fn(),
    resetForTesting: jest.fn(),
}));
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();
describe('actions/IOU/UpdateMoneyRequest', () => {
    const currentUserPersonalDetails: CurrentUserPersonalDetails = {
        ...createPersonalDetails(RORY_ACCOUNT_ID),
        login: RORY_EMAIL,
        email: RORY_EMAIL,
        displayName: RORY_EMAIL,
        avatar: 'https://example.com/avatar.jpg',
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL},
                },
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        jest.clearAllTimers();
        global.fetch = getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('updateMoneyRequestCategory', () => {
        it('should update the tax when there are tax expense rules', async () => {
            // Given a policy with tax expense rules associated with category
            const transactionID = '1';
            const policyID = '2';
            const transactionThreadReportID = '3';
            const transactionThreadReport = {reportID: transactionThreadReportID};
            const category = 'Advertising';
            const taxCode = 'id_TAX_EXEMPT';
            const ruleTaxCode = 'id_TAX_RATE_1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                taxRates: CONST.DEFAULT_TAX,
                rules: {
                    expenseRules: createCategoryTaxExpenseRules(category, ruleTaxCode),
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                taxCode,
                taxAmount: 0,
                amount: 100,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);

            // When updating a money request category
            updateMoneyRequestCategory({
                transactionID,
                transactionThreadReport,
                parentReport: undefined,
                iouReportOwnerLogin: undefined,
                category,
                policy: fakePolicy,
                policyTagList: undefined,
                policyCategories: undefined,
                policyRecentlyUsedCategories: [],
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            // Then the transaction tax rate and amount should be updated based on the expense rules
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    callback: (transaction) => {
                        Onyx.disconnect(connection);
                        expect(transaction?.taxCode).toBe(ruleTaxCode);
                        expect(transaction?.taxAmount).toBe(5);
                        resolve();
                    },
                });
            });

            // But the original message should only contains the old and new category data
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                    callback: (reportActions) => {
                        Onyx.disconnect(connection);
                        const reportAction = Object.values(reportActions ?? {}).at(0);
                        if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE)) {
                            const originalMessage = getOriginalMessage(reportAction);
                            expect(originalMessage?.oldCategory).toBe('');
                            expect(originalMessage?.category).toBe(category);
                            expect(originalMessage?.oldTaxRate).toBeUndefined();
                            expect(originalMessage?.oldTaxAmount).toBeUndefined();
                            resolve();
                        }
                    },
                });
            });
        });

        describe('should not update the tax', () => {
            it('if the transaction type is distance', async () => {
                // Given a policy with tax expense rules associated with category and a distance transaction
                const transactionID = '1';
                const policyID = '2';
                const category = 'Advertising';
                const taxCode = 'id_TAX_EXEMPT';
                const taxAmount = 0;
                const ruleTaxCode = 'id_TAX_RATE_1';
                const fakePolicy: Policy = {
                    ...createRandomPolicy(Number(policyID)),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {
                        expenseRules: createCategoryTaxExpenseRules(category, ruleTaxCode),
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                    taxCode,
                    taxAmount,
                    amount: 100,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
                    comment: {
                        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                        customUnit: {
                            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        },
                    },
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

                // When updating a money request category
                updateMoneyRequestCategory({
                    transactionID,
                    transactionThreadReport: {reportID: '3'},
                    parentReport: undefined,
                    iouReportOwnerLogin: undefined,
                    category,
                    policy: fakePolicy,
                    policyTagList: undefined,
                    policyCategories: undefined,
                    policyRecentlyUsedCategories: [],
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    isASAPSubmitBetaEnabled: false,
                    parentReportNextStep: undefined,
                    delegateAccountID: undefined,
                });

                await waitForBatchedUpdates();

                // Then the transaction tax rate and amount shouldn't be updated
                await new Promise<void>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                        callback: (transaction) => {
                            Onyx.disconnect(connection);
                            expect(transaction?.taxCode).toBe(taxCode);
                            expect(transaction?.taxAmount).toBe(taxAmount);
                            resolve();
                        },
                    });
                });
            });

            it('if there are no tax expense rules', async () => {
                // Given a policy without tax expense rules
                const transactionID = '1';
                const policyID = '2';
                const category = 'Advertising';
                const fakePolicy: Policy = {
                    ...createRandomPolicy(Number(policyID)),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                    amount: 100,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

                // When updating the money request category
                updateMoneyRequestCategory({
                    transactionID,
                    transactionThreadReport: {reportID: '3'},
                    parentReport: undefined,
                    iouReportOwnerLogin: undefined,
                    category,
                    policy: fakePolicy,
                    policyTagList: undefined,
                    policyCategories: undefined,
                    policyRecentlyUsedCategories: [],
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    isASAPSubmitBetaEnabled: false,
                    parentReportNextStep: undefined,
                    delegateAccountID: undefined,
                });

                await waitForBatchedUpdates();

                // Then the transaction tax rate and amount shouldn't be updated
                await new Promise<void>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                        callback: (transaction) => {
                            Onyx.disconnect(connection);
                            expect(transaction?.taxCode).toBeUndefined();
                            expect(transaction?.taxAmount).toBeUndefined();
                            resolve();
                        },
                    });
                });
            });
        });

        it('should remove all existing category violations when the transaction Category is unset', async () => {
            const transactionID = '1';
            const policyID = '2';
            const transactionThreadReportID = '3';
            const transactionThreadReport = {reportID: transactionThreadReportID};
            const category = '';
            const fakePolicy: Policy = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                requiresCategory: true,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                amount: 100,
                transactionID,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [
                {
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    name: CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY,
                    data: {},
                    showInReview: true,
                },
            ]);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);

            // When updating a money request category
            updateMoneyRequestCategory({
                transactionID,
                transactionThreadReport,
                parentReport: undefined,
                iouReportOwnerLogin: undefined,
                category,
                policy: fakePolicy,
                policyTagList: undefined,
                policyCategories: undefined,
                policyRecentlyUsedCategories: [],
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            // Any existing category violations will be removed, leaving only the MISSING_CATEGORY violation in the end
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                    callback: (transactionViolations) => {
                        Onyx.disconnect(connection);
                        expect(transactionViolations).toHaveLength(1);
                        expect(transactionViolations?.at(0)?.name).toEqual(CONST.VIOLATIONS.MISSING_CATEGORY);
                        resolve();
                    },
                });
            });
        });
    });

    describe('updateMoneyRequestAmountAndCurrency', () => {
        it('update the amount of the money request successfully', async () => {
            const initialCurrencies = [CONST.CURRENCY.EUR, CONST.CURRENCY.GBP];

            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                reportID: fakeReport.reportID,
                amount: 100,
                currency: CONST.CURRENCY.USD,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            mockFetch?.pause?.();

            updateMoneyRequestAmountAndCurrency({
                transactionID: fakeTransaction.transactionID,
                transactionThreadReport: fakeReport,
                parentReport: undefined,
                iouReportOwnerLogin: undefined,
                amount: 20000,
                currency: CONST.CURRENCY.USD,
                taxAmount: 0,
                taxCode: '',
                taxValue: '',
                policy: {
                    id: '123',
                    role: CONST.POLICY.ROLE.USER,
                    type: CONST.POLICY.TYPE.TEAM,
                    name: '',
                    owner: '',
                    outputCurrency: '',
                    isPolicyExpenseChatEnabled: false,
                },
                policyTagList: {},
                policyCategories: {},
                transactions: {},
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
                policyRecentlyUsedCurrencies: initialCurrencies,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();
            mockFetch?.succeed?.();
            await mockFetch?.resume?.();

            const updatedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        const newTransaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`];
                        resolve(newTransaction);
                    },
                });
            });
            expect(updatedTransaction?.modifiedAmount).toBe(20000);

            const recentlyUsedCurrencies = await getOnyxValue(ONYXKEYS.RECENTLY_USED_CURRENCIES);
            expect(recentlyUsedCurrencies).toEqual([CONST.CURRENCY.USD, ...initialCurrencies]);
        });

        it('update the amount of the money request failed', async () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                reportID: fakeReport.reportID,
                amount: 100,
                currency: 'USD',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            mockFetch?.pause?.();

            updateMoneyRequestAmountAndCurrency({
                transactionID: fakeTransaction.transactionID,
                transactionThreadReport: fakeReport,
                parentReport: undefined,
                iouReportOwnerLogin: undefined,
                amount: 20000,
                currency: CONST.CURRENCY.USD,
                taxAmount: 0,
                taxCode: '',
                taxValue: '',
                policy: {
                    id: '123',
                    role: CONST.POLICY.ROLE.USER,
                    type: CONST.POLICY.TYPE.TEAM,
                    name: '',
                    owner: '',
                    outputCurrency: '',
                    isPolicyExpenseChatEnabled: false,
                },
                policyTagList: {},
                policyCategories: {},
                transactions: {},
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
                policyRecentlyUsedCurrencies: [],
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();
            mockFetch?.fail?.();
            await mockFetch?.resume?.();

            const updatedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        const newTransaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`];
                        resolve(newTransaction);
                    },
                });
            });
            expect(updatedTransaction?.modifiedAmount).toBe('');
        });

        it('adds search snapshot optimistic and success updates for track expense edits when hash is provided', async () => {
            const transactionID = 'track-expense-transaction';
            const snapshotHash = 918273645;
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'self-dm-report',
                type: CONST.REPORT.TYPE.CHAT,
            };
            const transactionThreadReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: 'transaction-thread-report',
                type: CONST.REPORT.TYPE.CHAT,
                parentReportID: selfDMReport.reportID,
                parentReportActionID: 'parent-report-action',
            };
            const transaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                amount: 10000,
                currency: CONST.CURRENCY.USD,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`, transactionThreadReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await waitForBatchedUpdates();

            const {onyxData} = getUpdateTrackExpenseParams(transactionID, transactionThreadReport.reportID, {amount: 20000}, createRandomPolicy(1), undefined, snapshotHash);
            const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as const;
            const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;

            const optimisticSnapshot = onyxData.optimisticData?.find((update) => update.key === snapshotKey)?.value as OnyxEntry<SearchResults>;
            expect(optimisticSnapshot?.data?.[transactionKey]).toMatchObject({
                modifiedAmount: -20000,
                pendingFields: {amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            });

            const successSnapshot = onyxData.successData?.find((update) => update.key === snapshotKey)?.value as OnyxEntry<SearchResults>;
            expect(successSnapshot?.data?.[transactionKey]).toEqual({pendingFields: {amount: null}});

            const failureSnapshot = onyxData.failureData?.find((update) => update.key === snapshotKey)?.value as OnyxEntry<SearchResults>;
            expect(failureSnapshot?.data?.[transactionKey]).toMatchObject({
                transactionID,
                amount: 10000,
                pendingFields: {amount: null},
            });
        });
    });

    describe('updateMoneyRequestAmountAndCurrency', () => {
        it('removes AUTO_REPORTED_REJECTED_EXPENSE violation when the submitter edits the expense', async () => {
            const transactionID = 'txn1';
            const transactionThreadReportID = 'thread1';
            const expenseReportID = 'report1';
            const policyID = '42';
            const TEST_USER_ACCOUNT_ID = 1;
            const TEST_USER_LOGIN = 'test@test.com';

            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: expenseReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: TEST_USER_ACCOUNT_ID,
                policyID,
            };

            const transactionThread: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID: expenseReportID,
                parentReportActionID: 'parentAction',
                type: CONST.REPORT.TYPE.CHAT,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: expenseReportID,
                amount: 10000,
                currency: CONST.CURRENCY.USD,
                // No category so the test stays focused on the rejected-expense violation
                category: undefined,
            };

            const policy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.CORPORATE,
            };

            await Onyx.set(ONYXKEYS.SESSION, {
                accountID: TEST_USER_ACCOUNT_ID,
                email: TEST_USER_LOGIN,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThread);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [
                {
                    name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                },
            ]);
            await waitForBatchedUpdates();

            updateMoneyRequestAmountAndCurrency({
                transactionID,
                transactionThreadReport: transactionThread,
                parentReport: expenseReport,
                iouReportOwnerLogin: undefined,
                amount: 20000,
                currency: CONST.CURRENCY.USD,
                taxAmount: 0,
                taxCode: '',
                taxValue: '',
                policy,
                policyTagList: {},
                policyCategories: {},
                transactions: {},
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
                policyRecentlyUsedCurrencies: [],
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(updatedViolations).toEqual([]);
        });
    });

    describe('updateMoneyRequestAttendees', () => {
        it('should update recent attendees', async () => {
            // Given a transaction
            const transaction = createRandomTransaction(1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);

            // When updating the transaction attendees
            updateMoneyRequestAttendees({
                transactionID: transaction.transactionID,
                transactionThreadReport: createRandomReport(2, 'policyExpenseChat'),
                parentReport: undefined,
                iouReportOwnerLogin: undefined,
                attendees: [
                    {avatarUrl: '', displayName: 'user 1', email: 'user1@gmail.com'},
                    {avatarUrl: '', displayName: 'user 2', email: 'user2@gmail.com'},
                    {avatarUrl: '', displayName: 'user 3', email: 'user3@gmail.com'},
                    {avatarUrl: '', displayName: 'user 4', email: 'user4@gmail.com'},
                    {avatarUrl: '', displayName: 'user 5', email: 'user5@gmail.com'},
                    {avatarUrl: '', displayName: 'user 6', email: 'user6@gmail.com'},
                ],
                policy: undefined,
                policyTagList: undefined,
                policyCategories: undefined,
                violations: undefined,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: '',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });
            await waitForBatchedUpdates();

            // Then all 6 recent attendees should be stored (below the max of 40)
            const recentAttendees = await new Promise<OnyxEntry<Attendee[]>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: ONYXKEYS.NVP_RECENT_ATTENDEES,
                    callback: (attendees) => {
                        Onyx.disconnect(connection);
                        resolve(attendees);
                    },
                });
            });
            expect(recentAttendees?.length).toBe(6);
        });

        it('should keep displayName-only attendees in recent attendees', async () => {
            const transaction = createRandomTransaction(1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);

            updateMoneyRequestAttendees({
                transactionID: transaction.transactionID,
                transactionThreadReport: createRandomReport(2, 'policyExpenseChat'),
                parentReport: undefined,
                iouReportOwnerLogin: undefined,
                attendees: [{avatarUrl: '', displayName: 'Display Name Only'}],
                policy: undefined,
                policyTagList: undefined,
                policyCategories: undefined,
                violations: undefined,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: '',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });
            await waitForBatchedUpdates();

            const recentAttendees = await new Promise<OnyxEntry<Attendee[]>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: ONYXKEYS.NVP_RECENT_ATTENDEES,
                    callback: (attendees) => {
                        Onyx.disconnect(connection);
                        resolve(attendees);
                    },
                });
            });

            expect(recentAttendees).toContainEqual({avatarUrl: '', displayName: 'Display Name Only'});
        });
    });

    describe('updateMoneyRequestTag', () => {
        it('should update policyRecentlyUsedTags', async () => {
            // Given a policy recently used tags
            const policy = createRandomPolicy(1);
            const tagName = 'Tag';
            const newTag = 'new tag';
            const policyTags: PolicyTagLists = {
                [tagName]: {
                    name: tagName,
                    required: false,
                    orderWeight: 0,
                    tags: {A: {enabled: true, name: 'A'}},
                },
            };
            const policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags> = {
                [tagName]: ['old tag'],
            };
            const transactionThreadReportID = '2';
            const iouReportID = '3';
            const iouReport = {reportID: iouReportID, policyID: policy.id};
            const transactionThreadReport = {
                reportID: transactionThreadReportID,
                parentReportID: iouReportID,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, policyTags);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policy.id}`, policyRecentlyUsedTags);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport);

            // When updating the expense tag
            updateMoneyRequestTag({
                transactionID: '1',
                transactionThreadReport,
                parentReport: iouReport,
                iouReportOwnerLogin: undefined,
                tag: newTag,
                policy,
                policyTagList: policyTags,
                policyRecentlyUsedTags,
                policyCategories: undefined,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.email ?? '',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            waitForBatchedUpdates();

            // Then the transaction tag should be added to the recently used tags collection
            const newPolicyRecentlyUsedTags: RecentlyUsedTags = await new Promise((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policy.id}`,
                    callback: (recentlyUsedTags) => {
                        resolve(recentlyUsedTags ?? {});
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(newPolicyRecentlyUsedTags[tagName].length).toBe(2);
            expect(newPolicyRecentlyUsedTags[tagName].at(0)).toBe(newTag);
        });

        it('should remove the existing tagOutOfPolicy violation when the tag is unset and tags are not required', async () => {
            const transactionID = '1';
            const policyID = '2';
            const transactionThreadReportID = '3';
            const transactionThreadReport = {reportID: transactionThreadReportID};
            const fakePolicy: Policy = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                requiresTag: false,
                requiresCategory: false,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                amount: 100,
                transactionID,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [
                {
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
                    data: {},
                    showInReview: true,
                },
            ]);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);

            // When unsetting the tag
            updateMoneyRequestTag({
                transactionID,
                transactionThreadReport,
                parentReport: undefined,
                iouReportOwnerLogin: undefined,
                tag: '',
                policy: fakePolicy,
                policyTagList: undefined,
                policyRecentlyUsedTags: undefined,
                policyCategories: undefined,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            // The stale tagOutOfPolicy is stripped optimistically even though the recompute skips tag logic when
            // tags aren't required and the tag is now empty.
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                    callback: (transactionViolations) => {
                        Onyx.disconnect(connection);
                        expect(transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.TAG_OUT_OF_POLICY)).toBe(false);
                        resolve();
                    },
                });
            });
        });
    });

    describe('updateMoneyRequestDate', () => {
        it('should update the transaction created date', async () => {
            // Given an expense transaction with an expense report
            const transactionID = 'txnDate1';
            const transactionThreadReportID = 'threadDate1';
            const parentReportID = 'parentDate1';
            const policyID = '10';
            const originalDate = '2026-01-01';
            const newDate = '2026-01-15';

            const parentReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: parentReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                ownerAccountID: RORY_ACCOUNT_ID,
            };
            const transactionThreadReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: parentReportID,
                created: originalDate,
            };
            const fakePolicy: Policy = createRandomPolicy(Number(policyID));

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When updating the date
            updateMoneyRequestDate({
                personalPolicyOutputCurrency: undefined,
                transactionID,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin: undefined,
                transactions: {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: fakeTransaction},
                transactionViolations: {},
                value: newDate,
                policy: fakePolicy,
                policyTags: {},
                policyCategories: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
                isOffline: false,
            });

            await waitForBatchedUpdates();

            // Then the modified date on the transaction should be updated
            const transactionAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transactionAfter?.modifiedCreated).toBe(newDate);
        });
    });

    describe('updateMoneyRequestBillable', () => {
        it('should update the transaction billable field', async () => {
            // Given an expense transaction with billable = false
            const transactionID = 'txnBillable1';
            const transactionThreadReportID = 'threadBillable1';
            const parentReportID = 'parentBillable1';
            const policyID = '20';

            const parentReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: parentReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                ownerAccountID: RORY_ACCOUNT_ID,
            };
            const transactionThreadReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: parentReportID,
                billable: false,
            };
            const fakePolicy: Policy = createRandomPolicy(Number(policyID));

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When updating billable to true
            updateMoneyRequestBillable({
                transactionID,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin: undefined,
                value: true,
                policy: fakePolicy,
                policyTagList: {},
                policyCategories: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
                isOffline: false,
            });

            await waitForBatchedUpdates();

            // Then the transaction billable field should be updated
            const transactionAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transactionAfter?.billable).toBe(true);
        });

        it('should not update anything if transactionID is missing', async () => {
            // Given a transaction
            const transactionID = 'txnBillableNoOp';
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                billable: false,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);

            // When updateMoneyRequestBillable is called with an undefined transactionID
            updateMoneyRequestBillable({
                transactionID: undefined,
                transactionThreadReport: {reportID: '1'},
                parentReport: undefined,
                iouReportOwnerLogin: undefined,
                value: true,
                policy: undefined,
                policyTagList: {},
                policyCategories: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
                isOffline: false,
            });

            await waitForBatchedUpdates();

            // Then the original transaction billable value should be unchanged
            const transactionAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transactionAfter?.billable).toBe(false);
        });
    });

    describe('updateMoneyRequestDistance', () => {
        it('should update transaction with distance and waypoints', async () => {
            // Given a distance request transaction with valid waypoints and existing data
            const transactionID = 'transaction_123';
            const transactionThreadReportID = 'transactionReport_456';
            const parentReportID = 'parentReport_789';
            const policyID = 'policy_101';

            const fakeWaypoints = {
                waypoint0: {
                    keyForList: 'Start Location_1735023533854',
                    lat: 37.7886378,
                    lng: -122.4033442,
                    address: 'Start Location, San Francisco, CA, USA',
                    name: 'Start Location',
                },
                waypoint1: {
                    keyForList: 'End Location_1735023537514',
                    lat: 37.8077876,
                    lng: -122.4752007,
                    address: 'End Location, San Francisco, CA, USA',
                    name: 'End Location',
                },
            };

            const fakeTransaction: Transaction = {
                transactionID,
                amount: 10000,
                currency: CONST.CURRENCY.USD,
                created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                merchant: 'Test Merchant',
                reportID: parentReportID,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    },
                    waypoints: {},
                },
            };

            const fakePolicy = createRandomPolicy(Number(policyID));
            const transactionThreadReport = {
                reportID: transactionThreadReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;
            const parentReport = {
                reportID: parentReportID,
                type: CONST.REPORT.TYPE.IOU,
            } as Report;
            const recentWaypoints: RecentWaypoint[] = [];

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);

            mockFetch?.pause?.();

            // When updating the money request with distance and waypoints
            updateMoneyRequestDistance({
                personalPolicyOutputCurrency: undefined,
                transaction: fakeTransaction,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin: undefined,
                waypoints: fakeWaypoints,
                recentWaypoints,
                distance: 5000,
                policy: fakePolicy,
                policyTagList: undefined,
                policyCategories: undefined,
                transactionBackup: fakeTransaction,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'test@example.com',
                isASAPSubmitBetaEnabled: false,
                odometerStart: 10000,
                odometerEnd: 15000,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
            });

            mockFetch?.resume?.();

            await waitForBatchedUpdates();

            // Then the transaction should be updated with the new waypoints data and modified waypoints should be set
            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transaction?.modifiedWaypoints).toEqual(fakeWaypoints);
        });

        it('should filter pending recent waypoints when distance is not provided', async () => {
            // Given a distance request transaction with recent waypoints that have pending actions
            const transactionID = 'transaction_456';
            const policyID = 'policy_202';
            const parentReportID = 'parentReport_999';
            const transactionThreadReportID = 'transactionReport_888';

            const fakeTransaction: Transaction = {
                transactionID,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
                created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                merchant: 'Test Merchant 2',
                reportID: parentReportID,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    },
                    waypoints: {},
                },
            };

            const recentWaypoints: RecentWaypoint[] = [
                {
                    keyForList: 'waypoint_validated',
                    lat: 40.7128,
                    lng: -74.006,
                    address: 'New York, NY',
                    name: 'NYC',
                    pendingAction: undefined,
                },
                {
                    keyForList: 'waypoint_pending',
                    lat: 34.0522,
                    lng: -118.2437,
                    address: 'Los Angeles, CA',
                    name: 'LA',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            ];

            const fakePolicy = createRandomPolicy(Number(policyID));
            const transactionThreadReport = {
                reportID: transactionThreadReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;
            const parentReport = {
                reportID: parentReportID,
                type: CONST.REPORT.TYPE.IOU,
            } as Report;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
            // Set initial recent waypoints in Onyx (with both pending and non-pending waypoints)
            await Onyx.merge(ONYXKEYS.NVP_RECENT_WAYPOINTS, recentWaypoints);

            // Simulate a failed request - this will cause failureData to be applied
            mockFetch?.fail?.();

            // When updating the money request WITHOUT distance (only waypoints)
            updateMoneyRequestDistance({
                personalPolicyOutputCurrency: undefined,
                transaction: fakeTransaction,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin: undefined,
                waypoints: {
                    waypoint0: {
                        lat: 40.7128,
                        lng: -74.006,
                        address: 'NYC',
                        name: 'NYC',
                        keyForList: 'nyc_key',
                    },
                },
                recentWaypoints,
                distance: undefined, // No distance provided
                policy: fakePolicy,
                policyTagList: undefined,
                policyCategories: undefined,
                transactionBackup: fakeTransaction,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'test@example.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            // Then the recent waypoints should be updated via failureData, filtering out pending waypoints
            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transaction?.transactionID).toBe(transactionID);

            // On failure, recent waypoints should be reset to only non-pending waypoints
            const updatedRecentWaypoints = await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS);
            expect(updatedRecentWaypoints).toBeDefined();
            // The pending waypoint should have been filtered out
            const hasPendingWaypoint = updatedRecentWaypoints?.some((wp) => wp.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(hasPendingWaypoint).toBeFalsy();
            // Only the validated waypoint should remain
            expect(updatedRecentWaypoints?.length).toBe(1);
            expect(updatedRecentWaypoints?.[0]?.keyForList).toBe('waypoint_validated');
        });

        it('should handle complete distance expense workflow with multiple waypoint updates', async () => {
            // Scenario: User creates a distance expense, then updates waypoints multiple times before submitting
            const transactionID = 'distance_expense_001';
            const transactionThreadReportID = 'thread_report_001';
            const parentReportID = 'iou_report_001';
            const policyID = 'policy_functional';

            const initialWaypoints = {
                waypoint0: {
                    keyForList: 'office',
                    lat: 40.7128,
                    lng: -74.006,
                    address: 'New York',
                    name: 'Office',
                },
            };

            const updatedWaypoints = {
                waypoint0: {
                    keyForList: 'office',
                    lat: 40.7128,
                    lng: -74.006,
                    address: 'New York',
                    name: 'Office',
                },
                waypoint1: {
                    keyForList: 'meeting',
                    lat: 40.758,
                    lng: -73.9855,
                    address: 'Manhattan',
                    name: 'Client Meeting',
                },
                waypoint2: {
                    keyForList: 'parking',
                    lat: 34.0522,
                    lng: -118.2437,
                    address: 'Los Angeles',
                    name: 'Parking',
                },
            };

            const fakeTransaction: Transaction = {
                transactionID,
                amount: 25000,
                currency: CONST.CURRENCY.USD,
                created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                merchant: 'Uber',
                reportID: parentReportID,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {name: CONST.CUSTOM_UNITS.NAME_DISTANCE, quantity: 350},
                    waypoints: initialWaypoints,
                },
            };

            const fakePolicy = createRandomPolicy(Number(policyID));
            const transactionThreadReport = {
                reportID: transactionThreadReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;
            const parentReport = {
                reportID: parentReportID,
                type: CONST.REPORT.TYPE.IOU,
            } as Report;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);

            mockFetch?.pause?.();

            // First update: Add more waypoints to the expense
            updateMoneyRequestDistance({
                personalPolicyOutputCurrency: undefined,
                transaction: fakeTransaction,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin: undefined,
                waypoints: updatedWaypoints,
                recentWaypoints: [],
                distance: 350000, // 350 miles in meters
                policy: fakePolicy,
                policyTagList: undefined,
                policyCategories: undefined,
                transactionBackup: fakeTransaction,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'driver@example.com',
                isASAPSubmitBetaEnabled: false,
                odometerStart: 50000,
                odometerEnd: 50350,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
            });

            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Verify the transaction was updated with complete route information
            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            const waypoints = transaction?.modifiedWaypoints;
            expect(Object.keys(waypoints ?? {})).toHaveLength(3);
            expect(waypoints?.waypoint0).toBeDefined();
            expect(waypoints?.waypoint1).toBeDefined();
            expect(waypoints?.waypoint2).toBeDefined();
            // Verify specific waypoint details
            expect(waypoints?.waypoint1?.name).toBe('Client Meeting');
            expect(waypoints?.waypoint2?.address).toBe('Los Angeles');
        });

        it('QA: should handle edge cases and invalid inputs gracefully', async () => {
            // Edge case 1: Empty waypoints object
            const transactionID = 'edge_case_001';
            const transactionThreadReportID = 'thread_edge_001';
            const parentReportID = 'iou_edge_001';
            const policyID = 'policy_edge';

            const emptyWaypoints = {};

            const fakeTransaction: Transaction = {
                transactionID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                merchant: 'Test',
                reportID: parentReportID,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {name: CONST.CUSTOM_UNITS.NAME_DISTANCE},
                    waypoints: {},
                },
            };

            const fakePolicy = createRandomPolicy(Number(policyID));
            const transactionThreadReport = {
                reportID: transactionThreadReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;
            const parentReport = {
                reportID: parentReportID,
                type: CONST.REPORT.TYPE.IOU,
            } as Report;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);

            // Call with empty waypoints - should not crash
            updateMoneyRequestDistance({
                personalPolicyOutputCurrency: undefined,
                transaction: fakeTransaction,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin: undefined,
                waypoints: emptyWaypoints,
                recentWaypoints: [],
                distance: undefined, // No distance change
                policy: fakePolicy,
                policyTagList: undefined,
                policyCategories: undefined,
                transactionBackup: fakeTransaction,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'test@example.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            // Verify transaction still exists and wasn't corrupted - use synchronous check
            const transactionAfterUpdate = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

            // Transaction should still exist with valid ID
            expect(transactionAfterUpdate?.transactionID).toBe(transactionID);

            // Edge case 2: Undefined distance with waypoints
            const transactionID2 = 'edge_case_002';

            const fakeTransaction2: Transaction = {
                transactionID: transactionID2,
                amount: 2000,
                currency: CONST.CURRENCY.USD,
                created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                merchant: 'Test 2',
                reportID: parentReportID,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {name: CONST.CUSTOM_UNITS.NAME_DISTANCE},
                    waypoints: {},
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID2}`, fakeTransaction2);

            updateMoneyRequestDistance({
                personalPolicyOutputCurrency: undefined,
                transaction: fakeTransaction2,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin: undefined,
                waypoints: {
                    waypoint0: {
                        keyForList: 'start',
                        lat: 0,
                        lng: 0,
                        address: 'Start',
                        name: 'Start',
                    },
                },
                recentWaypoints: [],
                distance: undefined,
                policy: fakePolicy,
                policyTagList: undefined,
                policyCategories: undefined,
                transactionBackup: fakeTransaction2,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'test@example.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            // Verify second transaction
            const transaction2AfterUpdate = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID2}`);

            expect(transaction2AfterUpdate?.transactionID).toBe(transactionID2);
        });
    });

    describe('updateMoneyRequestReimbursable', () => {
        it.each([
            [true, false],
            [false, true],
        ])('should set the modified reimbursable to %s when starting from %s', async (newValue, originalValue) => {
            // Given an expense transaction with the original reimbursable value
            const transactionID = `txnReimbursable_${String(newValue)}`;
            const transactionThreadReportID = `threadReimbursable_${String(newValue)}`;
            const parentReportID = `parentReimbursable_${String(newValue)}`;
            const policyID = '30';

            const parentReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: parentReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                ownerAccountID: RORY_ACCOUNT_ID,
            };
            const transactionThreadReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: parentReportID,
                reimbursable: originalValue,
            };
            const fakePolicy: Policy = createRandomPolicy(Number(policyID));

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When updating reimbursable to the new value
            updateMoneyRequestReimbursable({
                transactionID,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin: undefined,
                value: newValue,
                policy: fakePolicy,
                policyTagList: {},
                policyCategories: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            // Then the transaction reimbursable should match the input value
            const transactionAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transactionAfter?.reimbursable).toBe(newValue);
        });

        it('should not update anything when transactionID is undefined', async () => {
            // Given a transaction with reimbursable = false
            const transactionID = 'txnReimbursableNoOp';
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reimbursable: false,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);

            // When updateMoneyRequestReimbursable is called with an undefined transactionID
            updateMoneyRequestReimbursable({
                transactionID: undefined,
                transactionThreadReport: {reportID: '1'},
                parentReport: undefined,
                iouReportOwnerLogin: undefined,
                value: true,
                policy: undefined,
                policyTagList: {},
                policyCategories: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            // Then the existing transaction reimbursable value should remain unchanged
            const transactionAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transactionAfter?.reimbursable).toBe(false);
        });
    });

    describe('updateMoneyRequestMerchant', () => {
        it('should set modifiedMerchant to the new value', async () => {
            // Given an expense transaction with an original merchant
            const transactionID = 'txnMerchant1';
            const transactionThreadReportID = 'threadMerchant1';
            const parentReportID = 'parentMerchant1';
            const policyID = '40';
            const originalMerchant = 'Old Merchant';
            const newMerchant = 'New Merchant';

            const parentReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: parentReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                ownerAccountID: RORY_ACCOUNT_ID,
            };
            const transactionThreadReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: parentReportID,
                merchant: originalMerchant,
            };
            const fakePolicy: Policy = createRandomPolicy(Number(policyID));

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When updating the merchant
            updateMoneyRequestMerchant({
                transactionID,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin: undefined,
                value: newMerchant,
                policy: fakePolicy,
                policyTagList: {},
                policyCategories: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            // Then modifiedMerchant should hold the new merchant string
            const transactionAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transactionAfter?.modifiedMerchant).toBe(newMerchant);
        });

        it('should set modifiedMerchant for a self-DM track expense', async () => {
            // Given a track-expense transaction inside a Self-DM (track-expense flow)
            const transactionID = 'txnMerchantTrack1';
            const transactionThreadReportID = 'threadMerchantTrack1';
            const parentReportID = 'parentMerchantTrack1';

            const parentReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: parentReportID,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const transactionThreadReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID,
                type: CONST.REPORT.TYPE.CHAT,
                iouReportID: undefined,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: parentReportID,
                merchant: 'Old Merchant',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);

            // When updating merchant for the track-expense
            updateMoneyRequestMerchant({
                transactionID,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin: undefined,
                value: 'Track Merchant',
                policy: undefined,
                policyTagList: {},
                policyCategories: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            await waitForBatchedUpdates();

            // Then modifiedMerchant should be set to the track-expense merchant
            const transactionAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transactionAfter?.modifiedMerchant).toBe('Track Merchant');
        });
    });

    describe('isOffline param', () => {
        it.each([
            ['push', false],
            ['skip', true],
        ])(
            'should %s the lastReadTime update on the parent IOU report when isOffline=%s and the parent has one normal IOU action plus a DELETE-pending IOU action',
            async (_label, isOffline) => {
                // Given a parent IOU report with one normal IOU action and one DELETE-pending IOU action,
                // pointing to a single visible transaction. With isOffline=false the DELETE-pending action
                // is filtered out (one-transaction-thread → lastReadTime is pushed). With isOffline=true,
                // both actions are visible (not a one-transaction-thread → lastReadTime is NOT pushed).
                const transactionID = `txnIsOffline_${String(isOffline)}`;
                const transactionThreadReportID = `threadIsOffline_${String(isOffline)}`;
                const parentReportID = `parentIsOffline_${String(isOffline)}`;
                const normalActionID = `normal_${String(isOffline)}`;
                const deletedActionID = `deleted_${String(isOffline)}`;
                const policyID = '50';
                const initialLastReadTime = '2025-01-01 00:00:00.000';

                const parentReport: Report = {
                    ...createRandomReport(1, undefined),
                    reportID: parentReportID,
                    type: CONST.REPORT.TYPE.IOU,
                    policyID,
                    chatReportID: parentReportID,
                    ownerAccountID: RORY_ACCOUNT_ID,
                    lastReadTime: initialLastReadTime,
                };
                const transactionThreadReport: Report = {
                    ...createRandomReport(2, undefined),
                    reportID: transactionThreadReportID,
                    parentReportID,
                    parentReportActionID: normalActionID,
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const fakeTransaction: Transaction = {
                    ...createRandomTransaction(3),
                    transactionID,
                    reportID: parentReportID,
                    merchant: 'Initial',
                };
                const fakePolicy: Policy = createRandomPolicy(Number(policyID));

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                    [normalActionID]: {
                        reportActionID: normalActionID,
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        created: '2025-02-01 00:00:00.000',
                        reportID: parentReportID,
                        childReportID: transactionThreadReportID,
                        actorAccountID: RORY_ACCOUNT_ID,
                        message: [{type: 'TEXT', text: 'iou action', html: 'iou action'}],
                        originalMessage: {
                            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                            IOUTransactionID: transactionID,
                            amount: 100,
                            currency: CONST.CURRENCY.USD,
                        },
                    },
                    [deletedActionID]: {
                        reportActionID: deletedActionID,
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        created: '2025-02-02 00:00:00.000',
                        reportID: parentReportID,
                        actorAccountID: RORY_ACCOUNT_ID,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                        message: [{type: 'TEXT', text: '', html: '', deleted: '2025-02-02 00:00:00.000'}],
                        originalMessage: {
                            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                            IOUTransactionID: `${transactionID}_extra`,
                            amount: 200,
                            currency: CONST.CURRENCY.USD,
                        },
                    },
                });

                // When updating the merchant with the given isOffline value
                updateMoneyRequestMerchant({
                    transactionID,
                    transactionThreadReport,
                    parentReport,
                    iouReportOwnerLogin: undefined,
                    value: `Updated_${String(isOffline)}`,
                    policy: fakePolicy,
                    policyTagList: {},
                    policyCategories: {},
                    currentUserAccountIDParam: RORY_ACCOUNT_ID,
                    currentUserEmailParam: RORY_EMAIL,
                    isASAPSubmitBetaEnabled: false,
                    parentReportNextStep: undefined,
                    isOffline,
                    delegateAccountID: undefined,
                });

                await waitForBatchedUpdates();

                // Then lastReadTime is pushed only when isOffline=false (i.e. one-transaction-thread)
                const parentReportAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`);
                if (isOffline) {
                    expect(parentReportAfter?.lastReadTime).toBe(initialLastReadTime);
                } else {
                    expect(parentReportAfter?.lastReadTime).not.toBe(initialLastReadTime);
                }
            },
        );
    });

    describe('getUpdateTrackExpenseParams', () => {
        it('preserves full-precision distance in API params (#90561 — mirror of getUpdateMoneyRequestParams)', async () => {
            // Given a self-DM track expense whose stored quantity is at 2-decimal precision
            const transactionID = 'track_distance_precision';
            const transactionThreadReportID = 'thread_precision';
            const policyID = 'policy_precision';

            const fakeTransaction: Transaction = {
                transactionID,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
                created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                merchant: 'Precision Test',
                reportID: 'parent_precision',
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 5,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    },
                    waypoints: {},
                },
            };
            const fakeThreadReport = {reportID: transactionThreadReportID, type: CONST.REPORT.TYPE.CHAT} as Report;
            const fakePolicy = createRandomPolicy(Number(1));

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, fakeThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When the caller passes a higher-precision distance than what `customUnit.quantity` would round to
            const {params} = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, {distance: 5.555}, fakePolicy, undefined);

            // Then the raw caller value flows into the API params instead of the rounded display value (5.56).
            expect(params.distance).toBe(5.555);
        });

        it('mirrors customUnitRateOutOfDateRange violation changes into the search snapshot when editing a tracked distance expense date', async () => {
            const transactionID = 'track_distance_date_violation';
            const transactionThreadReportID = 'thread_date_violation';
            const snapshotHash = 1122334455;
            const customUnitRateID = 'rate_id';
            const policyID = 'policy_date_violation';

            const fakeTransaction: Transaction = {
                transactionID,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
                created: '2025-06-15',
                merchant: 'Distance Track',
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 5,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        customUnitRateID,
                    },
                    waypoints: {},
                },
            };
            const fakeThreadReport = {
                reportID: transactionThreadReportID,
                type: CONST.REPORT.TYPE.CHAT,
                parentReportID: 'self-dm-report',
            } as Report;
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(1)),
                id: policyID,
                customUnits: {
                    unitId: {
                        attributes: {unit: 'mi'},
                        customUnitID: 'unitId',
                        defaultCategory: 'Car',
                        enabled: true,
                        name: 'Distance',
                        rates: {
                            [customUnitRateID]: {
                                currency: 'USD',
                                customUnitRateID,
                                enabled: true,
                                name: '2025 mileage',
                                rate: 65.5,
                                startDate: '2025-01-01',
                                endDate: '2025-12-31',
                            },
                        },
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, fakeThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, []);
            await waitForBatchedUpdates();

            const {onyxData} = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, {created: '2026-06-15'}, fakePolicy, undefined, snapshotHash, undefined, undefined, []);

            const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as const;
            const violationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}` as const;
            const optimisticViolationsUpdate = onyxData.optimisticData?.find((update) => update.key === violationsKey);

            expect(optimisticViolationsUpdate?.value).toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    showInReview: true,
                    data: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                }),
            );

            expect(onyxData.optimisticData).toContainEqual(
                expect.objectContaining({
                    key: snapshotKey,
                    value: expect.objectContaining({
                        data: expect.objectContaining({
                            [violationsKey]: optimisticViolationsUpdate?.value,
                        }),
                    }),
                }),
            );

            expect(onyxData.failureData).toContainEqual(
                expect.objectContaining({
                    key: snapshotKey,
                    value: expect.objectContaining({
                        data: expect.objectContaining({
                            [violationsKey]: [],
                        }),
                    }),
                }),
            );
        });
    });

    describe('updateMoneyRequestDate distance rate recalculation', () => {
        it('calls UpdateMoneyRequestDistanceRate with created when a workspace distance expense date change selects a different rate', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
            const transactionID = 'distance_date_rate_switch';
            const transactionThreadReportID = 'thread_date_rate_switch';
            const expenseReportID = 'expense_report_date_rate_switch';
            const policyID = 'policy_date_rate_switch';
            const rate2025 = 'rate_2025';
            const rate2026 = 'rate_2026';

            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: expenseReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                ownerAccountID: RORY_ACCOUNT_ID,
            };
            const transactionThread: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID: expenseReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const transaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: expenseReportID,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
                created: '2025-06-15',
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 10,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        customUnitRateID: rate2025,
                    },
                },
            };
            const policy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.CORPORATE,
                customUnits: {
                    unitId: {
                        attributes: {unit: 'mi'},
                        customUnitID: 'unitId',
                        defaultCategory: 'Car',
                        enabled: true,
                        name: 'Distance',
                        rates: {
                            [rate2025]: {
                                currency: 'USD',
                                customUnitRateID: rate2025,
                                enabled: true,
                                name: '2025 mileage',
                                rate: 65.5,
                                startDate: '2025-01-01',
                                endDate: '2025-12-31',
                            },
                            [rate2026]: {
                                currency: 'USD',
                                customUnitRateID: rate2026,
                                enabled: true,
                                name: '2026 mileage',
                                rate: 70,
                                startDate: '2026-01-01',
                                endDate: '2026-12-31',
                            },
                        },
                    },
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThread);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await waitForBatchedUpdates();

            updateMoneyRequestDate({
                personalPolicyOutputCurrency: undefined,
                transactionID,
                transactionThreadReport: transactionThread,
                parentReport: expenseReport,
                iouReportOwnerLogin: undefined,
                transactions: {},
                transactionViolations: {},
                value: '2026-06-15',
                policy,
                policyTags: {},
                policyCategories: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            expect(writeSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE, expect.anything(), expect.anything());
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE,
                expect.objectContaining({
                    transactionID,
                    customUnitRateID: rate2026,
                    created: '2026-06-15',
                }),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                            value: expect.objectContaining({
                                modifiedCreated: '2026-06-15',
                                comment: expect.objectContaining({
                                    customUnit: expect.objectContaining({
                                        customUnitRateID: rate2026,
                                    }),
                                }),
                            }),
                        }),
                    ]),
                }),
            );
            expect(writeSpy).toHaveBeenCalledTimes(1);

            writeSpy.mockRestore();
        });

        it('calls UpdateMoneyRequestDate only when the current rate remains eligible for the new date', async () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Inspecting API.write calls to verify date-only update path.
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
            const transactionID = 'distance_date_same_rate';
            const transactionThreadReportID = 'thread_date_same_rate';
            const expenseReportID = 'expense_report_date_same_rate';
            const policyID = 'policy_date_same_rate';
            const rate2025 = 'rate_2025';
            const defaultRate = 'rate_default';

            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: expenseReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
            };
            const transactionThread: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID: expenseReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const transaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: expenseReportID,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
                created: '2025-03-15',
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 10,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        customUnitRateID: rate2025,
                    },
                },
            };
            const policy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.CORPORATE,
                customUnits: {
                    unitId: {
                        attributes: {unit: 'mi'},
                        customUnitID: 'unitId',
                        defaultCategory: 'Car',
                        enabled: true,
                        name: 'Distance',
                        rates: {
                            [rate2025]: {
                                currency: 'USD',
                                customUnitRateID: rate2025,
                                enabled: true,
                                name: '2025 mileage',
                                rate: 65.5,
                                startDate: '2025-01-01',
                                endDate: '2025-12-31',
                            },
                            [defaultRate]: {
                                currency: 'USD',
                                customUnitRateID: defaultRate,
                                enabled: true,
                                name: 'Default mileage',
                                rate: 50,
                            },
                        },
                    },
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThread);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await waitForBatchedUpdates();

            updateMoneyRequestDate({
                personalPolicyOutputCurrency: undefined,
                transactionID,
                transactionThreadReport: transactionThread,
                parentReport: expenseReport,
                iouReportOwnerLogin: undefined,
                transactions: {},
                transactionViolations: {},
                value: '2025-06-15',
                policy,
                policyTags: {},
                policyCategories: {},
                currentUserAccountIDParam: 1,
                currentUserEmailParam: 'test@test.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE, expect.objectContaining({transactionID, created: '2025-06-15'}), expect.anything());
            expect(writeSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE, expect.anything(), expect.anything());

            writeSpy.mockRestore();
        });

        it('calls UpdateMoneyRequestDistanceRate when the current rate is missing from the policy', async () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Inspecting API.write calls to verify distance rate update path.
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
            const transactionID = 'distance_date_orphan_rate';
            const transactionThreadReportID = 'thread_date_orphan_rate';
            const expenseReportID = 'expense_report_date_orphan_rate';
            const policyID = 'policy_date_orphan_rate';
            const orphanedRateID = 'rate_removed';
            const activeRateID = 'rate_active';
            const newDate = '2025-06-20';

            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: expenseReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
            };
            const transactionThread: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID: expenseReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const transaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: expenseReportID,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
                created: '2025-06-15',
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 10,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        customUnitRateID: orphanedRateID,
                    },
                },
            };
            const policy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.CORPORATE,
                customUnits: {
                    unitId: {
                        attributes: {unit: 'mi'},
                        customUnitID: 'unitId',
                        defaultCategory: 'Car',
                        enabled: true,
                        name: 'Distance',
                        rates: {
                            [activeRateID]: {
                                currency: 'USD',
                                customUnitRateID: activeRateID,
                                enabled: true,
                                name: 'Active mileage',
                                rate: 65.5,
                            },
                        },
                    },
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThread);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await waitForBatchedUpdates();

            updateMoneyRequestDate({
                personalPolicyOutputCurrency: undefined,
                transactionID,
                transactionThreadReport: transactionThread,
                parentReport: expenseReport,
                iouReportOwnerLogin: undefined,
                transactions: {},
                transactionViolations: {},
                value: newDate,
                policy,
                policyTags: {},
                policyCategories: {},
                currentUserAccountIDParam: 1,
                currentUserEmailParam: 'test@test.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            expect(writeSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE, expect.anything(), expect.anything());
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE,
                expect.objectContaining({
                    transactionID,
                    customUnitRateID: activeRateID,
                    created: newDate,
                }),
                expect.anything(),
            );
            expect(writeSpy).toHaveBeenCalledTimes(1);

            writeSpy.mockRestore();
        });

        it('calls UpdateMoneyRequestDate only when no mileage rate is eligible for the new date', async () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Inspecting API.write calls to verify date-only update path.
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
            const transactionID = 'distance_date_no_eligible_rate';
            const transactionThreadReportID = 'thread_date_no_eligible_rate';
            const expenseReportID = 'expense_report_date_no_eligible_rate';
            const policyID = 'policy_date_no_eligible_rate';
            const rate2025 = 'rate_2025';
            const rate2026 = 'rate_2026';

            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: expenseReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
            };
            const transactionThread: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID: expenseReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const transaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: expenseReportID,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
                created: '2026-06-15',
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 10,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        customUnitRateID: rate2026,
                    },
                },
            };
            const policy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.CORPORATE,
                customUnits: {
                    unitId: {
                        attributes: {unit: 'mi'},
                        customUnitID: 'unitId',
                        defaultCategory: 'Car',
                        enabled: true,
                        name: 'Distance',
                        rates: {
                            [rate2025]: {
                                currency: 'USD',
                                customUnitRateID: rate2025,
                                enabled: true,
                                name: '2025 mileage',
                                rate: 65.5,
                                startDate: '2025-01-01',
                                endDate: '2025-12-31',
                                index: 0,
                            },
                            [rate2026]: {
                                currency: 'USD',
                                customUnitRateID: rate2026,
                                enabled: true,
                                name: '2026 mileage',
                                rate: 70,
                                startDate: '2026-01-01',
                                endDate: '2026-12-31',
                                index: 1,
                            },
                        },
                    },
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThread);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await waitForBatchedUpdates();

            updateMoneyRequestDate({
                personalPolicyOutputCurrency: undefined,
                transactionID,
                transactionThreadReport: transactionThread,
                parentReport: expenseReport,
                iouReportOwnerLogin: undefined,
                transactions: {},
                transactionViolations: {},
                value: '2027-06-15',
                policy,
                policyTags: {},
                policyCategories: {},
                currentUserAccountIDParam: 1,
                currentUserEmailParam: 'test@test.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE, expect.objectContaining({transactionID, created: '2027-06-15'}), expect.anything());
            expect(writeSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE, expect.anything(), expect.anything());

            writeSpy.mockRestore();
        });

        it('calls UpdateMoneyRequestDistanceRate with created when a Self DM track distance expense date change selects a different rate', async () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Inspecting API.write calls to verify date-only update path.
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
            const transactionID = 'distance_date_self_dm';
            const transactionThreadReportID = 'thread_date_self_dm';
            const selfDMReportID = 'self_dm_date_rate';
            const policyID = 'policy_date_self_dm';
            const rate2025 = 'rate_2025';
            const rate2026 = 'rate_2026';

            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: selfDMReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const trackIouAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
                comment: '',
                participants: [{accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}],
                transactionID,
                isPersonalTrackingExpense: true,
            });
            const transactionThread: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID: selfDMReportID,
                parentReportActionID: trackIouAction.reportActionID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const transaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: selfDMReportID,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
                created: '2025-06-15',
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 10,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        customUnitRateID: rate2025,
                    },
                },
            };
            const policy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.CORPORATE,
                customUnits: {
                    unitId: {
                        attributes: {unit: 'mi'},
                        customUnitID: 'unitId',
                        defaultCategory: 'Car',
                        enabled: true,
                        name: 'Distance',
                        rates: {
                            [rate2025]: {
                                currency: 'USD',
                                customUnitRateID: rate2025,
                                enabled: true,
                                name: '2025 mileage',
                                rate: 65.5,
                                startDate: '2025-01-01',
                                endDate: '2025-12-31',
                            },
                            [rate2026]: {
                                currency: 'USD',
                                customUnitRateID: rate2026,
                                enabled: true,
                                name: '2026 mileage',
                                rate: 70,
                                startDate: '2026-01-01',
                                endDate: '2026-12-31',
                            },
                        },
                    },
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`, selfDMReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThread);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`, {
                [trackIouAction.reportActionID]: trackIouAction,
            });
            await waitForBatchedUpdates();

            updateMoneyRequestDate({
                personalPolicyOutputCurrency: undefined,
                transactionID,
                transactionThreadReport: transactionThread,
                parentReport: selfDMReport,
                iouReportOwnerLogin: undefined,
                transactions: {},
                transactionViolations: {},
                value: '2026-06-15',
                policy,
                policyForTrackExpense: policy,
                policyTags: {},
                policyCategories: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
                isOffline: false,
                delegateAccountID: undefined,
            });

            expect(writeSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE, expect.anything(), expect.anything());
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE,
                expect.objectContaining({
                    transactionID,
                    customUnitRateID: rate2026,
                    created: '2026-06-15',
                }),
                expect.anything(),
            );
            expect(writeSpy).toHaveBeenCalledTimes(1);

            writeSpy.mockRestore();
        });
    });
});
