import React, {useRef, useState, useEffect, useContext, useMemo} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import lodashCloneDeep from 'lodash/cloneDeep';
import * as Report from '../../../libs/actions/Report';
import reportActionPropTypes from './reportActionPropTypes';
import Visibility from '../../../libs/Visibility';
import Timing from '../../../libs/actions/Timing';
import CONST from '../../../CONST';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import useReportScrollManager from '../../../hooks/useReportScrollManager';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Performance from '../../../libs/Performance';
import {withNetwork} from '../../../components/OnyxProvider';
import FloatingMessageCounter from './FloatingMessageCounter';
import networkPropTypes from '../../../components/networkPropTypes';
import ReportActionsList from './ReportActionsList';
import CopySelectionHelper from '../../../components/CopySelectionHelper';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import * as ReportUtils from '../../../libs/ReportUtils';
import reportPropTypes from '../../reportPropTypes';
import withNavigationFocus from '../../../components/withNavigationFocus';
import PopoverReactionList from './ReactionList/PopoverReactionList';
import getIsReportFullyVisible from '../../../libs/getIsReportFullyVisible';
import ReportScreenContext from '../ReportScreenContext';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

    /** Whether the composer is full size */
    /* eslint-disable-next-line react/no-unused-prop-types */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    reportActions: [],
    policy: null,
};

function ReportActionsView(props) {
    const context = useContext(ReportScreenContext);

    const reportScrollManager = useReportScrollManager();

    const didLayout = useRef(false);
    const didSubscribeToReportTypingEvents = useRef(false);
    const unsubscribeVisibilityListener = useRef(null);
    const hasCachedActions = useRef(_.size(props.reportActions) > 0);

    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(false);
    const [newMarkerReportActionID, setNewMarkerReportActionID] = useState(ReportUtils.getNewMarkerReportActionID(props.report, props.reportActions));

    const currentScrollOffset = useRef(0);
    const mostRecentIOUReportActionID = useRef(ReportActionsUtils.getMostRecentIOURequestActionID(props.reportActions));

    const unsubscribeFromNewActionEvent = useRef(null);

    const prevReportActionsRef = useRef(props.reportActions);
    const prevReportRef = useRef(props.report);
    const prevNetworkRef = useRef(props.network);
    const prevIsSmallScreenWidthRef = useRef(props.isSmallScreenWidth);

    /**
     * @returns {Boolean}
     */
    const isReportFullyVisible = useMemo(() => getIsReportFullyVisible(props.isFocused), [props.isFocused]);

    const openReportIfNecessary = () => {
        // If the report is optimistic (AKA not yet created) we don't need to call openReport again
        if (props.report.isOptimisticReport) {
            return;
        }

        Report.openReport(props.report.reportID);
    };

    useEffect(() => {
        unsubscribeVisibilityListener.current = Visibility.onVisibilityChange(() => {
            if (!isReportFullyVisible) {
                return;
            }
            // If the app user becomes active and they have no unread actions we clear the new marker to sync their device
            // e.g. they could have read these messages on another device and only just become active here
            const hasUnreadActions = ReportUtils.isUnread(props.report);
            if (!hasUnreadActions) {
                setNewMarkerReportActionID('');
            }
        });
        return () => {
            if (!unsubscribeVisibilityListener.current) {
                return;
            }
            unsubscribeVisibilityListener.current();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        openReportIfNecessary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // This callback is triggered when a new action arrives via Pusher and the event is emitted from Report.js. This allows us to maintain
        // a single source of truth for the "new action" event instead of trying to derive that a new action has appeared from looking at props.
        unsubscribeFromNewActionEvent.current = Report.subscribeToNewActionEvent(props.report.reportID, (isFromCurrentUser, newActionID) => {
            const isNewMarkerReportActionIDSet = !_.isEmpty(newMarkerReportActionID);

            // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
            // they are now in the list.
            if (isFromCurrentUser) {
                reportScrollManager.scrollToBottom();
                // If the current user sends a new message in the chat we clear the new marker since they have "read" the report
                setNewMarkerReportActionID('');
            } else if (isReportFullyVisible) {
                // We use the scroll position to determine whether the report should be marked as read and the new line indicator reset.
                // If the user is scrolled up and no new line marker is set we will set it otherwise we will do nothing so the new marker
                // stays in it's previous position.
                if (currentScrollOffset.current === 0) {
                    Report.readNewestAction(props.report.reportID);
                    setNewMarkerReportActionID('');
                } else if (!isNewMarkerReportActionIDSet) {
                    // The report is not in view and we received a comment from another user while the new marker is not set
                    // so we will set the new marker now.
                    setNewMarkerReportActionID(newActionID);
                }
            } else if (!isNewMarkerReportActionIDSet) {
                setNewMarkerReportActionID(newActionID);
            }
        });

        return () => {
            if (unsubscribeFromNewActionEvent.current) {
                unsubscribeFromNewActionEvent.current();
            }

            Report.unsubscribeFromReportChannel(props.report.reportID);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const prevNetwork = prevNetworkRef.current;
        // When returning from offline to online state we want to trigger a request to OpenReport which
        // will fetch the reportActions data and mark the report as read. If the report is not fully visible
        // then we call ReconnectToReport which only loads the reportActions data without marking the report as read.
        const wasNetworkChangeDetected = lodashGet(prevNetwork, 'isOffline') && !lodashGet(props.network, 'isOffline');
        if (wasNetworkChangeDetected) {
            if (isReportFullyVisible) {
                openReportIfNecessary();
            } else {
                Report.reconnect(props.report.reportID);
            }
        }
        // update ref with current network state
        prevNetworkRef.current = props.network;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.network, props.report, isReportFullyVisible]);

    useEffect(() => {
        const prevIsSmallScreenWidth = prevIsSmallScreenWidthRef.current;
        // If the view is expanded from mobile to desktop layout
        // we update the new marker position, mark the report as read, and fetch new report actions
        const didScreenSizeIncrease = prevIsSmallScreenWidth && !props.isSmallScreenWidth;
        const didReportBecomeVisible = isReportFullyVisible && didScreenSizeIncrease;
        if (didReportBecomeVisible) {
            setNewMarkerReportActionID(ReportUtils.isUnread(props.report) ? ReportUtils.getNewMarkerReportActionID(props.report, props.reportActions) : '');
            openReportIfNecessary();
        }
        // update ref with current state
        prevIsSmallScreenWidthRef.current = props.isSmallScreenWidth;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isSmallScreenWidth, props.report, props.reportActions, isReportFullyVisible]);

    useEffect(() => {
        const prevReportActions = prevReportActionsRef.current;
        // If the report is unread, we want to check if the number of actions has decreased. If so, then it seems that one of them was deleted. In this case, if the deleted action was the
        // one marking the unread point, we need to recalculate which action should be the unread marker.
        if (prevReportActions && ReportUtils.isUnread(props.report) && prevReportActions.length > props.report.length)
            setNewMarkerReportActionID(ReportUtils.getNewMarkerReportActionID(props.report, props.reportActions));

        prevReportActionsRef.current = props.reportActions;
    }, [props.report, props.reportActions]);

    useEffect(() => {
        // If the last unread message was deleted, remove the *New* green marker and the *New Messages* notification at scroll just as the deletion starts.
        if (
            !(
                ReportUtils.isUnread(props.report) &&
                props.reportActions.length > 0 &&
                props.reportActions[0].pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                !props.network.isOffline
            )
        ) {
            return;
        }
        const reportActionsWithoutPendingOne = lodashCloneDeep(props.reportActions);
        reportActionsWithoutPendingOne.shift();
        if (newMarkerReportActionID !== ReportUtils.getNewMarkerReportActionID(props.report, reportActionsWithoutPendingOne)) {
            setNewMarkerReportActionID(ReportUtils.getNewMarkerReportActionID(props.report, reportActionsWithoutPendingOne));
        }
    }, [props.report, props.reportActions, props.network, newMarkerReportActionID]);

    useEffect(() => {
        const prevReport = prevReportRef.current;
        // Checks to see if a report comment has been manually "marked as unread". All other times when the lastReadTime
        // changes it will be because we marked the entire report as read.
        const didManuallyMarkReportAsUnread = prevReport && prevReport.lastReadTime !== props.report.lastReadTime && ReportUtils.isUnread(props.report);
        if (didManuallyMarkReportAsUnread) {
            setNewMarkerReportActionID(ReportUtils.getNewMarkerReportActionID(props.report, props.reportActions));
        }
        // update ref with current report
        prevReportRef.current = props.report;
    }, [props.report, props.reportActions]);

    useEffect(() => {
        // Ensures subscription event succeeds when the report/workspace room is created optimistically.
        // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
        // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
        // Existing reports created will have empty fields for `pendingFields`.
        const didCreateReportSuccessfully = !props.report.pendingFields || (!props.report.pendingFields.addWorkspaceRoom && !props.report.pendingFields.createChat);
        if (!didSubscribeToReportTypingEvents.current && didCreateReportSuccessfully) {
            Report.subscribeToReportTypingEvents(props.report.reportID);
            didSubscribeToReportTypingEvents.current = true;
        }
    }, [props.report, didSubscribeToReportTypingEvents]);

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadMoreChats = () => {
        // Only fetch more if we are not already fetching so that we don't initiate duplicate requests.
        if (props.report.isLoadingMoreReportActions) {
            return;
        }

        const oldestReportAction = _.last(props.reportActions);

        // Don't load more chats if we're already at the beginning of the chat history
        if (oldestReportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return;
        }

        // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments
        Report.readOldestAction(props.report.reportID, oldestReportAction.reportActionID);
    };

    const scrollToBottomAndMarkReportAsRead = () => {
        reportScrollManager.scrollToBottom();
        Report.readNewestAction(props.report.reportID);
    };

    /**
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     */
    const toggleFloatingMessageCounter = () => {
        if (currentScrollOffset.current < -200 && !isFloatingMessageCounterVisible) {
            setIsFloatingMessageCounterVisible(true);
        }

        if (currentScrollOffset.current > -200 && isFloatingMessageCounterVisible) {
            setIsFloatingMessageCounterVisible(false);
        }
    };

    /**
     * keeps track of the Scroll offset of the main messages list
     *
     * @param {Object} {nativeEvent}
     */
    const trackScroll = ({nativeEvent}) => {
        currentScrollOffset.current = -nativeEvent.contentOffset.y;
        toggleFloatingMessageCounter();
    };
    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = () => {
        if (didLayout.current) {
            return;
        }

        didLayout.current = true;
        Timing.end(CONST.TIMING.SWITCH_REPORT, hasCachedActions.current ? CONST.TIMING.WARM : CONST.TIMING.COLD);

        // Capture the init measurement only once not per each chat switch as the value gets overwritten
        if (!ReportActionsView.initMeasured) {
            Performance.markEnd(CONST.TIMING.REPORT_INITIAL_RENDER);
            ReportActionsView.initMeasured = true;
        } else {
            Performance.markEnd(CONST.TIMING.SWITCH_REPORT);
        }
    };

    // Comments have not loaded at all yet do nothing
    if (!_.size(props.reportActions)) {
        return null;
    }

    return (
        <>
            <FloatingMessageCounter
                isActive={isFloatingMessageCounterVisible && !_.isEmpty(newMarkerReportActionID)}
                onClick={scrollToBottomAndMarkReportAsRead}
            />
            <ReportActionsList
                report={props.report}
                onScroll={trackScroll}
                onLayout={recordTimeToMeasureItemLayout}
                sortedReportActions={props.reportActions}
                mostRecentIOUReportActionID={mostRecentIOUReportActionID.current}
                isLoadingMoreReportActions={props.report.isLoadingMoreReportActions}
                loadMoreChats={loadMoreChats}
                newMarkerReportActionID={newMarkerReportActionID}
                policy={props.policy}
            />
            <PopoverReactionList
                ref={context.reactionListRef}
                report={props.report}
            />
            <CopySelectionHelper />
        </>
    );
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;
ReportActionsView.displayName = 'ReportActionsView';

function arePropsEqual(oldProps, newProps) {
    if (!_.isEqual(oldProps.reportActions, newProps.reportActions)) {
        return false;
    }

    if (lodashGet(oldProps.network, 'isOffline') !== lodashGet(newProps.network, 'isOffline')) {
        return false;
    }

    if (oldProps.report.isLoadingMoreReportActions !== newProps.report.isLoadingMoreReportActions) {
        return false;
    }

    if (oldProps.report.isLoadingReportActions !== newProps.report.isLoadingReportActions) {
        return false;
    }

    if (oldProps.report.lastReadTime !== newProps.report.lastReadTime) {
        return false;
    }

    if (newProps.isSmallScreenWidth !== oldProps.isSmallScreenWidth) {
        return false;
    }

    if (lodashGet(newProps.report, 'hasOutstandingIOU') !== lodashGet(oldProps.report, 'hasOutstandingIOU')) {
        return false;
    }

    if (newProps.isComposerFullSize !== oldProps.isComposerFullSize) {
        return false;
    }

    if (lodashGet(newProps.report, 'statusNum') !== lodashGet(oldProps.report, 'statusNum') || lodashGet(newProps.report, 'stateNum') !== lodashGet(oldProps.report, 'stateNum')) {
        return false;
    }

    if (lodashGet(newProps, 'policy.avatar') !== lodashGet(oldProps, 'policy.avatar')) {
        return false;
    }

    if (lodashGet(newProps, 'policy.name') !== lodashGet(oldProps, 'policy.name')) {
        return false;
    }

    if (lodashGet(newProps, 'report.reportName') !== lodashGet(oldProps, 'report.reportName')) {
        return false;
    }

    if (lodashGet(newProps, 'report.description') !== lodashGet(oldProps, 'report.description')) {
        return false;
    }

    if (lodashGet(newProps, 'report.managerID') !== lodashGet(oldProps, 'report.managerID')) {
        return false;
    }

    if (lodashGet(newProps, 'report.managerEmail') !== lodashGet(oldProps, 'report.managerEmail')) {
        return false;
    }

    return _.isEqual(lodashGet(newProps.report, 'icons', []), lodashGet(oldProps.report, 'icons', []));
}

const MemoizedReportActionsView = React.memo(ReportActionsView, arePropsEqual);

export default compose(Performance.withRenderTrace({id: '<ReportActionsView> rendering'}), withWindowDimensions, withNavigationFocus, withLocalize, withNetwork())(MemoizedReportActionsView);
