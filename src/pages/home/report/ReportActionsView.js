import React from 'react';
import {
    View,
    Keyboard,
    AppState,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import Text from '../../../components/Text';
import {
    fetchActions,
    fetchChatReportsByIDs,
    updateLastReadActionID,
    setNewMarkerPosition,
    subscribeToReportTypingEvents,
    unsubscribeFromReportChannel,
    deleteReportComment,
} from '../../../libs/actions/Report';
import ONYXKEYS from '../../../ONYXKEYS';
import ReportActionItem from './ReportActionItem';
import styles from '../../../styles/styles';
import ReportActionPropTypes from './ReportActionPropTypes';
import InvertedFlatList from '../../../components/InvertedFlatList';
import {lastItem} from '../../../libs/CollectionUtils';
import Visibility from '../../../libs/Visibility';
import Timing from '../../../libs/actions/Timing';
import CONST from '../../../CONST';
import themeColors from '../../../styles/themes/default';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withDrawerState, {withDrawerPropTypes} from '../../../components/withDrawerState';
import {flatListRef, scrollToBottom} from '../../../libs/ReportScrollManager';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import PopoverWithMeasuredContent from '../../../components/PopoverWithMeasuredContent';
import ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import ConfirmModal from '../../../components/ConfirmModal';

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
    reportActions: PropTypes.objectOf(PropTypes.shape(ReportActionPropTypes)),

    /** The session of the logged in person */
    session: PropTypes.shape({
        /** Email of the logged in person */
        email: PropTypes.string,
    }),

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
};

class ReportActionsView extends React.Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.scrollToListBottom = this.scrollToListBottom.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.recordTimeToMeasureItemLayout = this.recordTimeToMeasureItemLayout.bind(this);
        this.loadMoreChats = this.loadMoreChats.bind(this);
        this.sortedReportActions = [];

        this.didLayout = false;

        this.state = {
            isLoadingMoreChats: false,
            contextMenu: {
                reportID: 0,
                reportAction: {},
                isPopoverVisible: false,
                reportActionDraftMessage: '',
                isDeleteCommentConfirmModalVisible: false,
                cursorPosition: {
                    horizontal: 0,
                    vertical: 0,
                },

                // The horizontal and vertical position (relative to the screen) where the popover will display.
                popoverAnchorPosition: {
                    horizontal: 0,
                    vertical: 0,
                },
                selection: '',
            },
        };
        this.updateSortedReportActions(props.reportActions);
        this.updateMostRecentIOUReportActionNumber(props.reportActions);

        this.onPopoverHide = () => {};
        this.popoverAnchor = undefined;
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hidePhideContentMenuopover = this.hideContentMenu.bind(this);
        this.measureContent = this.measureContent.bind(this);
        this.measureContextMenuAnchorPosition = this.measureContextMenuAnchorPosition.bind(this);
        this.confirmDeleteAndHideModal = this.confirmDeleteAndHideModal.bind(this);
        this.hideDeleteConfirmModal = this.hideDeleteConfirmModal.bind(this);
        this.showDeleteConfirmModal = this.showDeleteConfirmModal.bind(this);
        this.contextMenuHidden = this.contextMenuHidden.bind(this);
    }

    componentDidMount() {
        AppState.addEventListener('change', this.onVisibilityChange);
        Dimensions.removeEventListener('change', this.measureContextMenuAnchorPosition);

        // If the reportID is not found then we have either not loaded this chat or the user is unable to access it.
        // We will attempt to fetch it and redirect if still not accessible.
        if (!this.props.report.reportID) {
            fetchChatReportsByIDs([this.props.reportID], true);
        }
        subscribeToReportTypingEvents(this.props.reportID);
        this.keyboardEvent = Keyboard.addListener('keyboardDidShow', () => {
            if (ReportActionComposeFocusManager.isFocused()) {
                this.scrollToListBottom();
            }
        });
        updateLastReadActionID(this.props.reportID);

        // Since we want the New marker to remain in place even if newer messages come in, we set it once on mount.
        // We determine the last read action by deducting the number of unread actions from the total number.
        // Then, we add 1 because we want the New marker displayed over the oldest unread sequence.
        const oldestUnreadSequenceNumber = this.props.report.unreadActionCount === 0
            ? 0
            : (this.props.report.maxSequenceNumber - this.props.report.unreadActionCount) + 1;

        setNewMarkerPosition(this.props.reportID, oldestUnreadSequenceNumber);

        fetchActions(this.props.reportID);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps.reportActions, this.props.reportActions)) {
            this.updateSortedReportActions(nextProps.reportActions);
            this.updateMostRecentIOUReportActionNumber(nextProps.reportActions);
            return true;
        }

        // If the new marker has changed places (because the user manually marked a comment as Unread), we have to
        // update the component.
        if (nextProps.report.newMarkerSequenceNumber > 0
            && nextProps.report.newMarkerSequenceNumber !== this.props.report.newMarkerSequenceNumber) {
            return true;
        }

        if (nextState.isLoadingMoreChats !== this.state.isLoadingMoreChats) {
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

        // ContextMenu props check
        return this.state.contextMenu.isPopoverVisible !== nextState.contextMenu.isPopoverVisible
            || this.state.contextMenu.popoverAnchorPosition !== nextState.contextMenu.popoverAnchorPosition
            || this.state.contextMenu.isDeleteCommentConfirmModalVisible !== nextState.contextMenu.isDeleteCommentConfirmModalVisible;
    }

    componentDidUpdate(prevProps) {
        // The last sequenceNumber of the same report has changed.
        const previousLastSequenceNumber = lodashGet(lastItem(prevProps.reportActions), 'sequenceNumber');
        const currentLastSequenceNumber = lodashGet(lastItem(this.props.reportActions), 'sequenceNumber');

        // Record the max action when window is visible except when Drawer is open on small screen
        const shouldRecordMaxAction = Visibility.isVisible()
            && (!this.props.isSmallScreenWidth || !this.props.isDrawerOpen);

        if (previousLastSequenceNumber !== currentLastSequenceNumber) {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise
            // leave the user positioned where they are now in the list.
            const lastAction = lastItem(this.props.reportActions);
            if (lastAction && (lastAction.actorEmail === this.props.session.email)) {
                this.scrollToListBottom();
            }

            // When the last action changes, record the max action
            // This will make the unread indicator go away if you receive comments in the same chat you're looking at
            if (shouldRecordMaxAction) {
                updateLastReadActionID(this.props.reportID);
            }
        }

        // We want to mark the unread comments when user resize the screen to desktop
        // Or user move back to report from LHN
        if (shouldRecordMaxAction && (
            prevProps.isDrawerOpen !== this.props.isDrawerOpen
            || prevProps.isSmallScreenWidth !== this.props.isSmallScreenWidth
        )) {
            updateLastReadActionID(this.props.reportID);
        }
    }

    componentWillUnmount() {
        if (this.keyboardEvent) {
            this.keyboardEvent.remove();
        }

        AppState.removeEventListener('change', this.onVisibilityChange);
        Dimensions.removeEventListener('change', this.measureContextMenuAnchorPosition);
        unsubscribeFromReportChannel(this.props.reportID);
    }

    /**
     * Records the max action on app visibility change event.
     */
    onVisibilityChange() {
        if (Visibility.isVisible()) {
            updateLastReadActionID(this.props.reportID);
        }
    }

    /**
     * Get the Context menu anchor position
     * We calculate the achor coordinates from measureInWindow async method
     *
     * @returns {Promise<Object>}
     * @memberof ReportActionItem
     */
    getMeasureLocation() {
        return new Promise((res) => {
            if (this.popoverAnchor) {
                this.popoverAnchor.measureInWindow((x, y) => res({x, y}));
            } else {
                res({x: 0, y: 0});
            }
        });
    }

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {string} [selection] - A copy text.
     */
    showContextMenu(event, selection, popoverAnchor, reportID, reportAction, draftMessage) {
        const nativeEvent = event.nativeEvent || {};
        this.popoverAnchor = popoverAnchor;
        this.capturePressLocation(nativeEvent).then(() => {
            this.setState({
                contextMenu: {
                    reportID,
                    reportAction,
                    selection,
                    isPopoverVisible: true,
                    reportActionDraftMessage: draftMessage,
                },
            });
        });
    }

    /**
     * This gets called on Dimensions change to find the anchor coordinates for the action context menu.
     */
    measureContextMenuAnchorPosition() {
        if (!this.state.contextMenu.isPopoverVisible) {
            return;
        }
        this.getMeasureLocation().then(({x, y}) => {
            this.setState(prev => ({
                contextMenu: {
                    popoverAnchorPosition: {
                        horizontal: prev.cursorPosition.horizontal + x,
                        vertical: prev.cursorPosition.vertical + y,
                    },
                },
            }));
        });
    }

    contextMenuHidden() {
        this.onPopoverHide();

        // After we have called the action, reset it.
        this.onPopoverHide = () => {};
    }

    /**
     * Save the location of a native press event & set the Initial Context menu anchor coordinates
     *
     * @param {Object} nativeEvent
     * @returns {Promise}
     */
    capturePressLocation(nativeEvent) {
        return this.getMeasureLocation().then(({x, y}) => {
            this.setState({
                contextMenu: {
                    cursorPosition: {
                        horizontal: nativeEvent.pageX - x,
                        vertical: nativeEvent.pageY - y,
                    },
                    popoverAnchorPosition: {
                        horizontal: nativeEvent.pageX,
                        vertical: nativeEvent.pageY,
                    },
                },
            });
        });
    }


    /**
     * Hide the ReportActionContextMenu modal popover.
     * @param {Function} onHideCallback Callback to be called after popover is completely hidden
     */
    hideContentMenu(onHideCallback) {
        if (_.isFunction(onHideCallback)) {
            this.onPopoverHide = onHideCallback;
        }
        this.setState({
            contextMenu: {
                isPopoverVisible: false,
            },
        });
    }

    /**
     * Used to calculate the Context Menu Dimensions
     *
     * @returns {JSX}
     * @memberof ReportActionItem
     */
    measureContent() {
        return (
            <ReportActionContextMenu
                isVisible
                selection={this.state.contextMenu.selection}
                reportID={this.state.contextMenu.reportID}
                reportAction={this.state.contextMenu.reportAction}
                hidePopover={this.hideContentMenu}
                showDeleteConfirmModal={this.showDeleteConfirmModal}
            />
        );
    }

    confirmDeleteAndHideModal() {
        deleteReportComment(this.state.contextMenu.reportID, this.state.contextMenu.reportAction);
        this.setState({
            contextMenu: {
                isDeleteCommentConfirmModalVisible: false,
            },
        });
    }

    hideDeleteConfirmModal() {
        this.setState({
            contextMenu: {
                isDeleteCommentConfirmModalVisible: false,
            },
        });
    }

    /**
     * Opens the Confirm delete action modal
     *
     * @memberof ReportActionItem
     */
    showDeleteConfirmModal() {
        this.setState({
            contextMenu: {
                isDeleteCommentConfirmModalVisible: true,
            },
        });
    }


    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    loadMoreChats() {
        // Only fetch more if we are not already fetching so that we don't initiate duplicate requests.
        if (this.state.isLoadingMoreChats) {
            return;
        }

        const minSequenceNumber = _.chain(this.props.reportActions)
            .pluck('sequenceNumber')
            .min()
            .value();

        if (minSequenceNumber === 0) {
            return;
        }

        this.setState({isLoadingMoreChats: true}, () => {
            // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments, unless we're near the beginning, in which
            // case just get everything starting from 0.
            const offset = Math.max(minSequenceNumber - CONST.REPORT.ACTIONS.LIMIT, 0);
            fetchActions(this.props.reportID, offset)
                .then(() => this.setState({isLoadingMoreChats: false}));
        });
    }

    /**
     * Updates and sorts the report actions by sequence number
     *
     * @param {Array<{sequenceNumber, actionName}>} reportActions
     */
    updateSortedReportActions(reportActions) {
        this.sortedReportActions = _.chain(reportActions)
            .sortBy('sequenceNumber')
            .filter((action) => {
                // Only show non-empty ADDCOMMENT actions or IOU actions
                // Empty ADDCOMMENT actions typically mean they have been deleted and should not be shown
                const message = _.first(lodashGet(action, 'message', null));
                const html = lodashGet(message, 'html', '');
                return action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU
                    || (action.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT && html !== '');
            })
            .map((item, index) => ({action: item, index}))
            .value()
            .reverse();
    }

    /**
     * Returns true when the report action immediately before the
     * specified index is a comment made by the same actor who who
     * is leaving a comment in the action at the specified index.
     * Also checks to ensure that the comment is not too old to
     * be considered part of the same comment
     *
     * @param {Number} actionIndex - index of the comment item in state to check
     *
     * @return {Boolean}
     */
    isConsecutiveActionMadeByPreviousActor(actionIndex) {
        const previousAction = this.sortedReportActions[actionIndex + 1];
        const currentAction = this.sortedReportActions[actionIndex];

        // It's OK for there to be no previous action, and in that case, false will be returned
        // so that the comment isn't grouped
        if (!currentAction || !previousAction) {
            return false;
        }

        // Comments are only grouped if they happen within 5 minutes of each other
        if (currentAction.action.timestamp - previousAction.action.timestamp > 300) {
            return false;
        }

        return currentAction.action.actorEmail === previousAction.action.actorEmail;
    }

    /**
     * Finds and updates most recent IOU report action number
     *
     * @param {Array<{sequenceNumber, actionName}>} reportActions
     */
    updateMostRecentIOUReportActionNumber(reportActions) {
        this.mostRecentIOUReportSequenceNumber = _.chain(reportActions)
            .sortBy('sequenceNumber')
            .filter(action => action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU)
            .max(action => action.sequenceNumber)
            .value().sequenceNumber;
    }

    /**
     * This function is triggered from the ref callback for the scrollview. That way it can be scrolled once all the
     * items have been rendered. If the number of actions has changed since it was last rendered, then
     * scroll the list to the end. As a report can contain non-message actions, we should confirm that list data exists.
     */
    scrollToListBottom() {
        scrollToBottom();
        updateLastReadActionID(this.props.reportID);
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
                displayAsGroup={this.isConsecutiveActionMadeByPreviousActor(index)}
                shouldDisplayNewIndicator={shouldDisplayNewIndicator}
                isMostRecentIOUReportAction={item.action.sequenceNumber === this.mostRecentIOUReportSequenceNumber}
                hasOutstandingIOU={this.props.report.hasOutstandingIOU}
                index={index}
                showContextMenu={this.showContextMenu}
                hideContentMenu={this.hideContentMenu}
                showDeleteConfirmModal={this.showDeleteConfirmModal}
            />
        );
    }

    render() {
        // Comments have not loaded at all yet do nothing
        if (!_.size(this.props.reportActions)) {
            return null;
        }

        // If we only have the created action then no one has left a comment
        if (_.size(this.props.reportActions) === 1) {
            return (
                <View style={[styles.chatContent, styles.chatContentEmpty]}>
                    <Text>
                        {this.props.translate('reportActionsView.beFirstPersonToComment')}
                    </Text>
                </View>
            );
        }

        return (
            <>
                <InvertedFlatList
                    ref={flatListRef}
                    data={this.sortedReportActions}
                    renderItem={this.renderItem}
                    CellRendererComponent={this.renderCell}
                    contentContainerStyle={[styles.chatContentScrollView]}

                    // We use a combination of sequenceNumber and clientID in case the clientID are the same - which
                    // shouldn't happen, but might be possible in some rare cases.
                    // eslint-disable-next-line react/jsx-props-no-multi-spaces
                    keyExtractor={item => `${item.action.sequenceNumber}${item.action.clientID}`}
                    initialRowHeight={32}
                    onEndReached={this.loadMoreChats}
                    onEndReachedThreshold={0.75}
                    ListFooterComponent={this.state.isLoadingMoreChats
                        ? <ActivityIndicator size="small" color={themeColors.spinner} />
                        : null}
                    keyboardShouldPersistTaps="handled"
                    onLayout={this.recordTimeToMeasureItemLayout}
                />
                <PopoverWithMeasuredContent
                    isVisible={this.state.contextMenu.isPopoverVisible}
                    onClose={this.hideContentMenu}
                    onModalHide={this.contextMenuHidden}
                    anchorPosition={this.state.contextMenu.popoverAnchorPosition}
                    animationIn="fadeIn"
                    animationOutTiming={1}
                    measureContent={this.measureContent}
                    shouldSetModalVisibility={false}
                    fullscreen={false}
                >
                    <ReportActionContextMenu
                        isVisible
                        reportID={this.state.contextMenu.reportID}
                        reportAction={this.state.contextMenu.reportAction}
                        draftMessage={this.state.contextMenu.reportActionDraftMessage}
                        hidePopover={this.hideContentMenu}
                        showDeleteConfirmModal={this.showDeleteConfirmModal}
                    />
                </PopoverWithMeasuredContent>
                <ConfirmModal
                    title={this.props.translate('reportActionContextMenu.deleteComment')}
                    isVisible={this.state.contextMenu.isDeleteCommentConfirmModalVisible}
                    onConfirm={this.confirmDeleteAndHideModal}
                    onCancel={this.hideDeleteConfirmModal}
                    prompt={this.props.translate('reportActionContextMenu.deleteConfirmation')}
                    confirmText={this.props.translate('common.delete')}
                    cancelText={this.props.translate('common.cancel')}
                />
            </>
        );
    }
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withDrawerState,
    withLocalize,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        reportActions: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            canEvict: false,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ReportActionsView);
