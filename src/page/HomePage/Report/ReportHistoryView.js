import React from 'react';
import {Text, VirtualizedList} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import * as Store from '../../../store/Store';
import {fetchHistory, updateLastReadActionID} from '../../../store/actions/ReportActions';
import WithStore from '../../../components/WithStore';
import STOREKEYS from '../../../store/STOREKEYS';
import ReportHistoryItem from './ReportHistoryItem';

const propTypes = {
    // The ID of the report being looked at
    reportID: PropTypes.string.isRequired,

    // These are from WithStore
    bind: PropTypes.func.isRequired,
    unbind: PropTypes.func.isRequired,
};

class ReportHistoryView extends React.Component {
    constructor(props) {
        super(props);

        this.recordlastReadActionID = _.debounce(this.recordlastReadActionID.bind(this), 1000, true);
    }

    componentDidMount() {
        this.bindToStore();
        this.recordMaxAction();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.reportID !== this.props.reportID) {
            this.props.unbind();
            this.bindToStore();
        }
    }

    /**
     * Returns the report history with everything but comments filtered out
     *
     * @returns {string[]}
     */
    getFilteredReportHistory() {
        const reportHistory = lodashGet(this.state, 'reportHistory');

        // Only return comments
        return _.filter(reportHistory, historyItem => historyItem.actionName === 'ADDCOMMENT');
    }

    /**
     * Binds this component to the store (needs to be done every time the props change)
     */
    bindToStore() {
        // Bind this.state.reportHistory to the history in the store
        // and call fetchHistory to load it with data
        this.props.bind({
            reportHistory: {
                key: `${STOREKEYS.REPORT}_${this.props.reportID}_history`,
                loader: fetchHistory,
                loaderParams: [this.props.reportID],
                prefillWithKey: `${STOREKEYS.REPORT}_${this.props.reportID}_history`,
            }
        }, this);
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
        Store.get(STOREKEYS.SESSION, 'accountID')
            .then((accountID) => {
                myAccountID = accountID;
                const path = `reportNameValuePairs.lastReadActionID_${accountID}`;
                return Store.get(`${STOREKEYS.REPORT}_${this.props.reportID}`, path, 0);
            })
            .then((lastReadActionID) => {
                if (maxSequenceNumber > lastReadActionID) {
                    updateLastReadActionID(myAccountID, this.props.reportID, maxSequenceNumber);
                }
            });
    }

    render() {
        const filteredHistory = this.getFilteredReportHistory();

        if (filteredHistory.length === 0) {
            return <Text>Be the first person to comment!</Text>;
        }

        return (
            <VirtualizedList
                data={filteredHistory.reverse()}
                getItemCount={() => filteredHistory.length}
                getItem={(data, index) => filteredHistory[index]}
                initialNumToRender="10"
                inverted
                renderItem={({index, item}) => (
                    <ReportHistoryItem
                        historyItem={item}
                        displayAsGroup={this.isConsecutiveHistoryItemMadeByPreviousActor(index)}
                    />
                )}
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 100,
                }}
                onViewableItemsChanged={({viewableItems}) => {
                    const maxVisibleSequenceNumber = _.chain(viewableItems)
                        .pluck('item')
                        .pluck('sequenceNumber')
                        .max()
                        .value();
                    this.recordlastReadActionID(maxVisibleSequenceNumber);
                }}
                onEndReached={() => this.recordMaxAction()}

                // We have to return a string for the key or else FlatList throws an error
                keyExtractor={reportHistoryItem => `${reportHistoryItem.sequenceNumber}`}
            />
        );
    }
}
ReportHistoryView.propTypes = propTypes;

export default WithStore()(ReportHistoryView);
