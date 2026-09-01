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

import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const REPORT_ID = '1';

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

test('[MoneyRequestReportActionsList] should render the unified list with 500 reportActions and 10 transactions stored', async () => {
    const scenario = async () => {
        await screen.findByTestId('money-request-report-actions-list');
    };
    await waitForBatchedUpdates();
    await measureRenders(<MoneyRequestReportActionsListWrapper />, {scenario});
});

test('[MoneyRequestReportActionsList] should measure re-renders when an unrelated report receives new actions', async () => {
    const UNRELATED_REPORT_ID = '999';
    // Reassure calls `scenario` once per run (10 runs + warmup) while Onyx is seeded once per test,
    // so every run must write actions that don't exist yet — otherwise runs after the first merge
    // already-present data and measure a no-op instead of the advertised transition.
    let run = 0;
    const scenario = async () => {
        await screen.findByTestId('money-request-report-actions-list');
        for (let i = 0; i < 5; i++) {
            const newAction = ReportTestUtils.getFakeReportAction(600 + run * 5 + i, {
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: `2023-09-14 00:${String(run).padStart(2, '0')}:0${i}.000`,
            });
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${UNRELATED_REPORT_ID}`, {[newAction.reportActionID]: newAction});
                await waitForBatchedUpdates();
            });
        }
        run++;
    };
    await waitForBatchedUpdates();
    await measureRenders(<MoneyRequestReportActionsListWrapper />, {scenario});
});

test('[MoneyRequestReportActionsList] should re-render the unified list when a new report action arrives', async () => {
    let run = 0;
    const scenario = async () => {
        await screen.findByTestId('money-request-report-actions-list');
        const newAction = ReportTestUtils.getFakeReportAction(501 + run, {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created: `2023-09-13 00:00:${String(run).padStart(2, '0')}.000`,
        });
        run++;
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[newAction.reportActionID]: newAction});
            await waitForBatchedUpdates();
        });
    };
    await waitForBatchedUpdates();
    await measureRenders(<MoneyRequestReportActionsListWrapper />, {scenario});
});

test('[MoneyRequestReportActionsList] should measure re-renders when a transaction under the report changes', async () => {
    let run = 0;
    const scenario = async () => {
        await screen.findByTestId('money-request-report-actions-list');
        run++;
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactions.at(0)?.transactionID}`, {amount: 20000 + run * 100, merchant: `Updated Merchant ${run}`});
            await waitForBatchedUpdates();
        });
    };
    await waitForBatchedUpdates();
    await measureRenders(<MoneyRequestReportActionsListWrapper />, {scenario});
});

test('[MoneyRequestReportActionsList] should render the unified list with 500 reportActions and 100 transactions stored', async () => {
    const LARGE_TRANSACTIONS_COUNT = 100;
    await act(async () => {
        const extraTransactions = Object.fromEntries(
            Array.from({length: LARGE_TRANSACTIONS_COUNT - TRANSACTIONS_COUNT}, (unused, index) => {
                const transaction = buildTransaction(TRANSACTIONS_COUNT + index);
                return [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction];
            }),
        );
        await Onyx.multiSet(extraTransactions);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {total: 10000 * LARGE_TRANSACTIONS_COUNT});
        await waitForBatchedUpdates();
    });
    const scenario = async () => {
        await screen.findByTestId('money-request-report-actions-list');
    };
    await waitForBatchedUpdates();
    await measureRenders(<MoneyRequestReportActionsListWrapper />, {scenario});
});
