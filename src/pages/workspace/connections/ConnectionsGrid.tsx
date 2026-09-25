/**
 * Lays out connection cards in two columns on wide screens and one column on narrow ones.
 */
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type {ConnectionListing} from './types';

import ConnectionCard from './ConnectionCard';

type ConnectionsGridProps = {
    listings: ConnectionListing[];
};

function ConnectionsGrid({listings}: ConnectionsGridProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // An odd number of cards gets an invisible filler so the last card keeps its column width
    const needsFiller = !shouldUseNarrowLayout && listings.length % 2 === 1;

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.columnGap3]}>
            {listings.map((listing) => (
                <ConnectionCard
                    key={listing.key}
                    listing={listing}
                />
            ))}
            {needsFiller && (
                <View
                    aria-hidden
                    accessibilityElementsHidden
                    style={[styles.workspaceSectionMoreFeaturesItem, styles.p0, styles.visibilityHidden, styles.bgTransparent]}
                />
            )}
        </View>
    );
}

export default ConnectionsGrid;
