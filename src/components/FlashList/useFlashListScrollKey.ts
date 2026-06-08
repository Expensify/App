import type {FlashListProps} from '@shopify/flash-list';
import {useEffect, useRef, useState} from 'react';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';

type FlashListScrollKeyProps<T> = {
    /** The array of items to render in the list. */
    data: T[];

    /** Function that extracts a unique key for each item in the list. */
    keyExtractor: (item: T, index: number) => string;

    /** Key of the item to initially scroll to when the list first renders. */
    initialScrollKey: string | null | undefined;

    /** Callback invoked when the user scrolls close to the start of the list. */
    onStartReached: FlashListProps<T>['onStartReached'];

    /** Whether the list should handle `maintainVisibleContentPosition` */
    shouldMaintainVisibleContentPosition?: boolean;

    /** Ref to the underlying list instance, used to nudge the initial scroll position. */
    ref?: FlatListRefType;

    /**
     * Number of pixels of later content to reveal underneath the anchored item once the deep-link handoff settles.
     * When set, the list stops short of pinning the anchor flush against the bottom, hinting there is more content below it.
     */
    initialScrollOffset?: number;
};

export default function useFlashListScrollKey<T>({
    data,
    keyExtractor,
    initialScrollKey,
    onStartReached,
    shouldMaintainVisibleContentPosition,
    ref,
    initialScrollOffset,
}: FlashListScrollKeyProps<T>) {
    const [isInitialRender, setIsInitialRender] = useState(!!initialScrollKey);
    const [hasLinkingSettled, setHasLinkingSettled] = useState(!initialScrollKey);
    const hasAppliedInitialScrollOffset = useRef(false);

    const getAnchorIndex = () => data.findIndex((item, index) => keyExtractor(item, index) === initialScrollKey);

    // Two-frame handoff for deep-link:
    // RAF 1: switch from sliced data to the full array — FlashList's default MVCP pins the
    //        linked item through the data swap.
    // RAF 2: pinning has happened, disable MVCP so it doesn't cause later jumps.
    useEffect(() => {
        if (!isInitialRender) {
            return;
        }

        // Without an anchor on this frame, we are not doing the deep-link slice handoff; clear the flag so a key that
        // appears later (e.g. marking a message unread) cannot reuse the "first paint" slice path.
        if (!initialScrollKey) {
            // If the initial scroll key gets unset, we need to disable the initial render flag,
            // otherwise the list will not render..
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsInitialRender(false);
            return;
        }

        requestAnimationFrame(() => {
            setIsInitialRender(false);
            requestAnimationFrame(() => {
                setHasLinkingSettled(true);

                // The slice handoff above leaves the anchored item flush against the bottom of the (inverted) list.
                // When there is later content above the anchor in the data (i.e. it is not the newest item), nudge the
                // list toward that content so a sliver of it peeks out underneath the anchor — hinting there is more here.
                if (!initialScrollOffset || hasAppliedInitialScrollOffset.current) {
                    return;
                }
                const anchorIndex = getAnchorIndex();
                if (anchorIndex <= 0) {
                    return;
                }
                hasAppliedInitialScrollOffset.current = true;
                // A negative viewOffset scrolls toward the newest (later) content, revealing `initialScrollOffset` px of it below the anchor.
                ref?.current?.scrollToIndex({index: anchorIndex, viewOffset: -initialScrollOffset, animated: false});
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialRender, initialScrollKey]);

    const maintainVisibleContentPosition: FlashListProps<T>['maintainVisibleContentPosition'] = {disabled: !shouldMaintainVisibleContentPosition && hasLinkingSettled};

    if (!isInitialRender || !initialScrollKey) {
        return {displayedData: data, onStartReached, maintainVisibleContentPosition};
    }

    const targetIndex = getAnchorIndex();
    if (targetIndex <= 0) {
        return {displayedData: data, onStartReached, maintainVisibleContentPosition};
    }

    // On the first render, slice from the target onward so the target item
    // appears at the visual bottom of the inverted list — no scrolling needed.
    return {displayedData: data.slice(targetIndex), onStartReached: () => {}, maintainVisibleContentPosition};
}
