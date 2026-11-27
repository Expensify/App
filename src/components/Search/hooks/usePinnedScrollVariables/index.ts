/** Publishes the sticky column header's height, which focus scrolling has to clear. */
import {PINNED_HEADER_ROW_SELECTOR, STICKY_HEADER_HEIGHT_VARIABLE} from '@components/Search/pinnedCellStyles/pinnedScrollVariables';
import getTableScroller from '@components/Search/primitives/getTableScroller';

import type {RefObject} from 'react';
import type {View} from 'react-native';

import {useLayoutEffect} from 'react';

function usePinnedScrollVariables(containerRef: RefObject<View | null>, isListScrollingBothAxes: boolean) {
    useLayoutEffect(() => {
        const table = getTableScroller(containerRef, isListScrollingBothAxes);
        const headerRow = table?.container.querySelector(PINNED_HEADER_ROW_SELECTOR);
        if (!table || !(headerRow instanceof HTMLElement)) {
            return;
        }
        const {container} = table;

        const writeHeaderHeight = () => {
            container.style.setProperty(STICKY_HEADER_HEIGHT_VARIABLE, `${headerRow.getBoundingClientRect().height}px`);
        };
        writeHeaderHeight();

        const resizeObserver = new ResizeObserver(writeHeaderHeight);
        resizeObserver.observe(headerRow);
        return () => resizeObserver.disconnect();
    }, [containerRef, isListScrollingBothAxes]);
}

export default usePinnedScrollVariables;
