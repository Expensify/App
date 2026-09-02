import SkeletonRect from '@components/SkeletonRect';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

// The icon box `getWidgetItemIconContainerStyle` draws in the rows these stand in for.
const ICON_SIZE = variables.componentSizeNormal;
const ICON_BORDER_RADIUS = variables.componentBorderRadiusNormal;

const BAR_HEIGHT = 12;

// Row geometry read off the styles the real rows use (see BaseWidgetItem).
function useWidgetSkeletonRowGeometry() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return {
        iconTextGap: styles.gap3.gap,
        rowHeight: ICON_SIZE + styles.pv3.paddingVertical * 2,
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
            transform={[{translateX: horizontalPadding}, {translateY: (rowHeight - ICON_SIZE) / 2}]}
            width={ICON_SIZE}
            height={ICON_SIZE}
            borderRadius={ICON_BORDER_RADIUS}
        />
    );
}

export {useWidgetSkeletonRowGeometry, WidgetSkeletonRowIcon, ICON_SIZE, BAR_HEIGHT};
