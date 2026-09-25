import SkeletonRect from '@components/SkeletonRect';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

// The icon slot `widgetItemIconContainer` reserves in the rows these stand in for. Wider than the glyph
// inside it, which is `iconSizeNormal`.
const ICON_SLOT_SIZE = variables.componentSizeNormal;
const ICON_BORDER_RADIUS = variables.componentBorderRadiusNormal;

// BaseWidgetItem renders its CTA button at `BUTTON_SIZE.SMALL`.
const BUTTON_WIDTH = variables.widgetItemButtonMinWidth;
const BUTTON_HEIGHT = variables.componentSizeSmall;
// The real button's `buttonBorderRadius` is 100, which CSS clamps proportionally down to a stadium.
// SVG clamps `rx` and `ry` independently, so that same 100 would draw an ellipse.
const BUTTON_BORDER_RADIUS = BUTTON_HEIGHT / 2;

// Row geometry read off the styles the real rows use (see BaseWidgetItem).
function useWidgetSkeletonRowGeometry() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return {
        iconTextGap: styles.gap3.gap,
        rowHeight: ICON_SLOT_SIZE + styles.pv3.paddingVertical * 2,
        horizontalPadding: shouldUseNarrowLayout ? styles.ph5.paddingHorizontal : styles.ph8.paddingHorizontal,
    };
}

type WidgetSkeletonRowIconProps = {
    /** Left inset the real row's icon box sits at */
    horizontalPadding: number;

    /** Height of the row the icon box is centered in */
    rowHeight: number;
};

function WidgetSkeletonRowIcon({horizontalPadding, rowHeight}: WidgetSkeletonRowIconProps) {
    return (
        <SkeletonRect
            transform={[{translateX: horizontalPadding}, {translateY: (rowHeight - ICON_SLOT_SIZE) / 2}]}
            width={ICON_SLOT_SIZE}
            height={ICON_SLOT_SIZE}
            borderRadius={ICON_BORDER_RADIUS}
        />
    );
}

type WidgetSkeletonRowButtonProps = {
    cardWidth: number;

    /** Right inset the real row's button sits at */
    horizontalPadding: number;

    rowHeight: number;
};

function WidgetSkeletonRowButton({cardWidth, horizontalPadding, rowHeight}: WidgetSkeletonRowButtonProps) {
    return (
        <SkeletonRect
            transform={[{translateX: cardWidth - horizontalPadding - BUTTON_WIDTH}, {translateY: (rowHeight - BUTTON_HEIGHT) / 2}]}
            width={BUTTON_WIDTH}
            height={BUTTON_HEIGHT}
            borderRadius={BUTTON_BORDER_RADIUS}
        />
    );
}

export {useWidgetSkeletonRowGeometry, WidgetSkeletonRowIcon, WidgetSkeletonRowButton, ICON_SLOT_SIZE};
