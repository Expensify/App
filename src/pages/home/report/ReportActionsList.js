import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import _ from 'underscore';
import InvertedFlatList from '../../../components/InvertedFlatList';
import withDrawerState, {withDrawerPropTypes} from '../../../components/withDrawerState';
import compose from '../../../libs/compose';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import styles from '../../../styles/styles';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as Report from '../../../libs/actions/Report';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import {withNetwork, withPersonalDetails} from '../../../components/OnyxProvider';
import ReportActionItem from './ReportActionItem';
import ReportActionItemParentAction from './ReportActionItemParentAction';
import ReportActionsSkeletonView from '../../../components/ReportActionsSkeletonView';
import variables from '../../../styles/variables';
import participantPropTypes from '../../../components/participantPropTypes';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import reportActionPropTypes from './reportActionPropTypes';
import CONST from '../../../CONST';
import reportPropTypes from '../../reportPropTypes';
import networkPropTypes from '../../../components/networkPropTypes';
import withLocalize from '../../../components/withLocalize';
import DateUtils from '../../../libs/DateUtils';
import FloatingMessageCounter from './FloatingMessageCounter';

const propTypes = {
    /** Position of the "New" line marker */
    newMarkerReportActionID: PropTypes.string,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

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

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withDrawerPropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    newMarkerReportActionID: '',
    personalDetails: {},
    onScroll: () => {},
    mostRecentIOUReportActionID: '',
    isLoadingMoreReportActions: false,
};

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

function isUnreadMsg(message, lastRead) {
    // console.log(`lastRead ${lastRead} < message ${message?.created}`, message);
    return message && lastRead && message.created && lastRead < message.created;
}

function ReportActionsList(props) {
    const opacity = useSharedValue(0);
    const userActiveSince = useRef(null);
    const currentUnreadMarker = useRef(null);
    const scrollingVerticalOffset = useRef(0);
    const [messageManuallyMarked, setMessageManuallyMarked] = useState(false);
    const report = props.report;
    const sortedReportActions = props.sortedReportActions;
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(false);
    const [reportActionSize, setReportActionSize] = useState(sortedReportActions.lenght);
    const animatedStyles = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    useEffect(() => {
        opacity.value = withTiming(1, {duration: 100});
    }, [opacity]);
    const [skeletonViewHeight, setSkeletonViewHeight] = useState(0);

    const windowHeight = props.windowHeight;

    useEffect(() => {
        userActiveSince.current = DateUtils.getDBTime();
    }, []);

    useEffect(() => {
        console.log(`~~Monil in useEffect 1 ${JSON.stringify(userActiveSince)}`);
        if (ReportUtils.isUnread(report) && scrollingVerticalOffset.current < 250) {
            Report.readNewestAction(report.reportID);
        }

        if (currentUnreadMarker.current || reportActionSize === sortedReportActions.length) {
            return;
        }

        setReportActionSize(sortedReportActions.length);
        // Report.readNewestAction(report.reportID);
        currentUnreadMarker.current = null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedReportActions.length, report.reportID]);

    useEffect(() => {
        const didManuallyMarkReportAsUnread = report.lastReadTime < DateUtils.getDBTime() && ReportUtils.isUnread(report);

        if (!didManuallyMarkReportAsUnread) {
            setMessageManuallyMarked(false);
            return;
        }

        // Clearing the current unread marker so that it can be recalculated
        currentUnreadMarker.current = null;
        setMessageManuallyMarked(true);

        // We only care when a new lastReadTime is set in the report
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.lastReadTime]);

    const trackVerticalScrolling = (event) => {
        scrollingVerticalOffset.current = event.nativeEvent.contentOffset.y;

        /**
         * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
         */
        if (scrollingVerticalOffset.current > 200 && !isFloatingMessageCounterVisible) {
            setIsFloatingMessageCounterVisible(true);
        }

        if (scrollingVerticalOffset.current < 200 && isFloatingMessageCounterVisible) {
            setIsFloatingMessageCounterVisible(false);
        }
        props.onScroll(event);
    };

    const scrollToBottomAndMarkReportAsRead = () => {
        ReportScrollManager.scrollToBottom();
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

    const hasOutstandingIOU = props.report.hasOutstandingIOU;

    const mostRecentIOUReportActionID = props.mostRecentIOUReportActionID;

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
                const isCurrentMessageUnread = !!isUnreadMsg(reportAction, report.lastReadTime);
                shouldDisplayNewMarker = isCurrentMessageUnread && !isUnreadMsg(nextMessage, report.lastReadTime);

                if (!messageManuallyMarked) {
                    shouldDisplayNewMarker = shouldDisplayNewMarker && reportAction.actorEmail !== Report.getCurrentUserEmail();
                }
                const canDisplayMarker = scrollingVerticalOffset.current < 250 ? reportAction.created < userActiveSince.current : true;

                if (!currentUnreadMarker.current && shouldDisplayNewMarker && canDisplayMarker) {
                    currentUnreadMarker.current = {id: reportAction.reportActionID, index, created: reportAction.created};
                }
            } else {
                shouldDisplayNewMarker = reportAction.reportActionID === currentUnreadMarker.current.id;
            }

            const shouldDisplayParentAction = reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED && ReportUtils.isThread(report);
            return shouldDisplayParentAction ? (
                <ReportActionItemParentAction
                    reportID={report.reportID}
                    parentReportID={`${report.parentReportID}`}
                />
            ) : (
                <ReportActionItem
                    report={report}
                    action={reportAction}
                    displayAsGroup={ReportActionsUtils.isConsecutiveActionMadeByPreviousActor(sortedReportActions, index)}
                    shouldDisplayNewMarker={shouldDisplayNewMarker}
                    shouldShowSubscriptAvatar={ReportUtils.isPolicyExpenseChat(report) && reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU}
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
    const extraData = [!props.isDrawerOpen && props.isSmallScreenWidth ? props.newMarkerReportActionID : undefined, ReportUtils.isArchivedRoom(props.report)];
    const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(props.personalDetails, props.report);

    return (
        <>
            <FloatingMessageCounter
                isActive={isFloatingMessageCounterVisible && !!currentUnreadMarker.current}
                onClick={scrollToBottomAndMarkReportAsRead}
            />

            <Animated.View style={[animatedStyles, styles.flex1]}>
                <InvertedFlatList
                    accessibilityLabel={props.translate('sidebarScreen.listOfChatMessages')}
                    ref={ReportScrollManager.flatListRef}
                    data={props.sortedReportActions}
                    renderItem={renderItem}
                    contentContainerStyle={[styles.chatContentScrollView, shouldShowReportRecipientLocalTime && styles.pt0]}
                    keyExtractor={keyExtractor}
                    initialRowHeight={32}
                    initialNumToRender={initialNumToRender}
                    onEndReached={props.loadMoreChats}
                    onEndReachedThreshold={0.75}
                    ListFooterComponent={() => {
                        if (props.report.isLoadingMoreReportActions) {
                            return <ReportActionsSkeletonView containerHeight={CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT * 3} />;
                        }

                        // Make sure the oldest report action loaded is not the first. This is so we do not show the
                        // skeleton view above the created action in a newly generated optimistic chat or one with not
                        // that many comments.
                        const lastReportAction = _.last(props.sortedReportActions) || {};
                        if (props.report.isLoadingReportActions && lastReportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
                            return (
                                <ReportActionsSkeletonView
                                    containerHeight={skeletonViewHeight}
                                    animate={!props.network.isOffline}
                                />
                            );
                        }

                        return null;
                    }}
                    keyboardShouldPersistTaps="handled"
                    onLayout={(event) => {
                        setSkeletonViewHeight(event.nativeEvent.layout.height);
                        props.onLayout(event);
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

export default compose(withDrawerState, withWindowDimensions, withLocalize, withPersonalDetails(), withNetwork())(ReportActionsList);
