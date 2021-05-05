import React from 'react';
import {
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
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withDrawerState, {withDrawerPropTypes} from '../../../components/withDrawerState';

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    /* Onyx Props */

    // The report currently being looked at
    report: PropTypes.shape({
        // Number of actions unread
        unreadActionCount: PropTypes.number,

        // The largest sequenceNumber on this report
        maxSequenceNumber: PropTypes.number,

        // Whether there is an outstanding amount in IOU
        hasOutstandingIOU: PropTypes.bool,

        // IOU report ID associated with current report
        iouReportID: PropTypes.number,
    }),

    // Array of report actions for this report
    reportActions: PropTypes.objectOf(PropTypes.shape(ReportActionPropTypes)),

    // The session of the logged in person
    session: PropTypes.shape({
        // Email of the logged in person
        email: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
    ...withDrawerPropTypes,
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
        this.recordMaxAction = this.recordMaxAction.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.loadMoreChats = this.loadMoreChats.bind(this);
        this.startRecordMaxActionTimer = this.startRecordMaxActionTimer.bind(this);
        this.sortedReportActions = [];
        this.timers = [];

        this.initialNewMarkerPosition = props.report.unreadActionCount === 0
            ? 0
            : (props.report.maxSequenceNumber + 1) - props.report.unreadActionCount;

        this.state = {
            isLoadingMoreChats: false,
        };

        this.updateSortedReportActions(props.reportActions);
        this.updateMostRecentIOUReportActionNumber(props.reportActions);
    }

    componentDidMount() {
        AppState.addEventListener('change', this.onVisibilityChange);
        subscribeToReportTypingEvents(this.props.reportID);
        this.keyboardEvent = Keyboard.addListener('keyboardDidShow', this.scrollToListBottom);
        this.recordMaxAction();
        fetchActions(this.props.reportID);
        Timing.end(CONST.TIMING.SWITCH_REPORT, CONST.TIMING.COLD);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps.reportActions, this.props.reportActions)) {
            this.updateSortedReportActions(nextProps.reportActions);
            this.updateMostRecentIOUReportActionNumber(nextProps.reportActions);
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

        if (this.props.report.hasOutstandingIOU !== nextProps.report.hasOutstandingIOU
            || this.props.report.iouReportID !== nextProps.report.iouReportID) {
            return true;
        }

        return false;
    }

    componentDidUpdate(prevProps) {
        // The last sequenceNumber of the same report has changed.
        const previousLastSequenceNumber = lodashGet(lastItem(prevProps.reportActions), 'sequenceNumber');
        const currentLastSequenceNumber = lodashGet(lastItem(this.props.reportActions), 'sequenceNumber');
        const shouldRecordMaxAction = Visibility.isVisible()
            && !(this.props.isDrawerOpen && this.props.isSmallScreenWidth);

        if (previousLastSequenceNumber !== currentLastSequenceNumber) {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise
            // leave the user positioned where they are now in the list.
            const lastAction = lastItem(this.props.reportActions);
            if (lastAction && (lastAction.actorEmail === this.props.session.email)) {
                this.scrollToListBottom();
            }

            // When the last action changes, wait three seconds, then record the max action
            // This will make the unread indicator go away if you receive comments in the same chat you're looking at
            if (shouldRecordMaxAction) {
                this.startRecordMaxActionTimer();
            }
        }

        // We want to mark the unread comments when user resize the screen to desktop
        // Or user move back to report from LHN
        if (shouldRecordMaxAction && (
            prevProps.isDrawerOpen !== this.props.isDrawerOpen
            || prevProps.isSmallScreenWidth !== this.props.isSmallScreenWidth
        )) {
            this.startRecordMaxActionTimer();
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
            this.startRecordMaxActionTimer();
        }
    }

    /**
     * Set a timer for recording the max action
     *
     * @memberof ReportActionsView
     */
    startRecordMaxActionTimer() {
        this.timers.push(setTimeout(this.recordMaxAction, 3000));
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
     * Recorded when the report first opens and when the list is scrolled to the bottom
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
     * @param {Array<{sequenceNumber, actionName}>} reportActions
     */
    updateMostRecentIOUReportActionNumber(reportActions) {
        this.mostRecentIOUReportSequenceNumber = _.chain(reportActions)
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
        return (
            <ReportActionItem
                reportID={this.props.reportID}
                action={item.action}
                displayAsGroup={this.isConsecutiveActionMadeByPreviousActor(index)}
                shouldDisplayNewIndicator={this.initialNewMarkerPosition > 0
                    && item.action.sequenceNumber === this.initialNewMarkerPosition}
                isMostRecentIOUReportAction={item.action.sequenceNumber === this.mostRecentIOUReportSequenceNumber}
                iouReportID={this.props.report.iouReportID}
                hasOutstandingIOU={this.props.report.hasOutstandingIOU}
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
                    <Text style={[styles.textP]}>Be the first person to comment!</Text>
                </View>
            );
        }

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

export default compose(
    withWindowDimensions,
    withDrawerState,
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
