import React from 'react';
import {Text, VirtualizedList} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import {fetchHistory} from '../../../store/actions/ReportActions';
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
    }

    componentDidMount() {
        this.bindToStore();
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
        const filteredHistory = this.getFilteredReportHistory();

        // This is the created action and the very first action so it cannot be a consecutive comment.
        if (historyItemIndex === 0) {
            return false;
        }

        const previousAction = filteredHistory[historyItemIndex - 1];
        const currentAction = filteredHistory[historyItemIndex];

        if (currentAction.timestamp - previousAction.timestamp > 300) {
            return false;
        }

        return currentAction.actorEmail === previousAction.actorEmail;
    }

    render() {
        const filteredHistory = this.getFilteredReportHistory();

        if (filteredHistory.length === 0) {
            return <Text>Be the first person to comment!</Text>;
        }

        return (
            <VirtualizedList
                ref={el => this.reportHistoryList = el}
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

                // We have to return a string for the key or else FlatList throws an error
                keyExtractor={reportHistoryItem => `${reportHistoryItem.sequenceNumber}`}
            />
        );
    }
}
ReportHistoryView.propTypes = propTypes;

export default WithStore()(ReportHistoryView);
