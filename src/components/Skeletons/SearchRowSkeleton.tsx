import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {Circle} from 'react-native-svg';
import SkeletonRect from '@components/SkeletonRect';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ItemListSkeletonView from './ItemListSkeletonView';

type SearchRowSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    reasonAttributes?: SkeletonSpanReasonAttributes;
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

function SearchRowSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacityEnabled = false, containerStyle, reasonAttributes}: SearchRowSkeletonProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout, isLargeScreenWidth} = useResponsiveLayout();
    useSkeletonSpan('SearchRowSkeleton', reasonAttributes);

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

                            <SkeletonRect
                                width={40}
                                height={4}
                                transform={[{translateX: 40}, {translateY: 20}]}
                            />
                            <Circle
                                cx={96}
                                cy={22}
                                r={6}
                            />

                            <SkeletonRect
                                width={40}
                                height={4}
                                transform={[{translateX: 112}, {translateY: 20}]}
                            />
                            <SkeletonRect
                                transform={[{translateX: windowWidth - 122}, {translateY: 8}]}
                                width={72}
                                height={20}
                                borderRadius={10}
                            />

                            <SkeletonRect
                                transform={[{translateX: 16}, {translateY: 44}]}
                                width={36}
                                height={40}
                            />
                            <SkeletonRect
                                transform={[{translateX: 64}, {translateY: 53}]}
                                width={124}
                                height={8}
                            />
                            <SkeletonRect
                                transform={[{translateX: 64}, {translateY: 67}]}
                                width={60}
                                height={8}
                            />
                            <SkeletonRect
                                transform={[{translateX: windowWidth - 130}, {translateY: 53}]}
                                width={80}
                                height={8}
                            />
                            <SkeletonRect
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
                        <SkeletonRect
                            transform={[{translateX: 12}, {translateY: 12}]}
                            borderRadius={5}
                            width={36}
                            height={40}
                        />
                        <SkeletonRect
                            transform={[{translateX: 60}, {translateY: 28}]}
                            width={30}
                            height={barHeight}
                        />
                        <SkeletonRect
                            transform={[{translateX: 102}, {translateY: 28}]}
                            width={longBarWidth}
                            height={barHeight}
                        />
                        {isLargeScreenWidth && (
                            <>
                                <SkeletonRect
                                    transform={[{translateX: 234}, {translateY: 28}]}
                                    width={longBarWidth}
                                    height={barHeight}
                                />

                                <SkeletonRect
                                    transform={[{translateX: 366}, {translateY: 28}]}
                                    width={60}
                                    height={barHeight}
                                />
                            </>
                        )}

                        <SkeletonRect
                            // We have to calculate this value to make sure the element is aligned to the button on the right side.
                            transform={[{translateX: windowWidth - leftPaneWidth - rightButtonWidth - gapWidth - centralPanePadding - gapWidth - rightSideElementWidth}, {translateY: 28}]}
                            width={80}
                            height={barHeight}
                        />

                        <SkeletonRect
                            // We have to calculate this value to make sure the element is aligned to the right border.
                            transform={[{translateX: windowWidth - leftPaneWidth - rightSideElementWidth - gapWidth - centralPanePadding}, {translateY: 18}]}
                            borderRadius={15}
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
