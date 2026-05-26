import React from 'react';
import OfflineIndicator from '@components/OfflineIndicator';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import AgentZeroAwareTypingIndicator from './AgentZeroAwareTypingIndicator';
import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import type {ReportActionComposeProps} from './ReportActionComposeTypes';

function ReportActionComposeDefaultFooter({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <ComposerFooter>
            {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            <AgentZeroAwareTypingIndicator reportID={reportID} />
            <ComposerExceededLength />
        </ComposerFooter>
    );
}

export default ReportActionComposeDefaultFooter;
