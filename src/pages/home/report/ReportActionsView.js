import React from 'react';
import {
    Animated,
    View,
    Keyboard,
    AppState,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import Text from '../../../components/Text';
import UnreadActionIndicator from '../../../components/UnreadActionIndicator';
import {
    fetchActions,
    updateLastReadActionID,
    subscribeToReportTypingEvents,
    unsubscribeFromReportChannel,
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

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    /* Onyx Props */

    // The report currently being looked at
    report: PropTypes.shape({
        // Number of actions unread
        unreadActionCount: PropTypes.number,
    }),

    // Array of report actions for this report
    reportActions: PropTypes.objectOf(PropTypes.shape(ReportActionPropTypes)),

    // The session of the logged in person
    session: PropTypes.shape({
        // Email of the logged in person
        email: PropTypes.string,
    }),
};

const defaultProps = {
    report: {
        unreadActionCount: 0,
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
        this.recordMaxAction = this.recordMaxAction.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.loadMoreChats = this.loadMoreChats.bind(this);
        this.sortedReportActions = [];
        this.timers = [];
        this.unreadIndicatorOpacity = new Animated.Value(1);

        // Helper variable that keeps track of the unread action count before it updates to zero
        this.unreadActionCount = 0;

        this.state = {
            isLoadingMoreChats: false,
        };

        this.updateSortedReportActions(props.reportActions);
        this.updateMostRecentIOUReportActionNumber();
    }

    componentDidMount() {
        AppState.addEventListener('change', this.onVisibilityChange);
        subscribeToReportTypingEvents(this.props.reportID);
        this.keyboardEvent = Keyboard.addListener('keyboardDidShow', this.scrollToListBottom);
        this.recordMaxAction();
        fetchActions(this.props.reportID);
        this.setUpUnreadActionIndicator();
        Timing.end(CONST.TIMING.SWITCH_REPORT, CONST.TIMING.COLD);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps.reportActions, this.props.reportActions)) {
            this.updateSortedReportActions(nextProps.reportActions);
            this.updateMostRecentIOUReportActionNumber();
            return true;
        }

        if (nextState.isLoadingMoreChats !== this.state.isLoadingMoreChats) {
            return true;
        }

        return false;
    }

    componentDidUpdate(prevProps) {
        // The last sequenceNumber of the same report has changed.
        const previousLastSequenceNumber = lodashGet(lastItem(prevProps.reportActions), 'sequenceNumber');
        const currentLastSequenceNumber = lodashGet(lastItem(this.props.reportActions), 'sequenceNumber');
        if (previousLastSequenceNumber !== currentLastSequenceNumber) {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise
            // leave the user positioned where they are now in the list.
            const lastAction = lastItem(this.props.reportActions);
            if (lastAction && (lastAction.actorEmail === this.props.session.email)) {
                this.scrollToListBottom();
            }

            // When the last action changes, wait three seconds, then record the max action
            // This will make the unread indicator go away if you receive comments in the same chat you're looking at
            if (Visibility.isVisible()) {
                this.timers.push(setTimeout(this.recordMaxAction, 3000));
            }
        }
    }

    componentWillUnmount() {
        if (this.keyboardEvent) {
            this.keyboardEvent.remove();
        }

        AppState.removeEventListener('change', this.onVisibilityChange);

        _.each(this.timers, timer => clearTimeout(timer));
        unsubscribeFromReportChannel(this.props.reportID);
    }

    /**
     * Records the max action on app visibility change event.
     */
    onVisibilityChange() {
        if (Visibility.isVisible()) {
            this.timers.push(setTimeout(this.recordMaxAction, 3000));
        }
    }

    /**
     * Checks if the unreadActionIndicator should be shown.
     * If it does, starts a timeout for the fading out animation and creates
     * a flag to not show it again if the report is still open
     */
    setUpUnreadActionIndicator() {
        this.unreadActionCount = this.props.report.unreadActionCount;

        if (this.unreadActionCount > 0) {
            this.unreadIndicatorOpacity = new Animated.Value(1);
            this.timers.push(setTimeout(() => {
                Animated.timing(this.unreadIndicatorOpacity, {
                    toValue: 0,
                    useNativeDriver: false,
                }).start();
            }, 3000));
        }
    }

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    loadMoreChats() {
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
            .filter(action => action.actionName === 'ADDCOMMENT' || action.actionName === 'IOU')
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
     * When the bottom of the list is reached, this is triggered, so it's a little different than recording the max
     * action when scrolled
     */
    recordMaxAction() {
        const reportActions = lodashGet(this.props, 'reportActions', {});
        const maxVisibleSequenceNumber = _.chain(reportActions)

            // We want to avoid marking any pending actions as read since
            // 1. Any action ID that hasn't been delivered by the server is a temporary action ID.
            // 2. We already set a comment someone has authored as the lastReadActionID_<accountID> rNVP on the server
            // and should sync it locally when we handle it via Pusher or Airship
            .reject(action => action.loading)
            .pluck('sequenceNumber')
            .max()
            .value();

        updateLastReadActionID(this.props.reportID, maxVisibleSequenceNumber);
    }

    /**
     * Finds and updates most recent IOU report action number
     *
     */
    updateMostRecentIOUReportActionNumber() {
        this.mostRecentIOUReportSequenceNumber = _.chain(this.props.reportActions)
            .sortBy('sequenceNumber')
            .filter(action => action.actionName === 'IOU')
            .max(action => action.sequenceNumber)
            .value().sequenceNumber;
    }

    /**
     * This function is triggered from the ref callback for the scrollview. That way it can be scrolled once all the
     * items have been rendered. If the number of actions has changed since it was last rendered, then
     * scroll the list to the end. As a report can contain non-message actions, we should confirm that list data exists.
     */
    scrollToListBottom() {
        if (this.actionListElement) {
            this.actionListElement.scrollToIndex({animated: false, index: 0});
        }
        this.recordMaxAction();
    }

    /**
     * This function overrides the CellRendererComponent (defaults to a plain View), giving each ReportActionItem a
     *  higher z-index than the one below it. This prevents issues where the ReportActionContextMenu overlapping between
     *  rows is hidden beneath other rows.
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
     * @param {Function} args.onLayout
     *
     * @returns {React.Component}
     */
    renderItem({
        item,
        index,
        onLayout,
    }) {
        return (

        // Using <View /> instead of a Fragment because there is a difference between how
        // <InvertedFlatList /> are implemented on native and web/desktop which leads to
        // the unread indicator on native to render below the message instead of above it.
            <View>
                {this.unreadActionCount > 0 && index === this.unreadActionCount - 1 && (
                    <UnreadActionIndicator animatedOpacity={this.unreadIndicatorOpacity} />
                )}
                <ReportActionItem
                    reportID={this.props.reportID}
                    action={item.action}
                    displayAsGroup={this.isConsecutiveActionMadeByPreviousActor(index)}
                    onLayout={onLayout}
                    isMostRecentIOUReportAction={item.action.sequenceNumber === this.mostRecentIOUReportSequenceNumber}
                />
            </View>
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
                    <Text style={[styles.textP]}>Be the first person to comment!</Text>
                </View>
            );
        }

        this.setUpUnreadActionIndicator();
        return (
            <InvertedFlatList
                ref={el => this.actionListElement = el}
                data={this.sortedReportActions}
                renderItem={this.renderItem}
                CellRendererComponent={this.renderCell}
                contentContainerStyle={[styles.chatContentScrollView]}
                keyExtractor={item => `${item.action.sequenceNumber}`}
                initialRowHeight={32}
                onEndReached={this.loadMoreChats}
                onEndReachedThreshold={0.75}
                ListFooterComponent={this.state.isLoadingMoreChats
                    ? <ActivityIndicator size="small" color={themeColors.spinner} />
                    : null}
            />
        );
    }
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;

export default withOnyx({
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
})(ReportActionsView);
