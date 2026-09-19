import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {isDirectFeed} from '@libs/CardUtils';

import CONST from '@src/CONST';
import type {CombinedCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx/CardFeeds';

import React from 'react';
import {View} from 'react-native';

import WorkspaceCompanyCardsBalanceLabel from './WorkspaceCompanyCardsBalanceLabel';

type WorkspaceCompanyCardsBalanceLabelsProps = {
    /** The currently selected feed, holding the balance data */
    selectedFeed: CombinedCardFeed | undefined;

    /** Name of the selected feed, used to determine whether it is a Plaid (direct) feed */
    feedName: CompanyCardFeedWithDomainID | undefined;
};

function WorkspaceCompanyCardsBalanceLabels({selectedFeed, feedName}: WorkspaceCompanyCardsBalanceLabelsProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // Balance is only available for Plaid-connected (direct) feeds.
    if (!isDirectFeed(feedName)) {
        return null;
    }

    const currentBalance = selectedFeed?.currentBalance;
    const remainingLimit = selectedFeed?.remainingLimit;
    const lastUpdated = selectedFeed?.balanceTimestamp;
    const currency = selectedFeed?.balanceCurrency ?? CONST.CURRENCY.USD;

    // Hide the whole block when the bank returned no balance data at all (e.g. the issuer does not provide it).
    if (typeof currentBalance !== 'number' && typeof remainingLimit !== 'number') {
        return null;
    }

    // On narrow layouts the two stats share the row evenly, so each label takes half the width.
    const labelContainerStyle = shouldUseNarrowLayout ? styles.flex1 : undefined;

    return (
        <View style={[styles.flexRow, styles.ph5, styles.mt2, styles.mb6, shouldUseNarrowLayout ? styles.gap4 : styles.gap96]}>
            <WorkspaceCompanyCardsBalanceLabel
                type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                value={currentBalance}
                lastUpdated={lastUpdated}
                currency={currency}
                containerStyle={labelContainerStyle}
            />
            <WorkspaceCompanyCardsBalanceLabel
                type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                value={remainingLimit}
                lastUpdated={lastUpdated}
                currency={currency}
                containerStyle={labelContainerStyle}
            />
        </View>
    );
}

export default WorkspaceCompanyCardsBalanceLabels;
