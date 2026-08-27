import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';

import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import {View} from 'react-native';

// The icon box `getWidgetItemIconContainerStyle` draws in the rows these stand in for.
const ICON_SIZE = variables.componentSizeNormal;
const ICON_BORDER_RADIUS = variables.componentBorderRadiusNormal;

const BAR_HEIGHT = 12;
// The CTA button BaseWidgetItem renders at `BUTTON_SIZE.SMALL` with `widgetItemButton`'s minimum width.
const BUTTON_WIDTH = variables.widgetItemButtonMinWidth;
const BUTTON_HEIGHT = variables.componentSizeSmall;
// The real button's `buttonBorderRadius` is 100, which CSS clamps proportionally down to a stadium.
// SVG clamps `rx` and `ry` independently, so that same 100 would draw an ellipse.
const BUTTON_BORDER_RADIUS = BUTTON_HEIGHT / 2;

const ROW_COUNT = 2;
const TITLE_BAR_WIDTH = 140;

function ForYouSkeleton() {
    const {onLayout, containerWidth: pageWidth} = useContainerWidth();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // Row geometry read off the styles the real rows use, so the placeholders land in the same places
    // their content will (see BaseWidgetItem).
    const iconTextGap = styles.gap3.gap;
    const rowHeight = ICON_SIZE + styles.pv3.paddingVertical * 2;
    const horizontalPadding = shouldUseNarrowLayout ? styles.ph5.paddingHorizontal : styles.ph8.paddingHorizontal;

    const renderSkeletonItem = () => {
        const titleX = horizontalPadding + ICON_SIZE + iconTextGap;

        return (
            <>
                <SkeletonRect
                    transform={[{translateX: horizontalPadding}, {translateY: (rowHeight - ICON_SIZE) / 2}]}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    borderRadius={ICON_BORDER_RADIUS}
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
