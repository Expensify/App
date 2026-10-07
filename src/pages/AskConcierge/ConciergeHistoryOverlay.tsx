import {SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS} from '@components/Navigation/SearchSidebarCollapseStore';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {useConciergeSessionActions} from '@pages/inbox/ConciergeSessionContext';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {StyleSheet} from 'react-native';
import Animated, {SlideInRight} from 'react-native-reanimated';

import AskConciergeSidebar from './AskConciergeSidebar';
import {closeConciergeHistory, useIsConciergeHistoryOpen} from './ConciergeHistoryStore';
import useConciergeThreads from './useConciergeThreads';

/**
 * The Concierge thread list, shown over the Concierge chat where there is no room for it beside the chat.
 *
 * It slides in, but never out: a thread opens by navigating, and the screen it pushes covers this one. Sliding
 * away underneath that push is what made the change read as two separate moves.
 */
function ConciergeHistoryOverlay() {
    const styles = useThemeStyles();
    const isOpen = useIsConciergeHistoryOpen();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const threads = useConciergeThreads(conciergeReportID);
    const {resetSession} = useConciergeSessionActions();

    if (!isOpen) {
        return null;
    }

    return (
        <Animated.View
            entering={SlideInRight.duration(SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS)}
            style={[StyleSheet.absoluteFill, styles.appBG, styles.zIndex10]}
        >
            <AskConciergeSidebar
                threads={threads}
                onBackButtonPress={closeConciergeHistory}
                onAskNewQuestion={() => {
                    // A new question starts a new session, so the chat behind the list opens on its empty state.
                    resetSession();
                    closeConciergeHistory();
                }}
                onSelectThread={(reportID) => {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
                    closeConciergeHistory();
                }}
            />
        </Animated.View>
    );
}

export default ConciergeHistoryOverlay;
