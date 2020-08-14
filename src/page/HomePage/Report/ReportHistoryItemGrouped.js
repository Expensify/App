import React from 'react';
import {Text} from 'react-native';
import PropTypes from 'prop-types';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';
import ReportHistoryItemMessage from './ReportHistoryItemMessage';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,
};

class ReportHistoryItemGrouped extends React.PureComponent {
    render() {
        const {historyItem} = this.props;
        return (
            <Text style={[styles.historyItemMessageWrapper]}>
                <ReportHistoryItemMessage historyItem={historyItem} />
            </Text>
        );
    }
}

ReportHistoryItemGrouped.propTypes = propTypes;

export default ReportHistoryItemGrouped;
