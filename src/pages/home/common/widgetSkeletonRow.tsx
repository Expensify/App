import {SkeletonViewRect} from '@components/SkeletonLoader';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

// The icon slot `widgetItemIconContainer` reserves in the rows these stand in for. Wider than the glyph
// inside it, which is `iconSizeNormal`.
const ICON_SLOT_SIZE = variables.componentSizeNormal;
const ICON_BORDER_RADIUS = variables.componentBorderRadiusNormal;

// BaseWidgetItem renders its CTA button at `BUTTON_SIZE.SMALL`.
const BUTTON_WIDTH = variables.widgetItemButtonMinWidth;
const BUTTON_HEIGHT = variables.componentSizeSmall;

// Row geometry read off the styles the real rows use (see BaseWidgetItem).
function useWidgetSkeletonRowGeometry() {
    const styles = useThemeStyles();
    const {values} = useLayoutSpacing();

    return {
        iconTextGap: styles.gap3.gap,
        rowHeight: ICON_SLOT_SIZE + styles.pv3.paddingVertical * 2,
        horizontalPadding: values.cardPadding,
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
        <SkeletonViewRect
            x={horizontalPadding}
            y={(rowHeight - ICON_SLOT_SIZE) / 2}
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
        <SkeletonViewRect
            x={cardWidth - horizontalPadding - BUTTON_WIDTH}
            y={(rowHeight - BUTTON_HEIGHT) / 2}
            width={BUTTON_WIDTH}
            height={BUTTON_HEIGHT}
            borderRadius={variables.buttonBorderRadius}
        />
    );
}

export {useWidgetSkeletonRowGeometry, WidgetSkeletonRowIcon, WidgetSkeletonRowButton, ICON_SLOT_SIZE};
