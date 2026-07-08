import {getValidGroupBy} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {ReactNode} from 'react';

import React, {createContext, useContext} from 'react';

import type {SearchSections} from './hooks/useExpenseReportSections';
import type {SearchShell, UseSearchShellParams} from './hooks/useSearchShell';
import type {SearchQueryJSON} from './types';

import useChatSections from './hooks/useChatSections';
import useExpenseReportSections from './hooks/useExpenseReportSections';
import useGroupedTransactionSections from './hooks/useGroupedTransactionSections';
import useSearchShell from './hooks/useSearchShell';
import useTaskSections from './hooks/useTaskSections';
import useTransactionSections from './hooks/useTransactionSections';

/** The tracking carriers `<Search>` reads for its deferral/focus effects (independent of the section outputs). */
type SearchTrackingCarriers = Pick<
    SearchShell,
    'showPendingExpensePlaceholder' | 'shouldDeferHeavySearchWork' | 'setShouldDeferHeavySearchWork' | 'hasPendingWriteOnMountRef' | 'skipDeferralOnFocusRef' | 'rearmTracking'
>;

/**
 * What the per-type section provider publishes: the sorted/joined section outputs plus the shared
 * optimistic-tracking carriers. Matches the section half of the legacy `useSearchSnapshot` return so the
 * `<Search>` body reads it exactly as before.
 */
type SearchSectionsContextValue = SearchSections & SearchTrackingCarriers;

const SearchSectionsContext = createContext<SearchSectionsContextValue | null>(null);

/** Read the active search's section outputs + tracking carriers. Throws if used outside the provider. */
function useSearchSections(): SearchSectionsContextValue {
    const value = useContext(SearchSectionsContext);
    if (!value) {
        throw new Error('useSearchSections must be used within a SearchSectionsProvider');
    }
    return value;
}

type SectionsProviderProps = {
    queryJSON: Readonly<SearchQueryJSON>;
    searchResults: SearchResults | undefined;
    newSearchResultKeys: Set<string> | null | undefined;
    transactions: UseSearchShellParams['transactions'];
    reportActions: UseSearchShellParams['reportActions'];
    children: ReactNode;
};

const pickTrackingCarriers = (shellOrSnapshot: SearchTrackingCarriers): SearchTrackingCarriers => ({
    showPendingExpensePlaceholder: shellOrSnapshot.showPendingExpensePlaceholder,
    shouldDeferHeavySearchWork: shellOrSnapshot.shouldDeferHeavySearchWork,
    setShouldDeferHeavySearchWork: shellOrSnapshot.setShouldDeferHeavySearchWork,
    hasPendingWriteOnMountRef: shellOrSnapshot.hasPendingWriteOnMountRef,
    skipDeferralOnFocusRef: shellOrSnapshot.skipDeferralOnFocusRef,
    rearmTracking: shellOrSnapshot.rearmTracking,
});

/**
 * Section provider for the expense-report view. Owns only the report-type slice of Onyx (via the scoped
 * shell + leaf), so every other search type mounts a different provider and never opens these subscriptions.
 */
function ExpenseReportSectionsProvider({queryJSON, searchResults, newSearchResultKeys, transactions, reportActions, children}: SectionsProviderProps) {
    const shell = useSearchShell({queryJSON, searchResults, transactions, reportActions});
    const sections = useExpenseReportSections({shell, queryJSON, searchResults, newSearchResultKeys});
    const value: SearchSectionsContextValue = {...sections, ...pickTrackingCarriers(shell)};
    return <SearchSectionsContext.Provider value={value}>{children}</SearchSectionsContext.Provider>;
}

/**
 * Section provider for the flat transaction views (`type` of expense/invoice/trip, no group-by). Owns only
 * the transaction-type slice of Onyx (via the scoped shell + leaf), so every other search type mounts a
 * different provider and never opens these subscriptions.
 */
function TransactionSectionsProvider({queryJSON, searchResults, newSearchResultKeys, transactions, reportActions, children}: SectionsProviderProps) {
    const shell = useSearchShell({queryJSON, searchResults, transactions, reportActions});
    const sections = useTransactionSections({shell, queryJSON, searchResults, newSearchResultKeys});
    const value: SearchSectionsContextValue = {...sections, ...pickTrackingCarriers(shell)};
    return <SearchSectionsContext.Provider value={value}>{children}</SearchSectionsContext.Provider>;
}

/**
 * Section provider for the chat view (`type === CHAT`). Owns only the chat-type slice of Onyx (via the scoped
 * shell + leaf), so every other search type mounts a different provider and never opens these subscriptions.
 */
function ChatSectionsProvider({queryJSON, searchResults, newSearchResultKeys, transactions, reportActions, children}: SectionsProviderProps) {
    const shell = useSearchShell({queryJSON, searchResults, transactions, reportActions});
    const sections = useChatSections({shell, queryJSON, searchResults, newSearchResultKeys});
    const value: SearchSectionsContextValue = {...sections, ...pickTrackingCarriers(shell)};
    return <SearchSectionsContext.Provider value={value}>{children}</SearchSectionsContext.Provider>;
}

/**
 * Section provider for the task view (`type === TASK`). Owns only the task-type slice of Onyx (via the scoped
 * shell + leaf), so every other search type mounts a different provider and never opens these subscriptions.
 */
function TaskSectionsProvider({queryJSON, searchResults, newSearchResultKeys, transactions, reportActions, children}: SectionsProviderProps) {
    const shell = useSearchShell({queryJSON, searchResults, transactions, reportActions});
    const sections = useTaskSections({shell, queryJSON, searchResults, newSearchResultKeys});
    const value: SearchSectionsContextValue = {...sections, ...pickTrackingCarriers(shell)};
    return <SearchSectionsContext.Provider value={value}>{children}</SearchSectionsContext.Provider>;
}

/**
 * Section provider for the grouped transaction views (`type` of expense/invoice/trip WITH a valid group-by).
 * Owns the heavy grouped slice of Onyx + the per-group sub-snapshot enrichment (via the scoped shell + leaf),
 * so every other search type mounts a different provider and never opens these subscriptions.
 */
function GroupedTransactionSectionsProvider({queryJSON, searchResults, newSearchResultKeys, transactions, reportActions, children}: SectionsProviderProps) {
    const shell = useSearchShell({queryJSON, searchResults, transactions, reportActions});
    const sections = useGroupedTransactionSections({shell, queryJSON, searchResults, newSearchResultKeys});
    const value: SearchSectionsContextValue = {...sections, ...pickTrackingCarriers(shell)};
    return <SearchSectionsContext.Provider value={value}>{children}</SearchSectionsContext.Provider>;
}

/**
 * Mounts the section provider that matches the active search type. The switch is a component boundary (not
 * a conditional hook), so only the active provider's subscriptions are ever live — the whole point of the
 * scoping effort.
 */
// Mirrors the dispatch order of `getSections`: chat/task/expense-report short-circuit on type (their groupBy
// is ignored), then a valid group-by selects the grouped provider, and everything else falls through to the
// flat transaction provider (`getTransactionsSections`) — the same fall-through default `getSections` uses.
function SearchSectionsProvider({queryJSON, searchResults, newSearchResultKeys, transactions, reportActions, children}: SectionsProviderProps) {
    let Provider = TransactionSectionsProvider;
    if (queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        Provider = ExpenseReportSectionsProvider;
    } else if (queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT) {
        Provider = ChatSectionsProvider;
    } else if (queryJSON.type === CONST.SEARCH.DATA_TYPES.TASK) {
        Provider = TaskSectionsProvider;
    } else if (getValidGroupBy(queryJSON.groupBy)) {
        Provider = GroupedTransactionSectionsProvider;
    }
    return (
        <Provider
            queryJSON={queryJSON}
            searchResults={searchResults}
            newSearchResultKeys={newSearchResultKeys}
            transactions={transactions}
            reportActions={reportActions}
        >
            {children}
        </Provider>
    );
}

export default SearchSectionsProvider;
export {useSearchSections};
export type {SearchSectionsContextValue};
