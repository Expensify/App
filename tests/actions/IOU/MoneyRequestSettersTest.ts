import {
    getSyncedParticipantAccountIDs,
    initMoneyRequest,
    resetDraftTransactionsCustomUnit,
    setMoneyRequestAmount,
    setMoneyRequestBillable,
    setMoneyRequestCategory,
    setMoneyRequestCreated,
    setMoneyRequestDateAttribute,
    setMoneyRequestDistanceRate,
    setMoneyRequestMerchant,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestParticipantsSyncedAccountIDs,
    setMoneyRequestTag,
} from '@libs/actions/IOU/MoneyRequest';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import Log from '@libs/Log';
import type * as PolicyUtils from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastSelectedDistanceRates, Policy, Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {format} from 'date-fns';
import Onyx from 'react-native-onyx';

import currencyList from '../../unit/currencyList.json';
import createRandomPolicy, {createCategoryTaxExpenseRules} from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import {getCurrencyDecimalsLocal, getGlobalFetchMock} from '../../utils/TestHelper';
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
    getIsFullscreenPreInsertedUnderRHP: jest.fn(() => false),
    clearFullscreenPreInsertedFlag: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
        isReady: jest.fn(() => true),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

const unapprovedCashHash = 71801560;
const unapprovedCashSimilarSearchHash = 1832274510;
jest.mock('@src/libs/SearchQueryUtils', () => {
    const actual = jest.requireActual('@src/libs/SearchQueryUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        getCurrentSearchQueryJSON: jest.fn().mockImplementation(() => ({
            hash: unapprovedCashHash,
            query: 'test',
            type: 'expense',
            status: ['drafts', 'outstanding'],
            filters: {operator: 'eq', left: 'reimbursable', right: 'yes'},
            flatFilters: [{key: 'reimbursable', filters: [{operator: 'eq', value: 'yes'}]}],
            inputQuery: '',
            recentSearchHash: 89,
            similarSearchHash: unapprovedCashSimilarSearchHash,
            sortBy: 'tag',
            sortOrder: 'asc',
        })),
        buildCannedSearchQuery: jest.fn(),
    };
});

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    // This factory runs while PolicyUtils is still loading inside an import cycle, so the barrel's `export *` helpers
    // aren't on it yet. Spread them from their own modules, which load fully.
    ...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils/customUnits'),
    ...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils/tax'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const CARLOS_ACCOUNT_ID = 1;
const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();
describe('actions/IOU', () => {
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

    beforeEach(() => {
        jest.clearAllTimers();
        global.fetch = getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('setMoneyRequestDistanceRate', () => {
        it('does not set distance rate if transaction is invalid', async () => {
            // Given an invalid transaction
            const consoleWarnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => {});

            // When calling setMoneyRequestDistanceRate with invalid transaction
            setMoneyRequestDistanceRate(undefined, 'customUnitRateID123', createRandomPolicy(1), false);
            // Then a warning should be logged and distance rate should not be set
            expect(consoleWarnSpy).toHaveBeenCalledWith('setMoneyRequestDistanceRate is called without a valid transaction, skipping setting distance rate.');
            const distanceRates = await getOnyxValue(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
            expect(distanceRates).toBeUndefined();
            consoleWarnSpy.mockRestore();
        });

        it('sets the last selected distance rate for valid transaction', async () => {
            const policy = createRandomPolicy(1);
            // Given a valid transaction
            const testTransaction: Transaction = {
                transactionID: 'testTransaction123',
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                comment: {
                    comment: 'Test transaction',
                    attendees: [],
                },
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID: 'testReport123',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`, testTransaction);

            // When calling setMoneyRequestDistanceRate with valid transaction
            const customUnitRateID = 'customUnitRateID123';
            setMoneyRequestDistanceRate(testTransaction, customUnitRateID, policy, false);
            await waitForBatchedUpdates();
            // Then the distance rate should be set in Onyx
            const lastDistanceRates = (await getOnyxValue(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES)) as LastSelectedDistanceRates | undefined;
            expect(lastDistanceRates?.[policy.id]).toBeDefined();
            expect(lastDistanceRates?.[policy.id]).toBe(customUnitRateID);
        });

        it('sets distance rate and distance unit for draft transaction', async () => {
            const policy = createRandomPolicy(1);
            policy.customUnits = {
                distanceUnitID: {
                    customUnitID: 'distanceUnitID',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
                    },
                    rates: {},
                },
            };

            const testTransaction: Transaction = {
                transactionID: 'testTransaction123',
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                comment: {
                    comment: 'Test transaction',
                },
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID: 'testReport123',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${testTransaction.transactionID}`, testTransaction);

            const customUnitRateID = 'customUnitRateID123';
            setMoneyRequestDistanceRate(testTransaction, customUnitRateID, policy, true);
            await waitForBatchedUpdates();

            const transactionDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${testTransaction.transactionID}`);
            expect(transactionDraft?.comment?.customUnit?.customUnitRateID).toBe(customUnitRateID);
            expect(transactionDraft?.comment?.customUnit?.distanceUnit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            expect(transactionDraft?.comment?.customUnit?.defaultP2PRate).toBeUndefined();
        });

        it('converts distance quantity if distance unit changes', async () => {
            const policy = createRandomPolicy(1);
            policy.customUnits = {
                distanceUnitID: {
                    customUnitID: 'distanceUnitID',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
                    },
                    rates: {},
                },
            };

            const testTransaction: Transaction = {
                transactionID: 'testTransaction123',
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                comment: {
                    comment: 'Test transaction',
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10,
                    },
                },
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID: 'testReport123',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`, testTransaction);

            const customUnitRateID = 'customUnitRateID123';
            setMoneyRequestDistanceRate(testTransaction, customUnitRateID, policy, false);
            await waitForBatchedUpdates();

            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`);
            expect(transaction?.comment?.customUnit?.customUnitRateID).toBe(customUnitRateID);
            expect(transaction?.comment?.customUnit?.distanceUnit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            // 10 miles to kilometers = 10 / 0.000621371 * 0.001 = 16.093444978925636
            expect(transaction?.comment?.customUnit?.quantity).toBe(16.093444978925636);
        });

        it('does not convert distance quantity if distance unit changes but it is an odometer request', async () => {
            const policy = createRandomPolicy(1);
            policy.customUnits = {
                distanceUnitID: {
                    customUnitID: 'distanceUnitID',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
                    },
                    rates: {},
                },
            };

            const testTransaction: Transaction = {
                transactionID: 'testTransaction123',
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
                comment: {
                    comment: 'Test transaction',
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10,
                    },
                },
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID: 'testReport123',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`, testTransaction);

            const customUnitRateID = 'customUnitRateID123';
            setMoneyRequestDistanceRate(testTransaction, customUnitRateID, policy, false);
            await waitForBatchedUpdates();

            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`);
            expect(transaction?.comment?.customUnit?.customUnitRateID).toBe(customUnitRateID);
            expect(transaction?.comment?.customUnit?.distanceUnit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            // Quantity should remain 10 for odometer requests
            expect(transaction?.comment?.customUnit?.quantity).toBe(10);
        });

        it('does not set defaultP2PRate to null when policy is undefined', async () => {
            const testTransaction: Transaction = {
                transactionID: 'testTransaction123',
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                comment: {
                    comment: 'Test transaction',
                    customUnit: {
                        defaultP2PRate: CONST.CUSTOM_UNITS.MILES_TO_KILOMETERS,
                    },
                },
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID: 'testReport123',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`, testTransaction);

            const customUnitRateID = 'customUnitRateID123';
            setMoneyRequestDistanceRate(testTransaction, customUnitRateID, undefined, false);
            await waitForBatchedUpdates();

            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`);
            expect(transaction?.comment?.customUnit?.customUnitRateID).toBe(customUnitRateID);
            expect(transaction?.comment?.customUnit?.defaultP2PRate).toBe(CONST.CUSTOM_UNITS.MILES_TO_KILOMETERS);
        });
    });

    describe('setMoneyRequestCategory', () => {
        it('should set the associated tax for the category based on the tax expense rules', async () => {
            // Given a policy with tax expense rules associated with category
            const transactionID = '1';
            const category = 'Advertising';
            const policyID = '2';
            const taxCode = 'id_TAX_EXEMPT';
            const ruleTaxCode = 'id_TAX_RATE_1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                taxRates: CONST.DEFAULT_TAX,
                rules: {expenseRules: createCategoryTaxExpenseRules(category, ruleTaxCode)},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
                taxCode,
                taxAmount: 0,
                amount: 100,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When setting the money request category
            setMoneyRequestCategory(transactionID, category, fakePolicy, getCurrencyDecimalsLocal);

            await waitForBatchedUpdates();

            // Then the transaction tax rate and amount should be updated based on the expense rules
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
                    callback: (transaction) => {
                        Onyx.disconnect(connection);
                        expect(transaction?.taxCode).toBe(ruleTaxCode);
                        expect(transaction?.taxAmount).toBe(5);
                        resolve();
                    },
                });
            });
        });

        describe('should not change the tax', () => {
            it('if the transaction type is distance', async () => {
                // Given a policy with tax expense rules associated with category and a distance transaction
                const transactionID = '1';
                const category = 'Advertising';
                const policyID = '2';
                const taxCode = 'id_TAX_EXEMPT';
                const ruleTaxCode = 'id_TAX_RATE_1';
                const taxAmount = 0;
                const fakePolicy: Policy = {
                    ...createRandomPolicy(Number(policyID)),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {expenseRules: createCategoryTaxExpenseRules(category, ruleTaxCode)},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
                    taxCode,
                    taxAmount,
                    amount: 100,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

                // When setting the money request category
                setMoneyRequestCategory(transactionID, category, fakePolicy, getCurrencyDecimalsLocal);

                await waitForBatchedUpdates();

                // Then the transaction tax rate and amount shouldn't be updated
                await new Promise<void>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
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
                const category = 'Advertising';
                const policyID = '2';
                const taxCode = 'id_TAX_EXEMPT';
                const taxAmount = 0;
                const fakePolicy: Policy = {
                    ...createRandomPolicy(Number(policyID)),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
                    taxCode,
                    taxAmount,
                    amount: 100,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

                // When setting the money request category
                setMoneyRequestCategory(transactionID, category, fakePolicy, getCurrencyDecimalsLocal);

                await waitForBatchedUpdates();

                // Then the transaction tax rate and amount shouldn't be updated
                await new Promise<void>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
                        callback: (transaction) => {
                            Onyx.disconnect(connection);
                            expect(transaction?.taxCode).toBe(taxCode);
                            expect(transaction?.taxAmount).toBe(taxAmount);
                            resolve();
                        },
                    });
                });
            });
        });

        it('should clear the tax when the policyID is empty', async () => {
            // Given a transaction with a tax
            const transactionID = '1';
            const taxCode = 'id_TAX_EXEMPT';
            const taxAmount = 0;
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
                taxCode,
                taxAmount,
                amount: 100,
            });

            // When setting the money request category without a policyID
            setMoneyRequestCategory(transactionID, '', undefined, getCurrencyDecimalsLocal);
            await waitForBatchedUpdates();

            // Then the transaction tax should be cleared
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
                    callback: (transaction) => {
                        Onyx.disconnect(connection);
                        expect(transaction?.taxCode).toBe('');
                        expect(transaction?.taxAmount).toBeUndefined();
                        resolve();
                    },
                });
            });
        });
    });

    describe('initMoneyRequest', () => {
        const fakeReport: Report = {
            ...createRandomReport(0, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: '1',
            managerID: CARLOS_ACCOUNT_ID,
        };
        const fakePolicy: Policy = {
            ...createRandomPolicy(1),
            type: CONST.POLICY.TYPE.TEAM,
            outputCurrency: 'USD',
        };

        const fakeParentReport: Report = {
            ...createRandomReport(1, undefined),
            reportID: fakeReport.reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: '1',
            managerID: CARLOS_ACCOUNT_ID,
        };
        const fakePersonalPolicy: Pick<Policy, 'id' | 'type' | 'autoReporting' | 'outputCurrency'> = {
            id: '2',
            autoReporting: true,
            type: CONST.POLICY.TYPE.PERSONAL,
            outputCurrency: 'NZD',
        };
        const transactionResult: Transaction = {
            amount: 0,
            comment: {},
            created: '2025-04-01',
            currency: 'USD',
            iouRequestType: 'manual',
            reportID: fakeReport.reportID,
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            isFromGlobalCreate: true,
            merchant: 'Expense',
        };

        const currentDate = '2025-04-01';
        beforeEach(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, null);
            await Onyx.merge(`${ONYXKEYS.CURRENT_DATE}`, currentDate);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            return waitForBatchedUpdates();
        });

        it('should merge transaction draft onyx value', async () => {
            await waitForBatchedUpdates()
                .then(() => {
                    initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [],
                    });
                })
                .then(async () => {
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual(transactionResult);
                });
        });

        it('should modify transaction draft when currentIouRequestType is different', async () => {
            await waitForBatchedUpdates()
                .then(() => {
                    return initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        currentIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [],
                    });
                })
                .then(async () => {
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual({
                        ...transactionResult,
                        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                    });
                });
        });
        it('should return personal currency when policy is missing', async () => {
            await waitForBatchedUpdates()
                .then(() => {
                    return initMoneyRequest({
                        reportID: fakeReport.reportID,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [],
                    });
                })
                .then(async () => {
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual({
                        ...transactionResult,
                        currency: fakePersonalPolicy.outputCurrency,
                    });
                });
        });

        it('should remove non-optimistic draft transactions when draftTransactionIDs is provided', async () => {
            const otherDraftTransactionID = '123456';
            const otherDraftTransaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID: otherDraftTransactionID,
            };

            // Set up an additional draft transaction
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${otherDraftTransactionID}`, otherDraftTransaction);

            await waitForBatchedUpdates()
                .then(() => {
                    initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [otherDraftTransactionID],
                    });
                })
                .then(async () => {
                    // The other draft transaction should be removed (Onyx returns undefined for removed keys)
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${otherDraftTransactionID}`)).toBeUndefined();
                    // The optimistic transaction should be created
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual(transactionResult);
                });
        });

        it('should preserve optimistic transaction in draftTransactionIDs while removing others', async () => {
            const otherDraftTransactionID = '789012';
            const otherDraftTransaction: Transaction = {
                ...createRandomTransaction(2),
                transactionID: otherDraftTransactionID,
            };
            const existingOptimisticTransaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            };

            // Set up both draft transactions
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${otherDraftTransactionID}`, otherDraftTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, existingOptimisticTransaction);

            await waitForBatchedUpdates()
                .then(() => {
                    initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [otherDraftTransactionID, CONST.IOU.OPTIMISTIC_TRANSACTION_ID],
                    });
                })
                .then(async () => {
                    // The other draft transaction should be removed (Onyx returns undefined for removed keys)
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${otherDraftTransactionID}`)).toBeUndefined();
                    // The optimistic transaction should be updated with the new transaction result (not removed)
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual(transactionResult);
                });
        });

        it('should remove multiple draft transactions when draftTransactionIDs contains several entries', async () => {
            const draftTransactionID1 = '111111';
            const draftTransactionID2 = '222222';
            const draftTransaction1: Transaction = {
                ...createRandomTransaction(4),
                transactionID: draftTransactionID1,
            };
            const draftTransaction2: Transaction = {
                ...createRandomTransaction(5),
                transactionID: draftTransactionID2,
            };

            // Set up multiple draft transactions
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransactionID1}`, draftTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransactionID2}`, draftTransaction2);

            await waitForBatchedUpdates()
                .then(() => {
                    initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [draftTransactionID1, draftTransactionID2],
                    });
                })
                .then(async () => {
                    // Both draft transactions should be removed (Onyx returns undefined for removed keys)
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransactionID1}`)).toBeUndefined();
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransactionID2}`)).toBeUndefined();
                    // The optimistic transaction should be created
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual(transactionResult);
                });
        });
    });

    describe('resetDraftTransactionsCustomUnit', () => {
        it('should do nothing if transaction is not passed', async () => {
            // Call the reset function without a transaction
            resetDraftTransactionsCustomUnit(undefined);
            await waitForBatchedUpdates();
            const allDraftTransactions = await getOnyxValue(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT);
            // Onyx resolves a registered collection with no members to the frozen `{}` once init has run.
            expect(allDraftTransactions).toEqual({});
        });
        it('should reset custom unit for a transaction', async () => {
            const transactionID = 'transaction_reset_001';
            const fakeTransaction: Transaction = {
                transactionID,
                amount: 1500,
                currency: CONST.CURRENCY.USD,
                created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                merchant: 'Test Reset',
                reportID: 'report_reset_001',
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 100,
                    },
                    waypoints: {
                        waypoint0: {lat: 40.7128, lng: -74.006, address: 'NYC', name: 'NYC', keyForList: 'nyc_key'},
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await waitForBatchedUpdates();
            // Call the reset function
            resetDraftTransactionsCustomUnit(fakeTransaction);
            await waitForBatchedUpdates();
            // Verify the transaction's custom unit and waypoints have been reset
            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(updatedTransaction?.comment?.customUnit?.name).toBe(CONST.CUSTOM_UNITS.NAME_DISTANCE);
            expect(updatedTransaction?.comment?.customUnit?.quantity).toBe(100);
        });
    });

    describe('setMoneyRequest helpers', () => {
        const transactionID = 'testTransaction123';

        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });

        it('setMoneyRequestAmount should set amount, currency, and shouldShowOriginalAmount on transaction draft', async () => {
            setMoneyRequestAmount(transactionID, 500, 'EUR', true);
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.amount).toBe(500);
            expect(draft?.currency).toBe('EUR');
            expect(draft?.shouldShowOriginalAmount).toBe(true);
        });

        it('setMoneyRequestParticipantsFromReport should store the login of a 1:1 chat participant with their accountID', async () => {
            // Given a 1:1 chat with a recipient whose personal details have a login, like an optimistic account created offline
            const recipientAccountID = 9999995;
            const recipientLogin = 'new.login@expensifail.com';
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[recipientAccountID]: {accountID: recipientAccountID, login: recipientLogin}});
            await waitForBatchedUpdates();
            const chatReport = {
                reportID: 'chatReport123',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [RORY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [recipientAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            } as Report;

            // When the draft's participants are set from that chat
            await setMoneyRequestParticipantsFromReport(transactionID, chatReport, RORY_ACCOUNT_ID);
            await waitForBatchedUpdates();

            // Then the login is stored too, so the recipient can still be resolved by login if the accountID is replaced on sync
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.participants).toEqual([{accountID: recipientAccountID, login: recipientLogin, selected: true}]);
        });

        describe('synced participant accountIDs', () => {
            const optimisticAccountID = 9999996;
            const realAccountID = 9999997;
            const recipientLogin = 'existing.user@expensifail.com';
            const chatReport = {
                reportID: 'chatReport456',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [RORY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [realAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            } as Report;

            it('getSyncedParticipantAccountIDs should find the real account through the 1:1 chat when the server left its login off', () => {
                // Given a draft recipient whose optimistic accountID was dropped on sync, and a real account with no login,
                // which is how the server can return an existing Expensify user
                const personalDetails = {
                    [RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL},
                    [realAccountID]: {accountID: realAccountID, displayName: 'Existing User'},
                };

                // When the real accountIDs are looked up with the chat the draft points to, which listed the optimistic accountID before the sync
                const participants = [{accountID: optimisticAccountID, login: recipientLogin, selected: true}];
                const syncedAccountIDs = getSyncedParticipantAccountIDs(participants, personalDetails, chatReport, [RORY_ACCOUNT_ID, optimisticAccountID], RORY_ACCOUNT_ID);

                // Then the chat's other participant replaces the optimistic accountID, so the existing chat can be found
                expect(syncedAccountIDs).toEqual({[optimisticAccountID]: realAccountID});
            });

            it('getSyncedParticipantAccountIDs should not swap a recipient the chat never listed for the chat recipient', () => {
                // Given a newly picked phone contact, whose optimistic accountID was never in personal details, on a draft that still points to another 1:1 chat
                const phoneContactAccountID = 9999998;
                const personalDetails = {
                    [RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL},
                    [realAccountID]: {accountID: realAccountID, displayName: 'Existing User'},
                };

                // When the real accountIDs are looked up, and the chat only ever listed its own recipient
                const participants = [{accountID: phoneContactAccountID, login: '+15005550006', selected: true}];
                const syncedAccountIDs = getSyncedParticipantAccountIDs(participants, personalDetails, chatReport, [RORY_ACCOUNT_ID, realAccountID], RORY_ACCOUNT_ID);

                // Then the phone contact is kept, so the expense isn't sent to the chat's recipient instead
                expect(syncedAccountIDs).toEqual({});
            });

            it('getSyncedParticipantAccountIDs should leave a recipient alone while its accountID is still in personal details', () => {
                // Given a draft recipient whose optimistic accountID has not synced yet
                const personalDetails = {[optimisticAccountID]: {accountID: optimisticAccountID, login: recipientLogin}};

                // When the real accountIDs are looked up
                const participants = [{accountID: optimisticAccountID, login: recipientLogin}];
                const syncedAccountIDs = getSyncedParticipantAccountIDs(participants, personalDetails, chatReport, [RORY_ACCOUNT_ID, optimisticAccountID], RORY_ACCOUNT_ID);

                // Then nothing is replaced, because the optimistic accountID is still the right one
                expect(syncedAccountIDs).toEqual({});
            });

            it('setMoneyRequestParticipantsSyncedAccountIDs should move the participant and its split share to the real accountID', async () => {
                // Given a split draft whose shares were saved under the recipient's optimistic accountID
                const transaction: Transaction = {
                    ...createRandomTransaction(1),
                    transactionID,
                    participants: [{accountID: optimisticAccountID, login: recipientLogin, selected: true}],
                    splitShares: {
                        [RORY_ACCOUNT_ID]: {amount: 1500, isModified: false},
                        [optimisticAccountID]: {amount: 1500, isModified: false},
                    },
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, transaction);
                await waitForBatchedUpdates();

                // When the draft is moved to the real accountID after sync
                setMoneyRequestParticipantsSyncedAccountIDs(transaction, {[optimisticAccountID]: realAccountID});
                await waitForBatchedUpdates();

                // Then the participant and the recipient's share both use the real accountID, so the split row still shows $15
                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
                expect(draft?.participants).toEqual([{accountID: realAccountID, login: recipientLogin, selected: true}]);
                expect(draft?.splitShares).toEqual({
                    [RORY_ACCOUNT_ID]: {amount: 1500, isModified: false},
                    [realAccountID]: {amount: 1500, isModified: false},
                });
            });
        });

        it('setMoneyRequestCreated should set created on transaction draft', async () => {
            setMoneyRequestCreated(transactionID, '2024-01-15', true);
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.created).toBe('2024-01-15');
        });

        it('setMoneyRequestDateAttribute should set date attributes on transaction draft', async () => {
            setMoneyRequestDateAttribute(transactionID, '2024-01-01', '2024-01-31');
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.comment?.customUnit?.attributes?.dates?.start).toBe('2024-01-01');
            expect(draft?.comment?.customUnit?.attributes?.dates?.end).toBe('2024-01-31');
        });

        it('setMoneyRequestMerchant should set merchant on transaction draft', async () => {
            setMoneyRequestMerchant(transactionID, 'Coffee Shop', true);
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.merchant).toBe('Coffee Shop');
        });

        it('setMoneyRequestTag should set tag on transaction draft', async () => {
            setMoneyRequestTag(transactionID, 'Engineering');
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.tag).toBe('Engineering');
        });

        it('setMoneyRequestBillable should set billable on transaction draft', async () => {
            setMoneyRequestBillable(transactionID, true);
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.billable).toBe(true);
        });
    });
});
