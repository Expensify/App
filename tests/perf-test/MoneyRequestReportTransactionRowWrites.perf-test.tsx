import {act, screen} from '@testing-library/react-native';

import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';

import type Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {setHasRadio} from '@libs/NetworkState';

import {ActionListContext} from '@pages/inbox/ActionListContext';
import {ReactionListContext} from '@pages/inbox/ReactionListContext';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ReportAction, ReportActions, Transaction} from '@src/types/onyx';

import type React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const REPORT_ID = '1';

// Real Reanimated returns one animated style handle per component for its whole life, while the global mock returns a
// new object on every render. Keep one object per component so rows get the same style identities they get on a device.
jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('react-native-reanimated/mock');
    const {useState} = jest.requireActual<typeof React>('react');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        createAnimatedPropAdapter: jest.fn,
        dispatchCommand: jest.fn(),
        useReducedMotion: jest.fn,
        useScrollViewOffset: jest.fn(() => 0),
        useAnimatedRef: jest.fn(() => jest.fn()),
        LayoutAnimationConfig: ({children}: {children: React.ReactNode}) => children,
        makeShareableCloneRecursive: jest.fn,
        useAnimatedStyle: (updater: () => Record<string, unknown>) => {
            const [style] = useState<Record<string, unknown>>(() => ({}));
            return Object.assign(style, updater());
        },
    };
});

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    const SCREENS_MOCK = jest.requireActual<{default: typeof SCREENS}>('@src/SCREENS').default;
    return {
        ...actualNav,
        useRoute: () => ({
            key: 'test-key',
            name: SCREENS_MOCK.REPORT,
            // Must stay in sync with REPORT_ID above — jest.mock hoisting forbids referencing the constant here.
            params: {reportID: '1'},
        }),
        useIsFocused: () => true,
    };
});

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    });
    initOnyxDerivedValues();
});

const mockOnLayout = jest.fn();
function buildActionListContextValue() {
    return {scrollOffsetRef: {current: 0}, getScrollOffset: () => 0, registerListRef: () => {}, getListRef: () => null};
}
const actionListContextValue = buildActionListContextValue();
const mockReactionListContextValue = {
    showReactionList: () => {},
    hideReactionList: () => {},
    isActiveReportAction: () => false,
};
const screenWrapperStatusContextValue = {
    didScreenTransitionEnd: true,
    isSafeAreaTopPaddingApplied: false,
    isSafeAreaBottomPaddingApplied: false,
};

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';
const POLICY_ID = 'PERF_POLICY_1';
const TRANSACTIONS_COUNT = 10;

const signUpWithTestUser = () => {
    TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
};

const sortedReportActions = ReportTestUtils.getMockedSortedReportActions(500);
const reportActions: ReportActions = Object.fromEntries(sortedReportActions.map((action: ReportAction) => [action.reportActionID, action]));
const report = {
    ...ReportTestUtils.createMockReport({reportID: REPORT_ID, lastVisibleActionCreated: sortedReportActions.at(0)?.created}),
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID: POLICY_ID,
    total: 10000 * TRANSACTIONS_COUNT,
    currency: CONST.CURRENCY.USD,
    lastReadTime: sortedReportActions.at(0)?.created,
};

function buildTransaction(index: number): Transaction {
    return {
        transactionID: `PERF_TXN_${index + 1}`,
        reportID: REPORT_ID,
        amount: 10000,
        currency: CONST.CURRENCY.USD,
        merchant: `Merchant ${index + 1}`,
        created: '2025-01-01',
        status: CONST.TRANSACTION.STATUS.POSTED,
    } as Transaction;
}

const transactions = Array.from({length: TRANSACTIONS_COUNT}, (unused, index) => buildTransaction(index));

beforeEach(async () => {
    setHasRadio(true);
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    await act(async () => {
        signUpWithTestUser();
        await Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, reportActions);
        for (const transaction of transactions) {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        }
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {
            isLoadingInitialReportActions: false,
            hasOnceLoadedReportActions: true,
            isLoadingOlderReportActions: false,
            hasLoadingOlderReportActionsError: false,
            isLoadingNewerReportActions: false,
            hasLoadingNewerReportActionsError: false,
        });
        await waitForBatchedUpdates();
    });
});

afterEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();
});

function MoneyRequestReportActionsListWrapper() {
    return (
        <NavigationContainer ref={navigationRef}>
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, AttachmentModalContextProvider]}>
                <SearchContextProvider>
                    <ReactionListContext.Provider value={mockReactionListContextValue}>
                        <ActionListContext.Provider value={actionListContextValue}>
                            <ScreenWrapperStatusContext.Provider value={screenWrapperStatusContextValue}>
                                <MoneyRequestReportActionsList onLayout={mockOnLayout} />
                            </ScreenWrapperStatusContext.Provider>
                        </ActionListContext.Provider>
                    </ReactionListContext.Provider>
                </SearchContextProvider>
            </ComposeProviders>
        </NavigationContainer>
    );
}

const WRITES_PER_SCENARIO = 10;
const UNRELATED_ACCOUNT_ID = 9999;
const FIRST_TRANSACTION_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactions.at(0)?.transactionID}` as const;
const FIRST_TRANSACTION_VIOLATIONS_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactions.at(0)?.transactionID}` as const;

async function measureWrites(write: (run: number, index: number) => Promise<unknown>) {
    // Reassure runs the scenario several times against one seeded Onyx, so every run writes a value that doesn't exist yet
    let run = 0;
    const scenario = async () => {
        await screen.findByTestId('money-request-report-actions-list');
        const currentRun = run;
        for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
            await act(async () => {
                await write(currentRun, index);
                await waitForBatchedUpdates();
            });
        }
        run++;
    };
    await waitForBatchedUpdates();
    await measureRenders(<MoneyRequestReportActionsListWrapper />, {scenario});
}

test('[MoneyRequestReportTransactionRows] should re-render when one transaction amount changes', async () => {
    // Given an expense report with 10 transactions, when the amount of one of them changes repeatedly
    // Then reassure measures what a write to one transaction costs the rows
    await measureWrites((run, index) => Onyx.merge(FIRST_TRANSACTION_KEY, {amount: 20000 + run * 100 + index}));
});

test('[MoneyRequestReportTransactionRows] should re-render when one transaction gets a violation', async () => {
    // Given an expense report with 10 transactions, when the violations of one of them change repeatedly
    // Then reassure measures what a violation on one transaction costs the rows
    await measureWrites((run, index) =>
        Onyx.set(
            FIRST_TRANSACTION_VIOLATIONS_KEY,
            (run * WRITES_PER_SCENARIO + index) % 2 === 0 ? [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}] : [],
        ),
    );
});

test('[MoneyRequestReportTransactionRows] should re-render when a comment arrives on the report', async () => {
    // Given an expense report with 10 transactions, when new comments arrive on the report
    // Then reassure measures what a report action write costs the transaction rows
    await measureWrites((run, index) => {
        const newAction = ReportTestUtils.getFakeReportAction(1000 + run * WRITES_PER_SCENARIO + index, {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created: `2023-09-15 00:${String(run % 60).padStart(2, '0')}:${String(index).padStart(2, '0')}.000`,
        });
        return Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[newAction.reportActionID]: newAction});
    });
});

test('[MoneyRequestReportTransactionRows] should re-render when an unrelated personal detail changes', async () => {
    // Given an expense report with 10 transactions, when a user outside the report is renamed
    // Then reassure measures what an unrelated personal details write costs the rows
    await measureWrites((run, index) => Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[UNRELATED_ACCOUNT_ID]: {accountID: UNRELATED_ACCOUNT_ID, displayName: `Unrelated ${run}-${index}`}}));
});

test('[MoneyRequestReportTransactionRows] should re-render when the report total changes', async () => {
    // Given an expense report with 10 transactions, when a report field every row receives changes
    // Then reassure measures the cost of a write that legitimately re-renders all rows
    await measureWrites((run, index) => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {total: 100000 + run * 100 + index}));
});
