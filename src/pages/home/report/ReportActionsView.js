import React from 'react';
import {
    View,
    Keyboard,
    AppState,
    ActivityIndicator,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Clipboard from '../../../libs/Clipboard';
import * as Report from '../../../libs/actions/Report';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import SelectionScraper from '../../../libs/SelectionScraper';
import ReportActionItem from './ReportActionItem';
import styles from '../../../styles/styles';
import reportActionPropTypes from './reportActionPropTypes';
import InvertedFlatList from '../../../components/InvertedFlatList';
import * as CollectionUtils from '../../../libs/CollectionUtils';
import Visibility from '../../../libs/Visibility';
import Timing from '../../../libs/actions/Timing';
import CONST from '../../../CONST';
import themeColors from '../../../styles/themes/default';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withDrawerState, {withDrawerPropTypes} from '../../../components/withDrawerState';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import PopoverReportActionContextMenu from './ContextMenu/PopoverReportActionContextMenu';
import variables from '../../../styles/variables';
import Performance from '../../../libs/Performance';
import * as ReportUtils from '../../../libs/reportUtils';
import ONYXKEYS from '../../../ONYXKEYS';
import {withNetwork, withPersonalDetails} from '../../../components/OnyxProvider';
import participantPropTypes from '../../../components/participantPropTypes';
import EmojiPicker from '../../../components/EmojiPicker/EmojiPicker';
import * as EmojiPickerAction from '../../../libs/actions/EmojiPickerAction';
import FloatingMessageCounter from './FloatingMessageCounter';
import networkPropTypes from '../../../components/networkPropTypes';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';

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

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

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
    personalDetails: {},
};

class ReportActionsView extends React.Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.scrollToBottomAndUpdateLastRead = this.scrollToBottomAndUpdateLastRead.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.recordTimeToMeasureItemLayout = this.recordTimeToMeasureItemLayout.bind(this);
        this.loadMoreChats = this.loadMoreChats.bind(this);
        this.appStateChangeListener = null;

        this.didLayout = false;

        this.state = {
            isFloatingMessageCounterVisible: false,
            messageCounterCount: this.props.report.unreadActionCount,
        };

        this.currentScrollOffset = 0;
        this.sortedReportActions = ReportActionsUtils.getSortedReportActions(props.reportActions);
        this.mostRecentIOUReportSequenceNumber = ReportActionsUtils.getMostRecentIOUReportSequenceNumber(props.reportActions);
        this.keyExtractor = this.keyExtractor.bind(this);
        this.trackScroll = this.trackScroll.bind(this);
        this.showFloatingMessageCounter = this.showFloatingMessageCounter.bind(this);
        this.hideFloatingMessageCounter = this.hideFloatingMessageCounter.bind(this);
        this.toggleFloatingMessageCounter = this.toggleFloatingMessageCounter.bind(this);
        this.updateNewMarkerPosition = this.updateNewMarkerPosition.bind(this);
        this.updateMessageCounterCount = this.updateMessageCounterCount.bind(this);
        this.updateNewMarkerAndMarkReadOnce = _.once(this.updateNewMarkerAndMarkRead.bind(this));
    }

    componentDidMount() {
        this.appStateChangeListener = AppState.addEventListener('change', this.onVisibilityChange);

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

        const copyShortcutConfig = CONST.KEYBOARD_SHORTCUTS.COPY;
        this.unsubscribeCopyShortcut = KeyboardShortcut.subscribe(
            copyShortcutConfig.shortcutKey,
            this.copySelectionToClipboard,
            copyShortcutConfig.descriptionKey,
            copyShortcutConfig.modifiers,
            false,
        );
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

        // Record the max action when window is visible except when Drawer is open on small screen
        const shouldRecordMaxAction = Visibility.isVisible()
            && (!this.props.isSmallScreenWidth || !this.props.isDrawerOpen);

        if (previousLastSequenceNumber !== currentLastSequenceNumber) {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise
            // leave the user positioned where they are now in the list.
            const lastAction = CollectionUtils.lastItem(this.props.reportActions);
            if (lastAction && (lastAction.actorEmail === this.props.session.email)) {
                ReportScrollManager.scrollToBottom();
            }

            if (lodashGet(lastAction, 'actorEmail', '') !== lodashGet(this.props.session, 'email', '')) {
                // Only update the unread count when the floating message counter is visible
                // Otherwise counter will be shown on scrolling up from the bottom even if user have read those messages
                if (this.state.isFloatingMessageCounterVisible) {
                    this.updateMessageCounterCount(!shouldRecordMaxAction);
                }

                // show new floating message counter when there is a new message
                this.toggleFloatingMessageCounter();
            }

            // When the last action changes, record the max action
            // This will make the NEW marker line go away if you receive comments in the same chat you're looking at
            if (shouldRecordMaxAction) {
                Report.updateLastReadActionID(this.props.reportID);
            }
        } else if (shouldRecordMaxAction && (
            prevProps.isDrawerOpen !== this.props.isDrawerOpen
            || prevProps.isSmallScreenWidth !== this.props.isSmallScreenWidth
        )) {
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

        if (this.unsubscribeCopyShortcut) {
            this.unsubscribeCopyShortcut();
        }
    }

    /**
     * Records the max action on app visibility change event.
     */
    onVisibilityChange() {
        if (!Visibility.isVisible() || this.props.isDrawerOpen) {
            return;
        }

        Report.updateLastReadActionID(this.props.reportID);
    }

    copySelectionToClipboard() {
        const selectionMarkdown = SelectionScraper.getAsMarkdown();

        Clipboard.setString(selectionMarkdown);
    }

    /**
     * Create a unique key for Each Action in the FlatList.
     * We use a combination of sequenceNumber and clientID in case the clientID are the same - which
     * shouldn't happen, but might be possible in some rare cases.
     * @param {Object} item
     * @return {String}
     */
    keyExtractor(item) {
        return `${item.action.sequenceNumber}${item.action.clientID}`;
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
     * Calculates the ideal number of report actions to render in the first render, based on the screen height and on
     * the height of the smallest report action possible.
     * @return {Number}
     */
    calculateInitialNumToRender() {
        const minimumReportActionHeight = styles.chatItem.paddingTop + styles.chatItem.paddingBottom
            + variables.fontSizeNormalHeight;
        const availableHeight = this.props.windowHeight
            - (styles.chatFooter.minHeight + variables.contentHeaderHeight);
        return Math.ceil(availableHeight / minimumReportActionHeight);
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

    /**
     * This function overrides the CellRendererComponent (defaults to a plain View), giving each ReportActionItem a
     * higher z-index than the one below it. This prevents issues where the ReportActionContextMenu overlapping between
     * rows is hidden beneath other rows.
     *
     * @param {Object} index - The ReportAction item in the FlatList.
     * @param {Object|Array} style – The default styles of the CellRendererComponent provided by the CellRenderer.
     * @param {Object} props – All the other Props provided to the CellRendererComponent by default.
     * @returns {React.Component}
     */
    renderCell({item, style, ...props}) {
        const cellStyle = [
            style,
            {zIndex: item.action.sequenceNumber},
        ];
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <View style={cellStyle} {...props} />;
    }

    /**
     * Do not move this or make it an anonymous function it is a method
     * so it will not be recreated each time we render an item
     *
     * See: https://reactnative.dev/docs/optimizing-flatlist-configuration#avoid-anonymous-function-on-renderitem
     *
     * @param {Object} args
     * @param {Object} args.item
     * @param {Number} args.index
     *
     * @returns {React.Component}
     */
    renderItem({
        item,
        index,
    }) {
        const shouldDisplayNewIndicator = this.props.report.newMarkerSequenceNumber > 0
            && item.action.sequenceNumber === this.props.report.newMarkerSequenceNumber;
        return (
            <ReportActionItem
                reportID={this.props.reportID}
                action={item.action}
                displayAsGroup={ReportActionsUtils.isConsecutiveActionMadeByPreviousActor(this.sortedReportActions, index)}
                shouldDisplayNewIndicator={shouldDisplayNewIndicator}
                isMostRecentIOUReportAction={item.action.sequenceNumber === this.mostRecentIOUReportSequenceNumber}
                hasOutstandingIOU={this.props.report.hasOutstandingIOU}
                index={index}
            />
        );
    }

    render() {
        // Comments have not loaded at all yet do nothing
        if (!_.size(this.props.reportActions)) {
            return null;
        }

        // Native mobile does not render updates flatlist the changes even though component did update called.
        // To notify there something changes we can use extraData prop to flatlist
        const extraData = (!this.props.isDrawerOpen && this.props.isSmallScreenWidth) ? this.props.report.newMarkerSequenceNumber : undefined;
        const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(this.props.personalDetails, this.props.report);

        return (
            <>
                <FloatingMessageCounter
                    active={this.state.isFloatingMessageCounterVisible}
                    count={this.state.messageCounterCount}
                    onClick={this.scrollToBottomAndUpdateLastRead}
                    onClose={this.hideFloatingMessageCounter}
                />
                <InvertedFlatList
                    ref={ReportScrollManager.flatListRef}
                    data={this.sortedReportActions}
                    renderItem={this.renderItem}
                    CellRendererComponent={this.renderCell}
                    contentContainerStyle={[
                        styles.chatContentScrollView,
                        shouldShowReportRecipientLocalTime && styles.pt0,
                    ]}
                    keyExtractor={this.keyExtractor}
                    initialRowHeight={32}
                    initialNumToRender={this.calculateInitialNumToRender()}
                    onEndReached={this.loadMoreChats}
                    onEndReachedThreshold={0.75}
                    ListFooterComponent={this.props.isLoadingReportActions
                        ? <ActivityIndicator size="small" color={themeColors.spinner} />
                        : null}
                    keyboardShouldPersistTaps="handled"
                    onLayout={this.recordTimeToMeasureItemLayout}
                    onScroll={this.trackScroll}
                    extraData={extraData}
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
    withPersonalDetails(),
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
