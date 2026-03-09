import React, {useCallback} from 'react';
import {View} from 'react-native';
import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

const ITEM_HEIGHT = 64;

function FixCompanyCardConnectionSkeleton() {
    const {onLayout, containerWidth: pageWidth} = useContainerWidth();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useSkeletonSpan('FixCompanyCardConnectionSkeleton');

    const horizontalPadding = shouldUseNarrowLayout ? 20 : 32;
    const gap = 12;

    const skeletonItem = useCallback(() => {
        const iconX = horizontalPadding;
        const iconY = 12;
        const titleX = iconX + 40 + gap;
        const titleWidth = 140;
        const buttonWidth = styles.widgetItemButton.minWidth;
        const buttonHeight = 28;
        const buttonX = pageWidth - horizontalPadding - buttonWidth;
        const buttonY = (ITEM_HEIGHT - buttonHeight) / 2;

        return (
            <>
                <SkeletonRect
                    transform={[{translateX: iconX}, {translateY: iconY}]}
                    width={40}
                    height={40}
                    borderRadius={8}
                />
                <SkeletonRect
                    transform={[{translateX: titleX}, {translateY: 26}]}
                    width={titleWidth}
                    height={12}
                />
                <SkeletonRect
                    transform={[{translateX: buttonX}, {translateY: buttonY}]}
                    width={buttonWidth}
                    height={buttonHeight}
                    borderRadius={14}
                />
            </>
        );
    }, [horizontalPadding, pageWidth, styles.widgetItemButton.minWidth]);

    return (
        <View onLayout={onLayout}>
            <ItemListSkeletonView
                itemViewHeight={ITEM_HEIGHT}
                shouldAnimate
                fixedNumItems={1}
                renderSkeletonItem={skeletonItem}
            />
        </View>
    );
}

export default FixCompanyCardConnectionSkeleton;
