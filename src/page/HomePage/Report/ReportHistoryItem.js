import React from 'react';
import {ActivityIndicator, View} from 'react-native';
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

const ReportHistoryItem = ({displayAsGroup, historyItem}) => (
    <View>
        {!displayAsGroup && <ReportHistoryItemSingle historyItem={historyItem} />}
        {displayAsGroup && <ReportHistoryItemGrouped historyItem={historyItem} />}
        {historyItem.tempGuid && <ActivityIndicator type="small" color="#7d8b8f" />}
    </View>
);
ReportHistoryItem.propTypes = propTypes;
ReportHistoryItem.displayName = 'ReportHistoryItem';

export default ReportHistoryItem;
