import ScrollView from '@components/ScrollView';

import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import AskConciergeEmptyState from './AskConciergeEmptyState';
import ConciergeChatHistoryToggle from './ConciergeChatHistoryToggle';

type AskConciergeWelcomeProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Called when the user presses `View chat history` */
    onShowPreviousMessages: () => void;
};

function AskConciergeWelcome({reportID, onShowPreviousMessages}: AskConciergeWelcomeProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    return (
        <ScrollView
            style={[!shouldUseNarrowLayout && styles.flexGrow0, styles.conciergeAskColumn]}
            contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter]}
            keyboardShouldPersistTaps="handled"
            onLayout={() => markOpenReportEnd(reportID, report, {warm: true})}
        >
            <AskConciergeEmptyState />
            <ConciergeChatHistoryToggle
                isHistoryShown={false}
                onPress={onShowPreviousMessages}
                containerStyles={styles.pv5}
            />
        </ScrollView>
    );
}

export default AskConciergeWelcome;
