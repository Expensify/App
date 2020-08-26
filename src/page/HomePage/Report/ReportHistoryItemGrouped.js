import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';
import ReportHistoryItemMessage from './ReportHistoryItemMessage';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,

    // Current users auth token
    authToken: PropTypes.string.isRequired,
};

class ReportHistoryItemGrouped extends React.PureComponent {
    render() {
        const {historyItem, authToken} = this.props;
        return (
            <View style={[styles.chatItem]}>
                <View style={[styles.chatItemRightGrouped]}>
                    <View style={[styles.chatItemMessage]}>
                        <ReportHistoryItemMessage historyItem={historyItem} authToken={authToken} />
                    </View>
                </View>
            </View>
        );
    }
}

ReportHistoryItemGrouped.propTypes = propTypes;

export default ReportHistoryItemGrouped;
