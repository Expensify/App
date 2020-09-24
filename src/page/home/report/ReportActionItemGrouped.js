import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,
};

class ReportActionItemGrouped extends React.PureComponent {
    render() {
        const {action} = this.props;
        return (
            <View style={[styles.chatItem]}>
                <View style={[styles.chatItemRightGrouped]}>
                    <View style={[styles.chatItemMessage]}>
                        <ReportActionItemMessage action={action} />
                    </View>
                </View>
            </View>
        );
    }
}

ReportActionItemGrouped.propTypes = propTypes;

export default ReportActionItemGrouped;
