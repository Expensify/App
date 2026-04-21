import type {FlashListProps} from '@shopify/flash-list';
import {useEffect, useState} from 'react';

type FlashListScrollKeyProps<T> = {
    /** The array of items to render in the list. */
    data: T[];

    /** Function that extracts a unique key for each item in the list. */
    keyExtractor: (item: T, index: number) => string;

    /** Key of the item to initially scroll to when the list first renders. */
    initialScrollKey: string | null | undefined;

    /** Callback invoked when the user scrolls close to the start of the list. */
    onStartReached: FlashListProps<T>['onStartReached'];
};

export default function useFlashListScrollKey<T>({data, keyExtractor, initialScrollKey, onStartReached}: FlashListScrollKeyProps<T>) {
    const [isInitialRender, setIsInitialRender] = useState(true);
    const [hasLinkingSettled, setHasLinkingSettled] = useState(!initialScrollKey);

    // Two-frame handoff for deep-link:
    // RAF 1: switch from sliced data to the full array — FlashList's default MVCP pins the
    //        linked item through the data swap.
    // RAF 2: pinning has happened, disable MVCP so it doesn't cause later jumps.
    useEffect(() => {
        if (!isInitialRender || !initialScrollKey) {
            return;
        }
        requestAnimationFrame(() => {
            setIsInitialRender(false);
            requestAnimationFrame(() => setHasLinkingSettled(true));
        });
    }, [isInitialRender, initialScrollKey]);

    // `undefined` = leave FlashList's default (MVCP enabled) while we're still pinning the linked item.
    // `{disabled: true}` once that's done so MVCP can't interfere afterward.
    const maintainVisibleContentPosition: FlashListProps<T>['maintainVisibleContentPosition'] = hasLinkingSettled ? {disabled: true} : undefined;

    if (!isInitialRender || !initialScrollKey) {
        return {displayedData: data, onStartReached, maintainVisibleContentPosition};
    }

    const targetIndex = data.findIndex((item, index) => keyExtractor(item, index) === initialScrollKey);
    if (targetIndex <= 0) {
        return {displayedData: data, onStartReached, maintainVisibleContentPosition};
    }

    // On the first render, slice from the target onward so the target item
    // appears at the visual bottom of the inverted list — no scrolling needed.
    return {displayedData: data.slice(targetIndex), onStartReached: () => {}, maintainVisibleContentPosition};
}
