import ScrollView from '@components/ScrollView';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import AskConciergeEmptyState from './AskConciergeEmptyState';
import ConciergeChatHistoryToggle from './ConciergeChatHistoryToggle';

type AskConciergeWelcomeProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Whether there are messages from before this session */
    hasPreviousMessages: boolean;

    /** Called when the user presses `View chat history` */
    onShowPreviousMessages: () => void;
};

function AskConciergeWelcome({reportID, hasPreviousMessages, onShowPreviousMessages}: AskConciergeWelcomeProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <ScrollView
            style={[shouldUseNarrowLayout ? styles.flex1 : styles.flexShrink1, styles.conciergeAskColumn]}
            contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter]}
            keyboardShouldPersistTaps="handled"
        >
            <AskConciergeEmptyState />
            <ConciergeChatHistoryToggle
                reportID={reportID}
                hasPreviousMessages={hasPreviousMessages}
                shouldShowFullHistory={false}
                onShowPreviousMessages={onShowPreviousMessages}
                containerStyles={styles.pv5}
            />
        </ScrollView>
    );
}

export default AskConciergeWelcome;
