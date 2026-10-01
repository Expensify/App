/**
 * Lays out connection cards in one column on narrow and medium screens, two on wide ones, and three on very wide ones.
 */
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

import type {ConnectionListing} from './types';

import ConnectionCard from './ConnectionCard';

type ConnectionsGridProps = {
    listings: ConnectionListing[];
};

function ConnectionsGrid({listings}: ConnectionsGridProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    let columnCount = 2;
    if (shouldUseNarrowLayout || isMediumScreenWidth) {
        columnCount = 1;
    } else if (windowWidth > variables.connectionsThreeColumnBreakpoint) {
        columnCount = 3;
    }

    // Invisible fillers complete the last row so its cards keep their column width
    const fillerCount = (columnCount - (listings.length % columnCount)) % columnCount;

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.gap3]}>
            {listings.map((listing) => (
                <ConnectionCard
                    key={listing.key}
                    listing={listing}
                    columnCount={columnCount}
                />
            ))}
            {Array.from({length: fillerCount}, (_, index) => (
                <View
                    key={index}
                    aria-hidden
                    accessibilityElementsHidden
                    style={[
                        styles.workspaceSectionMoreFeaturesItem,
                        styles.p0,
                        styles.mt0,
                        StyleUtils.getMinimumWidth(0),
                        columnCount === 3 && styles.connectionCardThreeColumns,
                        styles.visibilityHidden,
                        styles.bgTransparent,
                    ]}
                />
            ))}
        </View>
    );
}

export default ConnectionsGrid;
