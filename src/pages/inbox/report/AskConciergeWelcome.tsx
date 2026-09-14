import ScrollView from '@components/ScrollView';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import AskConciergeEmptyState from './AskConciergeEmptyState';
import ConciergeChatHistoryToggle from './ConciergeChatHistoryToggle';

type AskConciergeWelcomeProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Whether there are messages hidden before the session start */
    hasPreviousMessages: boolean;

    /** Callback to reveal the earlier conversation */
    onShowPreviousMessages: () => void;
};

function AskConciergeWelcome({reportID, hasPreviousMessages, onShowPreviousMessages}: AskConciergeWelcomeProps) {
    const styles = useThemeStyles();

    return (
        <ScrollView
            style={styles.flex1}
            contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter]}
        >
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
        </ScrollView>
    );
}

export default AskConciergeWelcome;
