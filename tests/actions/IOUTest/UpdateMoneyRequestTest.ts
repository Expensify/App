/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {format} from 'date-fns';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {
    updateMoneyRequestAmountAndCurrency,
    updateMoneyRequestAttendees,
    updateMoneyRequestCategory,
    updateMoneyRequestDistance,
    updateMoneyRequestTag,
} from '@libs/actions/IOU/UpdateMoneyRequest';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import {getOriginalMessage, isActionOfType} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists, RecentlyUsedTags, RecentWaypoint, Report} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Transaction from '@src/types/onyx/Transaction';
import currencyList from '../../unit/currencyList.json';
import createPersonalDetails from '../../utils/collections/personalDetails';
import createRandomPolicy, {createCategoryTaxExpenseRules} from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import type {MockFetch} from '../../utils/TestHelper';
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
                category,
                policy: fakePolicy,
                policyTagList: undefined,
                policyCategories: undefined,
                policyRecentlyUsedCategories: [],
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
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
                    category,
                    policy: fakePolicy,
                    policyTagList: undefined,
                    policyCategories: undefined,
                    policyRecentlyUsedCategories: [],
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    isASAPSubmitBetaEnabled: false,
                    parentReportNextStep: undefined,
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
                    category,
                    policy: fakePolicy,
                    policyTagList: undefined,
                    policyCategories: undefined,
                    policyRecentlyUsedCategories: [],
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    isASAPSubmitBetaEnabled: false,
                    parentReportNextStep: undefined,
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
                category,
                policy: fakePolicy,
                policyTagList: undefined,
                policyCategories: undefined,
                policyRecentlyUsedCategories: [],
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
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
            });
            await waitForBatchedUpdates();

            // Then the recent attendees should be updated with a maximum of 5 attendees
            const recentAttendees = await new Promise<OnyxEntry<Attendee[]>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: ONYXKEYS.NVP_RECENT_ATTENDEES,
                    callback: (attendees) => {
                        Onyx.disconnect(connection);
                        resolve(attendees);
                    },
                });
            });
            expect(recentAttendees?.length).toBe(CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW);
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
                tag: newTag,
                policy,
                policyTagList: policyTags,
                policyRecentlyUsedTags,
                policyCategories: undefined,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.email ?? '',
                isASAPSubmitBetaEnabled: false,
                parentReportNextStep: undefined,
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
                transaction: fakeTransaction,
                transactionThreadReport,
                parentReport,
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
                transaction: fakeTransaction,
                transactionThreadReport,
                parentReport,
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
                transaction: fakeTransaction,
                transactionThreadReport,
                parentReport,
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
                transaction: fakeTransaction,
                transactionThreadReport,
                parentReport,
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
                transaction: fakeTransaction2,
                transactionThreadReport,
                parentReport,
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
            });

            await waitForBatchedUpdates();

            // Verify second transaction
            const transaction2AfterUpdate = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID2}`);

            expect(transaction2AfterUpdate?.transactionID).toBe(transactionID2);
        });
    });
});
