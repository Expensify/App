/** Keeps the single interactive column header within the expense rows while the report scrolls. */
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useState, useSyncExternalStore} from 'react';
import {View} from 'react-native';

import type {ScrollOffsetStore} from './ExternalScrollFlashListTable';

type StickyReportTableHeaderProps = {
    scrollOffsetStore: ScrollOffsetStore;

    /** End of the rows relative to the header's natural top, not the outer scroll content. */
    tableEndOffsetStore: ScrollOffsetStore;

    /** Natural header top in outer scroll-content coordinates, including content padding. */
    offsetTop: number;
    children: React.ReactNode;
};

function StickyReportTableHeader({scrollOffsetStore, tableEndOffsetStore, offsetTop, children}: StickyReportTableHeaderProps) {
    const styles = useThemeStyles();
    const scrollOffset = useSyncExternalStore(scrollOffsetStore.subscribe, scrollOffsetStore.getOffset);
    const tableEndOffset = useSyncExternalStore(tableEndOffsetStore.subscribe, tableEndOffsetStore.getOffset);
    const [height, setHeight] = useState(0);
    const translateY = Math.min(Math.max(0, scrollOffset - offsetTop), Math.max(0, tableEndOffset - height));

    // Preserve layout space and focus by moving the existing header. In overflowing tables it stays inside
    // the rows' horizontal scroller, so alignment and horizontal gestures need no synchronization.
    return (
        <View
            testID="sticky-report-table-header"
            onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
            style={[styles.zIndex1, styles.appBG, {transform: [{translateY}]}]}
        >
            {children}
        </View>
    );
}

export default StickyReportTableHeader;
