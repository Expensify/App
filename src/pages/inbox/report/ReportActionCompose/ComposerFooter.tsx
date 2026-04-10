import React from 'react';
import {View} from 'react-native';
import OfflineIndicator from '@components/OfflineIndicator';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import AgentZeroAwareTypingIndicator from './AgentZeroAwareTypingIndicator';
import ComposerExceededLength from './ComposerExceededLength';

type ComposerFooterProps = {
    reportID: string;
};

function ComposerFooter({reportID}: ComposerFooterProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();

    return (
        <View
            style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, (!isSmallScreenWidth || (isSmallScreenWidth && !isOffline)) && styles.chatItemComposeSecondaryRow]}
        >
            {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            <AgentZeroAwareTypingIndicator reportID={reportID} />
            <ComposerExceededLength />
        </View>
    );
}

export default ComposerFooter;
