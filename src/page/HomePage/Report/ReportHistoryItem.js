import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportHistoryItemSingle from './ReportHistoryItemSingle';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';
import ReportHistoryItemGrouped from './ReportHistoryItemGrouped';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,

    // Current users auth token
    authToken: PropTypes.string.isRequired,
};

class ReportHistoryItem extends React.Component {
    shouldComponentUpdate(nextProps) {
        // This component should only render if the history item's sequenceNumber or displayAsGroup props change
        return nextProps.historyItem.sequenceNumber !== this.props.historyItem.sequenceNumber
            || nextProps.displayAsGroup !== this.props.displayAsGroup
            || nextProps.authToken !== this.props.authToken;
    }

    render() {
        const {historyItem, displayAsGroup, authToken} = this.props;
        if (historyItem.actionName !== 'ADDCOMMENT') {
            return null;
        }

        return (
            <View>
                {!displayAsGroup && (<ReportHistoryItemSingle historyItem={historyItem} authToken={authToken} />)}
                {displayAsGroup && <ReportHistoryItemGrouped historyItem={historyItem} authToken={authToken} />}
            </View>
        );
    }
}

ReportHistoryItem.propTypes = propTypes;

export default ReportHistoryItem;
