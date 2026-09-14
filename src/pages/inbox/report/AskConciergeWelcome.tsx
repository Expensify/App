import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

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

    return (
        <View style={styles.conciergeAskColumn}>
            <AskConciergeEmptyState />
            <ConciergeChatHistoryToggle
                reportID={reportID}
                hasPreviousMessages={hasPreviousMessages}
                shouldShowFullHistory={false}
                onShowPreviousMessages={onShowPreviousMessages}
                containerStyles={styles.pv5}
            />
        </View>
    );
}

export default AskConciergeWelcome;
