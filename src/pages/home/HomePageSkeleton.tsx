import ActivityIndicator from '@components/ActivityIndicator';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';
import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import SkeletonTextLine from '@components/Skeletons/SkeletonTextLine';
import WidgetContainer from '@components/WidgetContainer';

import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

// The icon box `getWidgetItemIconContainerStyle` draws in the rows these stand in for.
const ICON_SIZE = variables.componentSizeNormal;
const ICON_BORDER_RADIUS = variables.componentBorderRadiusNormal;

const BAR_HEIGHT = 12;
// The stacked pair of text lines the two-bar rows stand in for: a merchant line over a muted label line.
const FIRST_LINE_HEIGHT = variables.fontSizeNormalHeight;
const SECOND_LINE_HEIGHT = variables.lineHeightNormal;
const TITLE_LINE_HEIGHT = variables.widgetHeaderTitleLineHeight;
const TRAILING_BAR_WIDTH = 68;
const TRAILING_SUB_BAR_WIDTH = 40;
const CARD_TITLE_WIDTH = 120;
const LOWER_BAR_WIDTH = 80;

// The chart this stands in for holds its own loading spinner at exactly this height.
const SPINNER_CARD_HEIGHT = CHART_CONTENT_MIN_HEIGHT;
const ROWS_PER_LIST_CARD = 3;
const ROWS_PER_TABLE_CARD = 5;

const CARD_TEST_ID = 'homePageSkeletonCard';
const SPINNER_TEST_ID = 'homePageSkeletonSpinner';

// Two widths, so stacked rows read as separate rows rather than one block.
const TWO_BAR_ROW_BAR_WIDTHS = [140, 110] as const;

function getAlternatingBarWidth(widths: readonly [number, number], itemIndex: number) {
    return itemIndex % 2 === 0 ? widths[0] : widths[1];
}

type SkeletonRowArgs = {
    /** Index of the row inside its card */
    itemIndex: number;

    /** Measured width of the card's row area */
    width: number;

    horizontalPadding: number;
    rowHeight: number;
    iconTextGap: number;
    textLineGap: number;
};

function getStackedBarOffsets(rowHeight: number, textLineGap: number) {
    const blockTop = (rowHeight - (FIRST_LINE_HEIGHT + textLineGap + SECOND_LINE_HEIGHT)) / 2;

    return {
        upperBarY: blockTop + (FIRST_LINE_HEIGHT - BAR_HEIGHT) / 2,
        lowerBarY: blockTop + FIRST_LINE_HEIGHT + textLineGap + (SECOND_LINE_HEIGHT - BAR_HEIGHT) / 2,
    };
}

function renderRowIcon(horizontalPadding: number, rowHeight: number) {
    return (
        <SkeletonRect
            transform={[{translateX: horizontalPadding}, {translateY: (rowHeight - ICON_SIZE) / 2}]}
            width={ICON_SIZE}
            height={ICON_SIZE}
            borderRadius={ICON_BORDER_RADIUS}
        />
    );
}

function renderIconTwoBarRow({itemIndex, horizontalPadding, rowHeight, iconTextGap, textLineGap}: SkeletonRowArgs) {
    const textX = horizontalPadding + ICON_SIZE + iconTextGap;
    const {upperBarY, lowerBarY} = getStackedBarOffsets(rowHeight, textLineGap);

    return (
        <>
            {renderRowIcon(horizontalPadding, rowHeight)}
            <SkeletonRect
                transform={[{translateX: textX}, {translateY: upperBarY}]}
                width={getAlternatingBarWidth(TWO_BAR_ROW_BAR_WIDTHS, itemIndex)}
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

function renderIconTwoBarWithTrailingRow(args: SkeletonRowArgs) {
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
    /** How many skeleton rows the card renders */
    numRows: number;

    /** Draws the skeleton shapes for a single row from the geometry measured off the card */
    renderRow: (args: SkeletonRowArgs) => React.ReactNode;

    /** Whether each row gets a bottom border, matching cards whose real rows are separated */
    shouldShowSeparators?: boolean;
};

function HomePageSkeletonCard({numRows, renderRow, shouldShowSeparators = false}: HomePageSkeletonCardProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {onLayout, containerWidth} = useContainerWidth();
    // Row geometry read off the styles the real rows use (see BaseWidgetItem).
    const iconTextGap = styles.gap3.gap;
    const textLineGap = styles.gap1.gap;
    const rowHeight = ICON_SIZE + styles.pv3.paddingVertical * 2;
    const horizontalPadding = shouldUseNarrowLayout ? styles.ph5.paddingHorizontal : styles.ph8.paddingHorizontal;

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
                <ItemListSkeletonView
                    shouldAnimate
                    fixedNumItems={numRows}
                    itemViewHeight={rowHeight}
                    // The default `mr5` on each row would shrink the SVG below the card width and pull the
                    // right-aligned bars inward.
                    itemViewStyle={styles.mr0}
                    itemContainerStyle={shouldShowSeparators ? styles.borderBottom : undefined}
                    renderSkeletonItem={({itemIndex}) => renderRow({itemIndex, width: containerWidth, horizontalPadding, rowHeight, iconTextGap, textLineGap})}
                    onLayout={onLayout}
                />
            </WidgetContainer>
        </View>
    );
}

// The card this stands in for has no bar-representable rows, so a shimmer stand-in would invent a row
// structure the real card does not have.
function HomePageSkeletonSpinnerCard() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
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
                <View style={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getHeight(SPINNER_CARD_HEIGHT)]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        testID={SPINNER_TEST_ID}
                    />
                </View>
            </WidgetContainer>
        </View>
    );
}

function HomePageSkeletonRowCards() {
    return (
        <>
            <HomePageSkeletonCard
                numRows={ROWS_PER_LIST_CARD}
                renderRow={renderIconTwoBarRow}
            />
            <HomePageSkeletonCard
                numRows={ROWS_PER_TABLE_CARD}
                renderRow={renderIconTwoBarWithTrailingRow}
                shouldShowSeparators
            />
        </>
    );
}

export {HomePageSkeletonSpinnerCard, HomePageSkeletonRowCards, CARD_TEST_ID, SPINNER_TEST_ID};
