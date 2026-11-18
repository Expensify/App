import ScrollView from '@components/ScrollView';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import {hasHoverSupport} from '@libs/DeviceCapabilities';

import CONST from '@src/CONST';
import type {AIInsight, InsightsScope} from '@src/types/onyx';

import type {ReactElement} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React, {Fragment} from 'react';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

import InsightsAICard from './InsightsAICard';
import InsightsAILoadingIndicator from './InsightsAILoadingIndicator';

const MAX_CARD_COUNT = 4;
const CARDS_PER_ROW_ON_MEDIUM_SCREEN = 2;
const ENTERING_CARDS = FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION);
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

    const isLoading = insights === undefined && !hasFailedToLoad && !isOffline;

    if (isLoading) {
        return (
            <Animated.View
                key={insightsScope.searchKey}
                exiting={isReducedMotionEnabled ? undefined : EXITING_LOADER}
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

    const renderSlot = (card: ReactElement | undefined, index: number, slotStyle: StyleProp<ViewStyle>) => (
        <Fragment key={card?.key ?? `empty-${index}`}>
            {index > 0 && <View style={[styles.borderLeft, shouldUseNarrowLayout ? styles.mh8 : [styles.ml6, styles.mr6], !card && StyleUtils.getBorderColorStyle(theme.transparent)]} />}
            <View style={slotStyle}>{card}</View>
        </Fragment>
    );

    if (shouldUseNarrowLayout) {
        return (
            <Animated.View
                key="cards"
                entering={isReducedMotionEnabled ? undefined : ENTERING_CARDS}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={hasHoverSupport()}
                    style={[pageGutterEdgeToEdge, styles.pv5]}
                    contentContainerStyle={pageGutter}
                >
                    {cards.map((card, index) => renderSlot(card, index, styles.insightsAICard))}
                </ScrollView>
            </Animated.View>
        );
    }

    const cardsPerRow = isMediumScreenWidth ? CARDS_PER_ROW_ON_MEDIUM_SCREEN : MAX_CARD_COUNT;
    const rows = Array.from({length: Math.ceil(cards.length / cardsPerRow)}, (row, rowIndex) => cards.slice(rowIndex * cardsPerRow, (rowIndex + 1) * cardsPerRow));

    return (
        <Animated.View
            key="cards"
            entering={isReducedMotionEnabled ? undefined : ENTERING_CARDS}
            style={[styles.pv10, styles.gap8]}
        >
            {rows.map((row) => (
                <View
                    key={row.at(0)?.key}
                    style={styles.flexRow}
                >
                    {Array.from({length: cardsPerRow}, (slot, index) => renderSlot(row.at(index), index, [styles.flex1, styles.mnw0]))}
                </View>
            ))}
        </Animated.View>
    );
}

export default InsightsAICardRow;
