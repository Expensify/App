/** Keeps the report's single interactive column header within the expense table while the parent list scrolls. */
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useState, useSyncExternalStore} from 'react';
import {View} from 'react-native';

import type {ScrollOffsetStore} from './ExternalScrollFlashListTable';

type StickyReportTableHeaderProps = {
    scrollOffsetStore: ScrollOffsetStore;
    tableEndOffsetStore: ScrollOffsetStore;

    /** Natural header position in the outer list's scrollable content, including its top padding. */
    offsetTop: number;
    children: React.ReactNode;
};

function StickyReportTableHeader({scrollOffsetStore, tableEndOffsetStore, offsetTop, children}: StickyReportTableHeaderProps) {
    const styles = useThemeStyles();
    const scrollOffset = useSyncExternalStore(scrollOffsetStore.subscribe, scrollOffsetStore.getOffset);
    const tableEndOffset = useSyncExternalStore(tableEndOffsetStore.subscribe, tableEndOffsetStore.getOffset);
    const [height, setHeight] = useState(0);
    const translateY = Math.min(Math.max(0, scrollOffset - offsetTop), Math.max(0, tableEndOffset - offsetTop - height));

    // Transforms preserve the header's layout space and focus. Keeping it inside the table's horizontal
    // scroller also preserves column alignment and wheel gestures without a second header or scrollbar.
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
