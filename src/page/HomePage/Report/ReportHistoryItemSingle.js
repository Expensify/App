import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,
};

class ReportHistoryItemSingle extends React.Component {
    render() {
        return (
            <View>
                <Text>Single history item</Text>
            </View>
        );
    }
}
ReportHistoryItemSingle.propTypes = propTypes;

export default ReportHistoryItemSingle;
