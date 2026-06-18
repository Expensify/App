import React from 'react';
import useSearchSnapshot from './hooks/useSearchSnapshot';
import SearchList from './SearchList';
import type {SearchListProps} from './SearchList';
import TransactionListItem from './SearchList/ListItem/TransactionListItem';

/**
 * Flat-expense Search view (Slice S5, callstack-internal/expensify-issues#2547).
 *
 * The first real consumer of `useSearchSnapshot`. It owns the variant identity for the flat-expense
 * branch: the row component is always `TransactionListItem` and rows animate in. Data, columns, and
 * `hasLoadedAllTransactions` come from the hook; the remaining interaction props (selection, scroll,
 * pagination, table header) are passed through from the router during the transition.
 *
 * Follow-up commits move the interaction handlers and the shared primitives (ScrollRestoration,
 * KeyboardListNavigation, RowHighlight, RowLongPressMenu, HorizontalTableScroll, AnimatedExitRow,
 * SelectionTopBar) into this view so it composes them directly instead of receiving them.
 */
type ExpenseFlatSearchViewProps = Omit<SearchListProps, 'data' | 'columns' | 'hasLoadedAllTransactions' | 'ListItem' | 'shouldAnimate' | 'shouldPreventLongPressRow'>;

function ExpenseFlatSearchView({queryJSON, ...rest}: ExpenseFlatSearchViewProps) {
    const {data, columns, hasLoadedAllTransactions} = useSearchSnapshot(queryJSON);

    return (
        <SearchList
            {...rest}
            queryJSON={queryJSON}
            data={data}
            columns={columns}
            hasLoadedAllTransactions={hasLoadedAllTransactions}
            ListItem={TransactionListItem}
            shouldAnimate
        />
    );
}

ExpenseFlatSearchView.displayName = 'ExpenseFlatSearchView';

export default ExpenseFlatSearchView;
