import ActivityIndicator from '@components/ActivityIndicator';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';
import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import WidgetContainer from '@components/WidgetContainer';

import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
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
// The real card titles are `Text` at this line height, so the rows below it do not shift when the
// real title replaces the placeholder.
const TITLE_LINE_HEIGHT = variables.widgetHeaderTitleLineHeight;
const TITLE_BAR_Y = (TITLE_LINE_HEIGHT - BAR_HEIGHT) / 2;
// The CTA button BaseWidgetItem renders at `BUTTON_SIZE.SMALL` with `widgetItemButton`'s minimum width.
const PILL_WIDTH = variables.widgetItemButtonMinWidth;
const PILL_HEIGHT = variables.componentSizeSmall;
// The real button's `buttonBorderRadius` is 100, which CSS clamps proportionally down to a stadium.
// SVG clamps `rx` and `ry` independently, so that same 100 would draw an ellipse.
const PILL_BORDER_RADIUS = PILL_HEIGHT / 2;
const TRAILING_BAR_WIDTH = 68;
const TRAILING_SUB_BAR_WIDTH = 40;
const CARD_TITLE_WIDTH = 120;
const CARD_SUBTITLE_WIDTH = 180;
const LOWER_BAR_WIDTH = 80;

const SPINNER_CARD_HEIGHT = CHART_CONTENT_MIN_HEIGHT;
const ROWS_PER_LIST_CARD = 3;
const ROWS_PER_TABLE_CARD = 5;

const CARD_TEST_ID = 'homePageSkeletonCard';
const SPINNER_TEST_ID = 'homePageSkeletonSpinner';
const LEFT_COLUMN_TEST_ID = 'homePageSkeletonLeftColumn';
const RIGHT_COLUMN_TEST_ID = 'homePageSkeletonRightColumn';

const PILL_ROW_BAR_WIDTH = 140;
// Alternating leading-bar widths, so stacked rows read as separate rows rather than one block.
const TWO_BAR_ROW_BAR_WIDTHS = [140, 110] as const;

function getAlternatingBarWidth(widths: readonly [number, number], itemIndex: number) {
    return itemIndex % 2 === 0 ? widths[0] : widths[1];
}

type SkeletonRowArgs = {
    /** Index of the row inside its card, used to vary bar widths */
    itemIndex: number;

    /** Measured width of the card's row area */
    width: number;

    /** Inset applied to both edges of the row */
    horizontalPadding: number;

    /** Height of one row */
    rowHeight: number;

    /** Gap between the icon box and the text bars beside it */
    iconTextGap: number;

    /** Gap between the two stacked text lines of a row */
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

function renderIconBarPillRow({width, horizontalPadding, rowHeight, iconTextGap}: SkeletonRowArgs) {
    return (
        <>
            {renderRowIcon(horizontalPadding, rowHeight)}
            <SkeletonRect
                transform={[{translateX: horizontalPadding + ICON_SIZE + iconTextGap}, {translateY: (rowHeight - BAR_HEIGHT) / 2}]}
                width={PILL_ROW_BAR_WIDTH}
                height={BAR_HEIGHT}
            />
            <SkeletonRect
                transform={[{translateX: width - horizontalPadding - PILL_WIDTH}, {translateY: (rowHeight - PILL_HEIGHT) / 2}]}
                width={PILL_WIDTH}
                height={PILL_HEIGHT}
                borderRadius={PILL_BORDER_RADIUS}
            />
        </>
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

type HomePageSkeletonCardTitleProps = {
    /** Whether a second, wider bar is drawn below the title bar */
    shouldShowSubtitle?: boolean;
};

function HomePageSkeletonCardTitle({shouldShowSubtitle = false}: HomePageSkeletonCardTitleProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    // The title is separated from whatever sits under it in the real card header (see WidgetContainer).
    const titleGap = styles.gap2.gap;

    return (
        <SkeletonViewContentLoader
            animate
            height={shouldShowSubtitle ? TITLE_LINE_HEIGHT * 2 + titleGap : TITLE_LINE_HEIGHT}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <SkeletonRect
                transform={[{translateY: TITLE_BAR_Y}]}
                width={CARD_TITLE_WIDTH}
                height={BAR_HEIGHT}
            />
            {shouldShowSubtitle && (
                <SkeletonRect
                    transform={[{translateY: TITLE_LINE_HEIGHT + titleGap + TITLE_BAR_Y}]}
                    width={CARD_SUBTITLE_WIDTH}
                    height={BAR_HEIGHT}
                />
            )}
        </SkeletonViewContentLoader>
    );
}

type HomePageSkeletonCardProps = {
    /** How many placeholder rows this card renders */
    numRows: number;

    /** Draws one row. Receives the card's measured width so trailing content can be right-aligned */
    renderRow: (args: SkeletonRowArgs) => React.ReactNode;

    /** Whether rows are divided by separators */
    shouldShowSeparators?: boolean;

    /** Whether the card's title carries a second, wider bar */
    shouldShowSubtitle?: boolean;
};

function HomePageSkeletonCard({numRows, renderRow, shouldShowSeparators = false, shouldShowSubtitle = false}: HomePageSkeletonCardProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {onLayout, containerWidth} = useContainerWidth();
    // Row geometry read off the styles the real rows use, so the placeholders land in the same places
    // their content will (see BaseWidgetItem).
    const iconTextGap = styles.gap3.gap;
    const textLineGap = styles.gap1.gap;
    const rowHeight = ICON_SIZE + styles.pv3.paddingVertical * 2;
    const horizontalPadding = shouldUseNarrowLayout ? styles.ph5.paddingHorizontal : styles.ph8.paddingHorizontal;

    return (
        <View testID={CARD_TEST_ID}>
            <WidgetContainer
                titleContent={<HomePageSkeletonCardTitle shouldShowSubtitle={shouldShowSubtitle} />}
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

    // On wide this is the last card in the left column, so growing fills it to the bottom of the viewport.
    // On narrow the cards are one flat stack, where growing would push the cards below it down.
    const fillStyle = shouldUseNarrowLayout ? undefined : styles.flex1;

    return (
        <View
            testID={CARD_TEST_ID}
            style={fillStyle}
        >
            <WidgetContainer
                titleContent={<HomePageSkeletonCardTitle />}
                containerStyles={[fillStyle, styles.getWidgetContainerBottomPaddingStyle(shouldUseNarrowLayout)]}
            >
                <View style={[styles.alignItemsCenter, styles.justifyContentCenter, shouldUseNarrowLayout ? StyleUtils.getHeight(SPINNER_CARD_HEIGHT) : styles.flex1]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        testID={SPINNER_TEST_ID}
                    />
                </View>
            </WidgetContainer>
        </View>
    );
}

/** The caller supplies the `homePageMainLayout` container, which is what turns the two columns into a single stack on narrow layouts. */
function HomePageSkeleton() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const leftCards = (
        <>
            <HomePageSkeletonCard
                numRows={ROWS_PER_LIST_CARD}
                renderRow={renderIconBarPillRow}
                shouldShowSubtitle
            />
            <HomePageSkeletonSpinnerCard />
        </>
    );

    const rightCards = (
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

    if (shouldUseNarrowLayout) {
        return (
            <>
                {leftCards}
                {rightCards}
            </>
        );
    }

    return (
        <>
            <View
                testID={LEFT_COLUMN_TEST_ID}
                style={styles.homePageLeftColumn}
            >
                {leftCards}
            </View>
            <View
                testID={RIGHT_COLUMN_TEST_ID}
                style={styles.homePageRightColumn}
            >
                {rightCards}
            </View>
        </>
    );
}

export default HomePageSkeleton;
export {CARD_TEST_ID, SPINNER_TEST_ID, LEFT_COLUMN_TEST_ID, RIGHT_COLUMN_TEST_ID};
