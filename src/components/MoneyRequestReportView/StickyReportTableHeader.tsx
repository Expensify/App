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

    /** Whether the list header box sticks with CSS, leaving only end-of-rows push-off to this component. Defaults to false. */
    isListHeaderSticky?: boolean;

    children: React.ReactNode;
};

function StickyReportTableHeader({scrollOffsetStore, tableEndOffsetStore, offsetTop, isListHeaderSticky = false, children}: StickyReportTableHeaderProps) {
    const styles = useThemeStyles();
    const tableEndOffset = useSyncExternalStore(tableEndOffsetStore.subscribe, tableEndOffsetStore.getOffset);
    const [height, setHeight] = useState(0);
    const maxTranslateY = Math.max(0, tableEndOffset - height);

    // A clamped snapshot skips scroll renders whenever the header does not move.
    const getTranslateY = () => {
        const scrollOffset = scrollOffsetStore.getOffset();

        // A header the browser pins follows the scroll on the compositor without lagging behind it, so it only moves
        // here once its bottom meets the last row, and stops once it has left the viewport.
        if (isListHeaderSticky) {
            return Math.max(-height, Math.min(0, offsetTop + maxTranslateY - scrollOffset));
        }
        return Math.min(Math.max(0, scrollOffset - offsetTop), maxTranslateY);
    };
    const translateY = useSyncExternalStore(scrollOffsetStore.subscribe, getTranslateY);

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
