import ScrollView from '@components/ScrollView';

import useConciergeAskState from '@hooks/useConciergeAskState';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import AskConciergeEmptyState from './AskConciergeEmptyState';
import ConciergeChatHistoryToggle from './ConciergeChatHistoryToggle';

type AskConciergeWelcomeProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Whether the chat has earlier messages to show */
    hasPreviousMessages: boolean;

    /** Called when the user presses `View chat history` */
    onShowPreviousMessages: () => void;
};

function AskConciergeWelcome({reportID, hasPreviousMessages, onShowPreviousMessages}: AskConciergeWelcomeProps) {
    const styles = useThemeStyles();
    const {shouldCenterWelcomeWithComposer} = useConciergeAskState(reportID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    return (
        <ScrollView
            style={[shouldCenterWelcomeWithComposer && styles.flexGrow0, styles.conciergeAskColumn]}
            contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, !hasPreviousMessages && styles.pb5]}
            keyboardShouldPersistTaps="handled"
            onLayout={() => markOpenReportEnd(reportID, report, {warm: true})}
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
