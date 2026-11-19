/** The sidebar of the Concierge page: the user's Concierge conversations, newest activity first, and a button to start a new one. */
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import Header from '@components/Header';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useTabRootScreenWrapperProps from '@components/Navigation/TabBarBottomContent/useTabRootScreenWrapperProps';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';

import useConciergeConversations from '@hooks/useConciergeConversations';
import useCreateConciergeMessageThread from '@hooks/useCreateConciergeMessageThread';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportsParentHierarchy from '@hooks/useReportsParentHierarchy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {getConciergeConversationReportID} from '@libs/isInConciergeConversation';
import closeConciergePage from '@libs/Navigation/helpers/closeConciergePage';

import {loadConciergeThreads, openConciergeConversation} from '@userActions/ConciergeThreads';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';

import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import {ConciergeMessageRow, ConciergeThreadRow} from './ConciergeConversationRows';

// Loads the next page when the user is within three quarters of a screen of the end of the list
const LOAD_NEXT_PAGE_THRESHOLD = 0.75;

function ConciergeSidebarScreen() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const tabRootScreenWrapperProps = useTabRootScreenWrapperProps(NAVIGATION_TABS.CONCIERGE);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // The cursor of the page already asked for, so a list end reached twice doesn't load that page twice
    const requestedCursorRef = useRef<string | undefined>(undefined);
    const reloadFirstPage = () => {
        requestedCursorRef.current = undefined;
        loadConciergeThreads();
    };
    const {isOffline} = useNetwork({onReconnect: reloadFirstPage});
    const conversations = useConciergeConversations();

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [nextCursor] = useOnyx(ONYXKEYS.CONCIERGE_THREADS_NEXT_CURSOR);
    const [isLoading = false] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_CONCIERGE_THREADS);
    const createConciergeMessageThread = useCreateConciergeMessageThread();
    const {currentReportID} = useCurrentReportIDState();
    const currentReportParentHierarchy = useReportsParentHierarchy(currentReportID);
    const selectedConversationReportID = getConciergeConversationReportID(currentReportID, conciergeReportID, currentReportParentHierarchy);

    // The first page is loaded once per mount, so a second effect run doesn't send the request again
    const hasLoadedFirstPageRef = useRef(false);
    useEffect(() => {
        if (hasLoadedFirstPageRef.current) {
            return;
        }
        hasLoadedFirstPageRef.current = true;
        loadConciergeThreads();
    }, []);

    const loadNextPage = () => {
        if (!nextCursor || isLoading || isOffline || requestedCursorRef.current === nextCursor) {
            return;
        }
        requestedCursorRef.current = nextCursor;
        loadConciergeThreads(nextCursor);
    };

    const navigation = useNavigation();
    const goBack = () => {
        if (navigation.getState()?.index) {
            navigation.goBack();
            return;
        }
        closeConciergePage(ROUTES.HOME);
    };

    const startNewChat = () => {
        openConciergeConversation(conciergeReportID);
    };

    const openMessage = (message: ReportAction) => {
        openConciergeConversation(createConciergeMessageThread(message));
    };

    const newChatButton = (
        <Button
            size={CONST.BUTTON_SIZE.SMALL}
            onPress={startNewChat}
            sentryLabel={CONST.SENTRY_LABEL.CONCIERGE_SIDEBAR.NEW_CHAT}
        >
            <Button.Icon src={icons.Plus} />
            <Button.Text>{translate('common.new')}</Button.Text>
        </Button>
    );

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            style={styles.sidebar}
            testID="ConciergeSidebarScreen"
            // eslint-disable-next-line react/jsx-props-no-spreading -- The tab root wrapper props are shared by every tab root screen
            {...(shouldUseNarrowLayout ? {} : tabRootScreenWrapperProps)}
        >
            {shouldUseNarrowLayout ? (
                <Header>
                    <Header.BackButton onPress={goBack} />
                    <Header.Title title={translate('common.concierge.title')} />
                    <Header.Right>
                        <Header.Actions>{newChatButton}</Header.Actions>
                    </Header.Right>
                </Header>
            ) : (
                <TopBarWithLoadingBar
                    breadcrumbLabel={translate('common.concierge.title')}
                    shouldDisplaySearch={false}
                >
                    {/* The top bar keeps a 12px right margin of its own, so 8px here lands the button 20px from the edge. */}
                    <View style={styles.mr2}>{newChatButton}</View>
                </TopBarWithLoadingBar>
            )}
            <View style={styles.flex1}>
                {isLoading && conversations.length === 0 ? (
                    <OptionsListSkeletonView shouldAnimate />
                ) : (
                    <FlashList
                        data={conversations}
                        contentContainerStyle={styles.pt1}
                        keyExtractor={(conversation) => conversation.key}
                        extraData={selectedConversationReportID}
                        renderItem={({item}) =>
                            'reportID' in item ? (
                                <ConciergeThreadRow
                                    reportID={item.reportID}
                                    isSelected={item.reportID === selectedConversationReportID}
                                    onPress={openConciergeConversation}
                                />
                            ) : (
                                <ConciergeMessageRow
                                    reportActionID={item.reportActionID}
                                    created={item.lastActivity}
                                    onPress={openMessage}
                                />
                            )
                        }
                        onEndReached={loadNextPage}
                        onEndReachedThreshold={LOAD_NEXT_PAGE_THRESHOLD}
                        ListFooterComponent={isLoading && !isOffline ? <ActivityIndicator style={styles.pv4} /> : undefined}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

export default ConciergeSidebarScreen;
