import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportActionPropTypes).isRequired,
};

class ReportActionItemGrouped extends React.PureComponent {
    render() {
        const {historyItem} = this.props;
        return (
            <View style={[styles.chatItem]}>
                <View style={[styles.chatItemRightGrouped]}>
                    <View style={[styles.chatItemMessage]}>
                        <ReportActionItemMessage historyItem={historyItem} />
                    </View>
                </View>
            </View>
        );
    }
}

ReportActionItemGrouped.propTypes = propTypes;

export default ReportActionItemGrouped;
