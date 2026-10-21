import ScrollView from '@components/ScrollView';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsCard} from '@src/types/onyx';

import React, {Fragment} from 'react';
import {View} from 'react-native';

import InsightsAICard from './InsightsAICard';

type InsightsAICardRowProps = {
    cards: InsightsCard[] | undefined;
};

function InsightsAICardRow({cards}: InsightsAICardRowProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {pageGutter, pageGutterEdgeToEdge} = useLayoutSpacing();

    if (!cards?.length) {
        return null;
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[pageGutterEdgeToEdge, shouldUseNarrowLayout ? styles.pv5 : styles.pv10]}
            contentContainerStyle={pageGutter}
        >
            {cards.map((card, index) => (
                <Fragment key={card.text}>
                    {index > 0 && <View style={[styles.borderLeft, shouldUseNarrowLayout ? styles.mh8 : styles.mh5]} />}
                    <InsightsAICard card={card} />
                </Fragment>
            ))}
        </ScrollView>
    );
}

export default InsightsAICardRow;
