import React from 'react';
import {
    View,
    Keyboard,
    AppState,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import lodashUnionBy from 'lodash/unionBy';
import {withOnyx} from 'react-native-onyx';
import Text from '../../../components/Text';
import {
    fetchActions,
    updateLastReadActionID,
    setNewMarkerPosition,
    subscribeToReportTypingEvents,
    unsubscribeFromReportChannel,
} from '../../../libs/actions/Report';
import ONYXKEYS from '../../../ONYXKEYS';
import ReportActionItem from './ReportActionItem';
import styles from '../../../styles/styles';
import InvertedFlatList from '../../../components/InvertedFlatList';
import {lastItem} from '../../../libs/CollectionUtils';
import Visibility from '../../../libs/Visibility';
import Timing from '../../../libs/actions/Timing';
import CONST from '../../../CONST';
import themeColors from '../../../styles/themes/default';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withDrawerState, {withDrawerPropTypes} from '../../../components/withDrawerState';
import {flatListRef, scrollToBottom, scrollToIndex} from '../../../libs/ReportScrollManager';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import deferredPromise from '../../../libs/deferredPromise';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';

const propTypes = {
    /** The ID of the report actions will be created for */
    reportID: PropTypes.number.isRequired,

    /** Load chat history up and down relative to this action item */
    anchorSequenceNumber: PropTypes.number,

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
    session: {},

    // By default load the most recent chat messages
    anchorSequenceNumber: -1,
};

class ReportActionsView extends React.Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.scrollToListBottom = this.scrollToListBottom.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.loadOlderMessages = this.loadOlderMessages.bind(this);
        this.loadRecentMessages = this.loadRecentMessages.bind(this);

        // We are debouncing this call with a specific delay so that when all items in the list layout we can measure
        // the total time it took to complete.
        this.recordTimeToMeasureItemLayout = _.debounce(
            this.recordTimeToMeasureItemLayout.bind(this),
            CONST.TIMING.REPORT_ACTION_ITEM_LAYOUT_DEBOUNCE_TIME,
        );

        this.state = {
            reportActions: [],
        };
    }

    componentDidMount() {
        AppState.addEventListener('change', this.onVisibilityChange);
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

        this.loadFromAnchor(this.props.anchorSequenceNumber);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextState.reportActions, this.state.reportActions)) {
            this.updateMostRecentIOUReportActionNumber(nextState.reportActions);
            return true;
        }

        // If the new marker has changed places (because the user manually marked a comment as Unread), we have to
        // update the component.
        if (nextProps.report.newMarkerSequenceNumber > 0
            && nextProps.report.newMarkerSequenceNumber !== this.props.report.newMarkerSequenceNumber) {
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
        if (this.props.anchorSequenceNumber !== nextProps.anchorSequenceNumber) {
            return true;
        }

        return false;
    }

    componentDidUpdate(prevProps, prevState) {
        // The last sequenceNumber of the same report has changed.
        const previousLastSequenceNumber = lodashGet(lastItem(prevState.reportActions), 'sequenceNumber');
        const currentLastSequenceNumber = lodashGet(lastItem(this.state.reportActions), 'sequenceNumber');

        // Record the max action when window is visible except when Drawer is open on small screen
        const shouldRecordMaxAction = Visibility.isVisible()
            && (!this.props.isSmallScreenWidth || !this.props.isDrawerOpen);

        // Todo: this should run only when we have scrolled to the most recent message
        // E.g. when we start from a past message we don't want scrolling to recent messages to trigger this
        // Maybe trigger this from the composer - `ReportScrollManager.scrollToBottom`
        if (previousLastSequenceNumber !== currentLastSequenceNumber) {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise
            // leave the user positioned where they are now in the list.
            const lastAction = lastItem(this.state.reportActions);
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

        if (this.props.anchorSequenceNumber !== prevProps.anchorSequenceNumber) {
            this.loadFromAnchor(this.props.anchorSequenceNumber);
        }
    }

    componentWillUnmount() {
        if (this.keyboardEvent) {
            this.keyboardEvent.remove();
        }

        // We must cancel the debounce function so that we do not call the function when switching to a new chat before
        // the previous one has finished loading completely.
        this.recordTimeToMeasureItemLayout.cancel();

        AppState.removeEventListener('change', this.onVisibilityChange);

        unsubscribeFromReportChannel(this.props.reportID);

        if (this.waitItemsLayoutTask) {
            this.waitItemsLayoutTask.reject(new Error('Component is unmounting'));
        }
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
     * Load the chat relative to the starting point passed here
     * @param {number} anchor - an action sequence number
     */
    loadFromAnchor(anchor) {
        this.setState({reportActions: []});
        this.waitItemsLayoutTask = deferredPromise();
        this.loadMoreChats(anchor - 1)
            .then(() => {
                /** When an anchor is passed we need to position it in view. Since the list is inverted
                 * we're scrolled to the bottom, but when we start from the past we need to be on the top */
                if (anchor !== defaultProps.anchorSequenceNumber) {
                    const index = this.state.reportActions.length - 1;

                    /* ATM we have to wait for the items to render in order to scroll to it
                    * There should be a better way to position on the anchor when we start in the past
                    * E.g. stay at the top when new items are rendered */
                    this.waitItemsLayoutTask.promise.then(() => {
                        scrollToIndex({
                            index,
                            animated: false,
                            viewPosition: 0.5,
                        });
                    });
                }
            });
    }

    loadOlderMessages() {
        const minSequenceNumber = _.last(this.state.reportActions)?.sequenceNumber;

        // Skip fetching more. We have loaded up to the first message
        if (minSequenceNumber === 1) {
            return Promise.resolve();
        }

        const offset = Math.max(minSequenceNumber - CONST.REPORT.ACTIONS.LIMIT, 0);
        return this.loadMoreChats(offset);
    }

    loadRecentMessages() {
        const maxSequenceNumber = _.first(this.state.reportActions)?.sequenceNumber;
        return this.loadMoreChats(maxSequenceNumber);
    }

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     *
     * @param {number} offset
     * @returns {Promise}
     */
    loadMoreChats(offset) {
        if (this.fetchPromise) {
            return this.fetchPromise;
        }

        this.fetchPromise = fetchActions(this.props.reportID, offset)
            .then(({history}) => this.updateReportActions(history))
            .finally(() => {
                this.fetchPromise = null;
            });

        return this.fetchPromise;
    }

    /**
     * Updates and sorts the report actions by sequence number
     *
     * @param {Array<{sequenceNumber, actionName}>} actions
     */
    updateReportActions(actions) {
        this.setState((prevState) => {
            const union = lodashUnionBy(actions, prevState.reportActions, action => action.sequenceNumber);
            const reportActions = _.chain(union)
                .sortBy('sequenceNumber')
                .filter((action) => {
                    // Only show non-empty ADDCOMMENT actions or IOU actions
                    // Empty ADDCOMMENT actions typically mean they have been deleted and should not be shown
                    const message = _.first(lodashGet(action, 'message', null));
                    const html = lodashGet(message, 'html', '');
                    return action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU
                    || (action.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT && html !== '');
                })
                .value()
                .reverse();

            return {reportActions};
        });
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
        const previousAction = this.state.reportActions[actionIndex + 1];
        const currentAction = this.state.reportActions[actionIndex];

        // It's OK for there to be no previous action, and in that case, false will be returned
        // so that the comment isn't grouped
        if (!currentAction || !previousAction) {
            return false;
        }

        // Comments are only grouped if they happen within 5 minutes of each other
        if (currentAction.timestamp - previousAction.timestamp > 300) {
            return false;
        }

        return currentAction.actorEmail === previousAction.actorEmail;
    }

    /**
     * Finds and updates most recent IOU report action number
     *
     * @param {Array<{sequenceNumber, actionName}>} reportActions
     */
    updateMostRecentIOUReportActionNumber(reportActions) {
        this.mostRecentIOUReportSequenceNumber = _.chain(reportActions)
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
     * Runs each time a ReportActionItem is laid out. This method is debounced so we wait until the component has
     * finished laying out items before recording the chat as switched.
     */
    recordTimeToMeasureItemLayout() {
        // We are offsetting the time measurement here so that we can subtract our debounce time from the initial time
        // and get the actual time it took to load the report
        Timing.end(CONST.TIMING.SWITCH_REPORT, CONST.TIMING.COLD, CONST.TIMING.REPORT_ACTION_ITEM_LAYOUT_DEBOUNCE_TIME);
        if (this.waitItemsLayoutTask) {
            this.waitItemsLayoutTask.resolve();
            this.waitItemsLayoutTask = null;
            this.forceUpdate();
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
            {zIndex: item.sequenceNumber},
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
            && item.sequenceNumber === this.props.report.newMarkerSequenceNumber;

        return (
            <ReportActionItem
                reportID={this.props.reportID}
                action={item}
                displayAsGroup={this.isConsecutiveActionMadeByPreviousActor(index)}
                shouldDisplayNewIndicator={shouldDisplayNewIndicator}
                isMostRecentIOUReportAction={item.sequenceNumber === this.mostRecentIOUReportSequenceNumber}
                isUsedAsAnchor={item.sequenceNumber === this.props.anchorSequenceNumber}
                hasOutstandingIOU={this.props.report.hasOutstandingIOU}
                index={index}
                onLayout={this.recordTimeToMeasureItemLayout}
            />
        );
    }

    render() {
        // If we only have the created action then no one has left a comment
        if (_.size(this.state.reportActions) === 1) {
            return (
                <View style={[styles.chatContent, styles.chatContentEmpty]}>
                    <Text style={[styles.textP]}>
                        {this.props.translate('reportActionsView.beFirstPersonToComment')}
                    </Text>
                </View>
            );
        }

        const isLoading = Boolean(this.waitItemsLayoutTask || !_.size(this.state.reportActions));

        return (
            <>
                <FullScreenLoadingIndicator visible={isLoading} />
                <InvertedFlatList
                    ref={flatListRef}
                    data={this.state.reportActions}
                    renderItem={this.renderItem}
                    CellRendererComponent={this.renderCell}
                    ListEmptyComponent={() => null}
                    contentContainerStyle={[styles.chatContentScrollView]}

                // We use a combination of sequenceNumber and clientID in case the clientID are the same - which
                // shouldn't happen, but might be possible in some rare cases.
                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                    keyExtractor={action => `${action.sequenceNumber}${action.clientID}`}
                    initialRowHeight={32}
                    onEndReached={this.loadOlderMessages}
                    onStartReached={this.loadRecentMessages}
                    keyboardShouldPersistTaps="handled"
                    activityIndicatorColor={themeColors.spinner}
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
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ReportActionsView);
