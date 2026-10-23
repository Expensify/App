import ScrollView from '@components/ScrollView';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {AIInsight} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React, {Fragment} from 'react';
import {View} from 'react-native';

import InsightsAICard from './InsightsAICard';
import InsightsAICardSkeleton from './InsightsAICardSkeleton';

const SKELETON_CARD_COUNT = 4;

type InsightsAICardRowProps = {
    insights: AIInsight[] | undefined;

    /** Whether the dashboard has no response for the current filters yet */
    isLoading: boolean;
};

/** Shows the AI insights in a sideways-scrolling row, with placeholders while the dashboard loads. */
function InsightsAICardRow({insights, isLoading}: InsightsAICardRowProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {pageGutter, pageGutterEdgeToEdge} = useLayoutSpacing();

    if (!isLoading && !insights?.length) {
        return null;
    }

    const renderWithDivider = (content: ReactNode, index: number) => (
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
                ? Array.from({length: SKELETON_CARD_COUNT}, (item, index) => renderWithDivider(<InsightsAICardSkeleton />, index))
                : insights?.map((insight, index) => renderWithDivider(<InsightsAICard insight={insight} />, index))}
        </ScrollView>
    );
}

export default InsightsAICardRow;
