/**
 * The report-actions list's scroll view, pinned to the bottom of a clipping container. With its own height, the
 * scroll view moves as a whole when the container changes height, so the rows at its bottom edge stay there.
 */
import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import type {ActionSheetAwareScrollViewProps} from '@components/ActionSheetAwareScrollView/types';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type BottomPinnedScrollViewProps = ActionSheetAwareScrollViewProps & {
    /** The height the scroll view keeps while its container resizes. Without one, it fills the container. */
    height: number | undefined;

    /** How far the bottom edge of the scroll view sits above the bottom edge of the container. */
    raisedBy: number;
};

function BottomPinnedScrollView({style, onLayout, height, raisedBy, ...scrollViewProps}: BottomPinnedScrollViewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        // LegendList reads the viewport size from the container, which is the part of the scroll view that is visible.
        <View
            style={[style, styles.overflowHidden]}
            onLayout={onLayout}
        >
            {renderActionSheetAwareScrollView({
                ...scrollViewProps,
                // The rows are drawn past the scroll view's bounds, so the container shows them whatever height the scroll view has.
                style: StyleUtils.getBottomPinnedScrollViewStyle(height, raisedBy),
            })}
        </View>
    );
}

/** For LegendList's `renderScrollComponent`, which calls a function instead of rendering a component. */
function renderBottomPinnedScrollView(props: BottomPinnedScrollViewProps) {
    return <BottomPinnedScrollView {...props} />;
}

export default renderBottomPinnedScrollView;
