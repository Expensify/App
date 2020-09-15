import React from 'react';
import {View, ScrollView, Keyboard} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import Text from '../../../components/Text';
import withIon from '../../../components/withIon';
import {fetchActions, updateLastReadActionID} from '../../../lib/actions/Report';
import IONKEYS from '../../../IONKEYS';
import ReportActionItem from './ReportActionItem';
import styles from '../../../style/StyleSheet';
import {withRouter} from '../../../lib/Router';
import ReportActionPropTypes from './ReportActionPropTypes';
import compose from '../../../lib/compose';
import withBatchedRendering from '../../../components/withBatchedRendering';

const propTypes = {
    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    /* Ion Props */

    // Array of report actions for this report
    itemsToRender: PropTypes.PropTypes.arrayOf(PropTypes.shape(ReportActionPropTypes)),
};

const defaultProps = {
    itemsToRender: {},
};

class ReportActionsView extends React.Component {
    constructor(props) {
        super(props);

        this.scrollToListBottom = this.scrollToListBottom.bind(this);
        this.recordMaxAction = this.recordMaxAction.bind(this);
    }

    componentDidMount() {
        this.keyboardEvent = Keyboard.addListener('keyboardDidShow', this.scrollToListBottom);
        fetchActions(this.props.reportID);
    }

    componentDidUpdate(prevProps) {
        const isReportVisible = this.props.reportID === parseInt(this.props.match.params.reportID, 10);

        // When the number of actions change, wait three seconds, then record the max action
        // This will make the unread indicator go away if you receive comments in the same chat you're looking at
        if (isReportVisible && _.size(prevProps.itemsToRender) !== _.size(this.props.itemsToRender)) {
            setTimeout(this.recordMaxAction, 3000);
        }
    }

    componentWillUnmount() {
        this.keyboardEvent.remove();
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
    // eslint-disable-next-line
    isConsecutiveActionMadeByPreviousActor(actionIndex) {
        const reportActions = lodashGet(this.props, 'itemsToRender', {});

        // This is the created action and the very first action so it cannot be a consecutive comment.
        if (actionIndex === 0) {
            return false;
        }

        const previousAction = reportActions[actionIndex - 1];
        const currentAction = reportActions[actionIndex];

        // It's OK for there to be no previous action, and in that case, false will be returned
        // so that the comment isn't grouped
        if (!currentAction || !previousAction) {
            return false;
        }

        // Only comments that follow other comments are consecutive
        if (previousAction.actionName !== 'ADDCOMMENT' || currentAction.actionName !== 'ADDCOMMENT') {
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
        const reportActions = lodashGet(this.props, 'itemsToRender', {});
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
        if (!_.size(this.props.itemsToRender)) {
            return (
                <View style={[styles.chatContent, styles.chatContentEmpty]}>
                    <Text style={[styles.textP]}>Be the first person to comment!</Text>
                </View>
            );
        }

        return (
            <ScrollView
                ref={(el) => {
                    this.actionListElement = el;
                }}
                onContentSizeChange={this.scrollToListBottom}
                bounces={false}
                contentContainerStyle={[styles.chatContentScrollView]}
            >
                {_.map(this.props.itemsToRender, (item, index) => (
                    <ReportActionItem
                        key={item.sequenceNumber}
                        action={item}
                        displayAsGroup={this.isConsecutiveActionMadeByPreviousActor(index)}
                    />
                ))}
            </ScrollView>
        );
    }
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;

export default compose(
    withRouter,
    withIon({
        reportActions: {
            key: `${IONKEYS.REPORT_ACTIONS}_%DATAFROMPROPS%`,
            pathForProps: 'reportID',
        },
    }),
    withBatchedRendering((currentBatch, props) => {
        if (!props.reportActions) {
            return false;
        }

        // Render the last 100 (most recent) report actions first
        if (currentBatch === 0) {
            const sortedReportActions = _.sortBy(props.reportActions, 'sequenceNumber');
            return _.last(sortedReportActions, 100);
        }

        // After the first reports are rendered, then the rest of the reports are rendered
        // after a brief delay to give the UI thread some breathing room
        return _.sortBy(_.values(props.reportActions), 'sequenceNumber');
    })
)(ReportActionsView);
