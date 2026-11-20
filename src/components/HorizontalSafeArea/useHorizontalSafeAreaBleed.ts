/**
 * Lets a scroll view reach the screen edge through the horizontal safe area its screen keeps out of, with its content
 * still inset by it, so the content lines up with the rest of the screen at rest and scrolls under the safe area. The
 * insets are added to the caller's own margins and paddings, because a later style entry replaces a side's spacing
 * rather than adding to it.
 *
 * A horizontal scroll view is a row that would otherwise be cut off at the safe area, so it reaches the edge from inside
 * the screen's own scroll view too.
 *
 * Only a narrow-layout screen offers its edge: a wide one lays its panes out side by side, and a scroll view in one
 * pane would reach into the next.
 */
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import getSpacing from '@libs/getSpacing';

import type {ScrollViewProps} from 'react-native';

import {useContext} from 'react';
import {StyleSheet} from 'react-native';

import type {HorizontalSafeAreaPlacement} from './HorizontalSafeAreaContext';

import HorizontalSafeAreaContext, {HORIZONTAL_SAFE_AREA_PLACEMENT} from './HorizontalSafeAreaContext';

type ScrollViewStyles = Pick<ScrollViewProps, 'style' | 'contentContainerStyle'>;

type HorizontalSafeAreaBleed = ScrollViewStyles & {
    /** Where the scroll view's content sits, for the scroll views nested in it. */
    contentPlacement: HorizontalSafeAreaPlacement;
};

type HorizontalSafeAreaBleedProps = ScrollViewStyles & Pick<ScrollViewProps, 'horizontal'>;

function useHorizontalSafeAreaBleed({style, contentContainerStyle, horizontal}: HorizontalSafeAreaBleedProps): HorizontalSafeAreaBleed {
    const styles = useThemeStyles();
    const placement = useContext(HorizontalSafeAreaContext);
    const {left, right} = useSafeAreaInsets();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isScreenScrollView = placement === HORIZONTAL_SAFE_AREA_PLACEMENT.SCREEN;
    const shouldBleed = isScreenScrollView || (!!horizontal && placement === HORIZONTAL_SAFE_AREA_PLACEMENT.SCREEN_SCROLL_CONTENT);
    if (!shouldBleed || !shouldUseNarrowLayout || (!left && !right)) {
        return {style, contentContainerStyle, contentPlacement: HORIZONTAL_SAFE_AREA_PLACEMENT.BOX};
    }

    const margins = StyleSheet.flatten(style) ?? {};
    const paddings = StyleSheet.flatten(contentContainerStyle) ?? {};

    return {
        style: [
            style,
            // The negative margins only widen the scroll view to both screen edges when it stretches across its
            // parent, so a width or alignment set by the caller (like w100) would just shift it left instead.
            styles.wAuto,
            styles.alignSelfStretch,
            {
                marginLeft: getSpacing(margins, ['marginLeft', 'marginHorizontal', 'margin']) - left,
                marginRight: getSpacing(margins, ['marginRight', 'marginHorizontal', 'margin']) - right,
            },
        ],
        contentContainerStyle: [
            contentContainerStyle,
            {
                paddingLeft: getSpacing(paddings, ['paddingLeft', 'paddingHorizontal', 'padding']) + left,
                paddingRight: getSpacing(paddings, ['paddingRight', 'paddingHorizontal', 'padding']) + right,
            },
        ],
        contentPlacement: isScreenScrollView && !horizontal ? HORIZONTAL_SAFE_AREA_PLACEMENT.SCREEN_SCROLL_CONTENT : HORIZONTAL_SAFE_AREA_PLACEMENT.BOX,
    };
}

export default useHorizontalSafeAreaBleed;
