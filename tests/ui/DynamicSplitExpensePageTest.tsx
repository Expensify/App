import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import DynamicSplitExpensePage from '@pages/iou/DynamicSplitExpensePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

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

jest.mock('@components/HeaderWithBackButton', () => () => null);

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

function renderPage() {
    const route = createMock<DynamicSplitExpensePageProps['route']>({
        key: 'DynamicSplitExpenseSearch',
        name: SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE_SEARCH,
        params: {
            splitReportID: SELF_DM_REPORT_ID,
            originalTransactionID: ORIGINAL_TRANSACTION_ID,
            splitExpenseTransactionID: OPEN_SPLIT_TRANSACTION_ID,
        },
    });
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DynamicSplitExpensePage
                route={route}
                navigation={createMock<DynamicSplitExpensePageProps['navigation']>({})}
            />
        </ComposeProviders>,
    );
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
});
