import ScrollView from '@components/ScrollView';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsCard} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React, {Fragment} from 'react';
import {View} from 'react-native';

import InsightsAICard from './InsightsAICard';
import InsightsAICardSkeleton from './InsightsAICardSkeleton';

const SKELETON_CARD_COUNT = 4;

type InsightsAICardRowProps = {
    cards: InsightsCard[] | undefined;

    /** Whether the dashboard has no response for the current filters yet */
    isLoading: boolean;
};

function InsightsAICardRow({cards, isLoading}: InsightsAICardRowProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {pageGutter, pageGutterEdgeToEdge} = useLayoutSpacing();

    if (!isLoading && !cards?.length) {
        return null;
    }

    // Keyed by position because cards have no ID and their text can repeat
    const renderItem = (content: ReactNode, index: number) => (
        <Fragment key={index}>
            {index > 0 && <View style={[styles.borderLeft, shouldUseNarrowLayout ? styles.mh8 : styles.mh5]} />}
            {content}
        </Fragment>
    );

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[pageGutterEdgeToEdge, shouldUseNarrowLayout ? styles.pv5 : styles.pv10]}
            contentContainerStyle={pageGutter}
        >
            {isLoading
                ? Array.from({length: SKELETON_CARD_COUNT}, (item, index) => renderItem(<InsightsAICardSkeleton />, index))
                : cards?.map((card, index) => renderItem(<InsightsAICard card={card} />, index))}
        </ScrollView>
    );
}

export default InsightsAICardRow;
