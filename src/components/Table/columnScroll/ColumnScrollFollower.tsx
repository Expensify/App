import {useTableContext} from '@components/Table/TableContext';
import type {TableData} from '@components/Table/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import useTableColumnScroll from './useTableColumnScroll';

type ColumnScrollFollowerProps = {
    /** The column header to keep aligned. Has to carry the width the columns scroll across, so it overflows the clip. */
    children: React.ReactNode;
};

/**
 * Clips a column header to the table's width and scrolls it programmatically so it tracks the columns (see ./types).
 *
 * Rendered only where a header actually has to follow, so the mirroring attaches to whichever scroller FlashList
 * currently has: mounting with the header it applies to is what keeps it from holding onto a discarded one.
 */
function ColumnScrollFollower({children}: ColumnScrollFollowerProps) {
    const styles = useThemeStyles();
    const {listRef, scrollWidth} = useTableContext<TableData>();
    const followerRef = useTableColumnScroll(listRef, !!scrollWidth);

    return (
        <View
            ref={followerRef}
            style={[styles.overflowHidden, styles.w100]}
        >
            {children}
        </View>
    );
}

ColumnScrollFollower.displayName = 'ColumnScrollFollower';

export default ColumnScrollFollower;
