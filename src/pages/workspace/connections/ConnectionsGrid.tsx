/**
 * Lays out connection cards in as many columns as fit, up to three, and stacks them on narrow and medium screens.
 */
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type {ConnectionListing} from './types';

import ConnectionCard from './ConnectionCard';

// Invisible fillers take the empty slots of the last row so its cards keep their column width
const FILLER_COUNT = 2;

type ConnectionsGridProps = {
    listings: ConnectionListing[];
};

function ConnectionsGrid({listings}: ConnectionsGridProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    // Medium screens can leave less than a card's minimum width once both navigation panes are shown
    const shouldStackCards = shouldUseNarrowLayout || isMediumScreenWidth;

    return (
        <View style={styles.connectionsGrid}>
            {listings.map((listing) => (
                <ConnectionCard
                    key={listing.key}
                    listing={listing}
                    shouldUseFullWidth={shouldStackCards}
                />
            ))}
            {!shouldStackCards &&
                Array.from({length: FILLER_COUNT}, (_, index) => (
                    <View
                        key={index}
                        aria-hidden
                        accessibilityElementsHidden
                        style={[styles.workspaceSectionMoreFeaturesItem, styles.connectionCard, styles.p0, styles.mt0, styles.visibilityHidden, styles.bgTransparent]}
                    />
                ))}
        </View>
    );
}

export default ConnectionsGrid;
