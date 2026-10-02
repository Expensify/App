import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import ScreenWrapper from '@components/ScreenWrapper';

import useDocumentTitle from '@hooks/useDocumentTitle';
import {AskConciergeActionsContext, AskConciergeContext} from '@hooks/useIsInAskConcierge';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import {useConciergeSessionActions} from '@pages/inbox/ConciergeSessionContext';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import AskConciergeReport from './AskConciergeReport';
import AskConciergeSidebar from './AskConciergeSidebar';
import useConciergeThreads from './useConciergeThreads';
import {useNewConciergeQuestionRequests} from './NewQuestionStore';

type AskConciergePageProps = BottomTabScreenProps<TabNavigatorParamList, typeof SCREENS.ASK_CONCIERGE>;

function AskConciergePage({navigation}: AskConciergePageProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {resetSession} = useConciergeSessionActions();
    const threads = useConciergeThreads(conciergeReportID);

    // The Concierge chat is the starting point, so the page opens on it until a thread is picked.
    const [selectedReportID, setSelectedReportID] = useState<string>();
    const openReportID = selectedReportID ?? conciergeReportID;

    useDocumentTitle('Concierge');

    const selectThread = (reportID: string) => {
        if (shouldUseNarrowLayout) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
            return;
        }
        setSelectedReportID(reportID);
    };

    const askNewQuestion = () => {
        // A new question starts a new session, so the chat opens on its empty state rather than on the last answer.
        resetSession();

        if (shouldUseNarrowLayout && conciergeReportID) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeReportID));
            return;
        }
        setSelectedReportID(undefined);
    };

    // Pressing the navigation row while the page is open asks for a blank question, which no navigation can deliver.
    const newQuestionRequests = useNewConciergeQuestionRequests();
    const handledNewQuestionRequests = useRef(newQuestionRequests);
    useEffect(() => {
        if (handledNewQuestionRequests.current === newQuestionRequests) {
            return;
        }
        handledNewQuestionRequests.current = newQuestionRequests;
        resetSession();
        setSelectedReportID(undefined);
    }, [newQuestionRequests, resetSession]);

    const sidebar = (
        <AskConciergeSidebar
            threads={threads}
            selectedReportID={selectedReportID}
            onAskNewQuestion={askNewQuestion}
            onSelectThread={selectThread}
        />
    );

    // Sending a question from this page opens its thread here rather than in the Inbox.
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const askConciergeActions = {openConciergeThread: setSelectedReportID};

    return (
        <AskConciergeContext.Provider value>
            <AskConciergeActionsContext.Provider value={askConciergeActions}>
                <ScreenWrapper
                    shouldEnableKeyboardAvoidingView={false}
                    style={styles.appBG}
                    testID="AskConciergePage"
                    bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.ASK_CONCIERGE} />}
                >
                    {shouldUseNarrowLayout ? (
                        sidebar
                    ) : (
                        <View style={[styles.flex1, styles.flexRow]}>
                            <View style={[{width: variables.inboxSideBarWidth}, styles.borderRight]}>{sidebar}</View>
                            <View style={styles.flex1}>
                                {!!openReportID && (
                                    <AskConciergeReport
                                        navigation={navigation}
                                        reportID={openReportID}
                                    />
                                )}
                            </View>
                        </View>
                    )}
                </ScreenWrapper>
            </AskConciergeActionsContext.Provider>
        </AskConciergeContext.Provider>
    );
}

export default AskConciergePage;
