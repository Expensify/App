/**
 * Lays out connection cards in as many columns as fit, up to three, and stacks them on narrow and medium screens.
 */
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ConnectionListing} from './types';

import AccountingIntegrationWaitlistCard from './AccountingIntegrationWaitlistCard';
import ConnectionCard from './ConnectionCard';
import ExactOnlineWaitlistCard from './ExactOnlineWaitlistCard';

// Invisible fillers take the empty slots of the last row so its cards keep their column width
const FILLER_COUNT = 2;

type ConnectionsGridProps = {
    listings: ConnectionListing[];
    policyID?: string;
};

function ConnectionsGrid({listings, policyID}: ConnectionsGridProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    // Medium screens can leave less than a card's minimum width once both navigation panes are shown
    const shouldStackCards = shouldUseNarrowLayout || isMediumScreenWidth;
    const waitlistConnectionNames = CONST.POLICY.CONNECTIONS.WAITLIST_CONNECTION_NAMES;

    return (
        <View style={styles.connectionsGrid}>
            {listings.map((listing) => {
                if (listing.key === CONST.POLICY.CONNECTIONS.NAME.EXACT_ONLINE) {
                    return (
                        <ExactOnlineWaitlistCard
                            key={listing.key}
                            policyID={policyID}
                        />
                    );
                }
                const waitlistConnectionName = waitlistConnectionNames.find((name) => name === listing.key);
                if (waitlistConnectionName) {
                    // A waitlist signup belongs to a workspace, so there is nothing to join without one
                    if (!policyID) {
                        return null;
                    }
                    return (
                        <AccountingIntegrationWaitlistCard
                            key={listing.key}
                            connectionName={waitlistConnectionName}
                            title={listing.title}
                            icon={listing.icon}
                            policyID={policyID}
                            shouldUseFullWidth={shouldStackCards}
                        />
                    );
                }
                return (
                    <ConnectionCard
                        key={listing.key}
                        listing={listing}
                        shouldUseFullWidth={shouldStackCards}
                    />
                );
            })}
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
