/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxMergeCollectionInput} from 'react-native-onyx';
import '@libs/actions/IOU/MoneyRequest';
import {handleNavigateAfterExpenseCreate} from '@libs/actions/IOU/NavigationHelpers';
import {createSplitsAndOnyxData} from '@libs/actions/IOU/Split';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import {rand64} from '@libs/NumberUtils';
import type * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyTagLists, Report} from '@src/types/onyx';
import type {Participant as IOUParticipant, SplitExpense} from '@src/types/onyx/IOU';
import type {Participant} from '@src/types/onyx/Report';
import type {SplitShares} from '@src/types/onyx/Transaction';
import currencyList from '../../unit/currencyList.json';
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
    getIsFullscreenPreInsertedUnderRHP: jest.fn(() => false),
    clearFullscreenPreInsertedFlag: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn(),
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
// In production, requestMoney defers its API.write() call until the target screen's
// content lays out (or a safety timeout fires). In tests there is no target component
// to flush the deferred write, so we bypass the deferral by executing the callback immediately.
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
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
const CARLOS_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'member'};
const JULES_EMAIL = 'jules@expensifail.com';
const JULES_ACCOUNT_ID = 2;
const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;
const RORY_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'admin'};
const VIT_EMAIL = 'vit@expensifail.com';
const VIT_ACCOUNT_ID = 4;

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

    describe('Report Totals Calculation for Split Expenses', () => {
        function calculateReportTotalsForSplitExpenses(
            expenseReport: Report | undefined,
            splitExpenses: SplitExpense[],
            allReportsList: Record<string, Report> | undefined,
            changesInReportTotal: number,
        ): Map<string, number> {
            const reportTotals = new Map<string, number>();
            const expenseReportID = expenseReport?.reportID;

            if (expenseReportID) {
                const expenseReportKey = `${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`;
                const expenseReportTotal = allReportsList?.[expenseReportKey]?.total ?? expenseReport?.total ?? 0;
                reportTotals.set(expenseReportID, expenseReportTotal - changesInReportTotal);
            }

            for (const expense of splitExpenses) {
                const splitExpenseReportID = expense.reportID;
                if (!splitExpenseReportID || reportTotals.has(splitExpenseReportID)) {
                    continue;
                }

                const splitExpenseReport = allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${splitExpenseReportID}`];
                reportTotals.set(splitExpenseReportID, splitExpenseReport?.total ?? 0);
            }

            return reportTotals;
        }

        it('should calculate expense report total minus changes when expense report ID exists', () => {
            const expenseReport: Report = {
                reportID: 'report1',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [];
            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {
                    reportID: 'report1',
                    total: 10000,
                } as Report,
            };
            const changesInReportTotal = 2000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(1);
            expect(result.get('report1')).toBe(8000); // 10000 - 2000
        });

        it('should use expense report total directly when not in allReportsList', () => {
            const expenseReport: Report = {
                reportID: 'report1',
                total: 15000,
            } as Report;

            const splitExpenses: SplitExpense[] = [];
            const allReportsList = {}; // Empty, so should fall back to expenseReport.total
            const changesInReportTotal = 3000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(1);
            expect(result.get('report1')).toBe(12000); // 15000 - 3000
        });

        it('should use allReportsList total when it differs from expense report total', () => {
            const expenseReport: Report = {
                reportID: 'report1',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [];
            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {
                    reportID: 'report1',
                    total: 12000, // Different from expenseReport.total
                } as Report,
            };
            const changesInReportTotal = 2000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(1);
            expect(result.get('report1')).toBe(10000); // 12000 - 2000 (uses allReportsList value)
        });

        it('should add split expenses from different reports to the map', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [
                {
                    reportID: 'splitReport1',
                    amount: 2000,
                } as SplitExpense,
                {
                    reportID: 'splitReport2',
                    amount: 3000,
                } as SplitExpense,
            ];

            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}splitReport1`]: {
                    reportID: 'splitReport1',
                    total: 5000,
                } as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}splitReport2`]: {
                    reportID: 'splitReport2',
                    total: 7000,
                } as Report,
            };
            const changesInReportTotal = 1000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(3);
            expect(result.get('mainReport')).toBe(9000); // 10000 - 1000
            expect(result.get('splitReport1')).toBe(5000);
            expect(result.get('splitReport2')).toBe(7000);
        });

        it('should skip split expenses without reportID', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [
                {
                    reportID: undefined,
                    amount: 2000,
                } as SplitExpense,
                {
                    reportID: 'splitReport1',
                    amount: 3000,
                } as SplitExpense,
            ];

            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}splitReport1`]: {
                    reportID: 'splitReport1',
                    total: 5000,
                } as Report,
            };
            const changesInReportTotal = 1000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(2); // Only mainReport and splitReport1
            expect(result.get('mainReport')).toBe(9000);
            expect(result.get('splitReport1')).toBe(5000);
        });

        it('should skip split expenses that are already in reportTotals', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            // Two split expenses with the same reportID
            const splitExpenses: SplitExpense[] = [
                {
                    reportID: 'splitReport1',
                    amount: 2000,
                } as SplitExpense,
                {
                    reportID: 'splitReport1', // Duplicate reportID
                    amount: 3000,
                } as SplitExpense,
                {
                    reportID: 'splitReport2',
                    amount: 1500,
                } as SplitExpense,
            ];

            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}splitReport1`]: {
                    reportID: 'splitReport1',
                    total: 5000,
                } as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}splitReport2`]: {
                    reportID: 'splitReport2',
                    total: 3000,
                } as Report,
            };
            const changesInReportTotal = 1000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(3);
            expect(result.get('mainReport')).toBe(9000);
            expect(result.get('splitReport1')).toBe(5000); // Should only be added once
            expect(result.get('splitReport2')).toBe(3000);
        });

        it('should default split expense report total to 0 when not found in allReportsList', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [
                {
                    reportID: 'splitReport1',
                    amount: 2000,
                } as SplitExpense,
            ];

            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
                // splitReport1 is NOT in allReportsList
            };
            const changesInReportTotal = 1000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(2);
            expect(result.get('mainReport')).toBe(9000);
            expect(result.get('splitReport1')).toBe(0); // Defaults to 0
        });

        it('should handle empty split expenses array', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [];
            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
            };
            const changesInReportTotal = 2000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(1);
            expect(result.get('mainReport')).toBe(8000);
        });

        it('should handle negative changesInReportTotal', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [];
            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
            };
            const changesInReportTotal = -2000; // Negative change

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(1);
            expect(result.get('mainReport')).toBe(12000); // 10000 - (-2000) = 12000
        });
    });

    it('handleNavigateAfterExpenseCreate', async () => {
        const mockedIsReportTopmostSplitNavigator = isReportTopmostSplitNavigator as jest.MockedFunction<typeof isReportTopmostSplitNavigator>;
        const spyOnMergeTransactionIdsHighlightOnSearchRoute = jest.spyOn(require('@libs/actions/Transaction'), 'mergeTransactionIdsHighlightOnSearchRoute');
        const activeReportID = '1';
        const transactionID = '1';
        mockedIsReportTopmostSplitNavigator.mockReturnValue(false);

        handleNavigateAfterExpenseCreate({activeReportID, isFromGlobalCreate: false});
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(0);

        handleNavigateAfterExpenseCreate({activeReportID, isFromGlobalCreate: true});
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(0);

        mockedIsReportTopmostSplitNavigator.mockReturnValue(true);
        handleNavigateAfterExpenseCreate({activeReportID, isFromGlobalCreate: true, transactionID});
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(0);

        mockedIsReportTopmostSplitNavigator.mockReturnValue(false);
        handleNavigateAfterExpenseCreate({activeReportID, isFromGlobalCreate: true, transactionID});
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(0);

        handleNavigateAfterExpenseCreate({activeReportID, isFromGlobalCreate: true, transactionID, isInvoice: true});
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(0);

        spyOnMergeTransactionIdsHighlightOnSearchRoute.mockReset();
    });

    describe('createSplitsAndOnyxData', () => {
        const mockPersonalDetails: PersonalDetailsList = {
            [RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL, displayName: 'Rory'},
            [CARLOS_ACCOUNT_ID]: {accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL, displayName: 'Carlos'},
            [JULES_ACCOUNT_ID]: {accountID: JULES_ACCOUNT_ID, login: JULES_EMAIL, displayName: 'Jules'},
            [VIT_ACCOUNT_ID]: {accountID: VIT_ACCOUNT_ID, login: VIT_EMAIL, displayName: 'Vit'},
        };

        const baseTransactionParams = {
            amount: 400,
            currency: CONST.CURRENCY.USD,
            created: '2024-01-01',
            merchant: 'Test Merchant',
            comment: 'Test split',
            tag: '',
            category: '',
            taxCode: '',
            taxAmount: 0,
            splitShares: {} as SplitShares,
        };

        const buildParams = (
            overrides: {
                participants?: IOUParticipant[];
                existingSplitChatReportID?: string;
                transactionParamOverrides?: Partial<typeof baseTransactionParams>;
                participantsPolicyTags?: Record<string, PolicyTagLists>;
            } = {},
        ) => ({
            participants: overrides.participants ?? [{accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL}],
            currentUserLogin: RORY_EMAIL,
            currentUserAccountID: RORY_ACCOUNT_ID,
            existingSplitChatReportID: overrides.existingSplitChatReportID,
            transactionParams: {
                ...baseTransactionParams,
                ...overrides.transactionParamOverrides,
            },
            policyRecentlyUsedCategories: undefined,
            policyRecentlyUsedTags: undefined,
            isASAPSubmitBetaEnabled: false,
            transactionViolations: {},
            quickAction: undefined,
            policyRecentlyUsedCurrencies: [],
            betas: [CONST.BETAS.ALL],
            personalDetails: mockPersonalDetails,
            participantsPolicyTags: overrides.participantsPolicyTags ?? {},
        });

        it('returns valid splitData with chatReportID, transactionID, and reportActionID', () => {
            // Given a basic 1:1 split between the current user and one participant

            // When creating splits and Onyx data
            const result = createSplitsAndOnyxData(buildParams());

            // Then splitData should contain all required identifiers
            expect(result.splitData.chatReportID).toBeTruthy();
            expect(result.splitData.transactionID).toBeTruthy();
            expect(result.splitData.reportActionID).toBeTruthy();
        });

        it('includes createdReportActionID in splitData for a new chat', () => {
            // Given no existing split chat report

            // When creating splits and Onyx data
            const result = createSplitsAndOnyxData(buildParams());

            // Then splitData should include a createdReportActionID for the new chat
            expect(result.splitData.createdReportActionID).toBeTruthy();
        });

        it('omits createdReportActionID from splitData when using an existing chat', async () => {
            // Given an existing chat report already in Onyx
            const existingReportID = rand64();
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${existingReportID}`, {
                reportID: existingReportID,
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            });
            await waitForBatchedUpdates();

            // When creating splits referencing that existing chat
            const result = createSplitsAndOnyxData(buildParams({existingSplitChatReportID: existingReportID}));

            // Then splitData should not include a createdReportActionID
            expect(result.splitData.createdReportActionID).toBeUndefined();
        });

        it('splits amount equally among all participants when no splitShares are provided', () => {
            // Given a $400 expense split between the current user and 3 other participants
            const amount = 400;

            // When creating splits without custom splitShares
            const result = createSplitsAndOnyxData(
                buildParams({
                    participants: [
                        {accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL},
                        {accountID: JULES_ACCOUNT_ID, login: JULES_EMAIL},
                        {accountID: VIT_ACCOUNT_ID, login: VIT_EMAIL},
                    ],
                    transactionParamOverrides: {amount},
                }),
            );

            // Then each of the 4 splits (current user + 3 others) should be $100
            expect(result.splits).toHaveLength(4);
            for (const split of result.splits) {
                expect(split.amount).toBe(amount / 4);
            }
        });

        it('respects custom splitShares amounts when provided', () => {
            // Given a $200 expense with custom split: current user pays $150, Carlos pays $50
            const splitShares: SplitShares = {
                [RORY_ACCOUNT_ID]: {amount: 150},
                [CARLOS_ACCOUNT_ID]: {amount: 50},
            };

            // When creating splits with those custom splitShares
            const result = createSplitsAndOnyxData(
                buildParams({
                    transactionParamOverrides: {amount: 200, splitShares},
                }),
            );

            // Then each participant's split should reflect the custom amounts
            const currentUserSplit = result.splits.find((s) => s.accountID === RORY_ACCOUNT_ID);
            const carlosSplit = result.splits.find((s) => s.accountID === CARLOS_ACCOUNT_ID);

            expect(currentUserSplit?.amount).toBe(150);
            expect(carlosSplit?.amount).toBe(50);
        });

        it('uses SET method for the split chat report in optimisticData when creating a new chat', () => {
            // Given no existing split chat report

            // When creating splits and Onyx data
            const result = createSplitsAndOnyxData(buildParams());

            // Then the chat report update should use SET to write the new report atomically
            const splitChatReportUpdate = result.onyxData.optimisticData?.find(
                (update) =>
                    update.key.startsWith(ONYXKEYS.COLLECTION.REPORT) &&
                    !update.key.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) &&
                    !update.key.includes(ONYXKEYS.COLLECTION.REPORT_METADATA),
            );

            expect(splitChatReportUpdate?.onyxMethod).toBe(Onyx.METHOD.SET);
        });

        it('uses MERGE method for the split chat report in optimisticData when reusing an existing chat', async () => {
            // Given an existing chat report already in Onyx
            const existingReportID = rand64();
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${existingReportID}`, {
                reportID: existingReportID,
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            });
            await waitForBatchedUpdates();

            // When creating splits referencing that existing chat
            const result = createSplitsAndOnyxData(buildParams({existingSplitChatReportID: existingReportID}));

            // Then the chat report update should use MERGE to preserve existing fields
            const splitChatReportUpdate = result.onyxData.optimisticData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.REPORT}${existingReportID}`);

            expect(splitChatReportUpdate?.onyxMethod).toBe(Onyx.METHOD.MERGE);
        });

        it('adds isOptimisticReport:true to REPORT_METADATA in optimisticData for a new chat', () => {
            // Given no existing split chat report

            // When creating splits and Onyx data
            const result = createSplitsAndOnyxData(buildParams());

            // Then optimisticData should flag the new report as optimistic
            const reportMetaUpdate = result.onyxData.optimisticData?.find((update) => update.key.startsWith(ONYXKEYS.COLLECTION.REPORT_METADATA));

            expect(reportMetaUpdate?.value).toMatchObject({isOptimisticReport: true});
        });

        it('does not include REPORT_METADATA isOptimisticReport in optimisticData for an existing chat', async () => {
            // Given an existing chat report already in Onyx
            const existingReportID = rand64();
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${existingReportID}`, {
                reportID: existingReportID,
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            });
            await waitForBatchedUpdates();

            // When creating splits referencing that existing chat
            const result = createSplitsAndOnyxData(buildParams({existingSplitChatReportID: existingReportID}));

            // Then no REPORT_METADATA entry should be written for the existing report
            const reportMetaUpdate = result.onyxData.optimisticData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.REPORT_METADATA}${existingReportID}`);

            expect(reportMetaUpdate).toBeUndefined();
        });

        it('clears pendingAction and pendingFields on the split transaction in successData', () => {
            // Given a basic split

            // When creating splits and Onyx data
            const result = createSplitsAndOnyxData(buildParams());
            const {transactionID} = result.splitData;

            // Then successData should clear pending state on the split transaction
            const txSuccessUpdate = result.onyxData.successData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

            expect(txSuccessUpdate?.value).toMatchObject({pendingAction: null, pendingFields: null});
        });

        it('includes errors on the split transaction in failureData', () => {
            // Given a basic split

            // When creating splits and Onyx data
            const result = createSplitsAndOnyxData(buildParams());
            const {transactionID} = result.splitData;

            // Then failureData should include an errors entry on the split transaction for user-visible feedback
            const txFailureUpdate = result.onyxData.failureData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

            expect(txFailureUpdate?.value).toHaveProperty('errors');
        });

        it('sets policy recently used tags in optimisticData for a policy expense chat participant with a tag', async () => {
            // Given a workspace expense chat with a known tag list
            const policyID = 'test_policy_999';
            const tagListName = 'Department';
            const tagName = 'Engineering';

            const existingExpenseChatID = rand64();
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
                [`${ONYXKEYS.COLLECTION.REPORT}${existingExpenseChatID}`]: {
                    reportID: existingExpenseChatID,
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    policyID,
                    isOwnPolicyExpenseChat: true,
                    participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT},
                },
            } as OnyxMergeCollectionInput<typeof ONYXKEYS.COLLECTION.REPORT>);
            await waitForBatchedUpdates();

            const policyTagsList = {
                [tagListName]: {
                    name: tagListName,
                    tags: {[tagName]: {name: tagName, enabled: true}},
                },
            };

            // When splitting an expense with a tag inside that workspace chat
            const result = createSplitsAndOnyxData(
                buildParams({
                    existingSplitChatReportID: existingExpenseChatID,
                    participants: [
                        {
                            accountID: CARLOS_ACCOUNT_ID,
                            login: CARLOS_EMAIL,
                            isPolicyExpenseChat: true,
                            isOwnPolicyExpenseChat: true,
                            policyID,
                        },
                    ],
                    transactionParamOverrides: {tag: tagName},
                    participantsPolicyTags: {[policyID]: policyTagsList} as unknown as Record<string, PolicyTagLists>,
                }),
            );

            // Then optimisticData should update POLICY_RECENTLY_USED_TAGS with the used tag
            const recentlyUsedTagsUpdate = result.onyxData.optimisticData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);

            expect(recentlyUsedTagsUpdate?.value).toMatchObject({[tagListName]: [tagName]});
        });
    });
});
