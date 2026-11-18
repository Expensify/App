import type {SortableHeaderLabelProps} from '@components/Search/SortableHeaderText';
import {SortableHeaderLabel} from '@components/Search/SortableHeaderText';
import RESIZE_HANDLE_COLUMN_OVERLAP from '@components/Table/columnResize/resizeHandleColumnOverlap';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import HeadingCaret from './HeadingCaret';

type LabelHeadingProps = {
    isCaretVisible: boolean;

    /** Puts the caret before the label, for labels pinned to the end of the cell. */
    isCaretBeforeLabel: boolean;
    hasResizeHandle: boolean;
    labelProps: SortableHeaderLabelProps;
};

/** A heading with a label. The caret goes on the side away from the edge the label is pinned to, so revealing it on hover doesn't move the label. */
function LabelHeading({isCaretVisible, isCaretBeforeLabel, hasResizeHandle, labelProps}: LabelHeadingProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const caret = isCaretVisible && (
        <View style={isCaretBeforeLabel ? styles.mr1 : styles.ml1}>
            <HeadingCaret />
        </View>
    );

    return (
        <View
            style={[
                styles.flexRow,
                styles.alignItemsCenter,
                isCaretBeforeLabel && styles.justifyContentEnd,
                // Keeps the caret out of the resize handle's hit area.
                isCaretVisible && hasResizeHandle && StyleUtils.getPaddingRight(RESIZE_HANDLE_COLUMN_OVERLAP),
            ]}
        >
            {isCaretBeforeLabel && caret}
            <View style={styles.flexShrink1}>
                <SortableHeaderLabel {...labelProps} />
            </View>
            {!isCaretBeforeLabel && caret}
        </View>
    );
}

export default LabelHeading;
