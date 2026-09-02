import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';

import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {BAR_HEIGHT, ICON_SIZE, useWidgetSkeletonRowGeometry, WidgetSkeletonRowIcon} from '@pages/home/common/widgetSkeletonRow';

import variables from '@styles/variables';

import {View} from 'react-native';

// BaseWidgetItem renders its CTA button at `BUTTON_SIZE.SMALL`.
const BUTTON_WIDTH = variables.widgetItemButtonMinWidth;
const BUTTON_HEIGHT = variables.componentSizeSmall;
// The real button's `buttonBorderRadius` is 100, which CSS clamps proportionally down to a stadium.
// SVG clamps `rx` and `ry` independently, so that same 100 would draw an ellipse.
const BUTTON_BORDER_RADIUS = BUTTON_HEIGHT / 2;

// Matches the design mockup for this card.
const ROW_COUNT = 3;
const TITLE_BAR_WIDTH = 140;

function ForYouSkeleton() {
    const {onLayout, containerWidth: pageWidth} = useContainerWidth();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {iconTextGap, rowHeight, horizontalPadding} = useWidgetSkeletonRowGeometry();

    const renderSkeletonItem = () => {
        const titleX = horizontalPadding + ICON_SIZE + iconTextGap;

        return (
            <>
                <WidgetSkeletonRowIcon
                    horizontalPadding={horizontalPadding}
                    rowHeight={rowHeight}
                />
                <SkeletonRect
                    transform={[{translateX: titleX}, {translateY: (rowHeight - BAR_HEIGHT) / 2}]}
                    width={TITLE_BAR_WIDTH}
                    height={BAR_HEIGHT}
                />
                <SkeletonRect
                    transform={[{translateX: pageWidth - horizontalPadding - BUTTON_WIDTH}, {translateY: (rowHeight - BUTTON_HEIGHT) / 2}]}
                    width={BUTTON_WIDTH}
                    height={BUTTON_HEIGHT}
                    borderRadius={BUTTON_BORDER_RADIUS}
                />
            </>
        );
    };

    return (
        <View
            style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}
            onLayout={onLayout}
        >
            <ItemListSkeletonView
                itemViewHeight={rowHeight}
                shouldAnimate
                fixedNumItems={ROW_COUNT}
                renderSkeletonItem={renderSkeletonItem}
            />
        </View>
    );
}

export default ForYouSkeleton;
