import {render, screen} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import {computeSplitWarningMessage} from '@libs/SplitExpenseUtils';

import DynamicSplitExpensePage from '@pages/iou/DynamicSplitExpensePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';

import type ReactNative from 'react-native';

import React from 'react';
import createMock from 'tests/utils/createMock';

const mockTransaction: Transaction = createMock<Transaction>({
    transactionID: '1',
    reportID: '2',
    amount: 200,
    currency: 'USD',
    comment: {},
});
let mockDraft: Transaction = createMock<Transaction>({
    reportID: '2',
    amount: 200,
    currency: 'USD',
    comment: {splitExpenses: []},
});
let mockSelectedTab: string | undefined;
jest.mock('@hooks/useOnyx', () =>
    jest.fn((key: string) => {
        if (key.startsWith('selectedTab_')) {
            return [mockSelectedTab];
        }
        if (key.startsWith('splitTransactionDraft_')) {
            return [mockDraft, {status: 'loaded'}];
        }
        if (key === 'report_2') {
            return [{reportID: '2', type: 'expense'}];
        }
        return [undefined];
    }),
);
jest.mock('@hooks/useAllTransactions', () => () => ({
    ...Object.fromEntries([['transaction_1', mockTransaction]]),
}));
jest.mock('@hooks/useReportOrReportDraft', () => () => ({
    reportID: '2',
    type: 'expense',
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({
    accountID: 1,
    login: 'a@example.com',
}));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        getCurrencyDecimals: () => 2,
        convertToDisplayString: () => '2.00',
        getCurrencySymbol: () => '$',
    }),
}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({
    shouldUseNarrowLayout: false,
    isInLandscapeMode: false,
}));
jest.mock('@hooks/useConfirmModal', () => () => ({
    showConfirmModal: jest.fn(),
}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/usePermissions', () => () => ({
    isBetaEnabled: () => false,
    isBetaEnabledOrUnknown: () => false,
}));
jest.mock('@hooks/usePersonalDetails', () => ({
    useAllPersonalDetails: () => [undefined],
}));
jest.mock('@hooks/usePolicyForMovingExpenses', () => () => ({
    policyForMovingExpenses: undefined,
    shouldSelectPolicy: false,
}));
jest.mock('@hooks/useSplitEffectivePolicy', () => () => undefined);
jest.mock('@hooks/usePersonalPolicy', () => () => undefined);
jest.mock('@hooks/useGetIOUReportFromReportAction', () => () => ({
    iouReport: undefined,
}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Plus: '', ArrowsLeftRight: ''}),
}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    dateFnsLocale: undefined,
    formatPhoneNumber: (value: string) => value,
}));
jest.mock('@hooks/useDelegateAccountID', () => () => undefined);
jest.mock('@hooks/useDynamicBackPath', () => () => '/settings');
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({}),
    useSearchQueryContext: () => ({}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: jest.fn()}),
}));
jest.mock('@components/HeaderWithBackButton', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return jest.fn(({title}: {title: string}) => <Text testID="split-header-title">{title}</Text>);
});
jest.mock('@components/Button', () => ({
    __esModule: true,
    default: Object.assign(() => null, {
        Text: () => null,
        KeyboardShortcut: () => null,
    }),
}));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/BlockingViews/FullPageNotFoundView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/CollapsibleHeaderOnKeyboard',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@libs/Navigation/OnyxTabNavigator', () => ({
    __esModule: true,
    default: () => null,
    TopTab: {Screen: () => null},
    TabScreenWithFocusTrapWrapper: () => null,
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        goBack: jest.fn(),
        navigate: jest.fn(),
        dismissToPreviousRHP: jest.fn(),
    },
}));
jest.mock('@libs/actions/IOU/Duplicate', () => ({
    getIOUActionForTransactions: () => [],
}));
jest.mock('@libs/actions/IOU/SplitExpenseItems', () => ({
    getChildTransactions: () => [],
    initSplitExpenseItemData: () => ({}),
    resolveSplitItemReportID: () => '',
    addSplitExpenseField: jest.fn(),
    clearSplitTransactionDraftErrors: jest.fn(),
    evenlyDistributeSplitExpenseAmounts: jest.fn(),
    updateSplitExpenseAmountField: jest.fn(),
}));
jest.mock('@libs/ReportSecondaryActionUtils', () => ({
    isSplitAction: () => true,
}));
jest.mock('@libs/ReportUtils', () => ({
    getTransactionDetails: () => ({amount: 200, currency: 'USD'}),
    isReportApproved: () => false,
    isSelfDM: () => false,
    isSettled: () => false,
    parseReportRouteParams: () => ({}),
}));
jest.mock('@libs/TransactionUtils', () => ({
    getChildTransactions: () => [],
    getExpenseTypeTranslationKey: () => 'iou.split',
    getTransactionType: () => 'expense',
    isDistanceRequest: () => false,
    isManagedCardTransaction: () => false,
    isPerDiemRequest: () => false,
}));
jest.mock('@libs/DistanceRequestUtils', () => ({
    __esModule: true,
    default: {getMileageRates: () => ({})},
}));
jest.mock('@libs/SplitExpenseUtils', () => ({
    computeSplitSaveErrorMessage: () => '',
    computeSplitWarningMessage: jest.fn(() => ''),
}));
jest.mock('@pages/iou/updateSplitTransactionsFromSplitExpensesFlow', () => jest.fn());
function renderTab(tab: string | undefined, splitExpenseTransactionID = '') {
    mockSelectedTab = tab;
    // The page reads these route params only; the test does not mount a complete navigator route.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const route = {
        name: SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE,
        params: {
            splitReportID: '2',
            originalTransactionID: '1',
            splitExpenseTransactionID,
        },
    } as React.ComponentProps<typeof DynamicSplitExpensePage>['route'];
    // Navigation methods are not called by this header test, so the platform navigator fixture is intentionally empty.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const navigation = {} as React.ComponentProps<typeof DynamicSplitExpensePage>['navigation'];
    const result = render(
        <DynamicSplitExpensePage
            route={route}
            navigation={navigation}
        />,
    );
    return {...result, route, navigation};
}
describe('DynamicSplitExpensePage', () => {
    it.each([
        [CONST.TAB.SPLIT.AMOUNT, 'iou.split'],
        [CONST.TAB.SPLIT.PERCENTAGE, 'iou.splitByPercentage'],
        [CONST.TAB.SPLIT.DATE, 'iou.splitByDate'],
        [undefined, 'iou.split'],
        ['other', 'iou.split'],
    ])('uses the selected split tab %s for its header title', (tab, title) => {
        // Given the selected tab Onyx value that can include split tabs
        // When the real split page chooses its header title
        renderTab(tab);
        // Then only the matching split tab changes the header
        expect(screen.getByTestId('split-header-title')).toHaveTextContent(title);
        expect(useOnyx).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.SPLIT_EXPENSE_TAB_TYPE}`);
    });
    it.each([CONST.TAB.SPLIT.PERCENTAGE, CONST.TAB.SPLIT.DATE])('prefers the edit title over the %s title', (tab) => {
        // Given an edit transaction whose selected tab has a distinct title
        // When the real split page chooses its header title
        renderTab(tab, '3');
        // Then editing takes precedence over the selected tab
        expect(screen.getByTestId('split-header-title')).toHaveTextContent('iou.editSplits');
    });
    it('keeps the missing split array stable across rerenders and uses a new draft array', () => {
        // Given a draft without splitExpenses and the real warning calculation boundary
        mockDraft = {...mockDraft, comment: {}};
        const warning = jest.mocked(computeSplitWarningMessage);
        const {rerender, route, navigation} = renderTab(CONST.TAB.SPLIT.AMOUNT);
        const first = warning.mock.lastCall?.at(0)?.splitExpenses;
        expect(first).toBeDefined();
        // When the page rerenders without a new draft, then receives a split from the draft producer
        rerender(
            <DynamicSplitExpensePage
                route={route}
                navigation={navigation}
            />,
        );
        expect(warning.mock.lastCall?.at(0)?.splitExpenses).toBe(first);
        const nextSplits: SplitExpense[] = [{transactionID: '3', amount: 100, created: '2026-10-06'}];
        mockDraft = {...mockDraft, comment: {splitExpenses: nextSplits}};
        rerender(
            <DynamicSplitExpensePage
                route={route}
                navigation={navigation}
            />,
        );
        // Then the real page passes the changed array to its warning consumer
        expect(warning.mock.lastCall?.at(0)?.splitExpenses).toBe(nextSplits);
    });
});
