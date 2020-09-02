import React from 'react';
import {View, ScrollView, Keyboard} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import Text from '../../../components/Text';
import Ion from '../../../lib/Ion';
import withIon from '../../../components/withIon';
import {fetchHistory, updateLastReadActionID} from '../../../lib/actions/Report';
import IONKEYS from '../../../IONKEYS';
import ReportHistoryItem from './ReportHistoryItem';
import styles from '../../../style/StyleSheet';
import {withRouter} from '../../../lib/Router';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';
import compose from '../../../lib/compose';

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    /* Ion Props */

    // Array of report history items for this report
    reportHistory: PropTypes.PropTypes.objectOf(PropTypes.shape(ReportHistoryPropsTypes)),
};

const defaultProps = {
    reportHistory: {},
};

class ReportHistoryView extends React.Component {
    constructor(props) {
        super(props);

        this.recordlastReadActionID = _.debounce(this.recordlastReadActionID.bind(this), 1000, true);
        this.scrollToListBottom = this.scrollToListBottom.bind(this);
    }

    componentDidMount() {
        this.keyboardEvent = Keyboard.addListener('keyboardDidShow', this.scrollToListBottom);
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
     * @param {Number} historyItemIndex - index of the comment item in state to check
     *
     * @return {Boolean}
     */
    // eslint-disable-next-line
    isConsecutiveHistoryItemMadeByPreviousActor(historyItemIndex) {
        const reportHistory = lodashGet(this.props, 'reportHistory', {});

        // This is the created action and the very first action so it cannot be a consecutive comment.
        if (historyItemIndex === 0) {
            return false;
        }

        const previousAction = reportHistory[historyItemIndex - 1];
        const currentAction = reportHistory[historyItemIndex];

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
        const reportHistory = lodashGet(this.props, 'reportHistory', {});
        const maxVisibleSequenceNumber = _.chain(reportHistory)
            .pluck('sequenceNumber')
            .max()
            .value();
        this.recordlastReadActionID(maxVisibleSequenceNumber);
    }

    /**
     * Takes a max seqNum and if it's greater than the last read action, then make a request to the API to
     * update the report
     *
     * @param {number} maxSequenceNumber
     */
    recordlastReadActionID(maxSequenceNumber) {
        let myAccountID;
        Ion.get(IONKEYS.SESSION, 'accountID')
            .then((accountID) => {
                myAccountID = accountID;
                const path = `reportNameValuePairs.lastReadActionID_${accountID}`;
                return Ion.get(`${IONKEYS.REPORT}_${this.props.reportID}`, path, 0);
            })
            .then((lastReadActionID) => {
                if (maxSequenceNumber > lastReadActionID) {
                    updateLastReadActionID(myAccountID, this.props.reportID, maxSequenceNumber);
                }
            });
    }

    /**
     * This function is triggered from the ref callback for the scrollview. That way it can be scrolled once all the
     * items have been rendered. If the number of items in our history have changed since it was last rendered, then
     * scroll the list to the end.
     */
    scrollToListBottom() {
        if (this.historyListElement) {
            this.historyListElement.scrollToEnd({animated: false});
        }
        this.recordMaxAction();
    }

    render() {
        if (!_.size(this.props.reportHistory)) {
            return (
                <View style={[styles.chatContent, styles.chatContentEmpty]}>
                    <Text style={[styles.textP]}>Be the first person to comment!</Text>
                </View>
            );
        }

        return (
            <ScrollView
                ref={(el) => {
                    this.historyListElement = el;
                }}
                onContentSizeChange={this.scrollToListBottom}
                bounces={false}
                contentContainerStyle={[styles.chatContentScrollView]}
            >
                {_.chain(this.props.reportHistory).sortBy('sequenceNumber').map((item, index) => (
                    <ReportHistoryItem
                        key={item.sequenceNumber}
                        historyItem={item}
                        displayAsGroup={this.isConsecutiveHistoryItemMadeByPreviousActor(index)}
                    />
                )).value()}
            </ScrollView>
        );
    }
}

ReportHistoryView.propTypes = propTypes;
ReportHistoryView.defaultProps = defaultProps;

const key = `${IONKEYS.REPORT_HISTORY}_%DATAFROMPROPS%`;
export default compose(
    withRouter,
    withIon({
        reportHistory: {
            key,
            loader: fetchHistory,
            loaderParams: ['%DATAFROMPROPS%'],
            pathForProps: 'reportID',
        },
    }),
)(ReportHistoryView);
