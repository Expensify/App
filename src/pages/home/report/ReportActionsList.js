import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import _ from 'underscore';
import CONST from '../../../CONST';
import InvertedFlatList from '../../../components/InvertedFlatList';
import {withPersonalDetails} from '../../../components/OnyxProvider';
import ReportActionsSkeletonView from '../../../components/ReportActionsSkeletonView';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import useLocalize from '../../../hooks/useLocalize';
import useNetwork from '../../../hooks/useNetwork';
import useReportScrollManager from '../../../hooks/useReportScrollManager';
import DateUtils from '../../../libs/DateUtils';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as Report from '../../../libs/actions/Report';
import compose from '../../../libs/compose';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import reportPropTypes from '../../reportPropTypes';
import FloatingMessageCounter from './FloatingMessageCounter';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import reportActionPropTypes from './reportActionPropTypes';
import useFrozenScroll from "../../../hooks/useFrozenScroll";

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Sorted actions prepared for display */
    sortedReportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)).isRequired,

    /** The ID of the most recent IOU report action connected with the shown report */
    mostRecentIOUReportActionID: PropTypes.string,

    /** Are we loading more report actions? */
    isLoadingMoreReportActions: PropTypes.bool,

    /** Callback executed on list layout */
    onLayout: PropTypes.func.isRequired,

    /** Callback executed on scroll */
    onScroll: PropTypes.func,

    /** Function to load more chats */
    loadMoreChats: PropTypes.func.isRequired,

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    personalDetails: {},
    onScroll: () => {},
    mostRecentIOUReportActionID: '',
    isLoadingMoreReportActions: false,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const VERTICAL_OFFSET_THRESHOLD = 200;
const MSG_VISIBLE_THRESHOLD = 250;

// Seems that there is an architecture issue that prevents us from using the reportID with useRef
// the useRef value gets reset when the reportID changes, so we use a global variable to keep track
let prevReportID = null;

// In the component we are subscribing to the arrival of new actions.
// As there is the possibility that there are multiple instances of a ReportScreen
// for the same report, we only ever want one subscription to be active, as
// the subscriptions could otherwise be conflicting.
const newActionUnsubscribeMap = {};

/**
 * Create a unique key for each action in the FlatList.
 * We use the reportActionID that is a string representation of a random 64-bit int, which should be
 * random enough to avoid collisions
 * @param {Object} item
 * @param {Object} item.action
 * @return {String}
 */
function keyExtractor(item) {
    return item.reportActionID;
}

const maintainVisibleContentPositionOptions = {
    minIndexForVisible: 1,
}

function isMessageUnread(message, lastReadTime) {
    return Boolean(message && lastReadTime && message.created && lastReadTime < message.created);
}

function ReportActionsList({
    report,
    sortedReportActions,
    windowHeight,
    onScroll,
    mostRecentIOUReportActionID,
    isSmallScreenWidth,
    personalDetailsList,
    currentUserPersonalDetails,
    hasOutstandingIOU,
    loadMoreChats,
    onLayout,
    isComposerFullSize,
}) {
    const reportScrollManager = useReportScrollManager();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const opacity = useSharedValue(0);
    const userActiveSince = useRef(null);
    const [currentUnreadMarker, setCurrentUnreadMarker] = useState(null);
    const scrollingVerticalOffset = useRef(0);
    const readActionSkipped = useRef(false);
    const reportActionSize = useRef(sortedReportActions.length);

    // Considering that renderItem is enclosed within a useCallback, marking it as "read" twice will retain the value as "true," preventing the useCallback from re-executing.
    // However, if we create and listen to an object, it will lead to a new useCallback execution.
    const [messageManuallyMarked, setMessageManuallyMarked] = useState({read: false});
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(false);
    const animatedStyles = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    useEffect(() => {
        opacity.value = withTiming(1, {duration: 100});
    }, [opacity]);
    const [skeletonViewHeight, setSkeletonViewHeight] = useState(0);
    const {shouldFreezeScroll} = useFrozenScroll();

    useEffect(() => {
        // If the reportID changes, we reset the userActiveSince to null, we need to do it because
        // the parent component is sending the previous reportID even when the user isn't active
        // on the report
        if (userActiveSince.current && prevReportID && prevReportID !== report.reportID) {
            userActiveSince.current = null;
        } else {
            userActiveSince.current = DateUtils.getDBTime();
        }
        prevReportID = report.reportID;
    }, [report.reportID]);

    useEffect(() => {
        if (!userActiveSince.current || report.reportID !== prevReportID) {
            return;
        }

        if (ReportUtils.isUnread(report)) {
            if (scrollingVerticalOffset.current < MSG_VISIBLE_THRESHOLD) {
                Report.readNewestAction(report.reportID);
            } else {
                readActionSkipped.current = true;
            }
        }

        if (currentUnreadMarker || reportActionSize.current === sortedReportActions.length) {
            return;
        }

        reportActionSize.current = sortedReportActions.length;
        setCurrentUnreadMarker(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedReportActions.length, report.reportID]);

    useEffect(() => {
        const didManuallyMarkReportAsUnread = report.lastReadTime < DateUtils.getDBTime() && ReportUtils.isUnread(report);
        if (!didManuallyMarkReportAsUnread) {
            setMessageManuallyMarked({read: false});
            return;
        }

        // Clearing the current unread marker so that it can be recalculated
        setCurrentUnreadMarker(null);
        setMessageManuallyMarked({read: true});

        // We only care when a new lastReadTime is set in the report
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.lastReadTime]);

    useEffect(() => {
        // Why are we doing this, when in the cleanup of the useEffect we are already calling the unsubscribe function?
        // Answer: On web, when navigating to another report screen, the previous report screen doesn't get unmounted,
        //         meaning that the cleanup might not get called. When we then open a report we had open already previosuly, a new
        //         ReportScreen will get created. Thus, we have to cancel the earlier subscription of the previous screen,
        //         because the two subscriptions could conflict!
        //         In case we return to the previous screen (e.g. by web back navigation) the useEffect for that screen would
        //         fire again, as the focus has changed and will set up the subscription correctly again.
        const previousSubUnsubscribe = newActionUnsubscribeMap[report.reportID];
        if (previousSubUnsubscribe) {
            previousSubUnsubscribe();
        }

        // This callback is triggered when a new action arrives via Pusher and the event is emitted from Report.js. This allows us to maintain
        // a single source of truth for the "new action" event instead of trying to derive that a new action has appeared from looking at props.
        const unsubscribe = Report.subscribeToNewActionEvent(report.reportID, (isFromCurrentUser) => {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
            // they are now in the list.
            if (!isFromCurrentUser) {
                return;
            }
            reportScrollManager.scrollToBottom();
        });

        const cleanup = () => {
            if (unsubscribe) {
                unsubscribe();
            }
            Report.unsubscribeFromReportChannel(report.reportID);
        };

        newActionUnsubscribeMap[report.reportID] = cleanup;

        return cleanup;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.reportID]);

    /**
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     */
    const handleUnreadFloatingButton = () => {
        if (scrollingVerticalOffset.current > VERTICAL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && !!currentUnreadMarker) {
            setIsFloatingMessageCounterVisible(true);
        }

        if (scrollingVerticalOffset.current < VERTICAL_OFFSET_THRESHOLD && isFloatingMessageCounterVisible) {
            if (readActionSkipped.current) {
                readActionSkipped.current = false;
                Report.readNewestAction(report.reportID);
            }
            setIsFloatingMessageCounterVisible(false);
        }
    };

    const trackVerticalScrolling = (event) => {
        scrollingVerticalOffset.current = event.nativeEvent.contentOffset.y;
        handleUnreadFloatingButton();
        onScroll(event);
    };

    const scrollToBottomAndMarkReportAsRead = () => {
        reportScrollManager.scrollToBottom();
        readActionSkipped.current = false;
        Report.readNewestAction(report.reportID);
    };

    /**
     * Calculates the ideal number of report actions to render in the first render, based on the screen height and on
     * the height of the smallest report action possible.
     * @return {Number}
     */
    const initialNumToRender = useMemo(() => {
        const minimumReportActionHeight = styles.chatItem.paddingTop + styles.chatItem.paddingBottom + variables.fontSizeNormalHeight;
        const availableHeight = windowHeight - (CONST.CHAT_FOOTER_MIN_HEIGHT + variables.contentHeaderHeight);
        return Math.ceil(availableHeight / minimumReportActionHeight);
    }, [windowHeight]);

    /**
     * Thread's divider line should hide when the first chat in the thread is marked as unread.
     * This is so that it will not be conflicting with header's separator line.
     */
    const shouldHideThreadDividerLine = useMemo(
        () => sortedReportActions.length > 1 && sortedReportActions[sortedReportActions.length - 2].reportActionID === currentUnreadMarker,
        [sortedReportActions, currentUnreadMarker],
    );

    /**
     * @param {Object} args
     * @param {Number} args.index
     * @returns {React.Component}
     */
    const renderItem = useCallback(
        ({item: reportAction, index}) => {
            let shouldDisplayNewMarker = false;

            if (!currentUnreadMarker) {
                const nextMessage = sortedReportActions[index + 1];
                const isCurrentMessageUnread = isMessageUnread(reportAction, report.lastReadTime);
                shouldDisplayNewMarker = isCurrentMessageUnread && !isMessageUnread(nextMessage, report.lastReadTime);

                if (!messageManuallyMarked.read) {
                    shouldDisplayNewMarker = shouldDisplayNewMarker && reportAction.actorAccountID !== Report.getCurrentUserAccountID();
                }
                const canDisplayMarker = scrollingVerticalOffset.current < MSG_VISIBLE_THRESHOLD ? reportAction.created < userActiveSince.current : true;

                if (!currentUnreadMarker && shouldDisplayNewMarker && canDisplayMarker) {
                    setCurrentUnreadMarker(reportAction.reportActionID);
                }
            } else {
                shouldDisplayNewMarker = reportAction.reportActionID === currentUnreadMarker;
            }
            return (
                <ReportActionsListItemRenderer
                    reportAction={reportAction}
                    index={index}
                    report={report}
                    hasOutstandingIOU={hasOutstandingIOU}
                    sortedReportActions={sortedReportActions}
                    mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    shouldDisplayNewMarker={shouldDisplayNewMarker}
                />
            );
        },
        [report, hasOutstandingIOU, sortedReportActions, mostRecentIOUReportActionID, messageManuallyMarked, shouldHideThreadDividerLine, currentUnreadMarker],
    );

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = [isSmallScreenWidth ? currentUnreadMarker : undefined, ReportUtils.isArchivedRoom(report)];
    const hideComposer = ReportUtils.shouldDisableWriteActions(report);
    const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(personalDetailsList, report, currentUserPersonalDetails.accountID) && !isComposerFullSize;

    return (
        <>
            <FloatingMessageCounter
                isActive={isFloatingMessageCounterVisible && !!currentUnreadMarker}
                onClick={scrollToBottomAndMarkReportAsRead}
            />
            <Animated.View style={[animatedStyles, styles.flex1, !shouldShowReportRecipientLocalTime && !hideComposer ? styles.pb4 : {}]}>
                <InvertedFlatList
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    ref={reportScrollManager.ref}
                    style={styles.overscrollBehaviorContain}
                    data={sortedReportActions}
                    renderItem={renderItem}
                    contentContainerStyle={styles.chatContentScrollView}
                    keyExtractor={keyExtractor}
                    initialRowHeight={32}
                    initialNumToRender={initialNumToRender}
                    onEndReached={loadMoreChats}
                    onEndReachedThreshold={0.75}
                    ListFooterComponent={() => {
                        if (report.isLoadingMoreReportActions) {
                            return <ReportActionsSkeletonView containerHeight={CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT * 3} />;
                        }

                        // Make sure the oldest report action loaded is not the first. This is so we do not show the
                        // skeleton view above the created action in a newly generated optimistic chat or one with not
                        // that many comments.
                        const lastReportAction = _.last(sortedReportActions) || {};
                        if (report.isLoadingReportActions && lastReportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
                            return (
                                <ReportActionsSkeletonView
                                    containerHeight={skeletonViewHeight}
                                    animate={!isOffline}
                                />
                            );
                        }

                        return null;
                    }}
                    keyboardShouldPersistTaps="handled"
                    onLayout={(event) => {
                        setSkeletonViewHeight(event.nativeEvent.layout.height);
                        onLayout(event);
                    }}
                    onScroll={trackVerticalScrolling}
                    extraData={extraData}
                    maintainVisibleContentPosition={shouldFreezeScroll ? maintainVisibleContentPositionOptions : null}
                />
            </Animated.View>
        </>
    );
}

ReportActionsList.propTypes = propTypes;
ReportActionsList.defaultProps = defaultProps;
ReportActionsList.displayName = 'ReportActionsList';

export default compose(withWindowDimensions, withPersonalDetails(), withCurrentUserPersonalDetails)(ReportActionsList);
