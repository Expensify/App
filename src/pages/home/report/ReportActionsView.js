import React from 'react';
import {
    Keyboard,
    AppState,
    View,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import * as Report from '../../../libs/actions/Report';
import reportActionPropTypes from './reportActionPropTypes';
import * as CollectionUtils from '../../../libs/CollectionUtils';
import Visibility from '../../../libs/Visibility';
import Timing from '../../../libs/actions/Timing';
import CONST from '../../../CONST';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withDrawerState, {withDrawerPropTypes} from '../../../components/withDrawerState';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import PopoverReportActionContextMenu from './ContextMenu/PopoverReportActionContextMenu';
import Performance from '../../../libs/Performance';
import ONYXKEYS from '../../../ONYXKEYS';
import {withNetwork} from '../../../components/OnyxProvider';
import * as EmojiPickerAction from '../../../libs/actions/EmojiPickerAction';
import FloatingMessageCounter from './FloatingMessageCounter';
import networkPropTypes from '../../../components/networkPropTypes';
import ReportActionsList from './ReportActionsList';
import CopySelectionHelper from '../../../components/CopySelectionHelper';
import EmojiPicker from '../../../components/EmojiPicker/EmojiPicker';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import styles from '../../../styles/styles';

const propTypes = {
    /** The ID of the report actions will be created for */
    reportID: PropTypes.number.isRequired,

    /* Onyx Props */

    /** The report currently being looked at */
    report: PropTypes.shape({
        /** Number of actions unread */
        unreadActionCount: PropTypes.number,

        /** The largest sequenceNumber on this report */
        maxSequenceNumber: PropTypes.number,

        /** The current position of the new marker */
        newMarkerSequenceNumber: PropTypes.number,

        /** Whether there is an outstanding amount in IOU */
        hasOutstandingIOU: PropTypes.bool,
    }),

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** The session of the logged in person */
    session: PropTypes.shape({
        /** Email of the logged in person */
        email: PropTypes.string,
    }),

    /** Are we loading more report actions? */
    isLoadingReportActions: PropTypes.bool,

    /** Are we waiting for more report data? */
    isLoadingReportData: PropTypes.bool,

    /** Is the composer full size */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...windowDimensionsPropTypes,
    ...withDrawerPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {
        unreadActionCount: 0,
        maxSequenceNumber: 0,
        hasOutstandingIOU: false,
    },
    reportActions: {},
    session: {},
    isLoadingReportActions: false,
    isLoadingReportData: false,
};

class ReportActionsView extends React.Component {
    constructor(props) {
        super(props);

        this.appStateChangeListener = null;

        this.didLayout = false;

        this.state = {
            isFloatingMessageCounterVisible: false,
            messageCounterCount: this.props.report.unreadActionCount,
        };

        this.currentScrollOffset = 0;
        this.sortedReportActions = ReportActionsUtils.getSortedReportActions(props.reportActions);
        this.mostRecentIOUReportSequenceNumber = ReportActionsUtils.getMostRecentIOUReportSequenceNumber(props.reportActions);
        this.trackScroll = this.trackScroll.bind(this);
        this.showFloatingMessageCounter = this.showFloatingMessageCounter.bind(this);
        this.hideFloatingMessageCounter = this.hideFloatingMessageCounter.bind(this);
        this.toggleFloatingMessageCounter = this.toggleFloatingMessageCounter.bind(this);
        this.updateNewMarkerPosition = this.updateNewMarkerPosition.bind(this);
        this.updateMessageCounterCount = this.updateMessageCounterCount.bind(this);
        this.recordTimeToMeasureItemLayout = this.recordTimeToMeasureItemLayout.bind(this);
        this.updateNewMarkerAndMarkReadOnce = _.once(this.updateNewMarkerAndMarkRead.bind(this));
    }

    componentDidMount() {
        this.appStateChangeListener = AppState.addEventListener('change', () => {
            if (!Visibility.isVisible() || this.props.isDrawerOpen) {
                return;
            }

            Report.updateLastReadActionID(this.props.reportID);
        });

        // If the reportID is not found then we have either not loaded this chat or the user is unable to access it.
        // We will attempt to fetch it and redirect if still not accessible.
        if (!this.props.report.reportID) {
            Report.fetchChatReportsByIDs([this.props.reportID], true);
        }
        Report.subscribeToReportTypingEvents(this.props.reportID);
        this.keyboardEvent = Keyboard.addListener('keyboardDidShow', () => {
            if (!ReportActionComposeFocusManager.isFocused()) {
                return;
            }
            ReportScrollManager.scrollToBottom();
        });

        if (!this.props.isLoadingReportData) {
            this.updateNewMarkerAndMarkReadOnce();
        }

        this.fetchData();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps.reportActions, this.props.reportActions)) {
            this.sortedReportActions = ReportActionsUtils.getSortedReportActions(nextProps.reportActions);
            this.mostRecentIOUReportSequenceNumber = ReportActionsUtils.getMostRecentIOUReportSequenceNumber(nextProps.reportActions);
            return true;
        }

        // If the new marker has changed places, update the component.
        if (nextProps.report.newMarkerSequenceNumber !== this.props.report.newMarkerSequenceNumber) {
            return true;
        }

        if (nextProps.network.isOffline !== this.props.network.isOffline) {
            return true;
        }

        if (nextProps.isLoadingReportActions !== this.props.isLoadingReportActions) {
            return true;
        }

        if (!nextProps.isLoadingReportData && this.props.isLoadingReportData) {
            return true;
        }

        if (nextState.isFloatingMessageCounterVisible !== this.state.isFloatingMessageCounterVisible) {
            return true;
        }

        if (nextState.messageCounterCount !== this.state.messageCounterCount) {
            return true;
        }

        if (this.props.isSmallScreenWidth !== nextProps.isSmallScreenWidth) {
            return true;
        }

        if (this.props.isDrawerOpen !== nextProps.isDrawerOpen) {
            return true;
        }

        if (this.props.report.hasOutstandingIOU !== nextProps.report.hasOutstandingIOU) {
            return true;
        }

        return !_.isEqual(lodashGet(this.props.report, 'icons', []), lodashGet(nextProps.report, 'icons', []));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.network.isOffline && !this.props.network.isOffline) {
            this.fetchData();
        }

        // Update the last read action for the report currently in view when report data finishes loading.
        // This report should now be up-to-date and since it is in view we mark it as read.
        if (!this.props.isLoadingReportData && prevProps.isLoadingReportData) {
            this.updateNewMarkerAndMarkReadOnce();
        }

        // The last sequenceNumber of the same report has changed.
        const previousLastSequenceNumber = lodashGet(CollectionUtils.lastItem(prevProps.reportActions), 'sequenceNumber');
        const currentLastSequenceNumber = lodashGet(CollectionUtils.lastItem(this.props.reportActions), 'sequenceNumber');

        // Record the max action when window is visible and the sidebar is not covering the report view on a small screen
        const isSidebarCoveringReportView = this.props.isSmallScreenWidth && this.props.isDrawerOpen;
        const shouldRecordMaxAction = Visibility.isVisible() && !isSidebarCoveringReportView;

        const sidebarClosed = prevProps.isDrawerOpen && !this.props.isDrawerOpen;
        const screenSizeIncreased = prevProps.isSmallScreenWidth && !this.props.isSmallScreenWidth;
        const reportBecomeVisible = sidebarClosed || screenSizeIncreased;

        if (previousLastSequenceNumber !== currentLastSequenceNumber) {
            const lastAction = CollectionUtils.lastItem(this.props.reportActions);
            const isLastActionFromCurrentUser = lodashGet(lastAction, 'actorEmail', '') === lodashGet(this.props.session, 'email', '');
            if (isLastActionFromCurrentUser) {
                // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where they are now in the list.
                ReportScrollManager.scrollToBottom();
            } else {
                // Only update the unread count when the floating message counter is visible
                // Otherwise counter will be shown on scrolling up from the bottom even if user have read those messages
                if (this.state.isFloatingMessageCounterVisible) {
                    this.updateMessageCounterCount(!shouldRecordMaxAction);
                }

                // Show new floating message counter when there is a new message
                this.toggleFloatingMessageCounter();
            }

            // When the last action changes, record the max action
            // This will make the NEW marker line go away if you receive comments in the same chat you're looking at
            if (shouldRecordMaxAction) {
                Report.updateLastReadActionID(this.props.reportID);
            }
        }

        // Update the new marker position and last read action when we are closing the sidebar or moving from a small to large screen size
        if (shouldRecordMaxAction && reportBecomeVisible) {
            this.updateNewMarkerPosition(this.props.report.unreadActionCount);
            Report.updateLastReadActionID(this.props.reportID);
        }
    }

    componentWillUnmount() {
        if (this.keyboardEvent) {
            this.keyboardEvent.remove();
        }

        if (this.appStateChangeListener) {
            this.appStateChangeListener.remove();
        }

        Report.unsubscribeFromReportChannel(this.props.reportID);
    }

    fetchData() {
        Report.fetchActions(this.props.reportID);
    }

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    loadMoreChats() {
        // Only fetch more if we are not already fetching so that we don't initiate duplicate requests.
        if (this.props.isLoadingReportActions) {
            return;
        }

        const minSequenceNumber = _.chain(this.props.reportActions)
            .pluck('sequenceNumber')
            .min()
            .value();

        if (minSequenceNumber === 0) {
            return;
        }

        // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments, unless we're near the beginning, in which
        // case just get everything starting from 0.
        const offset = Math.max(minSequenceNumber - CONST.REPORT.ACTIONS.LIMIT, 0);
        Report.fetchActionsWithLoadingState(this.props.reportID, offset);
    }

    /**
     * This function is triggered from the ref callback for the scrollview. That way it can be scrolled once all the
     * items have been rendered. If the number of actions has changed since it was last rendered, then
     * scroll the list to the end. As a report can contain non-message actions, we should confirm that list data exists.
     */
    scrollToBottomAndUpdateLastRead() {
        ReportScrollManager.scrollToBottom();
        Report.updateLastReadActionID(this.props.reportID);
    }

    /**
     * Updates NEW marker position
     * @param {Number} unreadActionCount
     */
    updateNewMarkerPosition(unreadActionCount) {
        // Since we want the New marker to remain in place even if newer messages come in, we set it once on mount.
        // We determine the last read action by deducting the number of unread actions from the total number.
        // Then, we add 1 because we want the New marker displayed over the oldest unread sequence.
        const oldestUnreadSequenceNumber = unreadActionCount === 0 ? 0 : Report.getLastReadSequenceNumber(this.props.report.reportID) + 1;
        Report.setNewMarkerPosition(this.props.reportID, oldestUnreadSequenceNumber);
    }

    /**
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     */
    toggleFloatingMessageCounter() {
        // Update the message counter count before counter is about to show
        if (this.currentScrollOffset < -200 && !this.state.isFloatingMessageCounterVisible) {
            this.updateMessageCounterCount();
            this.showFloatingMessageCounter();
        }

        if (this.currentScrollOffset > -200 && this.state.isFloatingMessageCounterVisible) {
            this.hideFloatingMessageCounter();
        }
    }

    /**
     * Update the message counter count to show in the floating message counter
     * @param {Boolean} [shouldResetLocalCount=false] Whether count should increment or reset
     */
    updateMessageCounterCount(shouldResetLocalCount = false) {
        this.setState((prevState) => {
            const messageCounterCount = shouldResetLocalCount
                ? this.props.report.unreadActionCount
                : prevState.messageCounterCount + this.props.report.unreadActionCount;
            this.updateNewMarkerPosition(messageCounterCount);
            return {messageCounterCount};
        });
    }

    /**
     * Update NEW marker and mark report as read
     */
    updateNewMarkerAndMarkRead() {
        this.updateNewMarkerPosition(this.props.report.unreadActionCount);

        // Only mark as read if the report is open
        if (!this.props.isDrawerOpen) {
            Report.updateLastReadActionID(this.props.reportID);
        }
    }

    /**
     * Show the new floating message counter
     */
    showFloatingMessageCounter() {
        this.setState({isFloatingMessageCounterVisible: true});
    }

    /**
     * Hide the new floating message counter
     */
    hideFloatingMessageCounter() {
        this.setState({
            isFloatingMessageCounterVisible: false,
            messageCounterCount: 0,
        });
    }

    /**
     * keeps track of the Scroll offset of the main messages list
     *
     * @param {Object} {nativeEvent}
     */
    trackScroll({nativeEvent}) {
        this.currentScrollOffset = -nativeEvent.contentOffset.y;
        this.toggleFloatingMessageCounter();
    }

    /**
     * Runs when the FlatList finishes laying out
     */
    recordTimeToMeasureItemLayout() {
        if (this.didLayout) {
            return;
        }

        this.didLayout = true;
        Timing.end(CONST.TIMING.SWITCH_REPORT, CONST.TIMING.COLD);

        // Capture the init measurement only once not per each chat switch as the value gets overwritten
        if (!ReportActionsView.initMeasured) {
            Performance.markEnd(CONST.TIMING.REPORT_INITIAL_RENDER);
            ReportActionsView.initMeasured = true;
        } else {
            Performance.markEnd(CONST.TIMING.SWITCH_REPORT);
        }
    }

    render() {
        // Comments have not loaded at all yet do nothing
        if (!_.size(this.props.reportActions)) {
            return null;
        }

        return (
            <View style={[this.props.isComposerFullSize && styles.flex0]}>
                <FloatingMessageCounter
                    active={this.state.isFloatingMessageCounterVisible}
                    count={this.state.messageCounterCount}
                    onClick={this.scrollToBottomAndUpdateLastRead}
                    onClose={this.hideFloatingMessageCounter}
                />
                <ReportActionsList
                    report={this.props.report}
                    onScroll={this.trackScroll}
                    onLayout={this.recordTimeToMeasureItemLayout}
                    sortedReportActions={this.sortedReportActions}
                    mostRecentIOUReportSequenceNumber={this.mostRecentIOUReportSequenceNumber}
                    isLoadingReportActions={this.props.isLoadingReportActions}
                />
                <PopoverReportActionContextMenu ref={ReportActionContextMenu.contextMenuRef} />
                <EmojiPicker ref={EmojiPickerAction.emojiPickerRef} />
                <CopySelectionHelper />
            </View>
        );
    }
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;

export default compose(
    Performance.withRenderTrace({id: '<ReportActionsView> rendering'}),
    withWindowDimensions,
    withDrawerState,
    withLocalize,
    withNetwork(),
    withOnyx({
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
        isLoadingReportActions: {
            key: ONYXKEYS.IS_LOADING_REPORT_ACTIONS,
            initWithStoredValues: false,
        },
    }),
)(ReportActionsView);
