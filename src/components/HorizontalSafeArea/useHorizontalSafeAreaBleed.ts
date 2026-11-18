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

import type {ScrollViewProps, ViewStyle} from 'react-native';

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

type SpacingKey = keyof Pick<ViewStyle, 'margin' | 'marginHorizontal' | 'marginLeft' | 'marginRight' | 'padding' | 'paddingHorizontal' | 'paddingLeft' | 'paddingRight'>;

/** The spacing a style sets on one side, from the most to the least specific key. */
function getSpacing(style: ViewStyle, keys: SpacingKey[]): number {
    for (const key of keys) {
        const value = style[key];
        if (typeof value === 'number') {
            return value;
        }
    }
    return 0;
}

function useHorizontalSafeAreaBleed({style, contentContainerStyle, horizontal}: HorizontalSafeAreaBleedProps): HorizontalSafeAreaBleed {
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
