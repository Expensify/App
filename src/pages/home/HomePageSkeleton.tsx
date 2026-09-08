import ChartSkeleton from '@components/Charts/ChartSkeleton';
import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import SkeletonTextLine, {BAR_HEIGHT} from '@components/Skeletons/SkeletonTextLine';
import WidgetContainer from '@components/WidgetContainer';

import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
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

const ROWS_PER_LIST_CARD = 3;
const ROWS_PER_TABLE_CARD = CONST.HOME.SECTION_VISIBLE_LIMIT;

const CARD_TEST_ID = 'homePageSkeletonCard';

// Two widths alternating down the card, so stacked rows read as separate rows rather than one block.
const TWO_BAR_ROW_BAR_WIDTHS = [140, 110] as const;

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

type HomePageSkeletonCardShellProps = {
    /** What the card draws inside its container */
    children: React.ReactNode;
};

function HomePageSkeletonCardShell({children}: HomePageSkeletonCardShellProps) {
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

type HomePageSkeletonCardProps = {
    numRows: number;

    /** Draws the skeleton shapes for a single row from the geometry measured off the card */
    renderRow: (args: SkeletonRowArgs) => React.ReactNode;

    /** Whether each row gets a bottom border, matching cards whose real rows are separated */
    shouldShowSeparators?: boolean;
};

function HomePageSkeletonCard({numRows, renderRow, shouldShowSeparators = false}: HomePageSkeletonCardProps) {
    const styles = useThemeStyles();
    const {onLayout, containerWidth} = useContainerWidth();
    const {iconTextGap, rowHeight, horizontalPadding} = useWidgetSkeletonRowGeometry();
    const textLineGap = styles.gap1.gap;

    return (
        <HomePageSkeletonCardShell>
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
        </HomePageSkeletonCardShell>
    );
}

// The line shape is drawn because the default Home insight is a line chart.
function HomePageSkeletonChartCard() {
    return (
        <HomePageSkeletonCardShell>
            <ChartSkeleton view={CONST.SEARCH.VIEW.LINE} />
        </HomePageSkeletonCardShell>
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

export {HomePageSkeletonChartCard, HomePageSkeletonRowCards, CARD_TEST_ID};
