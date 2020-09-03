import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportHistoryPropsTypes from './ReportActionPropsTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,
};

class ReportActionItem extends React.Component {
    shouldComponentUpdate(nextProps) {
        // This component should only render if the history item's sequenceNumber or displayAsGroup props change
        return nextProps.displayAsGroup !== this.props.displayAsGroup
            || !_.isEqual(nextProps.historyItem, this.props.historyItem);
    }

    render() {
        const {historyItem, displayAsGroup} = this.props;
        if (historyItem.actionName !== 'ADDCOMMENT') {
            return null;
        }

        return (
            <View>
                {!displayAsGroup && <ReportActionItemSingle historyItem={historyItem} />}
                {displayAsGroup && <ReportActionItemGrouped historyItem={historyItem} />}
            </View>
        );
    }
}

ReportActionItem.propTypes = propTypes;

export default ReportActionItem;
