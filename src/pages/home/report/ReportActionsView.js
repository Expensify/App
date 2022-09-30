import React from 'react';
import {
    Keyboard,
    AppState,
} from 'react-native';
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
import {withDrawerPropTypes} from '../../../components/withDrawerState';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import PopoverReportActionContextMenu from './ContextMenu/PopoverReportActionContextMenu';
import Performance from '../../../libs/Performance';
import {withNetwork} from '../../../components/OnyxProvider';
import * as EmojiPickerAction from '../../../libs/actions/EmojiPickerAction';
import FloatingMessageCounter from './FloatingMessageCounter';
import networkPropTypes from '../../../components/networkPropTypes';
import ReportActionsList from './ReportActionsList';
import CopySelectionHelper from '../../../components/CopySelectionHelper';
import EmojiPicker from '../../../components/EmojiPicker/EmojiPicker';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import * as ReportUtils from '../../../libs/ReportUtils';
import reportPropTypes from '../../reportPropTypes';

const propTypes = {
    /* Onyx Props */

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** The session of the logged in person */
    session: PropTypes.shape({
        /** Email of the logged in person */
        email: PropTypes.string,
    }),

    /** Whether the composer is full size */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...windowDimensionsPropTypes,
    ...withDrawerPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    reportActions: {},
    session: {},
};

class ReportActionsView extends React.Component {
    constructor(props) {
        super(props);

        this.appStateChangeListener = null;

        this.didLayout = false;

        this.state = {
            isFloatingMessageCounterVisible: false,
            newMarkerSequenceNumber: ReportUtils.isUnread(props.report)
                ? props.report.lastReadSequenceNumber + 1
                : 0,
        };

        this.currentScrollOffset = 0;
        this.sortedReportActions = ReportActionsUtils.getSortedReportActions(props.reportActions);
        this.mostRecentIOUReportSequenceNumber = ReportActionsUtils.getMostRecentIOUReportSequenceNumber(props.reportActions);
        this.trackScroll = this.trackScroll.bind(this);
        this.toggleFloatingMessageCounter = this.toggleFloatingMessageCounter.bind(this);
        this.loadMoreChats = this.loadMoreChats.bind(this);
        this.recordTimeToMeasureItemLayout = this.recordTimeToMeasureItemLayout.bind(this);
        this.scrollToBottomAndMarkReportAsRead = this.scrollToBottomAndMarkReportAsRead.bind(this);
    }

    componentDidMount() {
        this.appStateChangeListener = AppState.addEventListener('change', () => {
            if (!this.getIsReportFullyVisible()) {
                return;
            }

            // If the app user becomes active and they have no unread actions we clear the new marker to sync their device
            // e.g. they could have read these messages on another device and only just become active here
            Report.openReport(this.props.report.reportID);
            this.setState({newMarkerSequenceNumber: 0});
        });

        Report.subscribeToReportTypingEvents(this.props.report.reportID);
        this.keyboardEvent = Keyboard.addListener('keyboardDidShow', () => {
            if (!ReportActionComposeFocusManager.isFocused()) {
                return;
            }
            ReportScrollManager.scrollToBottom();
        });

        if (this.getIsReportFullyVisible()) {
            Report.openReport(this.props.report.reportID);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps.reportActions, this.props.reportActions)) {
            this.sortedReportActions = ReportActionsUtils.getSortedReportActions(nextProps.reportActions);
            this.mostRecentIOUReportSequenceNumber = ReportActionsUtils.getMostRecentIOUReportSequenceNumber(nextProps.reportActions);
            return true;
        }

        if (lodashGet(nextProps.network, 'isOffline') !== lodashGet(this.props.network, 'isOffline')) {
            return true;
        }

        if (nextProps.report.isLoadingMoreReportActions !== this.props.report.isLoadingMoreReportActions) {
            return true;
        }

        if (nextProps.report.lastReadSequenceNumber !== this.props.report.lastReadSequenceNumber) {
            return true;
        }

        if (nextState.isFloatingMessageCounterVisible !== this.state.isFloatingMessageCounterVisible) {
            return true;
        }

        if (nextState.newMarkerSequenceNumber !== this.state.newMarkerSequenceNumber) {
            return true;
        }

        if (this.props.isSmallScreenWidth !== nextProps.isSmallScreenWidth) {
            return true;
        }

        if (this.props.isDrawerOpen !== nextProps.isDrawerOpen) {
            return true;
        }

        if (lodashGet(this.props.report, 'hasOutstandingIOU') !== lodashGet(nextProps.report, 'hasOutstandingIOU')) {
            return true;
        }

        if (this.props.isComposerFullSize !== nextProps.isComposerFullSize) {
            return true;
        }

        return !_.isEqual(lodashGet(this.props.report, 'icons', []), lodashGet(nextProps.report, 'icons', []));
    }

    componentDidUpdate(prevProps) {
        const isReportFullyVisible = this.getIsReportFullyVisible();

        // When returning from offline to online state we want to trigger a request to OpenReport which
        // will fetch the reportActions data and mark the report as read. If the report is not fully visible
        // then we call ReconnectToReport which only loads the reportActions data without marking the report as read.
        const wasNetworkChangeDetected = lodashGet(prevProps.network, 'isOffline') && !lodashGet(this.props.network, 'isOffline');
        if (wasNetworkChangeDetected) {
            if (isReportFullyVisible) {
                Report.openReport(this.props.report.reportID);
            } else {
                Report.reconnect(this.props.report.reportID);
            }
        }

        const previousLastSequenceNumber = lodashGet(CollectionUtils.lastItem(prevProps.reportActions), 'sequenceNumber');
        const currentLastSequenceNumber = lodashGet(CollectionUtils.lastItem(this.props.reportActions), 'sequenceNumber');
        const didNewReportActionAppear = previousLastSequenceNumber !== currentLastSequenceNumber;
        if (didNewReportActionAppear) {
            const lastAction = CollectionUtils.lastItem(this.props.reportActions);
            const isLastActionFromCurrentUser = lodashGet(lastAction, 'actorEmail', '') === lodashGet(this.props.session, 'email', '');

            // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
            // they are now in the list.
            if (isLastActionFromCurrentUser) {
                ReportScrollManager.scrollToBottom();

                // If the current user sends a new message in the chat we clear the new marker since they have "read" the report
                this.setState({newMarkerSequenceNumber: 0});
            } else if (isReportFullyVisible) {
                // We use the scroll position to determine whether the report should be marked as read and the new line indicator reset.
                // If the user is scrolled up and no new line marker is set we will set it otherwise we will do nothing so the new marker
                // stays in it's previous position.
                if (this.currentScrollOffset === 0) {
                    Report.readNewestAction(this.props.report.reportID);
                    this.setState({newMarkerSequenceNumber: 0});
                } else if (this.state.newMarkerSequenceNumber === 0) {
                    this.setState({newMarkerSequenceNumber: currentLastSequenceNumber});
                }
            } else if (this.state.newMarkerSequenceNumber === 0) {
                // The report is not in view and we received a comment from another user while the new marker is not set
                // so we will set the new marker now.
                this.setState({newMarkerSequenceNumber: currentLastSequenceNumber});
            }
        }

        // If the report was previously hidden by the side bar, or the view is expanded from mobile to desktop layout
        // we update the new marker position, mark the report as read, and fetch new report actions
        const didSidebarClose = prevProps.isDrawerOpen && !this.props.isDrawerOpen;
        const didScreenSizeIncrease = prevProps.isSmallScreenWidth && !this.props.isSmallScreenWidth;
        const didReportBecomeVisible = isReportFullyVisible && (didSidebarClose || didScreenSizeIncrease);
        if (didReportBecomeVisible) {
            this.setState({
                newMarkerSequenceNumber: !ReportUtils.isUnread(this.props.report)
                    ? 0
                    : this.props.report.lastReadSequenceNumber + 1,
            });
            Report.openReport(this.props.report.reportID);
        }

        // When the user navigates to the LHN the ReportActionsView doesn't unmount and just remains hidden.
        // The next time we navigate to the same report (e.g. by swiping or tapping the LHN row) we want the new marker to clear.
        const didSidebarOpen = !prevProps.isDrawerOpen && this.props.isDrawerOpen;
        const didUserNavigateToSidebarAfterReadingReport = didSidebarOpen && !ReportUtils.isUnread(this.props.report);
        if (didUserNavigateToSidebarAfterReadingReport) {
            this.setState({newMarkerSequenceNumber: 0});
        }

        // Checks to see if a report comment has been manually "marked as unread". All other times when the lastReadSequenceNumber
        // changes it will be because we marked the entire report as read.
        const didManuallyMarkReportAsUnread = (prevProps.report.lastReadSequenceNumber !== this.props.report.lastReadSequenceNumber)
            && ReportUtils.isUnread(this.props.report);
        if (didManuallyMarkReportAsUnread) {
            this.setState({newMarkerSequenceNumber: this.props.report.lastReadSequenceNumber + 1});
        }
    }

    componentWillUnmount() {
        if (this.keyboardEvent) {
            this.keyboardEvent.remove();
        }

        if (this.appStateChangeListener) {
            this.appStateChangeListener.remove();
        }

        Report.unsubscribeFromReportChannel(this.props.report.reportID);
    }

    /**
     * @returns {Boolean}
     */
    getIsReportFullyVisible() {
        const isSidebarCoveringReportView = this.props.isSmallScreenWidth && this.props.isDrawerOpen;
        return Visibility.isVisible() && !isSidebarCoveringReportView;
    }

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    loadMoreChats() {
        // Only fetch more if we are not already fetching so that we don't initiate duplicate requests.
        if (this.props.report.isLoadingMoreReportActions) {
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
        const oldestActionSequenceNumber = Math.max(minSequenceNumber - CONST.REPORT.ACTIONS.LIMIT, 0);
        Report.readOldestAction(this.props.report.reportID, oldestActionSequenceNumber);
    }

    scrollToBottomAndMarkReportAsRead() {
        ReportScrollManager.scrollToBottom();
        Report.readNewestAction(this.props.report.reportID);
    }

    /**
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     */
    toggleFloatingMessageCounter() {
        if (this.currentScrollOffset < -200 && !this.state.isFloatingMessageCounterVisible) {
            this.setState({isFloatingMessageCounterVisible: true});
        }

        if (this.currentScrollOffset > -200 && this.state.isFloatingMessageCounterVisible) {
            this.setState({isFloatingMessageCounterVisible: false});
        }
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
            <>
                {!this.props.isComposerFullSize && (
                    <>
                        <FloatingMessageCounter
                            isActive={this.state.isFloatingMessageCounterVisible && this.state.newMarkerSequenceNumber > 0}
                            onClick={this.scrollToBottomAndMarkReportAsRead}
                        />
                        <ReportActionsList
                            report={this.props.report}
                            onScroll={this.trackScroll}
                            onLayout={this.recordTimeToMeasureItemLayout}
                            sortedReportActions={this.sortedReportActions}
                            mostRecentIOUReportSequenceNumber={this.mostRecentIOUReportSequenceNumber}
                            isLoadingMoreReportActions={this.props.report.isLoadingMoreReportActions}
                            loadMoreChats={this.loadMoreChats}
                            newMarkerSequenceNumber={this.state.newMarkerSequenceNumber}
                        />
                        <PopoverReportActionContextMenu ref={ReportActionContextMenu.contextMenuRef} />
                    </>
                )}
                <EmojiPicker ref={EmojiPickerAction.emojiPickerRef} />
                <CopySelectionHelper />
            </>
        );
    }
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;

export default compose(
    Performance.withRenderTrace({id: '<ReportActionsView> rendering'}),
    withWindowDimensions,
    withLocalize,
    withNetwork(),
)(ReportActionsView);
