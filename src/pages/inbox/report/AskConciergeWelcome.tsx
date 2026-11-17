import ScrollView from '@components/ScrollView';

import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import {INITIAL_SCROLL_METRICS, useActionListContext} from '@pages/inbox/ActionListContext';

import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect} from 'react';

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
    const {syncScrollSharedValues} = useActionListContext();

    // This screen replaces the report list, so the header could stay hidden by the list's last scroll with no way
    // to scroll it back in. Dropping that scroll state shows the header again.
    useEffect(() => {
        syncScrollSharedValues(INITIAL_SCROLL_METRICS);
    }, [syncScrollSharedValues]);

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
