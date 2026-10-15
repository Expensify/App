/** Exact Online's coming-soon card keeps account signup separate from live connector setup. */
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import ExactOnlineWaitlistRow from '@pages/workspace/accounting/ExactOnlineWaitlistRow';

import React from 'react';
import {View} from 'react-native';

type ExactOnlineWaitlistCardProps = {
    policyID?: string;
};

function ExactOnlineWaitlistCard({policyID}: ExactOnlineWaitlistCardProps) {
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
                shouldUseNarrowLayout || isMediumScreenWidth ? [styles.flexBasis100, StyleUtils.getMinimumWidth(0)] : styles.connectionCard,
            ]}
        >
            <ExactOnlineWaitlistRow
                policy={policy}
                style={[styles.pv4, styles.ph4]}
                isBadgeCondensed
            />
        </View>
    );
}

export default ExactOnlineWaitlistCard;
