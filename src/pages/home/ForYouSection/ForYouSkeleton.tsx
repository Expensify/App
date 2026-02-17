import React, {useCallback} from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

const ITEM_HEIGHT = 64;

function getTitleSkeletonWidth(index: number) {
    switch (index % 3) {
        case 0:
            return 140;
        case 1:
            return 120;
        case 2:
            return 100;
        default:
            return 120;
    }
}

function ForYouSkeleton() {
    const {containerRef, containerWidth: pageWidth} = useContainerWidth();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useSkeletonSpan('ForYouSkeleton');

    const horizontalPadding = shouldUseNarrowLayout ? 20 : 32;
    const gap = 12;

    const skeletonItem = useCallback(
        (args: {itemIndex: number}) => {
            const iconX = horizontalPadding;
            const iconY = 12;
            const titleX = iconX + 40 + gap;
            const titleWidth = getTitleSkeletonWidth(args.itemIndex);
            const buttonWidth = 56;
            const buttonHeight = 28;
            const buttonX = pageWidth - horizontalPadding - buttonWidth;
            const buttonY = (ITEM_HEIGHT - buttonHeight) / 2;

            return (
                <>
                    <Rect
                        x={iconX}
                        y={iconY}
                        width={40}
                        height={40}
                        rx={8}
                        ry={8}
                    />
                    <Rect
                        x={titleX}
                        y={26}
                        width={titleWidth}
                        height={12}
                        rx={4}
                        ry={4}
                    />
                    <Rect
                        x={buttonX}
                        y={buttonY}
                        width={buttonWidth}
                        height={buttonHeight}
                        rx={14}
                        ry={14}
                    />
                </>
            );
        },
        [horizontalPadding, pageWidth],
    );

    return (
        <View
            style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}
            ref={containerRef}
        >
            <ItemListSkeletonView
                itemViewHeight={ITEM_HEIGHT}
                shouldAnimate
                fixedNumItems={3}
                renderSkeletonItem={skeletonItem}
            />
        </View>
    );
}

ForYouSkeleton.displayName = 'ForYouSkeleton';

export default ForYouSkeleton;
