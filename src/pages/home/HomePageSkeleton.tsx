import ActivityIndicator from '@components/ActivityIndicator';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';
import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import SkeletonTextLine, {BAR_HEIGHT} from '@components/Skeletons/SkeletonTextLine';
import WidgetContainer from '@components/WidgetContainer';

import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {lineHeightScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import {ICON_SLOT_SIZE, useWidgetSkeletonRowGeometry, WidgetSkeletonRowIcon} from './common/widgetSkeletonRow';

// The stacked pair of text lines the two-bar rows stand in for: a merchant line over a muted label line.
const FIRST_LINE_HEIGHT = lineHeightScale.text;
const SECOND_LINE_HEIGHT = lineHeightScale.label;
const TITLE_LINE_HEIGHT = variables.widgetHeaderTitleLineHeight;
const TRAILING_BAR_WIDTH = 68;
const TRAILING_SUB_BAR_WIDTH = 40;
const CARD_TITLE_WIDTH = 120;
const LOWER_BAR_WIDTH = 80;

// The chart this stands in for holds its own loading spinner at exactly this height.
const SPINNER_CARD_HEIGHT = CHART_CONTENT_MIN_HEIGHT;
const ROWS_PER_LIST_CARD = 3;
const ROWS_PER_TABLE_CARD = CONST.HOME.SECTION_VISIBLE_LIMIT;

const CARD_TEST_ID = 'homePageSkeletonCard';
const SPINNER_TEST_ID = 'homePageSkeletonSpinner';

const TWO_BAR_ROW_BAR_WIDTHS = [140, 110] as const;

type SkeletonRowArgs = {
    itemIndex: number;
    horizontalPadding: number;
    rowHeight: number;
    iconTextGap: number;
    textLineGap: number;
};

type TrailingSkeletonRowArgs = SkeletonRowArgs & {
    /** Measured width of the card's row area, which the trailing bars are right-aligned against */
    width: number;
};

function getStackedBarOffsets(rowHeight: number, textLineGap: number) {
    const blockTop = (rowHeight - (FIRST_LINE_HEIGHT + textLineGap + SECOND_LINE_HEIGHT)) / 2;

    return {
        upperBarY: blockTop + (FIRST_LINE_HEIGHT - BAR_HEIGHT) / 2,
        lowerBarY: blockTop + FIRST_LINE_HEIGHT + textLineGap + (SECOND_LINE_HEIGHT - BAR_HEIGHT) / 2,
    };
}

function renderIconTwoBarRow({itemIndex, horizontalPadding, rowHeight, iconTextGap, textLineGap}: SkeletonRowArgs) {
    const textX = horizontalPadding + ICON_SLOT_SIZE + iconTextGap;
    const {upperBarY, lowerBarY} = getStackedBarOffsets(rowHeight, textLineGap);

    return (
        <>
            <WidgetSkeletonRowIcon
                horizontalPadding={horizontalPadding}
                rowHeight={rowHeight}
            />
            <SkeletonRect
                transform={[{translateX: textX}, {translateY: upperBarY}]}
                width={TWO_BAR_ROW_BAR_WIDTHS[itemIndex % TWO_BAR_ROW_BAR_WIDTHS.length]}
                height={BAR_HEIGHT}
            />
            <SkeletonRect
                transform={[{translateX: textX}, {translateY: lowerBarY}]}
                width={LOWER_BAR_WIDTH}
                height={BAR_HEIGHT}
            />
        </>
    );
}

function renderIconTwoBarWithTrailingRow(args: TrailingSkeletonRowArgs) {
    const {width, horizontalPadding, rowHeight, textLineGap} = args;
    const {upperBarY, lowerBarY} = getStackedBarOffsets(rowHeight, textLineGap);

    return (
        <>
            {renderIconTwoBarRow(args)}
            <SkeletonRect
                transform={[{translateX: width - horizontalPadding - TRAILING_BAR_WIDTH}, {translateY: upperBarY}]}
                width={TRAILING_BAR_WIDTH}
                height={BAR_HEIGHT}
            />
            <SkeletonRect
                transform={[{translateX: width - horizontalPadding - TRAILING_SUB_BAR_WIDTH}, {translateY: lowerBarY}]}
                width={TRAILING_SUB_BAR_WIDTH}
                height={BAR_HEIGHT}
            />
        </>
    );
}

type HomePageSkeletonCardProps = {
    children: React.ReactNode;
};

function HomePageSkeletonCard({children}: HomePageSkeletonCardProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <View testID={CARD_TEST_ID}>
            <WidgetContainer
                titleContent={
                    <SkeletonTextLine
                        lineHeight={TITLE_LINE_HEIGHT}
                        barWidth={CARD_TITLE_WIDTH}
                    />
                }
                containerStyles={styles.getWidgetContainerBottomPaddingStyle(shouldUseNarrowLayout)}
            >
                {children}
            </WidgetContainer>
        </View>
    );
}

function HomePageSkeletonListCard() {
    const styles = useThemeStyles();
    const {iconTextGap, rowHeight, horizontalPadding} = useWidgetSkeletonRowGeometry();
    const textLineGap = styles.gap1.gap;

    return (
        <HomePageSkeletonCard>
            <ItemListSkeletonView
                shouldAnimate
                fixedNumItems={ROWS_PER_LIST_CARD}
                itemViewHeight={rowHeight}
                itemViewStyle={styles.mr0}
                renderSkeletonItem={({itemIndex}) => renderIconTwoBarRow({itemIndex, horizontalPadding, rowHeight, iconTextGap, textLineGap})}
            />
        </HomePageSkeletonCard>
    );
}

function HomePageSkeletonTableCard() {
    const styles = useThemeStyles();
    const {onLayout, containerWidth} = useContainerWidth();
    const {iconTextGap, rowHeight, horizontalPadding} = useWidgetSkeletonRowGeometry();
    const textLineGap = styles.gap1.gap;

    return (
        <HomePageSkeletonCard>
            <ItemListSkeletonView
                shouldAnimate
                fixedNumItems={ROWS_PER_TABLE_CARD}
                itemViewHeight={rowHeight}
                // The default `mr5` on each row would shrink the SVG below the card width and pull the right-aligned bars inward.
                itemViewStyle={styles.mr0}
                // The rows this stands in for are separated.
                itemContainerStyle={styles.borderBottom}
                renderSkeletonItem={({itemIndex}) => renderIconTwoBarWithTrailingRow({itemIndex, width: containerWidth, horizontalPadding, rowHeight, iconTextGap, textLineGap})}
                onLayout={onLayout}
            />
        </HomePageSkeletonCard>
    );
}

// The card this stands in for has no bar-representable rows, so a shimmer stand-in would invent a row structure the real card does not have.
function HomePageSkeletonSpinnerCard() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <HomePageSkeletonCard>
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getHeight(SPINNER_CARD_HEIGHT)]}>
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    testID={SPINNER_TEST_ID}
                />
            </View>
        </HomePageSkeletonCard>
    );
}

function HomePageSkeletonRowCards() {
    return (
        <>
            <HomePageSkeletonListCard />
            <HomePageSkeletonTableCard />
        </>
    );
}

export {HomePageSkeletonSpinnerCard, HomePageSkeletonRowCards, CARD_TEST_ID, SPINNER_TEST_ID};
