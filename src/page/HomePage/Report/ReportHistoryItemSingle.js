import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';
import ReportHistoryItemMessage from './ReportHistoryItemMessage';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,
};

class ReportHistoryItemSingle extends React.Component {
    render() {
        return (
            <View>
                <ReportHistoryItemMessage historyItem={this.props.historyItem} />
            </View>
        );
    }
}
ReportHistoryItemSingle.propTypes = propTypes;

export default ReportHistoryItemSingle;
