import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';

import Tab from '@libs/actions/Tab';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import * as SplitExpenseUtils from '@libs/SplitExpenseUtils';

import DynamicSplitExpensePage from '@pages/iou/DynamicSplitExpensePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_LOGIN = 'current-user@example.com';
const SELF_DM_REPORT_ID = 'selfDM';
const APPROVED_REPORT_ID = 'approvedReport';
const ORIGINAL_TRANSACTION_ID = 'original';
const OPEN_SPLIT_TRANSACTION_ID = 'openSplit';
const FROZEN_SPLIT_TRANSACTION_ID = 'frozenSplit';

let capturedSplitListData: SplitListItemType[] = [];
let mockSearchResultsData: SearchResultDataType | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: jest.fn(() => ({
        currentSearchResults: mockSearchResultsData ? {data: mockSearchResultsData} : undefined,
    })),
    useSearchQueryContext: jest.fn(() => ({
        currentSearchHash: 0,
        currentSearchQueryJSON: undefined,
    })),
    useSearchSelectionActions: jest.fn(() => ({
        clearSelectedTransactions: jest.fn(),
    })),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () =>
    jest.fn(() => ({
        accountID: 1,
        login: 'current-user@example.com',
        email: 'current-user@example.com',
    })),
);

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'search'));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    dismissModal: jest.fn(),
}));

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({title}: {title: string}) => <Text testID="split-header-title">{title}</Text>;
});

jest.mock('@components/CollapsibleHeaderOnKeyboard', () => {
    function MockCollapsibleHeaderOnKeyboard({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockCollapsibleHeaderOnKeyboard;
});

// Render only the amount tab synchronously - the real material top tab navigator needs a navigation container.
jest.mock('@libs/Navigation/OnyxTabNavigator', () => {
    function MockOnyxTabNavigator({children}: {children: React.ReactNode}) {
        return children;
    }
    function MockScreen({name, children}: {name: string; children: () => React.ReactNode}) {
        return name === 'amount' ? children() : null;
    }
    function MockTabScreenWithFocusTrapWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return {
        __esModule: true,
        default: MockOnyxTabNavigator,
        TopTab: {Screen: MockScreen},
        TabScreenWithFocusTrapWrapper: MockTabScreenWithFocusTrapWrapper,
    };
});

jest.mock('@pages/iou/SplitList', () => {
    function MockSplitList({data}: {data: SplitListItemType[]}) {
        capturedSplitListData = data;
        return null;
    }
    return MockSplitList;
});

type DynamicSplitExpensePageProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE_SEARCH>;

function makeTransaction(transactionID: string, reportID: string, amount: number): Transaction {
    // Pin status - createRandomTransaction randomizes it, and isSplitAction treats PENDING as non-editable.
    return {
        ...createRandomTransaction(0),
        transactionID,
        reportID,
        amount,
        currency: CONST.CURRENCY.USD,
        status: CONST.TRANSACTION.STATUS.POSTED,
    };
}

function renderPage(splitExpenseTransactionID = OPEN_SPLIT_TRANSACTION_ID) {
    const route = createMock<DynamicSplitExpensePageProps['route']>({
        key: 'DynamicSplitExpenseSearch',
        name: SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE_SEARCH,
        params: {
            splitReportID: SELF_DM_REPORT_ID,
            originalTransactionID: ORIGINAL_TRANSACTION_ID,
            splitExpenseTransactionID,
        },
    });
    const navigation = createMock<DynamicSplitExpensePageProps['navigation']>({});
    const result = render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DynamicSplitExpensePage
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );
    return {...result, route, navigation};
}

describe('DynamicSplitExpensePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        capturedSplitListData = [];
        mockSearchResultsData = undefined;
        await Onyx.clear();

        const selfDMReport: Report = {
            reportID: SELF_DM_REPORT_ID,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
        await Promise.all([
            Onyx.set(ONYXKEYS.SESSION, {
                accountID: CURRENT_USER_ACCOUNT_ID,
                email: CURRENT_USER_LOGIN,
            }),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`, selfDMReport),
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${ORIGINAL_TRANSACTION_ID}`, makeTransaction(ORIGINAL_TRANSACTION_ID, SELF_DM_REPORT_ID, 300)),
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${OPEN_SPLIT_TRANSACTION_ID}`, makeTransaction(OPEN_SPLIT_TRANSACTION_ID, SELF_DM_REPORT_ID, 100)),
            Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, {
                ...makeTransaction(ORIGINAL_TRANSACTION_ID, SELF_DM_REPORT_ID, 300),
                comment: {
                    originalTransactionID: ORIGINAL_TRANSACTION_ID,
                    splitExpenses: [
                        {
                            transactionID: OPEN_SPLIT_TRANSACTION_ID,
                            amount: 100,
                            created: '2024-01-01',
                        },
                        {
                            transactionID: FROZEN_SPLIT_TRANSACTION_ID,
                            amount: 200,
                            created: '2024-01-01',
                        },
                    ],
                },
            }),
        ]);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('marks a split whose approved report is only in search results data as non-editable', async () => {
        // Given a split opened from Spend whose transaction and approved report are only in the search snapshot, not in Onyx
        const searchResultsData: SearchResultDataType = {};
        searchResultsData[`${ONYXKEYS.COLLECTION.TRANSACTION}${FROZEN_SPLIT_TRANSACTION_ID}`] = makeTransaction(FROZEN_SPLIT_TRANSACTION_ID, APPROVED_REPORT_ID, 200);
        searchResultsData[`${ONYXKEYS.COLLECTION.REPORT}${APPROVED_REPORT_ID}`] = {
            reportID: APPROVED_REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };
        mockSearchResultsData = searchResultsData;

        // When the split page renders its rows
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the frozen split's row is read-only, matching the actions that ignore edits to it, while the open split stays editable
        const openRow = capturedSplitListData.find((item) => item.transactionID === OPEN_SPLIT_TRANSACTION_ID);
        const frozenRow = capturedSplitListData.find((item) => item.transactionID === FROZEN_SPLIT_TRANSACTION_ID);
        expect(openRow?.isEditable).toBe(true);
        expect(frozenRow?.isEditable).toBe(false);
    });

    it('keeps a split editable when its report in search results data is still open', async () => {
        // Given the same split from Spend, but its report is still open, so its amount may absorb changes
        const searchResultsData: SearchResultDataType = {};
        searchResultsData[`${ONYXKEYS.COLLECTION.TRANSACTION}${FROZEN_SPLIT_TRANSACTION_ID}`] = makeTransaction(FROZEN_SPLIT_TRANSACTION_ID, APPROVED_REPORT_ID, 200);
        searchResultsData[`${ONYXKEYS.COLLECTION.REPORT}${APPROVED_REPORT_ID}`] = {
            reportID: APPROVED_REPORT_ID,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
        mockSearchResultsData = searchResultsData;

        // When the split page renders its rows
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then both rows stay editable - only frozen splits are locked
        expect(capturedSplitListData).toHaveLength(2);
        expect(capturedSplitListData.every((item) => item.isEditable)).toBe(true);
    });

    it.each([
        [CONST.TAB.SPLIT.AMOUNT, 'Split'],
        [CONST.TAB.SPLIT.PERCENTAGE, 'Split by percentage'],
        [CONST.TAB.SPLIT.DATE, 'Split by date'],
        [undefined, 'Split'],
        ['other', 'Split'],
    ])('uses the selected split tab %s for its header title', async (tab, title) => {
        // Given a selected tab value from Onyx, including absent and unrecognized values
        if (tab !== undefined) {
            Tab.setSelectedTab(CONST.TAB.SPLIT_EXPENSE_TAB_TYPE, tab);
        }
        await waitForBatchedUpdatesWithAct();

        // When the real split page renders its header
        renderPage('');
        await waitForBatchedUpdatesWithAct();

        // Then only a matching split tab changes the header title
        expect(screen.getByTestId('split-header-title')).toHaveTextContent(title);
    });

    it.each([CONST.TAB.SPLIT.PERCENTAGE, CONST.TAB.SPLIT.DATE])('prefers the edit title over the %s title', async (tab) => {
        // Given an edit transaction and a tab with a distinct title
        Tab.setSelectedTab(CONST.TAB.SPLIT_EXPENSE_TAB_TYPE, tab);
        await waitForBatchedUpdatesWithAct();

        // When the real split page renders its header
        renderPage('3');
        await waitForBatchedUpdatesWithAct();

        // Then editing takes precedence over the selected tab
        expect(screen.getByTestId('split-header-title')).toHaveTextContent('Edit splits');
    });

    it('keeps the missing split array stable across rerenders and uses a new draft array', async () => {
        // Given a draft without splitExpenses and the real warning calculation
        const draft = {...makeTransaction(ORIGINAL_TRANSACTION_ID, SELF_DM_REPORT_ID, 300), comment: {}};
        await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, draft);
        await waitForBatchedUpdatesWithAct();
        const warning = jest.spyOn(SplitExpenseUtils, 'computeSplitWarningMessage');
        renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(warning).toHaveBeenCalled();
        const firstWarning = warning.mock.lastCall?.at(0);
        const first = firstWarning?.splitExpenses;
        expect(first).toEqual([]);
        expect(Math.abs(firstWarning?.transactionDetailsAmount ?? 0)).toBe(300);
        const firstCallCount = warning.mock.calls.length;

        // When the draft amount changes while splitExpenses is still absent
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, {...draft, amount: 301});
        });
        await waitForBatchedUpdatesWithAct();
        expect(warning.mock.calls.length).toBeGreaterThan(firstCallCount);
        const changedAmountWarning = warning.mock.lastCall?.at(0);
        expect(Math.abs(changedAmountWarning?.transactionDetailsAmount ?? 0)).toBe(301);
        expect(Math.sign(changedAmountWarning?.transactionDetailsAmount ?? 0)).toBe(Math.sign(firstWarning?.transactionDetailsAmount ?? 0));
        expect(changedAmountWarning?.splitExpenses).toBe(first);
        const secondCallCount = warning.mock.calls.length;

        const nextSplits: SplitExpense[] = [{transactionID: '3', amount: 100, created: '2026-10-06'}];
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, {...draft, amount: 301, comment: {splitExpenses: nextSplits}});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the real page passes the changed array to its warning consumer
        expect(warning.mock.calls.length).toBeGreaterThan(secondCallCount);
        expect(warning.mock.lastCall?.at(0)?.splitExpenses).toEqual(nextSplits);
        warning.mockRestore();
    });
});
