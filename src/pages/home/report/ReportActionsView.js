import React from 'react';
import {
    Keyboard,
    AppState,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Clipboard from '../../../libs/Clipboard';
import * as Report from '../../../libs/actions/Report';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import SelectionScraper from '../../../libs/SelectionScraper';
import reportActionPropTypes from './reportActionPropTypes';
import * as CollectionUtils from '../../../libs/CollectionUtils';
import Visibility from '../../../libs/Visibility';
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
import * as ReportUtils from '../../../libs/reportUtils';
import ONYXKEYS from '../../../ONYXKEYS';
import EmojiPicker from '../../../components/EmojiPicker';
import * as EmojiPickerAction from '../../../libs/actions/EmojiPickerAction';
import ReportActionsList from '../../../components/ReportActionsList';
import reportPropTypes from '../../../components/reportPropTypes';
import FloatingMessageCounter from './FloatingMessageCounter';

const propTypes = {
    /** The ID of the report actions will be created for */
    reportID: PropTypes.number.isRequired,

    /* Onyx Props */

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** The session of the logged in person */
    session: PropTypes.shape({
        /** Email of the logged in person */
        email: PropTypes.string,
    }),

    /** Are we waiting for more report data? */
    isLoadingReportData: PropTypes.bool,

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
    isLoadingReportData: false,
};

class ReportActionsView extends React.Component {
    constructor(props) {
        super(props);

        // Scroll offset is tracked so that we can update the FloatingMessageCounter
        this.currentScrollOffset = 0;

        // Report actions + most recent IOU sequence number are stored on the instance sorted on init and on update
        this.sortedReportActions = ReportUtils.sortActionsForDisplay(props.reportActions);
        this.mostRecentIOUReportSequenceNumber = ReportUtils.getMostRecentIOUReportSequenceNumber(props.reportActions);

        // Bind methods
        this.updateOffsetAndToggleMessageCounter = this.updateOffsetAndToggleMessageCounter.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.scrollToBottomAndUpdateLastRead = this.scrollToBottomAndUpdateLastRead.bind(this);

        // Floating message counter methods
        this.hideFloatingMessageCounter = this.hideFloatingMessageCounter.bind(this);
        this.toggleFloatingMessageCounter = this.toggleFloatingMessageCounter.bind(this);
        this.updateAllIndicators = this.updateAllIndicators.bind(this);

        // New line indicator methods
        this.updateNewLineIndicatorAndMarkReadOnce = _.once(this.updateNewLineIndicatorAndMarkRead.bind(this));
        this.updateNewLineIndicatorPosition = this.updateNewLineIndicatorPosition.bind(this);

        this.state = {
            shouldFloatingMessageCounterShow: false,

            // The floating message counter badge is initialized with the report's unread action count,
            // but later updated when the ReportActionsList is scrolled or a new comment arrives.
            floatingBadgeCount: this.props.report.unreadActionCount,
        };
    }

    componentDidMount() {
        // If the reportID is not found then we have either not loaded this chat or the user is unable to access it.
        // We will attempt to fetch it and redirect if still not accessible.
        if (!this.props.report.reportID) {
            Report.fetchChatReportsByIDs([this.props.reportID], true);
        }

        // If we are loading report data when the component mounts then we defer the updating of the new line indicator until the component updates
        if (!this.props.isLoadingReportData) {
            this.updateNewLineIndicatorAndMarkReadOnce();
        }

        // Always fetch the latest report actions for this report
        Report.fetchActions(this.props.reportID);
        this.unsubscribeFromEvents = this.subcribeToEvents();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps.reportActions, this.props.reportActions)) {
            this.sortedReportActions = ReportUtils.sortActionsForDisplay(nextProps.reportActions);
            this.mostRecentIOUReportSequenceNumber = ReportUtils.getMostRecentIOUReportSequenceNumber(nextProps.reportActions);
            return true;
        }

        // If the new line indicator has changed places, update the component.
        if (nextProps.report.newMarkerSequenceNumber !== this.props.report.newMarkerSequenceNumber) {
            return true;
        }

        if (!nextProps.isLoadingReportData && this.props.isLoadingReportData) {
            return true;
        }

        if (nextState.shouldFloatingMessageCounterShow !== this.state.shouldFloatingMessageCounterShow) {
            return true;
        }

        if (nextState.floatingBadgeCount !== this.state.floatingBadgeCount) {
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
        // Update the last read action for the report currently in view when report data finishes loading.
        // This report should now be up-to-date and since it is in view we mark it as read.
        if (prevProps.isLoadingReportData && !this.props.isLoadingReportData) {
            this.updateNewLineIndicatorAndMarkReadOnce();
        }

        // The last sequenceNumber of the same report has changed.
        const previousLastSequenceNumber = lodashGet(CollectionUtils.lastItem(prevProps.reportActions), 'sequenceNumber');
        const currentLastSequenceNumber = lodashGet(CollectionUtils.lastItem(this.props.reportActions), 'sequenceNumber');

        if (previousLastSequenceNumber !== currentLastSequenceNumber) {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise update the floating message counter if visible
            const lastAction = CollectionUtils.lastItem(this.props.reportActions);
            const isLastActionByCurrentUser = lodashGet(lastAction, 'actorEmail', '') !== lodashGet(this.props.session, 'email', '');

            if (isLastActionByCurrentUser) {
                ReportScrollManager.scrollToBottom();
            } else {
                // Only update the count when FloatingMessageCounter is visible
                // Otherwise the counter will be shown on scrolling up from the bottom even if the user has read those messages
                if (this.state.shouldFloatingMessageCounterShow) {
                    this.updateAllIndicators(!this.isReportInView());
                }

                this.toggleFloatingMessageCounter();
            }

            // When the last action changes, record the max action
            // This will make the unread indicator go away if you receive comments in the same chat you're looking at
            if (this.isReportInView()) {
                Report.updateLastReadActionID(this.props.reportID);
            }

            return;
        }

        // Besides a new sequence number we will want to update the new line indicator and last read when we:
        // - Navigate to the active report via the Left Hand Nav
        // - When the orientation changes
        const didOrientationChange = prevProps.isSmallScreenWidth !== this.props.isSmallScreenWidth;
        const didLeftHandNavClose = prevProps.isDrawerOpen && !this.props.isDrawerOpen;
        if (this.isReportInView() && (didLeftHandNavClose || didOrientationChange)) {
            this.updateNewLineIndicatorPosition(this.props.report.unreadActionCount);
            Report.updateLastReadActionID(this.props.reportID);
        }
    }

    componentWillUnmount() {
        if (!this.unsubscribeFromEvents) {
            return;
        }

        this.unsubscribeFromEvents();
    }

    /**
     * Records the max action on app visibility change event.
     */
    onVisibilityChange() {
        if (!this.isReportInView()) {
            return;
        }

        Report.updateLastReadActionID(this.props.reportID);
    }

    /**
     * If we are one larger screens then the report can be in view while the drawer is open. But if we are on a smaller screen then
     * the report is not in view if the drawer (Left Hand Nav) is open.
     *
     * @returns {Boolean}
     */
    isReportInView() {
        return Visibility.isVisible() && (!this.props.isSmallScreenWidth || !this.props.isDrawerOpen);
    }

    /**
     * @returns {Function} cleanup events when called
     */
    subcribeToEvents() {
        Report.subscribeToReportTypingEvents(this.props.reportID);
        const appStateChangeListener = AppState.addEventListener('change', this.onVisibilityChange);
        const copyShortcutConfig = CONST.KEYBOARD_SHORTCUTS.COPY;
        const unsubscribeCopyShortcut = KeyboardShortcut.subscribe(copyShortcutConfig.shortcutKey, () => {
            const selectionMarkdown = SelectionScraper.getAsMarkdown();
            Clipboard.setString(selectionMarkdown);
        }, copyShortcutConfig.descriptionKey, copyShortcutConfig.modifiers, false);
        const keyboardEvent = Keyboard.addListener('keyboardDidShow', () => {
            if (!ReportActionComposeFocusManager.isFocused()) {
                return;
            }
            ReportScrollManager.scrollToBottom();
        });

        return () => {
            keyboardEvent.remove();
            appStateChangeListener.remove();
            unsubscribeCopyShortcut();
            Report.unsubscribeFromReportChannel(this.props.reportID);
        };
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
    updateNewLineIndicatorPosition(unreadActionCount) {
        // Since we want the New marker to remain in place even if newer messages come in, we set it once on mount.
        // We determine the last read action by deducting the number of unread actions from the total number.
        // Then, we add 1 because we want the New marker displayed over the oldest unread sequence.
        const oldestUnreadSequenceNumber = unreadActionCount === 0 ? 0 : Report.getLastReadSequenceNumber(this.props.report.reportID) + 1;
        Report.setNewMarkerPosition(this.props.reportID, oldestUnreadSequenceNumber);
    }

    /**
     * Show/hide the new FloatingMessageCounter when user is scrolling back/forth in the history of messages.
     */
    toggleFloatingMessageCounter() {
        // Update the unread message count before FloatingMessageCounter is about to show
        if (this.currentScrollOffset < -200 && !this.state.shouldFloatingMessageCounterShow) {
            this.updateAllIndicators();
            this.setState({shouldFloatingMessageCounterShow: true});
        }

        if (this.currentScrollOffset > -200 && this.state.shouldFloatingMessageCounterShow) {
            this.hideFloatingMessageCounter();
        }
    }

    /**
     * Update the unread messages count to show in the FloatingMessageCounter
     * @param {Boolean} [shouldResetFloatingMessageCounterCount=false] Whether count should increment or reset
     */
    updateAllIndicators(shouldResetFloatingMessageCounterCount = false) {
        this.setState((prevState) => {
            const floatingMessageCounterCount = shouldResetFloatingMessageCounterCount
                ? this.props.report.unreadActionCount
                : prevState.floatingMessageCounterCount + this.props.report.unreadActionCount;
            this.updateNewLineIndicatorPosition(floatingMessageCounterCount);
            return {floatingMessageCounterCount};
        });
    }

    /**
     * Update NEW marker and mark report as read
     */
    updateNewLineIndicatorAndMarkRead() {
        this.updateNewLineIndicatorPosition(this.props.report.unreadActionCount);

        // Only mark as read if the report is open
        if (!this.props.isDrawerOpen) {
            Report.updateLastReadActionID(this.props.reportID);
        }
    }

    /**
     * Hide the FloatingMessageCounter
     */
    hideFloatingMessageCounter() {
        this.setState({shouldFloatingMessageCounterShow: false}, () => {
            this.setState({floatingMessageCounterCount: 0});
        });
    }

    /**
     * Keeps track of the Scroll offset of the main messages list
     *
     * @param {Object} {nativeEvent}
     */
    updateOffsetAndToggleMessageCounter({nativeEvent}) {
        this.currentScrollOffset = -nativeEvent.contentOffset.y;
        this.toggleFloatingMessageCounter();
    }

    render() {
        // Comments have not loaded at all yet do nothing
        if (!_.size(this.props.reportActions)) {
            return null;
        }

        return (
            <>
                <FloatingMessageCounter
                    active={this.state.shouldFloatingMessageCounterShow}
                    count={this.state.floatingMessageCounterCount}
                    onClick={this.scrollToBottomAndUpdateLastRead}
                    onClose={this.hideFloatingMessageCounter}
                />
                <ReportActionsList
                    report={this.props.report}
                    reportID={this.props.reportID}
                    sortedReportActions={this.sortedReportActions}
                    extraData={this.isReportInView() ? this.props.report.newMarkerSequenceNumber : undefined}
                    onScroll={this.updateOffsetAndToggleMessageCounter}
                />
                <PopoverReportActionContextMenu ref={ReportActionContextMenu.contextMenuRef} />
                <EmojiPicker ref={EmojiPickerAction.emojiPickerRef} />
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
    withOnyx({
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
    }),
)(ReportActionsView);
