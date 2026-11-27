import ScrollView from '@components/ScrollView';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import {hasHoverSupport} from '@libs/DeviceCapabilities';

import {lineHeightScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {AIInsight, InsightsScope} from '@src/types/onyx';

import type {ReactElement} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React, {Fragment} from 'react';
import {View} from 'react-native';
import Animated, {css, cubicBezier, FadeOut} from 'react-native-reanimated';

import InsightsAICard from './InsightsAICard';
import InsightsAILoadingIndicator from './InsightsAILoadingIndicator';

const MAX_CARD_COUNT = 4;
const CARDS_PER_ROW_ON_MEDIUM_SCREEN = 2;
const CARD_REVEAL_STAGGER_MS = 120;
const CARD_ENTER_TRANSLATE_Y = 8;
const CARD_ENTER_EASING = cubicBezier(0.33, 1, 0.68, 1);
const CARD_ENTER_ANIMATION = css.keyframes({
    from: {opacity: 0, transform: [{translateY: CARD_ENTER_TRANSLATE_Y}]},
    to: {opacity: 1, transform: [{translateY: 0}]},
});
const EXITING_LOADER = FadeOut.duration(CONST.SEARCH.ANIMATION.FADE_DURATION);

type InsightsAICardRowProps = {
    insights: AIInsight[] | undefined;

    /** Dashboard filters the insights were written for, sent to Concierge when the user asks to explain. */
    insightsScope: InsightsScope;

    /** Whether the last request for the dashboard failed, so the insights won't arrive */
    hasFailedToLoad: boolean;
};

/** Keeps the generation status visible until the AI insight cards arrive. */
function InsightsAICardRow({insights, insightsScope, hasFailedToLoad}: InsightsAICardRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {pageGutter, pageGutterEdgeToEdge} = useLayoutSpacing();
    const {isOffline} = useNetwork();
    const isReducedMotionEnabled = Accessibility.useReducedMotion();
    const cardsPerRow = isMediumScreenWidth ? CARDS_PER_ROW_ON_MEDIUM_SCREEN : MAX_CARD_COUNT;
    const reservedRowCount = shouldUseNarrowLayout ? 1 : Math.ceil(MAX_CARD_COUNT / cardsPerRow);

    // While loading, reserve the tallest card layout so the loader does not grow when long insights arrive. Loaded cards take their own height to keep the designed spacing.
    const reservedCardHeight =
        styles.defaultBadge.minHeight +
        styles.gap2.gap +
        lineHeightScale.text * variables.insightsAIReservedTextLines +
        styles.gap3.gap +
        lineHeightScale.label * variables.insightsAIReservedTextLines +
        styles.gap5.gap +
        variables.componentSizeSmall;
    const reservedCardsHeight =
        reservedCardHeight * reservedRowCount +
        styles.gap8.gap * (reservedRowCount - 1) +
        (shouldUseNarrowLayout ? styles.pt5.paddingTop + styles.pb7.paddingBottom : 2 * styles.pv5.paddingVertical);
    const reservedLoaderHeight =
        variables.insightsAILoadingAnimationSize +
        styles.mb4.marginBottom +
        lineHeightScale.text +
        styles.mb1.marginBottom +
        lineHeightScale.text * variables.insightsAIReservedTextLines +
        2 * styles.pv12.paddingVertical;
    const reservedHeightStyle = StyleUtils.getMinimumHeight(Math.max(reservedCardsHeight, reservedLoaderHeight));

    const isLoading = insights === undefined && !hasFailedToLoad && !isOffline;

    if (isLoading) {
        return (
            <Animated.View
                key={insightsScope.searchKey}
                exiting={isReducedMotionEnabled ? undefined : EXITING_LOADER}
                style={[reservedHeightStyle, styles.justifyContentCenter]}
            >
                <InsightsAILoadingIndicator searchKey={insightsScope.searchKey} />
            </Animated.View>
        );
    }

    const cards = (insights ?? [])
        // The type requires a chip, but insights persisted from older responses have only text, and the card would crash on them
        .filter((insight) => !!insight.chip)
        .map((insight) => (
            <InsightsAICard
                key={insight.id}
                insight={insight}
                insightsScope={insightsScope}
            />
        ));

    if (!cards.length) {
        return null;
    }

    const renderSlot = (card: ReactElement | undefined, index: number, slotStyle: StyleProp<ViewStyle>, cardIndex = index) => {
        const revealStyle =
            !isReducedMotionEnabled && card
                ? ({
                      animationName: CARD_ENTER_ANIMATION,
                      animationDuration: CONST.SEARCH.ANIMATION.FADE_DURATION,
                      animationDelay: cardIndex * CARD_REVEAL_STAGGER_MS,
                      animationTimingFunction: CARD_ENTER_EASING,
                      animationFillMode: 'both',
                  } as const)
                : undefined;

        return (
            <Fragment key={card?.key ?? `empty-${index}`}>
                {index > 0 && (
                    <Animated.View
                        style={[styles.borderLeft, shouldUseNarrowLayout ? styles.mh8 : [styles.ml6, styles.mr6], !card && StyleUtils.getBorderColorStyle(theme.transparent), revealStyle]}
                    />
                )}
                <Animated.View style={[slotStyle, revealStyle]}>{card}</Animated.View>
            </Fragment>
        );
    };

    if (shouldUseNarrowLayout) {
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={hasHoverSupport()}
                style={[pageGutterEdgeToEdge, styles.pt5, styles.pb7]}
                contentContainerStyle={pageGutter}
            >
                {cards.map((card, index) => renderSlot(card, index, styles.insightsAICard))}
            </ScrollView>
        );
    }

    const rows = Array.from({length: Math.ceil(cards.length / cardsPerRow)}, (row, rowIndex) => cards.slice(rowIndex * cardsPerRow, (rowIndex + 1) * cardsPerRow));

    return (
        <View style={[styles.pv5, styles.gap8]}>
            {rows.map((row, rowIndex) => (
                <View
                    key={row.at(0)?.key}
                    style={styles.flexRow}
                >
                    {Array.from({length: cardsPerRow}, (slot, index) => renderSlot(row.at(index), index, [styles.flex1, styles.mnw0], rowIndex * cardsPerRow + index))}
                </View>
            ))}
        </View>
    );
}

export default InsightsAICardRow;
