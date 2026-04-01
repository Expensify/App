import React from 'react';
import {View} from 'react-native';
import ExceededCommentLength from '@components/ExceededCommentLength';
import OfflineIndicator from '@components/OfflineIndicator';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import AgentZeroAwareTypingIndicator from './AgentZeroAwareTypingIndicator';

type ComposerFooterProps = {
    reportID: string;
    exceededMaxLength: number | null;
    hasExceededMaxTaskTitleLength: boolean;
    isOffline: boolean;
};

function ComposerFooter({reportID, exceededMaxLength, hasExceededMaxTaskTitleLength, isOffline}: ComposerFooterProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();

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
