import React from 'react';
import {View, Keyboard, ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import Text from '../../../components/Text';
import withIon from '../../../components/withIon';
import {fetchActions, updateLastReadActionID} from '../../../lib/actions/Report';
import IONKEYS from '../../../IONKEYS';
import ReportActionItem from './ReportActionItem';
import styles, {colors} from '../../../style/StyleSheet';
import ReportActionPropTypes from './ReportActionPropTypes';
import InvertedFlatList from '../../../components/InvertedFlatList';

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    // Is this report currently in view?
    isActiveReport: PropTypes.bool.isRequired,

    /* Ion Props */

    // Array of report actions for this report
    reportActions: PropTypes.objectOf(PropTypes.shape(ReportActionPropTypes)),
};

const defaultProps = {
    reportActions: {},
};

class ReportActionsView extends React.Component {
    constructor(props) {
        super(props);

        this.scrollToListBottom = this.scrollToListBottom.bind(this);
        this.recordMaxAction = this.recordMaxAction.bind(this);

        this.sortedReportActions = this.updateSortedReportActions();
    }

    componentDidMount() {
        this.keyboardEvent = Keyboard.addListener('keyboardDidShow', this.scrollToListBottom);
        fetchActions(this.props.reportID);
    }

    componentDidUpdate(prevProps) {
        // When the number of actions change, wait three seconds, then record the max action
        // This will make the unread indicator go away if you receive comments in the same chat you're looking at
        if (this.props.isActiveReport && _.size(prevProps.reportActions) !== _.size(this.props.reportActions)) {
            setTimeout(this.recordMaxAction, 3000);
        }
    }

    componentWillUnmount() {
        this.keyboardEvent.remove();
    }

    /**
     * Updates and sorts the report actions by sequence number
     */
    updateSortedReportActions() {
        this.sortedReportActions = _.chain(this.props.reportActions)
            .sortBy('sequenceNumber')
            .filter(action => action.actionName === 'ADDCOMMENT')
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
        const previousAction = this.sortedReportActions[actionIndex - 1];
        const currentAction = this.sortedReportActions[actionIndex];

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
     * When the bottom of the list is reached, this is triggered, so it's a little different than recording the max
     * action when scrolled
     */
    recordMaxAction() {
        const reportActions = lodashGet(this.props, 'reportActions', {});
        const maxVisibleSequenceNumber = _.chain(reportActions)
            .pluck('sequenceNumber')
            .max()
            .value();

        updateLastReadActionID(this.props.reportID, maxVisibleSequenceNumber);
    }

    /**
     * This function is triggered from the ref callback for the scrollview. That way it can be scrolled once all the
     * items have been rendered. If the number of actions has changed since it was last rendered, then
     * scroll the list to the end.
     */
    scrollToListBottom() {
        if (this.actionListElement) {
            this.actionListElement.scrollToEnd({animated: false});
        }
        this.recordMaxAction();
    }

    render() {
        // Comments have not loaded at all yet show a loading spinner
        if (!_.size(this.props.reportActions)) {
            return (
                <View style={[styles.chatContent, styles.chatContentEmpty]}>
                    <ActivityIndicator color={colors.icon} />
                </View>
            );
        }

        // If we only have the created action then no one has left a comment
        if (_.size(this.props.reportActions) === 1) {
            return (
                <View style={[styles.chatContent, styles.chatContentEmpty]}>
                    <Text style={[styles.textP]}>Be the first person to comment!</Text>
                </View>
            );
        }

        this.updateSortedReportActions();
        return (
            <InvertedFlatList
                ref={el => this.actionListElement = el}
                data={this.sortedReportActions}
                renderItem={({
                    item,
                    index,
                    onLayout,
                    needsLayoutCalculation,
                }) => (
                    <ReportActionItem
                        action={item.action}
                        displayAsGroup={this.isConsecutiveActionMadeByPreviousActor(index)}
                        onLayout={onLayout}
                        needsLayoutCalculation={needsLayoutCalculation}
                    />
                )}
                bounces={false}
                contentContainerStyle={[styles.chatContentScrollView]}
                keyExtractor={item => `${item.action.sequenceNumber}`}
            />
        );
    }
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;

export default withIon({
    reportActions: {
        key: ({reportID}) => `${IONKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
    },
})(ReportActionsView);
