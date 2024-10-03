import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {Circle, Rect} from 'react-native-svg';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ItemListSkeletonView from './ItemListSkeletonView';

type SearchRowSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
};

const barHeight = 8;
const longBarWidth = 120;
const leftPaneWidth = variables.sideBarWidth;

// 12 is the gap between the element and the right button
const gapWidth = 12;

// 80 is the width of the element itself
const rightSideElementWidth = 80;

// 24 is the padding of the central pane summing two sides
const centralPanePadding = 40;

// 80 is the width of the button on the right side
const rightButtonWidth = 80;

function SearchRowSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacityEnabled = false, containerStyle}: SearchRowSkeletonProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout, isLargeScreenWidth} = useResponsiveLayout();

    if (shouldUseNarrowLayout) {
        return (
            <View style={[styles.flex1, containerStyle]}>
                <ItemListSkeletonView
                    itemViewHeight={CONST.SEARCH_SKELETON_VIEW_ITEM_HEIGHT}
                    itemViewStyle={[styles.highlightBG, styles.mb2, styles.br3, styles.mh5]}
                    gradientOpacityEnabled={gradientOpacityEnabled}
                    shouldAnimate={shouldAnimate}
                    fixedNumItems={fixedNumItems}
                    renderSkeletonItem={() => (
                        <>
                            <Circle
                                cx={24}
                                cy={26}
                                r={8}
                            />

                            <Rect
                                x={40}
                                y={24}
                                width={40}
                                height={4}
                            />
                            <Circle
                                cx={96}
                                cy={26}
                                r={8}
                            />

                            <Rect
                                x={112}
                                y={24}
                                width={40}
                                height={4}
                            />
                            <Rect
                                x={windowWidth - 130}
                                y={12}
                                width={80}
                                height={28}
                                rx={14}
                                ry={14}
                            />

                            <Rect
                                x={16}
                                y={56}
                                width={36}
                                height={40}
                                rx={4}
                                ry={4}
                            />
                            <Rect
                                x={64}
                                y={65}
                                width={124}
                                height={8}
                            />
                            <Rect
                                x={64}
                                y={79}
                                width={60}
                                height={8}
                            />
                            <Rect
                                x={windowWidth - 130}
                                y={65}
                                width={80}
                                height={8}
                            />
                            <Rect
                                x={windowWidth - 110}
                                y={79}
                                width={60}
                                height={8}
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
                itemViewStyle={[styles.highlightBG, styles.mb3, styles.br3, styles.mh5]}
                renderSkeletonItem={() => (
                    <>
                        <Rect
                            x={12}
                            y={12}
                            rx={5}
                            ry={5}
                            width={36}
                            height={40}
                        />
                        <Rect
                            x={60}
                            y={28}
                            width={30}
                            height={barHeight}
                        />
                        <Rect
                            x={102}
                            y={28}
                            width={longBarWidth}
                            height={barHeight}
                        />
                        {isLargeScreenWidth && (
                            <>
                                <Rect
                                    x={234}
                                    y={28}
                                    width={longBarWidth}
                                    height={barHeight}
                                />

                                <Rect
                                    x={366}
                                    y={28}
                                    width={60}
                                    height={barHeight}
                                />
                            </>
                        )}

                        <Rect
                            // We have to calculate this value to make sure the element is aligned to the button on the right side.
                            x={windowWidth - leftPaneWidth - rightButtonWidth - gapWidth - centralPanePadding - gapWidth - rightSideElementWidth}
                            y={28}
                            width={80}
                            height={barHeight}
                        />

                        <Rect
                            // We have to calculate this value to make sure the element is aligned to the right border.
                            x={windowWidth - leftPaneWidth - rightSideElementWidth - gapWidth - centralPanePadding}
                            y={18}
                            rx={15}
                            ry={15}
                            width={80}
                            height={28}
                        />
                    </>
                )}
            />
        </View>
    );
}

SearchRowSkeleton.displayName = 'SearchRowSkeleton';

export default SearchRowSkeleton;
