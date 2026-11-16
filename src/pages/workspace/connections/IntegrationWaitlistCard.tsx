/** A coming-soon integration's card keeps account signup separate from live connector setup. */
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {WaitlistIntegration} from '@libs/IntegrationWaitlistUtils';

import IntegrationWaitlistRow from '@pages/workspace/accounting/IntegrationWaitlistRow';

import React from 'react';
import {View} from 'react-native';

type IntegrationWaitlistCardProps = {
    integration: WaitlistIntegration;
    policyID?: string;
};

function IntegrationWaitlistCard({integration, policyID}: IntegrationWaitlistCardProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const policy = usePolicy(policyID);

    return (
        <View
            style={[
                styles.workspaceSectionMoreFeaturesItem,
                styles.p0,
                styles.overflowHidden,
                // Uses width, not flexBasis, since native Yoga caches a flexBasis percentage across rotations.
                shouldUseNarrowLayout || isMediumScreenWidth ? [styles.flexBasisAuto, styles.w100, StyleUtils.getMinimumWidth(0)] : styles.connectionCard,
            ]}
        >
            <IntegrationWaitlistRow
                integration={integration}
                policy={policy}
                style={[styles.pv4, styles.ph4]}
                isBadgeCondensed
            />
        </View>
    );
}

export default IntegrationWaitlistCard;
