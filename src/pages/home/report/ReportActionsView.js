import React from 'react';
import {
    Keyboard,
    AppState,
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

const propTypes = {
    /** The ID of the report actions will be created for */
    reportID: PropTypes.number.isRequired,

    /* Onyx Props */

    /** The report currently being looked at */
    report: PropTypes.shape({
        /** The largest sequenceNumber on this report */
        maxSequenceNumber: PropTypes.number,

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

    /** Whether the composer is full size */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** Are we loading more report actions? */
    isLoadingReportActions: PropTypes.bool,

    /** Are we waiting for more report data? */
    isLoadingReportData: PropTypes.bool,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...windowDimensionsPropTypes,
    ...withDrawerPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {
        isUnread: false,
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
            newMarkerSequenceNumber: props.report.isUnread ? props.report.lastReadSequenceNumber + 1 : 0,
        };

        this.currentScrollOffset = 0;
        this.sortedReportActions = ReportActionsUtils.getSortedReportActions(props.reportActions);
        this.mostRecentIOUReportSequenceNumber = ReportActionsUtils.getMostRecentIOUReportSequenceNumber(props.reportActions);
        this.trackScroll = this.trackScroll.bind(this);
        this.showFloatingMessageCounter = this.showFloatingMessageCounter.bind(this);
        this.hideFloatingMessageCounter = this.hideFloatingMessageCounter.bind(this);
        this.toggleFloatingMessageCounter = this.toggleFloatingMessageCounter.bind(this);
        this.loadMoreChats = this.loadMoreChats.bind(this);
        this.recordTimeToMeasureItemLayout = this.recordTimeToMeasureItemLayout.bind(this);
        this.scrollToBottomAndMarkReportAsRead = this.scrollToBottomAndMarkReportAsRead.bind(this);
        this.updateNewMarkerAndMarkReadOnce = _.once(this.updateNewMarkerAndMarkRead.bind(this));
    }

    componentDidMount() {
        this.appStateChangeListener = AppState.addEventListener('change', () => {
            if (!this.getIsReportFullyVisible()) {
                return;
            }

            if (!this.props.report.isUnread) {
                this.resetNewMarkerSequenceNumber();
            }

            Report.openReport(this.props.reportID);
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
        if (nextState.newMarkerSequenceNumber !== this.state.newMarkerSequenceNumber) {
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

        if (this.props.isSmallScreenWidth !== nextProps.isSmallScreenWidth) {
            return true;
        }

        if (this.props.isDrawerOpen !== nextProps.isDrawerOpen) {
            return true;
        }

        if (this.props.report.hasOutstandingIOU !== nextProps.report.hasOutstandingIOU) {
            return true;
        }

        if (this.props.report.lastReadSequenceNumber !== nextProps.report.lastReadSequenceNumber) {
            return true;
        }

        if (this.props.isComposerFullSize !== nextProps.isComposerFullSize) {
            return true;
        }

        return !_.isEqual(lodashGet(this.props.report, 'icons', []), lodashGet(nextProps.report, 'icons', []));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.network.isOffline && !this.props.network.isOffline) {
            if (this.getIsReportFullyVisible()) {
                Report.openReport(this.props.reportID);
            }
            this.fetchData();
        }

        if ((prevProps.report.lastReadSequenceNumber !== this.props.report.lastReadSequenceNumber) && this.props.report.isUnread) {
            this.updateNewMarkerSequenceNumber(this.props.report.lastReadSequenceNumber + 1);
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
        const isReportFullyVisible = this.getIsReportFullyVisible();
        const sidebarClosed = prevProps.isDrawerOpen && !this.props.isDrawerOpen;
        const sidebarOpened = !prevProps.isDrawerOpen && this.props.isDrawerOpen;
        const screenSizeIncreased = prevProps.isSmallScreenWidth && !this.props.isSmallScreenWidth;
        const reportBecomeVisible = sidebarClosed || screenSizeIncreased;

        if (previousLastSequenceNumber !== currentLastSequenceNumber) {
            const lastAction = CollectionUtils.lastItem(this.props.reportActions);
            const isLastActionFromCurrentUser = lodashGet(lastAction, 'actorEmail', '') === lodashGet(this.props.session, 'email', '');
            if (isLastActionFromCurrentUser) {
                // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where they are now in the list.
                ReportScrollManager.scrollToBottom();
                this.resetNewMarkerSequenceNumber();
            }

            if (isReportFullyVisible) {
                if (this.currentScrollOffset === 0) {
                    Report.readNewestAction(this.props.reportID);
                    this.resetNewMarkerSequenceNumber();
                } else if (this.state.newMarkerSequenceNumber === 0) {
                    this.updateNewMarkerSequenceNumber(currentLastSequenceNumber);
                }
            }
        }

        // The report was revealed so we treat this as an "open report"
        if (isReportFullyVisible && reportBecomeVisible) {
            Report.openReport(this.props.reportID);
        }

        // Switched from report view to LHN reset the new marker
        if (sidebarOpened && !this.props.report.isUnread) {
            this.resetNewMarkerSequenceNumber();
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

    /**
     * @returns {Boolean}
     */
    getIsReportFullyVisible() {
        const isSidebarCoveringReportView = this.props.isSmallScreenWidth && this.props.isDrawerOpen;
        return Visibility.isVisible() && !isSidebarCoveringReportView;
    }

    fetchData() {
        Report.fetchActions(this.props.reportID);
    }

    resetNewMarkerSequenceNumber() {
        this.setState({newMarkerSequenceNumber: 0});
    }

    updateNewMarkerSequenceNumber(newMarkerSequenceNumber) {
        this.setState({newMarkerSequenceNumber});
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
        const oldestActionSequenceNumber = Math.max(minSequenceNumber - CONST.REPORT.ACTIONS.LIMIT, 0);
        Report.readOldestAction(this.props.reportID, oldestActionSequenceNumber);
    }

    scrollToBottomAndMarkReportAsRead() {
        ReportScrollManager.scrollToBottom();
        Report.readNewestAction(this.props.reportID);
        this.setState({newMarkerSequenceNumber: 0});
    }

    /**
     * Show/hide the new floating message indicator when user is scrolling back/forth in the history of messages.
     */
    toggleFloatingMessageCounter() {
        if (this.currentScrollOffset < -200 && !this.state.isFloatingMessageCounterVisible) {
            this.showFloatingMessageCounter();
        }

        if (this.currentScrollOffset > -200 && this.state.isFloatingMessageCounterVisible) {
            this.hideFloatingMessageCounter();
        }
    }

    /**
     * Update NEW marker and mark report as read
     */
    updateNewMarkerAndMarkRead() {
        // Only mark as read if the report is fully visible
        if (!this.getIsReportFullyVisible()) {
            return;
        }

        Report.openReport(this.props.reportID);
    }

    /**
     * Show the new floating message indicator
     */
    showFloatingMessageCounter() {
        this.setState({isFloatingMessageCounterVisible: true});
    }

    /**
     * Hide the new floating message indicator
     */
    hideFloatingMessageCounter() {
        this.setState({isFloatingMessageCounterVisible: false});
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
                            active={this.state.isFloatingMessageCounterVisible && this.state.newMarkerSequenceNumber > 0}
                            onClick={this.scrollToBottomAndMarkReportAsRead}
                        />
                        <ReportActionsList
                            report={this.props.report}
                            onScroll={this.trackScroll}
                            onLayout={this.recordTimeToMeasureItemLayout}
                            sortedReportActions={this.sortedReportActions}
                            mostRecentIOUReportSequenceNumber={this.mostRecentIOUReportSequenceNumber}
                            isLoadingReportActions={this.props.isLoadingReportActions}
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
    withDrawerState,
    withLocalize,
    withNetwork(),
    withOnyx({
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
        isLoadingReportActions: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.IS_LOADING_REPORT_ACTIONS}${reportID}`,
            initWithStoredValues: false,
        },
    }),
)(ReportActionsView);
