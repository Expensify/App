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
};

const ReportHistoryItem = ({displayAsGroup, historyItem}) => {
    if (historyItem.actionName !== 'ADDCOMMENT') {
        return null;
    }

    return (
        <View>
            {!displayAsGroup && <ReportHistoryItemSingle historyItem={historyItem} />}
            {displayAsGroup && <ReportHistoryItemGrouped historyItem={historyItem} />}
        </View>
    );
};
ReportHistoryItem.propTypes = propTypes;
ReportHistoryItem.displayName = 'ReportHistoryItem';

export default ReportHistoryItem;
