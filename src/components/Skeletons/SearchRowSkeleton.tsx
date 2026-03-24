import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {Circle} from 'react-native-svg';
import SkeletonRect from '@components/SkeletonRect';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
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
    reasonAttributes: SkeletonSpanReasonAttributes;
    isLoadMore?: boolean;
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

function SearchRowSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacityEnabled = false, containerStyle, reasonAttributes, isLoadMore = false}: SearchRowSkeletonProps) {
    const theme = useTheme();
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
            <View
                style={[
                    styles.mh5,
                    styles.overflowHidden,
                    {
                        borderBottomLeftRadius: variables.componentBorderRadius,
                        borderBottomRightRadius: variables.componentBorderRadius,
                        ...(isLoadMore ? {} : {borderTopLeftRadius: variables.componentBorderRadius, borderTopRightRadius: variables.componentBorderRadius}),
                    },
                ]}
            >
                <ItemListSkeletonView
                    shouldAnimate={shouldAnimate}
                    fixedNumItems={fixedNumItems}
                    gradientOpacityEnabled={gradientOpacityEnabled}
                    itemViewStyle={[styles.highlightBG, {marginRight: 0}]}
                    itemContainerStyle={{borderBottomWidth: 1, borderColor: theme.border}}
                    itemViewHeight={variables.tableRowHeight}
                    renderSkeletonItem={() => (
                        <>
                            <SkeletonRect
                                transform={[{translateX: 12}, {translateY: 10}]}
                                borderRadius={variables.componentBorderRadiusSmall}
                                width={variables.w28}
                                height={variables.h32}
                            />
                            <SkeletonRect
                                transform={[{translateX: 52}, {translateY: 22}]}
                                width={30}
                                height={barHeight}
                            />
                            <SkeletonRect
                                transform={[{translateX: 94}, {translateY: 22}]}
                                width={longBarWidth}
                                height={barHeight}
                            />
                            {isLargeScreenWidth && (
                                <>
                                    <SkeletonRect
                                        transform={[{translateX: 226}, {translateY: 22}]}
                                        width={longBarWidth}
                                        height={barHeight}
                                    />

                                    <SkeletonRect
                                        transform={[{translateX: 358}, {translateY: 22}]}
                                        width={60}
                                        height={barHeight}
                                    />
                                </>
                            )}

                            <SkeletonRect
                                transform={[
                                    {translateX: windowWidth - leftPaneWidth - rightButtonWidth - gapWidth - centralPanePadding - gapWidth - rightSideElementWidth},
                                    {translateY: 22},
                                ]}
                                width={80}
                                height={barHeight}
                            />

                            <SkeletonRect
                                transform={[{translateX: windowWidth - leftPaneWidth - rightSideElementWidth - gapWidth - centralPanePadding}, {translateY: 12}]}
                                borderRadius={15}
                                width={80}
                                height={28}
                            />
                        </>
                    )}
                />
            </View>
        </View>
    );
}

export default SearchRowSkeleton;
