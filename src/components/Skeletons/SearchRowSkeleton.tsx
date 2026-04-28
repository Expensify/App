import React from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {Circle} from 'react-native-svg';
import SkeletonRect from '@components/SkeletonRect';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import ItemListSkeletonView from './ItemListSkeletonView';

type SearchRowSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    reasonAttributes: SkeletonSpanReasonAttributes;
    isLoadMore?: boolean;
    onLayout?: (event: LayoutChangeEvent) => void;
    shouldUseNarrowLayout?: boolean;
};

const barHeight = 8;
const longBarWidth = 120;
const leftPaneWidth = variables.sideBarWithLHBWidth;

// 12 is the gap between the element and the right button
const gapWidth = 12;

// 68 is the width of the action button
const rightSideElementWidth = 68;

// 40 is the padding of the central pane summing two sides
const centralPanePadding = 40;

// 16 is the width of the right arrow icon + padding
const rightArrowWidth = 28;

// 68 is the width of the action button
const rightButtonWidth = 68;

function SearchRowSkeleton({
    shouldAnimate = true,
    fixedNumItems,
    gradientOpacityEnabled = false,
    containerStyle,
    reasonAttributes,
    isLoadMore = false,
    onLayout,
    shouldUseNarrowLayout: shouldUseNarrowLayoutProp,
}: SearchRowSkeletonProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout: shouldUseNarrowLayoutResponsive, isLargeScreenWidth} = useResponsiveLayout();
    // The prop lets callers (e.g. SearchStaticList) pin the layout independently of the
    // global responsive breakpoint - useful when the skeleton is rendered in a context
    // whose container width doesn't match the window (e.g. inside a split pane).
    const shouldUseNarrowLayout = shouldUseNarrowLayoutProp ?? shouldUseNarrowLayoutResponsive;
    useSkeletonSpan('SearchRowSkeleton', reasonAttributes);

    if (shouldUseNarrowLayout) {
        const containerWidth = windowWidth - 40;
        return (
            <View style={[styles.flex1, containerStyle]}>
                <ItemListSkeletonView
                    itemViewHeight={100}
                    itemViewStyle={[styles.highlightBG, styles.mr0]}
                    itemContainerStyle={styles.borderBottom}
                    style={[styles.mh5, styles.overflowHidden, isLoadMore && styles.searchTableBottomRadius, !isLoadMore && styles.searchTableTopRadius]}
                    gradientOpacityEnabled={gradientOpacityEnabled}
                    shouldAnimate={shouldAnimate}
                    onLayout={onLayout}
                    fixedNumItems={fixedNumItems}
                    renderSkeletonItem={() => (
                        <>
                            <Circle
                                cx={24}
                                cy={24}
                                r={8}
                            />
                            <SkeletonRect
                                width={40}
                                height={4}
                                transform={[{translateX: 38}, {translateY: 22}]}
                            />
                            <SkeletonRect
                                transform={[{translateX: containerWidth - 56}, {translateY: 16}]}
                                width={40}
                                height={16}
                                borderRadius={4}
                            />
                            <SkeletonRect
                                transform={[{translateX: 16}, {translateY: 44}]}
                                width={36}
                                height={40}
                                borderRadius={4}
                            />
                            <SkeletonRect
                                transform={[{translateX: 64}, {translateY: 50}]}
                                width={124}
                                height={barHeight}
                            />
                            <SkeletonRect
                                transform={[{translateX: containerWidth - 76}, {translateY: 50}]}
                                width={60}
                                height={barHeight}
                            />
                            <SkeletonRect
                                transform={[{translateX: 64}, {translateY: 72}]}
                                width={60}
                                height={barHeight}
                            />
                            <SkeletonRect
                                transform={[{translateX: containerWidth - 48}, {translateY: 72}]}
                                width={32}
                                height={barHeight}
                            />
                        </>
                    )}
                />
            </View>
        );
    }

    return (
        <View style={[styles.flex1, containerStyle]}>
            <ItemListSkeletonView
                shouldAnimate={shouldAnimate}
                fixedNumItems={fixedNumItems}
                gradientOpacityEnabled={gradientOpacityEnabled}
                onLayout={onLayout}
                itemViewStyle={[styles.highlightBG, styles.mr0]}
                itemViewHeight={variables.tableRowHeight}
                itemContainerStyle={styles.borderBottom}
                style={[styles.mh5, styles.overflowHidden, isLoadMore && styles.searchTableBottomRadius, !isLoadMore && styles.searchTableTopRadius]}
                renderSkeletonItem={() => (
                    <>
                        <SkeletonRect
                            transform={[{translateX: 12}, {translateY: 12}]}
                            borderRadius={variables.componentBorderRadiusSmall}
                            width={variables.w28}
                            height={variables.h32}
                        />
                        <SkeletonRect
                            transform={[{translateX: 52}, {translateY: 24}]}
                            width={30}
                            height={barHeight}
                        />
                        <SkeletonRect
                            transform={[{translateX: 94}, {translateY: 24}]}
                            width={longBarWidth}
                            height={barHeight}
                        />
                        {isLargeScreenWidth && (
                            <>
                                <SkeletonRect
                                    transform={[{translateX: 226}, {translateY: 24}]}
                                    width={longBarWidth}
                                    height={barHeight}
                                />

                                <SkeletonRect
                                    transform={[{translateX: 358}, {translateY: 24}]}
                                    width={60}
                                    height={barHeight}
                                />
                            </>
                        )}

                        <SkeletonRect
                            // We have to calculate this value to make sure the element is aligned to the button on the right side.
                            transform={[
                                {translateX: windowWidth - leftPaneWidth - rightArrowWidth - rightButtonWidth - gapWidth - centralPanePadding - gapWidth - rightSideElementWidth},
                                {translateY: 24},
                            ]}
                            width={68}
                            height={barHeight}
                        />

                        <SkeletonRect
                            // We have to calculate this value to make sure the element is aligned to the right border.
                            transform={[{translateX: windowWidth - leftPaneWidth - rightArrowWidth - rightSideElementWidth - gapWidth - centralPanePadding}, {translateY: 14}]}
                            borderRadius={15}
                            width={68}
                            height={28}
                        />
                    </>
                )}
            />
        </View>
    );
}

export default SearchRowSkeleton;
