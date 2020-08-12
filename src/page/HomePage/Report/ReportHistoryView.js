import React from 'react';
import {Text, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import Ion from '../../../lib/Ion';
import {fetchHistory, updateLastReadActionID} from '../../../lib/actions/ActionsReport';
import WithIon from '../../../components/WithIon';
import IONKEYS from '../../../IONKEYS';
import ReportHistoryItem from './ReportHistoryItem';

const propTypes = {
    // The ID of the report being looked at
    reportID: PropTypes.string.isRequired,
};

class ReportHistoryView extends React.Component {
    constructor(props) {
        super(props);

        // Keeps track of the history length so that when length changes, the list is scrolled to the bottom
        this.previousReportHistoryLength = 0;

        this.recordlastReadActionID = _.debounce(this.recordlastReadActionID.bind(this), 1000, true);
        this.scrollToBottomWhenListSizeChanges = this.scrollToBottomWhenListSizeChanges.bind(this);
    }

    componentDidUpdate(prevProps) {
        // Reset the previous history length when the props change
        if (this.props.reportID !== prevProps.reportID) {
            this.previousReportHistoryLength = 0;
            this.itemsAreRendered = false;
        }
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
        // Disable this for now
        return false;

        // const filteredHistory = this.getFilteredReportHistory();
        //
        // // This is the created action and the very first action so it cannot be a consecutive comment.
        // if (historyItemIndex === 0) {
        //     return false;
        // }
        //
        // const previousAction = filteredHistory[historyItemIndex - 1];
        // const currentAction = filteredHistory[historyItemIndex];
        //
        // if (currentAction.timestamp - previousAction.timestamp > 300) {
        //     return false;
        // }
        //
        // return currentAction.actorEmail === previousAction.actorEmail;
    }

    /**
     * When the bottom of the list is reached, this is triggered, so it's a little different than recording the max
     * action when scrolled
     */
    recordMaxAction() {
        const reportHistory = lodashGet(this.state, 'reportHistory', []);
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
    scrollToBottomWhenListSizeChanges() {
        if (this.historyListElement) {
            if (this.previousReportHistoryLength < this.state.reportHistory.length) {
                this.historyListElement.scrollToEnd({animated: false});
                this.recordMaxAction();
            }

            this.previousReportHistoryLength = this.state.reportHistory.length;
        }
    }

    render() {
        const reportHistory = lodashGet(this.state || {}, 'reportHistory', []);
        if (reportHistory.length === 0) {
            return <Text>Be the first person to comment!</Text>;
        }

        return (
            <ScrollView
                ref={(el) => {
                    this.historyListElement = el;
                    this.scrollToBottomWhenListSizeChanges();
                }}
            >
                {_.map(reportHistory, (item, index) => (
                    <ReportHistoryItem
                        key={item.sequenceNumber}
                        historyItem={item}
                        displayAsGroup={this.isConsecutiveHistoryItemMadeByPreviousActor(index)}
                    />
                ))}
            </ScrollView>
        );
    }
}
ReportHistoryView.propTypes = propTypes;

const key = `${IONKEYS.REPORT_HISTORY}_%DATAFROMPROPS%`;
export default WithIon({
    reportHistory: {
        key,
        loader: fetchHistory,
        loaderParams: ['%DATAFROMPROPS%'],
        prefillWithKey: key,
        pathForProps: 'reportID',
    },
})(ReportHistoryView);
