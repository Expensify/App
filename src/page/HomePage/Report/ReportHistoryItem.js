import React from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import ReportHistoryItemSingle from './ReportHistoryItemSingle';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';
import ReportHistoryItemGrouped from './ReportHistoryItemGrouped';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,
};

class ReportHistoryItem extends React.Component {
    render() {
        return (
            <View>
                {!this.props.displayAsGroup && <ReportHistoryItemSingle historyItem={this.props.historyItem} />}
                {this.props.displayAsGroup && <ReportHistoryItemGrouped historyItem={this.props.historyItem} />}
                {this.props.historyItem.tempGuid && <Text>pending...</Text>}
            </View>
        );
    }
}
ReportHistoryItem.propTypes = propTypes;

export default ReportHistoryItem;
