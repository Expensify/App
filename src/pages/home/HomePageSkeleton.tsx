/**
 * The fixed placeholder shape home renders while the first OpenApp is in flight: four cards with no
 * correspondence to the nine real Sections, so no Section has to guess whether it will exist. The count
 * is fixed rather than derived, so no card can promise content that fails to arrive.
 */
import ActivityIndicator from '@components/ActivityIndicator';
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

const ROW_HEIGHT = 64;

// The two variables `getWidgetItemIconContainerStyle` pairs for the icon box these rows stand in for.
const ICON_SIZE = variables.componentSizeNormal;
const ICON_BORDER_RADIUS = variables.componentBorderRadiusNormal;

const ICON_TEXT_GAP = 12;
const BAR_HEIGHT = 8;
const UPPER_BAR_Y = 20;
const LOWER_BAR_Y = 38;
const TITLE_BAR_HEIGHT = 12;
const TITLE_GAP = 8;
const PILL_WIDTH = 68;
const PILL_HEIGHT = 28;
const TRAILING_BAR_WIDTH = 68;
const TRAILING_SUB_BAR_WIDTH = 40;
const CARD_TITLE_WIDTH = 120;
const CARD_SUBTITLE_WIDTH = 180;
const LOWER_BAR_WIDTH = 80;

const SPINNER_CARD_HEIGHT = 200;
const ROWS_PER_LIST_CARD = 3;
const ROWS_PER_TABLE_CARD = 5;

// Every card carries the same identifier so a count assertion sees all four, whatever shape each one is.
const CARD_TEST_ID = 'homePageSkeletonCard';
const SPINNER_TEST_ID = 'homePageSkeletonSpinner';
const LEFT_COLUMN_TEST_ID = 'homePageSkeletonLeftColumn';
const RIGHT_COLUMN_TEST_ID = 'homePageSkeletonRightColumn';

// Alternating leading-bar widths, so stacked rows read as separate rows rather than one block.
const PILL_ROW_BAR_WIDTHS = [140, 100] as const;
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
};

/** The leading icon box every row shape starts with. */
function renderRowIcon(horizontalPadding: number) {
    return (
        <SkeletonRect
            transform={[{translateX: horizontalPadding}, {translateY: (ROW_HEIGHT - ICON_SIZE) / 2}]}
            width={ICON_SIZE}
            height={ICON_SIZE}
            borderRadius={ICON_BORDER_RADIUS}
        />
    );
}

/** Icon + one text bar + a trailing pill. */
function renderIconBarPillRow({itemIndex, width, horizontalPadding}: SkeletonRowArgs) {
    return (
        <>
            {renderRowIcon(horizontalPadding)}
            <SkeletonRect
                transform={[{translateX: horizontalPadding + ICON_SIZE + ICON_TEXT_GAP}, {translateY: (ROW_HEIGHT - TITLE_BAR_HEIGHT) / 2}]}
                width={getAlternatingBarWidth(PILL_ROW_BAR_WIDTHS, itemIndex)}
                height={TITLE_BAR_HEIGHT}
            />
            <SkeletonRect
                transform={[{translateX: width - horizontalPadding - PILL_WIDTH}, {translateY: (ROW_HEIGHT - PILL_HEIGHT) / 2}]}
                width={PILL_WIDTH}
                height={PILL_HEIGHT}
                borderRadius={PILL_HEIGHT / 2}
            />
        </>
    );
}

/** Icon + two stacked text bars. */
function renderIconTwoBarRow({itemIndex, horizontalPadding}: SkeletonRowArgs) {
    const textX = horizontalPadding + ICON_SIZE + ICON_TEXT_GAP;

    return (
        <>
            {renderRowIcon(horizontalPadding)}
            <SkeletonRect
                transform={[{translateX: textX}, {translateY: UPPER_BAR_Y}]}
                width={getAlternatingBarWidth(TWO_BAR_ROW_BAR_WIDTHS, itemIndex)}
                height={BAR_HEIGHT}
            />
            <SkeletonRect
                transform={[{translateX: textX}, {translateY: LOWER_BAR_Y}]}
                width={LOWER_BAR_WIDTH}
                height={BAR_HEIGHT}
            />
        </>
    );
}

/** Icon + two stacked text bars + two right-aligned trailing bars. */
function renderIconTwoBarWithTrailingRow(args: SkeletonRowArgs) {
    const {width, horizontalPadding} = args;

    return (
        <>
            {renderIconTwoBarRow(args)}
            <SkeletonRect
                transform={[{translateX: width - horizontalPadding - TRAILING_BAR_WIDTH}, {translateY: UPPER_BAR_Y}]}
                width={TRAILING_BAR_WIDTH}
                height={BAR_HEIGHT}
            />
            <SkeletonRect
                transform={[{translateX: width - horizontalPadding - TRAILING_SUB_BAR_WIDTH}, {translateY: LOWER_BAR_Y}]}
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

    return (
        <SkeletonViewContentLoader
            animate
            height={shouldShowSubtitle ? TITLE_BAR_HEIGHT * 2 + TITLE_GAP : TITLE_BAR_HEIGHT}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <SkeletonRect
                width={CARD_TITLE_WIDTH}
                height={TITLE_BAR_HEIGHT}
            />
            {shouldShowSubtitle && (
                <SkeletonRect
                    transform={[{translateY: TITLE_BAR_HEIGHT + TITLE_GAP}]}
                    width={CARD_SUBTITLE_WIDTH}
                    height={TITLE_BAR_HEIGHT}
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
    // Read off the style that positions the card title, so rows stay lined up with it if the inset changes.
    const horizontalPadding = styles.getWidgetContainerHeaderStyle(shouldUseNarrowLayout).marginHorizontal;

    return (
        <View testID={CARD_TEST_ID}>
            <WidgetContainer titleContent={<HomePageSkeletonCardTitle shouldShowSubtitle={shouldShowSubtitle} />}>
                <ItemListSkeletonView
                    shouldAnimate
                    fixedNumItems={numRows}
                    itemViewHeight={ROW_HEIGHT}
                    // The default `mr5` on each row would shrink the SVG below the card width and pull the
                    // right-aligned bars inward.
                    itemViewStyle={styles.mr0}
                    itemContainerStyle={shouldShowSeparators ? styles.borderBottom : undefined}
                    renderSkeletonItem={({itemIndex}) => renderRow({itemIndex, width: containerWidth, horizontalPadding})}
                    onLayout={onLayout}
                />
            </WidgetContainer>
        </View>
    );
}

// The card this stands in for has no bar-representable rows, so a shimmer stand-in would invent a row
// structure the real card does not have. The mock draws a spinner here.
function HomePageSkeletonSpinnerCard() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // On wide this is the last card in the left column, so growing fills the column to the bottom of the
    // viewport the way the design draws it. On narrow the cards are one flat stack, so growing would push
    // the cards below it to the bottom and leave a gap above them.
    const fillStyle = shouldUseNarrowLayout ? undefined : styles.flex1;

    return (
        <View
            testID={CARD_TEST_ID}
            style={fillStyle}
        >
            <WidgetContainer
                titleContent={<HomePageSkeletonCardTitle />}
                containerStyles={fillStyle}
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

/**
 * Returns a fragment: the caller supplies the `homePageMainLayout` container, which is what turns the
 * two columns into a single stack on narrow layouts.
 */
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
