import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../style/StyleSheet';
import {fetchHistory} from '../../../store/actions/ReportActions';
import WithStoreSubscribeToState from '../../../components/WithStoreSubscribeToState';
import STOREKEYS from '../../../store/STOREKEYS';

const propTypes = {
    // The ID of the report being looked at
    reportID: PropTypes.string.isRequired,

    // These are from WithStoreSubscribeToState
    bind: PropTypes.func.isRequired,
};

class ReportHistoryView extends React.Component {
    componentDidMount() {
        // Bind this.state.reportHistory to the history in the store
        // and call fetchHistory to load it with data
        this.props.bind(
            `${STOREKEYS.REPORT}_${this.props.reportID}_history`,
            null,
            null,
            'reportHistory',
            this,
            null,
            fetchHistory,
            [this.props.reportID]
        );
    }

    render() {
        return (
            <View style={styles.flexColumn}>
                <Text>Report History View</Text>
            </View>
        );
    }
}
ReportHistoryView.propTypes = propTypes;

export default WithStoreSubscribeToState()(ReportHistoryView);
