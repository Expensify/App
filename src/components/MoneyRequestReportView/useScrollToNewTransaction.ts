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
 * Scroll a newly-created transaction into view, once per transaction. The rows are virtualized, so the row can't
 * drive this itself (an off-window row never mounts) — the list scrolls to it by index/layout instead, which
 * reaches unmounted rows. Skipped when the row is already on screen so the user isn't yanked, and held until the
 * report can be seen.
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

    // The index is derived at render (not inside the effect) so the effect keys on a stable number — the items array
    // identity churns across the re-renders that follow a transaction insert, and re-firing the effect would cancel
    // the scheduled frame below before it runs.
    const newTransactionTableIndex = newTransactionID ? transactionListItems.findIndex((item) => item.type === 'transaction' && item.transaction.transactionID === newTransactionID) : -1;

    useEffect(() => {
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

        // Horizontal table: the rows live in a nested FlashList whose own scroll is a no-op — only the parent page
        // scrolls. Ask the table where the row sits in page space (works for unmounted rows) and scroll the parent there.
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
