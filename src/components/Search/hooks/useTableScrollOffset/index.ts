/**
 * Keeps the Spend table's sideways offset while its list scrolls both ways: restores it after a new search, before paint, and stops
 * the list's vertical scrolls from resetting it.
 */
import getTableScroller from '@components/Search/primitives/getTableScroller';

import type {RefObject} from 'react';
import type {View} from 'react-native';

import {useLayoutEffect} from 'react';

import type HorizontalScrollOffsetStore from './types';

type ReactNativeWebScrollToOptions = {x?: number; y?: number; animated?: boolean};

/** react-native-web's ScrollView, whose scrollTo and scrollToEnd (and FlashList's copies) all go through this method. */
type ReactNativeWebScrollResponder = {scrollResponderScrollTo: (options?: ReactNativeWebScrollToOptions) => void};

/** react-native-web puts its ScrollView's methods, including the one returning the ScrollView, on the scrolling element. */
type ReactNativeWebScrollNode = {getScrollResponder?: () => ReactNativeWebScrollResponder | undefined};

/** @param restoreKey Restores the kept offset whenever it changes (typically the list data). */
function useTableScrollOffset(containerRef: RefObject<View | null>, isListScrollingBothAxes: boolean, scrollOffset: HorizontalScrollOffsetStore, restoreKey: unknown) {
    useLayoutEffect(() => {
        const scroller = getTableScroller(containerRef, isListScrollingBothAxes)?.scroller;
        if (!scroller) {
            return;
        }

        // FlashList scrolls a vertical list with `{x: 0, y}` (arrow keys, focus restore, scroll to end), and react-native-web scrolls
        // both axes to that, so its scrolls keep the table's sideways offset.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- react-native-web puts getScrollResponder on the scrolling element
        const scrollResponder = (scroller as unknown as ReactNativeWebScrollNode).getScrollResponder?.();
        const reactNativeWebScrollTo = scrollResponder?.scrollResponderScrollTo;
        if (scrollResponder && reactNativeWebScrollTo) {
            scrollResponder.scrollResponderScrollTo = (options?: ReactNativeWebScrollToOptions) => reactNativeWebScrollTo({...options, x: scroller.scrollLeft});
        }

        const savedOffset = scrollOffset.get();
        if (savedOffset > 0) {
            scroller.scrollLeft = savedOffset;
        }
        const keepOffset = () => scrollOffset.set(scroller.scrollLeft);
        scroller.addEventListener('scroll', keepOffset, {passive: true});

        return () => {
            scroller.removeEventListener('scroll', keepOffset);
            if (scrollResponder && reactNativeWebScrollTo) {
                scrollResponder.scrollResponderScrollTo = reactNativeWebScrollTo;
            }
        };
    }, [containerRef, isListScrollingBothAxes, scrollOffset, restoreKey]);
}

export default useTableScrollOffset;
