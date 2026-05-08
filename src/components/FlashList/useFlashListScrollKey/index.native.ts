import type {FlashListProps} from '@shopify/flash-list';
import {useEffect, useState} from 'react';
import CONST from '@src/CONST';
import type FlashListScrollKeyProps from './types';

export default function useFlashListScrollKey<T>({
    data,
    keyExtractor,
    initialScrollKey: initialScrollKeyProp,
    onStartReached,
    shouldMaintainVisibleContentPosition,
    shouldFocusToTopOnMount,
}: FlashListScrollKeyProps<T>) {
    const initialScrollKey = shouldFocusToTopOnMount && !initialScrollKeyProp ? CONST.REPORT.ACTIONS.TYPE.CREATED : initialScrollKeyProp;
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
        if (shouldFocusToTopOnMount && !initialScrollKeyProp) {
            setTimeout(() => {
                setIsInitialRender(false);
                requestAnimationFrame(() => setHasLinkingSettled(true));
            }, 800); // TODO: set into CONST
        } else {
            requestAnimationFrame(() => {
                setIsInitialRender(false);
                requestAnimationFrame(() => setHasLinkingSettled(true));
            });
        }
    }, [isInitialRender, initialScrollKey, shouldFocusToTopOnMount, initialScrollKeyProp]);

    const maintainVisibleContentPosition: FlashListProps<T>['maintainVisibleContentPosition'] = {
        disabled: !shouldMaintainVisibleContentPosition && hasLinkingSettled,
        startRenderingFromBottom: shouldFocusToTopOnMount,
    };

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
