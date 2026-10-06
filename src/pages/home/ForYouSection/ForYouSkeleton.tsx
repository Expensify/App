import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import {BAR_HEIGHT} from '@components/Skeletons/SkeletonTextLine';

import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {ICON_SLOT_SIZE, useWidgetSkeletonRowGeometry, WidgetSkeletonRowButton, WidgetSkeletonRowIcon} from '@pages/home/common/widgetSkeletonRow';

import {View} from 'react-native';

// Matches the design mockup for this card.
const ROW_COUNT = 3;
const TITLE_BAR_WIDTH = 140;

function ForYouSkeleton() {
    const {onLayout, containerWidth: pageWidth} = useContainerWidth();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {iconTextGap, rowHeight, horizontalPadding} = useWidgetSkeletonRowGeometry();

    const renderSkeletonItem = () => {
        const titleX = horizontalPadding + ICON_SLOT_SIZE + iconTextGap;

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
                <WidgetSkeletonRowButton
                    cardWidth={pageWidth}
                    horizontalPadding={horizontalPadding}
                    rowHeight={rowHeight}
                />
            </>
        );
    };

    return (
        <View
            style={styles.getWidgetRowGroupStyle(shouldUseNarrowLayout)}
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
