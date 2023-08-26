import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import _ from 'underscore';
import InvertedFlatList from '../../../components/InvertedFlatList';
import compose from '../../../libs/compose';
import styles from '../../../styles/styles';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as Report from '../../../libs/actions/Report';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import {withPersonalDetails} from '../../../components/OnyxProvider';
import ReportActionItem from './ReportActionItem';
import ReportActionItemParentAction from './ReportActionItemParentAction';
import ReportActionsSkeletonView from '../../../components/ReportActionsSkeletonView';
import variables from '../../../styles/variables';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import reportActionPropTypes from './reportActionPropTypes';
import CONST from '../../../CONST';
import reportPropTypes from '../../reportPropTypes';
import useLocalize from '../../../hooks/useLocalize';
import useNetwork from '../../../hooks/useNetwork';
import DateUtils from '../../../libs/DateUtils';
import FloatingMessageCounter from './FloatingMessageCounter';
import useReportScrollManager from '../../../hooks/useReportScrollManager';

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
    const currentUnreadMarker = useRef(null);
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

        if (currentUnreadMarker.current || reportActionSize.current === sortedReportActions.length) {
            return;
        }

        reportActionSize.current = sortedReportActions.length;
        currentUnreadMarker.current = null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedReportActions.length, report.reportID]);

    useEffect(() => {
        const didManuallyMarkReportAsUnread = report.lastReadTime < DateUtils.getDBTime() && ReportUtils.isUnread(report);
        if (!didManuallyMarkReportAsUnread) {
            setMessageManuallyMarked({read: false});
            return;
        }

        // Clearing the current unread marker so that it can be recalculated
        currentUnreadMarker.current = null;
        setMessageManuallyMarked({read: true});

        // We only care when a new lastReadTime is set in the report
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.lastReadTime]);

    /**
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     */
    const handleUnreadFloatingButton = () => {
        if (scrollingVerticalOffset.current > VERTICAL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && !!currentUnreadMarker.current) {
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
     * @param {Object} args
     * @param {Number} args.index
     * @returns {React.Component}
     */
    const renderItem = useCallback(
        ({item: reportAction, index}) => {
            let shouldDisplayNewMarker = false;

            if (!currentUnreadMarker.current) {
                const nextMessage = sortedReportActions[index + 1];
                const isCurrentMessageUnread = isMessageUnread(reportAction, report.lastReadTime);
                shouldDisplayNewMarker = isCurrentMessageUnread && !isMessageUnread(nextMessage, report.lastReadTime);

                if (!messageManuallyMarked.read) {
                    shouldDisplayNewMarker = shouldDisplayNewMarker && reportAction.actorAccountID !== Report.getCurrentUserAccountID();
                }
                const canDisplayMarker = scrollingVerticalOffset.current < MSG_VISIBLE_THRESHOLD ? reportAction.created < userActiveSince.current : true;

                if (!currentUnreadMarker.current && shouldDisplayNewMarker && canDisplayMarker) {
                    currentUnreadMarker.current = reportAction.reportActionID;
                }
            } else {
                shouldDisplayNewMarker = reportAction.reportActionID === currentUnreadMarker.current;
            }

            const shouldDisplayParentAction =
                reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED &&
                ReportUtils.isChatThread(report) &&
                !ReportActionsUtils.isTransactionThread(ReportActionsUtils.getParentReportAction(report));
            const shouldHideThreadDividerLine = sortedReportActions.length > 1 && sortedReportActions[sortedReportActions.length - 2].reportActionID === currentUnreadMarker.current;

            return shouldDisplayParentAction ? (
                <ReportActionItemParentAction
                    shouldHideThreadDividerLine={shouldDisplayParentAction && shouldHideThreadDividerLine}
                    reportID={report.reportID}
                    parentReportID={`${report.parentReportID}`}
                    shouldDisplayNewMarker={shouldDisplayNewMarker}
                />
            ) : (
                <ReportActionItem
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    report={report}
                    action={reportAction}
                    displayAsGroup={ReportActionsUtils.isConsecutiveActionMadeByPreviousActor(sortedReportActions, index)}
                    shouldDisplayNewMarker={shouldDisplayNewMarker}
                    shouldShowSubscriptAvatar={
                        (ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isExpenseReport(report)) &&
                        _.contains([CONST.REPORT.ACTIONS.TYPE.IOU, CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW], reportAction.actionName)
                    }
                    isMostRecentIOUReportAction={reportAction.reportActionID === mostRecentIOUReportActionID}
                    hasOutstandingIOU={hasOutstandingIOU}
                    index={index}
                />
            );
        },
        [report, hasOutstandingIOU, sortedReportActions, mostRecentIOUReportActionID, messageManuallyMarked],
    );

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = [isSmallScreenWidth ? currentUnreadMarker.current : undefined, ReportUtils.isArchivedRoom(report)];
    const hideComposer = ReportUtils.shouldDisableWriteActions(report);
    const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(personalDetailsList, report, currentUserPersonalDetails.accountID) && !isComposerFullSize;

    return (
        <>
            <FloatingMessageCounter
                isActive={isFloatingMessageCounterVisible && !!currentUnreadMarker.current}
                onClick={scrollToBottomAndMarkReportAsRead}
            />
            <Animated.View style={[animatedStyles, styles.flex1, !shouldShowReportRecipientLocalTime && !hideComposer ? styles.pb4 : {}]}>
                <InvertedFlatList
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    ref={reportScrollManager.ref}
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
                />
            </Animated.View>
        </>
    );
}

ReportActionsList.propTypes = propTypes;
ReportActionsList.defaultProps = defaultProps;
ReportActionsList.displayName = 'ReportActionsList';

export default compose(withWindowDimensions, withPersonalDetails(), withCurrentUserPersonalDetails)(ReportActionsList);
