import useNavigationBarWidth from '@components/Navigation/FlatNavigationBar/useNavigationBarWidth';
import {SkeletonViewRect as SkeletonRect} from '@components/SkeletonRect';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getPlatform from '@libs/getPlatform';

import layoutSpacing, {resolveLayoutSpacing} from '@styles/layoutSpacing';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import ItemListSkeletonView from './ItemListSkeletonView';

type SearchRowSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    isLoadMore?: boolean;
    onLayout?: (event: LayoutChangeEvent) => void;
    shouldUseNarrowLayout?: boolean;
};

const barHeight = 8;
const longBarWidth = 120;
const shouldOffsetByNavigationBar = getPlatform() === CONST.PLATFORM.WEB;

// 12 is the gap between the element and the right button
const gapWidth = 12;

// 68 is the width of the action button
const rightSideElementWidth = 68;

const centralPanePadding = layoutSpacing.pageGutter.wide * 2;

// 16 is the width of the right arrow icon + padding
const rightArrowWidth = 28;

// 68 is the width of the action button
const rightButtonWidth = 68;

function SearchRowSkeleton({
    shouldAnimate = true,
    fixedNumItems,
    gradientOpacityEnabled = false,
    containerStyle,
    isLoadMore = false,
    onLayout,
    shouldUseNarrowLayout: shouldUseNarrowLayoutProp,
}: SearchRowSkeletonProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const navigationBarWidth = useNavigationBarWidth();
    const {shouldUseNarrowLayout: shouldUseNarrowLayoutResponsive, isLargeScreenWidth} = useResponsiveLayout();
    // The prop lets callers (e.g. SearchStaticList) pin the layout independently of the
    // global responsive breakpoint - useful when the skeleton is rendered in a context
    // whose container width doesn't match the window (e.g. inside a split pane).
    const shouldUseNarrowLayout = shouldUseNarrowLayoutProp ?? shouldUseNarrowLayoutResponsive;
    const {values, pageGutterMargin} = resolveLayoutSpacing(shouldUseNarrowLayout);
    const leftPaneWidth = variables.sideBarWithLHBWidth + (shouldOffsetByNavigationBar ? navigationBarWidth : 0);

    if (shouldUseNarrowLayout) {
        const containerWidth = windowWidth - values.pageGutter * 2;
        return (
            <View style={[styles.flex1, containerStyle]}>
                <ItemListSkeletonView
                    itemViewHeight={100}
                    itemViewStyle={[styles.highlightBG, styles.mr0]}
                    itemContainerStyle={styles.borderBottom}
                    style={[pageGutterMargin, styles.overflowHidden, isLoadMore && styles.tableBottomRadius, !isLoadMore && styles.tableTopRadius]}
                    gradientOpacityEnabled={gradientOpacityEnabled}
                    shouldAnimate={shouldAnimate}
                    onLayout={onLayout}
                    fixedNumItems={fixedNumItems}
                    renderSkeletonItem={() => (
                        <>
                            <SkeletonRect
                                x={16}
                                y={16}
                                width={16}
                                height={16}
                                borderRadius={8}
                            />
                            <SkeletonRect
                                width={40}
                                height={4}
                                x={38}
                                y={22}
                            />
                            <SkeletonRect
                                x={containerWidth - 56}
                                y={16}
                                width={40}
                                height={16}
                                borderRadius={4}
                            />
                            <SkeletonRect
                                x={16}
                                y={44}
                                width={36}
                                height={40}
                                borderRadius={4}
                            />
                            <SkeletonRect
                                x={64}
                                y={50}
                                width={124}
                                height={barHeight}
                            />
                            <SkeletonRect
                                x={containerWidth - 76}
                                y={50}
                                width={60}
                                height={barHeight}
                            />
                            <SkeletonRect
                                x={64}
                                y={72}
                                width={60}
                                height={barHeight}
                            />
                            <SkeletonRect
                                x={containerWidth - 48}
                                y={72}
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
                style={[pageGutterMargin, styles.overflowHidden, isLoadMore && styles.tableBottomRadius, !isLoadMore && styles.tableTopRadius]}
                renderSkeletonItem={() => (
                    <>
                        <SkeletonRect
                            x={12}
                            y={12}
                            borderRadius={variables.componentBorderRadiusSmall}
                            width={variables.w28}
                            height={variables.h32}
                        />
                        <SkeletonRect
                            x={52}
                            y={24}
                            width={30}
                            height={barHeight}
                        />
                        <SkeletonRect
                            x={94}
                            y={24}
                            width={longBarWidth}
                            height={barHeight}
                        />
                        {isLargeScreenWidth && (
                            <>
                                <SkeletonRect
                                    x={226}
                                    y={24}
                                    width={longBarWidth}
                                    height={barHeight}
                                />

                                <SkeletonRect
                                    x={358}
                                    y={24}
                                    width={60}
                                    height={barHeight}
                                />
                            </>
                        )}

                        <SkeletonRect
                            // We have to calculate this value to make sure the element is aligned to the button on the right side.
                            x={windowWidth - leftPaneWidth - rightArrowWidth - rightButtonWidth - gapWidth - centralPanePadding - gapWidth - rightSideElementWidth}
                            y={24}
                            width={68}
                            height={barHeight}
                        />

                        <SkeletonRect
                            // We have to calculate this value to make sure the element is aligned to the right border.
                            x={windowWidth - leftPaneWidth - rightArrowWidth - rightSideElementWidth - gapWidth - centralPanePadding}
                            y={14}
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
