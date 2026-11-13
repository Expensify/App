/** The sidebar of the Concierge page: the user's Concierge conversations, newest activity first, and a button to start a new one. */
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useTabRootScreenWrapperProps from '@components/Navigation/TabBarBottomContent/useTabRootScreenWrapperProps';
import TopBar from '@components/Navigation/TopBar';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';

import useConciergeConversations from '@hooks/useConciergeConversations';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {ConciergeSplitNavigatorParamList} from '@libs/Navigation/types';
import {getParticipantsPersonalDetails} from '@libs/PersonalDetailsUtils';

import {loadConciergeThreads, openConciergeConversation, openConciergeMessage} from '@userActions/ConciergeThreads';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {ReportAction} from '@src/types/onyx';

import type {NavigationState} from '@react-navigation/native';

import {useNavigationState} from '@react-navigation/native';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {getStableReportSelector} from '@selectors/Report';
import {FlashList} from '@shopify/flash-list';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import ConciergeConversationRow from './ConciergeConversationRow';

// Loads the next page when the user is within three quarters of a screen of the end of the list
const LOAD_NEXT_PAGE_THRESHOLD = 0.75;

function getOpenReportID(state: NavigationState<ConciergeSplitNavigatorParamList>) {
    const reportRoute = state.routes.findLast((route) => route.name === SCREENS.REPORT);
    return reportRoute?.params && 'reportID' in reportRoute.params ? reportRoute.params.reportID : undefined;
}

function ConciergeSidebarScreen() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const tabRootScreenWrapperProps = useTabRootScreenWrapperProps(NAVIGATION_TABS.CONCIERGE);
    // The cursor of the page already asked for, so a list end reached twice doesn't load that page twice
    const requestedCursorRef = useRef<string | undefined>(undefined);
    const reloadFirstPage = () => {
        requestedCursorRef.current = undefined;
        loadConciergeThreads();
    };
    const {isOffline} = useNetwork({onReconnect: reloadFirstPage});
    const conversations = useConciergeConversations();
    const openReportID = useNavigationState(getOpenReportID);

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: getStableReportSelector});
    const [nextCursor] = useOnyx(ONYXKEYS.CONCIERGE_THREADS_NEXT_CURSOR);
    const [isLoading = false] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_CONCIERGE_THREADS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const personalDetails = usePersonalDetails();

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

    const startNewChat = () => {
        if (!conciergeReportID) {
            return;
        }
        openConciergeConversation(conciergeReportID);
    };

    const openMessage = (message: ReportAction) => {
        openConciergeMessage({
            message,
            conciergeReport,
            currentUserAccountID,
            introSelected,
            isSelfTourViewed,
            participantsPersonalDetails: getParticipantsPersonalDetails([currentUserAccountID, Number(message.actorAccountID)], personalDetails),
            delegateAccountID,
        });
    };

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            style={styles.sidebar}
            testID="ConciergeSidebarScreen"
            // eslint-disable-next-line react/jsx-props-no-spreading -- The tab root wrapper props are shared by every tab root screen
            {...tabRootScreenWrapperProps}
        >
            <TopBar
                breadcrumbLabel={translate('common.concierge.title')}
                shouldDisplaySearch={false}
            >
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={startNewChat}
                    sentryLabel={CONST.SENTRY_LABEL.CONCIERGE_SIDEBAR.NEW_CHAT}
                >
                    <Button.Icon src={icons.Plus} />
                    <Button.Text>{translate('common.new')}</Button.Text>
                </Button>
            </TopBar>
            <View style={styles.flex1}>
                <FlashList
                    data={conversations}
                    keyExtractor={(conversation) => conversation.key}
                    renderItem={({item}) => (
                        <ConciergeConversationRow
                            conversation={item}
                            isSelected={!!item.reportID && item.reportID === openReportID}
                            onOpenThread={openConciergeConversation}
                            onOpenMessage={openMessage}
                        />
                    )}
                    extraData={openReportID}
                    onEndReached={loadNextPage}
                    onEndReachedThreshold={LOAD_NEXT_PAGE_THRESHOLD}
                    ListFooterComponent={isLoading && !isOffline ? <ActivityIndicator style={styles.pv4} /> : undefined}
                />
            </View>
        </ScreenWrapper>
    );
}

export default ConciergeSidebarScreen;
