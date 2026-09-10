import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import {BAR_HEIGHT} from '@components/Skeletons/SkeletonTextLine';

import useContainerWidth from '@hooks/useContainerWidth';

import {ICON_SLOT_SIZE, useWidgetSkeletonRowGeometry, WidgetSkeletonRowButton, WidgetSkeletonRowIcon} from '@pages/home/common/widgetSkeletonRow';

import {View} from 'react-native';

const TITLE_BAR_WIDTH = 140;

function FixCompanyCardConnectionSkeleton() {
    const {onLayout, containerWidth: cardWidth} = useContainerWidth();
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
                    cardWidth={cardWidth}
                    horizontalPadding={horizontalPadding}
                    rowHeight={rowHeight}
                />
            </>
        );
    };

    return (
        <View onLayout={onLayout}>
            <ItemListSkeletonView
                itemViewHeight={rowHeight}
                shouldAnimate
                fixedNumItems={1}
                renderSkeletonItem={renderSkeletonItem}
            />
        </View>
    );
}

export default FixCompanyCardConnectionSkeleton;
