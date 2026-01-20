import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {Circle, Rect} from 'react-native-svg';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
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
const leftPaneWidth = variables.sideBarWithLHBWidth + variables.navigationTabBarSize;

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
    useSkeletonSpan('SearchRowSkeleton');

    if (shouldUseNarrowLayout) {
        return (
            <View style={[styles.flex1, containerStyle]}>
                <ItemListSkeletonView
                    itemViewHeight={CONST.SEARCH_SKELETON_VIEW_ITEM_HEIGHT_SMALL}
                    itemViewStyle={[styles.highlightBG, styles.mb2, styles.br3, styles.ml5]}
                    gradientOpacityEnabled={gradientOpacityEnabled}
                    shouldAnimate={shouldAnimate}
                    fixedNumItems={fixedNumItems}
                    renderSkeletonItem={() => (
                        <>
                            <Circle
                                cx={24}
                                cy={22}
                                r={6}
                            />

                            <Rect
                                width={40}
                                height={4}
                                transform={[{translateX: 40}, {translateY: 20}]}
                            />
                            <Circle
                                cx={96}
                                cy={22}
                                r={6}
                            />

                            <Rect
                                width={40}
                                height={4}
                                transform={[{translateX: 112}, {translateY: 20}]}
                            />
                            <Rect
                                transform={[{translateX: windowWidth - 122}, {translateY: 8}]}
                                width={72}
                                height={20}
                                rx={10}
                                ry={14}
                            />

                            <Rect
                                transform={[{translateX: 16}, {translateY: 44}]}
                                width={36}
                                height={40}
                                rx={4}
                                ry={4}
                            />
                            <Rect
                                transform={[{translateX: 64}, {translateY: 53}]}
                                width={124}
                                height={8}
                            />
                            <Rect
                                transform={[{translateX: 64}, {translateY: 67}]}
                                width={60}
                                height={8}
                            />
                            <Rect
                                transform={[{translateX: windowWidth - 130}, {translateY: 53}]}
                                width={80}
                                height={8}
                            />
                            <Rect
                                transform={[{translateX: windowWidth - 110}, {translateY: 67}]}
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
                itemViewStyle={[styles.highlightBG, styles.mb2, styles.br3, styles.ml5]}
                renderSkeletonItem={() => (
                    <>
                        <Rect
                            transform={[{translateX: 12}, {translateY: 12}]}
                            rx={5}
                            ry={5}
                            width={36}
                            height={40}
                        />
                        <Rect
                            transform={[{translateX: 60}, {translateY: 28}]}
                            width={30}
                            height={barHeight}
                        />
                        <Rect
                            transform={[{translateX: 102}, {translateY: 28}]}
                            width={longBarWidth}
                            height={barHeight}
                        />
                        {isLargeScreenWidth && (
                            <>
                                <Rect
                                    transform={[{translateX: 234}, {translateY: 28}]}
                                    width={longBarWidth}
                                    height={barHeight}
                                />

                                <Rect
                                    transform={[{translateX: 366}, {translateY: 28}]}
                                    width={60}
                                    height={barHeight}
                                />
                            </>
                        )}

                        <Rect
                            // We have to calculate this value to make sure the element is aligned to the button on the right side.
                            transform={[{translateX: windowWidth - leftPaneWidth - rightButtonWidth - gapWidth - centralPanePadding - gapWidth - rightSideElementWidth}, {translateY: 28}]}
                            width={80}
                            height={barHeight}
                        />

                        <Rect
                            // We have to calculate this value to make sure the element is aligned to the right border.
                            transform={[{translateX: windowWidth - leftPaneWidth - rightSideElementWidth - gapWidth - centralPanePadding}, {translateY: 18}]}
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

export default SearchRowSkeleton;
