import type {FlashListProps} from '@shopify/flash-list';
import {useEffect, useState} from 'react';

type FlashListScrollKeyProps<T> = {
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    initialScrollKey: string | null | undefined;
    onStartReached: FlashListProps<T>['onStartReached'];
};

export default function useFlashListScrollKey<T>({data, keyExtractor, initialScrollKey, onStartReached}: FlashListScrollKeyProps<T>) {
    const [isInitialRender, setIsInitialRender] = useState(true);

    // After the first render with sliced data, give FlashList one frame to lay out,
    // then switch to the full data array. maintainVisibleContentPosition keeps the target pinned.
    useEffect(() => {
        if (!isInitialRender || !initialScrollKey) {
            return;
        }
        requestAnimationFrame(() => setIsInitialRender(false));
    }, [isInitialRender, initialScrollKey]);

    if (!isInitialRender || !initialScrollKey) {
        return {displayedData: data, onStartReached};
    }

    const targetIndex = data.findIndex((item, index) => keyExtractor(item, index) === initialScrollKey);
    if (targetIndex <= 0) {
        return {displayedData: data, onStartReached};
    }

    // On the first render, slice from the target onward so the target item
    // appears at the visual bottom of the inverted list — no scrolling needed.
    return {displayedData: data.slice(targetIndex), onStartReached: () => {}};
}
