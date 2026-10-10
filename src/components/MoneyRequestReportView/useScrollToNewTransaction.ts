import type FlatListRefType from '@components/FlashList/types';

import useIsScreenVisible from '@hooks/useIsScreenVisible';

import type {ViewToken} from '@src/types/utils/ReactNativeCompat';

import type {RefObject} from 'react';

import {useEffect, useRef} from 'react';

import type {ExternalScrollFlashListTableHandle, ScrollOffsetStore} from './ExternalScrollFlashListTable';
import type {TransactionListItemData} from './MoneyRequestReportTransactionList';

type UseScrollToNewTransactionParams = {
    newTransactionID: string | undefined;
    transactionListItems: TransactionListItemData[];

    /** Whether the rows are items of the main list, rather than of a table nested in it. */
    shouldInlineTransactions: boolean;

    listRef: FlatListRefType;
    tableRef: RefObject<ExternalScrollFlashListTableHandle | null>;
    viewableItemsRef: RefObject<ViewToken[]>;
    scrollOffsetStore: ScrollOffsetStore;
    viewportHeight: number;
};

/**
 * Scrolls a new transaction into view once while it stays new. The rows are virtualized and a row outside the window never mounts, so the list scrolls
 * to it by index or layout instead. Skipped when the row is already on screen, and held until the report can be seen.
 */
function useScrollToNewTransaction({
    newTransactionID,
    transactionListItems,
    shouldInlineTransactions,
    listRef,
    tableRef,
    viewableItemsRef,
    scrollOffsetStore,
    viewportHeight,
}: UseScrollToNewTransactionParams) {
    const isScreenVisible = useIsScreenVisible();
    const scrolledToNewTransactionIDRef = useRef<string | undefined>(undefined);

    // Derived at render so the effect keys on a stable number. The items array changes identity on the re-renders after an insert,
    // and re-running the effect would cancel the frame below before it runs.
    const newTransactionTableIndex = newTransactionID ? transactionListItems.findIndex((item) => item.type === 'transaction' && item.transaction.transactionID === newTransactionID) : -1;

    useEffect(() => {
        // A transaction that is no longer new can only become new again by leaving the report and coming back, which earns another scroll.
        if (scrolledToNewTransactionIDRef.current !== newTransactionID) {
            scrolledToNewTransactionIDRef.current = undefined;
        }
        if (!isScreenVisible || newTransactionTableIndex < 0 || scrolledToNewTransactionIDRef.current === newTransactionID) {
            return;
        }

        if (shouldInlineTransactions) {
            // Inline: the transaction is a main-list item at the same index (transactions lead `data`).
            const rafId = requestAnimationFrame(() => {
                // The ID is consumed inside the frame (not at schedule time): if a re-fire cancels this frame, the next
                // effect run reschedules instead of treating the scroll as done.
                scrolledToNewTransactionIDRef.current = newTransactionID;
                if (viewableItemsRef.current.some((token) => token.index === newTransactionTableIndex)) {
                    return;
                }
                listRef?.current?.scrollToIndex({index: newTransactionTableIndex, animated: true, viewPosition: 0.5});
            });
            return () => cancelAnimationFrame(rafId);
        }

        // Horizontal table: the rows live in a nested FlashList whose own scroll does nothing, so only the parent page scrolls.
        // Ask the table where the row sits on the page, which works for unmounted rows, and scroll the parent there.
        const rafId = requestAnimationFrame(() => {
            scrolledToNewTransactionIDRef.current = newTransactionID;
            const row = tableRef.current?.getRowPageOffset(newTransactionTableIndex);
            if (!row) {
                return;
            }
            const scrollOffset = scrollOffsetStore.getOffset();
            if (row.top >= scrollOffset && row.top + row.height <= scrollOffset + viewportHeight) {
                return;
            }
            listRef?.current?.scrollToOffset({offset: Math.max(0, row.top - viewportHeight / 2), animated: true});
        });
        return () => cancelAnimationFrame(rafId);
    }, [isScreenVisible, newTransactionID, newTransactionTableIndex, shouldInlineTransactions, viewportHeight, scrollOffsetStore, listRef, tableRef, viewableItemsRef]);
}

export default useScrollToNewTransaction;
