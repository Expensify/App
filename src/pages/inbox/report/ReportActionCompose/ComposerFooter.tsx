import React from 'react';
import {View} from 'react-native';
import ExceededCommentLength from '@components/ExceededCommentLength';
import OfflineIndicator from '@components/OfflineIndicator';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import AgentZeroAwareTypingIndicator from './AgentZeroAwareTypingIndicator';
import {useComposerSendState} from './ComposerContext';

type ComposerFooterProps = {
    reportID: string;
};

function ComposerFooter({reportID}: ComposerFooterProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const {exceededMaxLength, hasExceededMaxTaskTitleLength} = useComposerSendState();

    return (
        <View
            style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, (!isSmallScreenWidth || (isSmallScreenWidth && !isOffline)) && styles.chatItemComposeSecondaryRow]}
        >
            {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            <AgentZeroAwareTypingIndicator reportID={reportID} />
            {!!exceededMaxLength && (
                <ExceededCommentLength
                    maxCommentLength={exceededMaxLength}
                    isTaskTitle={hasExceededMaxTaskTitleLength}
                />
            )}
        </View>
    );
}

export default ComposerFooter;
