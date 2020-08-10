import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportHistoryItemSingle from './ReportHistoryItemSingle';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,
};

class ReportHistoryItem extends React.Component {
    render() {
        return (
            <View>
                <ReportHistoryItemSingle historyItem={this.props.historyItem} />
            </View>
        );
    }
}
ReportHistoryItem.propTypes = propTypes;

export default ReportHistoryItem;
