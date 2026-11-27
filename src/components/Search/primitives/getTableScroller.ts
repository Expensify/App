/** Finds the Spend table's scroller inside the view around its list, so every hook agrees on when there is one. */
import {PINNED_TABLE_SCROLLER_SELECTOR} from '@components/Search/pinnedCellStyles/pinnedScrollVariables';

import type {RefObject} from 'react';
import type {View} from 'react-native';

type TableScroller = {
    container: HTMLElement;

    scroller: HTMLElement;
};

function getTableScroller(containerRef: RefObject<View | null>, isListScrollingBothAxes: boolean): TableScroller | undefined {
    const container = isListScrollingBothAxes ? containerRef.current : null;
    if (!(container instanceof HTMLElement)) {
        return undefined;
    }
    const scroller = container.querySelector(PINNED_TABLE_SCROLLER_SELECTOR);
    return scroller instanceof HTMLElement ? {container, scroller} : undefined;
}

export default getTableScroller;
