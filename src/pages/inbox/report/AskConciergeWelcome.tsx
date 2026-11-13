import ScrollView from '@components/ScrollView';

import useIsConciergeNewChatOnly from '@hooks/useIsConciergeNewChatOnly';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
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
    const isConciergeNewChatOnly = useIsConciergeNewChatOnly();
    const isInSidePanel = useIsInSidePanel();

    return (
        <ScrollView
            style={[!shouldUseNarrowLayout && !isInSidePanel && styles.flexGrow0, styles.conciergeAskColumn]}
            // Without a history button under the welcome text, the text keeps the same gap from the composer on its own
            contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, isConciergeNewChatOnly && styles.pb8]}
            keyboardShouldPersistTaps="handled"
            onLayout={() => markOpenReportEnd(reportID, report, {warm: true})}
        >
            <AskConciergeEmptyState />
            {!isConciergeNewChatOnly && (
                <ConciergeChatHistoryToggle
                    isHistoryShown={false}
                    onPress={onShowPreviousMessages}
                    containerStyles={styles.pv5}
                />
            )}
        </ScrollView>
    );
}

export default AskConciergeWelcome;
