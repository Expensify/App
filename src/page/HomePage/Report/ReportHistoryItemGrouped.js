import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';
import ReportHistoryItemMessage from './ReportHistoryItemMessage';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,
};

const ReportHistoryItemGrouped = ({historyItem}) => {
    return (
        <View style={[styles.flexRow]}>
            <View style={[styles.historyItemAvatarWrapperGrouped]} />
            <View style={[styles.historyItemMessageWrapper]}>
                <View style={[styles.p1]}>
                    <ReportHistoryItemMessage historyItem={historyItem} />
                </View>
            </View>
        </View>
    );
};

ReportHistoryItemGrouped.propTypes = propTypes;

export default ReportHistoryItemGrouped;
