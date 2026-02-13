import {renderHook} from '@testing-library/react-native';
import useSuggestedSearchDefaultNavigation from '@hooks/useSuggestedSearchDefaultNavigation';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON, shouldSkipSuggestedSearchNavigation as shouldSkipSuggestedSearchNavigationForQuery} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

function createApproveMenuItem(): SearchTypeMenuItem {
    return {
        key: CONST.SEARCH.SEARCH_KEYS.APPROVE,
        translationPath: 'common.approve' as TranslationPaths,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        icon: {} as IconAsset,
        searchQuery: buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
        }),
        searchQueryJSON: undefined,
        hash: 1,
        similarSearchHash: 101,
    };
}

function createSubmitMenuItem(): SearchTypeMenuItem {
    return {
        key: CONST.SEARCH.SEARCH_KEYS.SUBMIT,
        translationPath: 'iou.submitExpense' as TranslationPaths,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        icon: {} as IconAsset,
        searchQuery: buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
        }),
        searchQueryJSON: undefined,
        hash: 2,
        similarSearchHash: 202,
    };
}

function createExpenseMenuItem(): SearchTypeMenuItem {
    return {
        key: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
        translationPath: 'common.expenses' as TranslationPaths,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        icon: {} as IconAsset,
        searchQuery: buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        }),
        searchQueryJSON: undefined,
        hash: 3,
        similarSearchHash: 303,
    };
}

function createExpenseReportMenuItem(): SearchTypeMenuItem {
    return {
        key: CONST.SEARCH.SEARCH_KEYS.REPORTS,
        translationPath: 'common.reports' as TranslationPaths,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        icon: {} as IconAsset,
        searchQuery: buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        }),
        searchQueryJSON: undefined,
        hash: 4,
        similarSearchHash: 404,
    };
}

function createChatMenuItem(): SearchTypeMenuItem {
    return {
        key: CONST.SEARCH.SEARCH_KEYS.CHATS,
        translationPath: 'common.chats' as TranslationPaths,
        type: CONST.SEARCH.DATA_TYPES.CHAT,
        icon: {} as IconAsset,
        searchQuery: buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.CHAT,
        }),
        searchQueryJSON: undefined,
        hash: 5,
        similarSearchHash: 505,
    };
}

describe('useSuggestedSearchDefaultNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates to the Approve search when skeleton hides and approve menu item is available', () => {
        const clearSelectedTransactions = jest.fn();
        const approveMenuItem = createApproveMenuItem();
        const submitMenuItem = createSubmitMenuItem();
        const expenseMenuItem = createExpenseMenuItem();
        const expenseReportMenuItem = createExpenseReportMenuItem();
        const chatMenuItem = createChatMenuItem();

        const {rerender} = renderHook((props: Parameters<typeof useSuggestedSearchDefaultNavigation>[0]) => useSuggestedSearchDefaultNavigation(props), {
            initialProps: {
                shouldShowSkeleton: true,
                flattenedMenuItems: [approveMenuItem, submitMenuItem, expenseMenuItem, expenseReportMenuItem, chatMenuItem],
                similarSearchHash: undefined,
                clearSelectedTransactions,
            },
        });

        rerender({
            shouldShowSkeleton: false,
            flattenedMenuItems: [approveMenuItem, submitMenuItem, expenseMenuItem, expenseReportMenuItem, chatMenuItem],
            similarSearchHash: undefined,
            clearSelectedTransactions,
        });

        expect(clearSelectedTransactions).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: approveMenuItem.searchQuery}));
    });

    it('goes to Submit search when Approve is unavailable and Submit menu item is available', () => {
        const clearSelectedTransactions = jest.fn();
        const submitMenuItem = createSubmitMenuItem();
        const expenseMenuItem = createExpenseMenuItem();
        const expenseReportMenuItem = createExpenseReportMenuItem();
        const chatMenuItem = createChatMenuItem();

        const {rerender} = renderHook((props: Parameters<typeof useSuggestedSearchDefaultNavigation>[0]) => useSuggestedSearchDefaultNavigation(props), {
            initialProps: {
                shouldShowSkeleton: true,
                flattenedMenuItems: [submitMenuItem, expenseMenuItem, expenseReportMenuItem, chatMenuItem],
                similarSearchHash: undefined,
                clearSelectedTransactions,
            },
        });

        rerender({
            shouldShowSkeleton: false,
            flattenedMenuItems: [submitMenuItem, expenseMenuItem, expenseReportMenuItem, chatMenuItem],
            similarSearchHash: undefined,
            clearSelectedTransactions,
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: submitMenuItem.searchQuery}));
    });

    it('does not navigate if skeleton never rendered', () => {
        const clearSelectedTransactions = jest.fn();
        const approveMenuItem = createApproveMenuItem();
        const submitMenuItem = createSubmitMenuItem();
        const expenseMenuItem = createExpenseMenuItem();
        const expenseReportMenuItem = createExpenseReportMenuItem();
        const chatMenuItem = createChatMenuItem();
        renderHook((props: Parameters<typeof useSuggestedSearchDefaultNavigation>[0]) => useSuggestedSearchDefaultNavigation(props), {
            initialProps: {
                shouldShowSkeleton: false,
                flattenedMenuItems: [approveMenuItem, submitMenuItem, expenseMenuItem, expenseReportMenuItem, chatMenuItem],
                similarSearchHash: undefined,
                clearSelectedTransactions,
            },
        });

        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does not navigate if search already active', () => {
        const clearSelectedTransactions = jest.fn();
        const approveMenuItem = createApproveMenuItem();
        const submitMenuItem = createSubmitMenuItem();
        const expenseMenuItem = createExpenseMenuItem();
        const expenseReportMenuItem = createExpenseReportMenuItem();
        const chatMenuItem = createChatMenuItem();
        renderHook((props: Parameters<typeof useSuggestedSearchDefaultNavigation>[0]) => useSuggestedSearchDefaultNavigation(props), {
            initialProps: {
                shouldShowSkeleton: false,
                flattenedMenuItems: [approveMenuItem, submitMenuItem, expenseMenuItem, expenseReportMenuItem, chatMenuItem],
                similarSearchHash: expenseMenuItem.similarSearchHash,
                clearSelectedTransactions,
            },
        });

        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does not navigate when navigation is skipped', () => {
        const clearSelectedTransactions = jest.fn();
        const approveMenuItem = createApproveMenuItem();
        const submitMenuItem = createSubmitMenuItem();

        const {rerender} = renderHook((props: Parameters<typeof useSuggestedSearchDefaultNavigation>[0]) => useSuggestedSearchDefaultNavigation(props), {
            initialProps: {
                shouldShowSkeleton: true,
                flattenedMenuItems: [approveMenuItem, submitMenuItem],
                similarSearchHash: undefined,
                clearSelectedTransactions,
                shouldSkipNavigation: true,
            },
        });

        rerender({
            shouldShowSkeleton: false,
            flattenedMenuItems: [approveMenuItem, submitMenuItem],
            similarSearchHash: undefined,
            clearSelectedTransactions,
            shouldSkipNavigation: true,
        });

        expect(clearSelectedTransactions).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does not navigate to Approve for inline-context query without rawFilterList when skeleton hides', () => {
        const clearSelectedTransactions = jest.fn();
        const approveMenuItem = createApproveMenuItem();
        const submitMenuItem = createSubmitMenuItem();
        const parsedQueryJSON = buildSearchQueryJSON('in:checking');
        if (!parsedQueryJSON) {
            throw new Error('Expected parsed query to be defined');
        }
        const inlineContextQueryJSON = {...parsedQueryJSON, rawFilterList: undefined};
        const shouldSkipNavigation = shouldSkipSuggestedSearchNavigationForQuery(inlineContextQueryJSON);

        const {rerender} = renderHook((props: Parameters<typeof useSuggestedSearchDefaultNavigation>[0]) => useSuggestedSearchDefaultNavigation(props), {
            initialProps: {
                shouldShowSkeleton: true,
                flattenedMenuItems: [approveMenuItem, submitMenuItem],
                similarSearchHash: undefined,
                clearSelectedTransactions,
                shouldSkipNavigation,
            },
        });

        rerender({
            shouldShowSkeleton: false,
            flattenedMenuItems: [approveMenuItem, submitMenuItem],
            similarSearchHash: undefined,
            clearSelectedTransactions,
            shouldSkipNavigation,
        });

        expect(shouldSkipNavigation).toBe(true);
        expect(clearSelectedTransactions).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
