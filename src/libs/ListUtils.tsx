import type {ListItem} from '@components/SelectionList/types';

import type {ThemeStyles} from '@styles/index';

import {View} from 'react-native';

function sortDefaultToTop<T extends ListItem>(items: T[], isDefault: (item: T) => boolean, styles: ThemeStyles): T[] {
    return items
        .toSorted((a, b) => {
            if (isDefault(a)) {
                return -1;
            }
            if (isDefault(b)) {
                return 1;
            }
            return 0;
        })
        .map((item) => ({
            ...item,
            footerContent: isDefault(item) && items.length > 1 ? <View style={[styles.mh5, styles.mv1, styles.borderBottom]} /> : undefined,
        }));
}

/**
 * Places the clear row below a pinned selection, otherwise at the top.
 */
function withClearRow<T extends ListItem>(items: T[], clearRow: T, isSelectionPinnedToTop: boolean): T[] {
    return isSelectionPinnedToTop ? [...items.slice(0, 1), clearRow, ...items.slice(1)] : [clearRow, ...items];
}

/** Removes the default row's separator when it is the last item in the list. */
function clearTrailingDefaultSeparator<T extends ListItem>(items: T[], isDefault: (item: T) => boolean): T[] {
    const lastItem = items.at(-1);
    if (!lastItem?.footerContent || !isDefault(lastItem)) {
        return items;
    }
    return [...items.slice(0, -1), {...lastItem, footerContent: undefined}];
}

export {sortDefaultToTop, withClearRow, clearTrailingDefaultSeparator};
