import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../../style/StyleSheet';
import {fetchHistory} from '../../../store/actions/ReportActions';
import WithStore from '../../../components/WithStore';
import STOREKEYS from '../../../store/STOREKEYS';
import ReportHistoryItem from './ReportHistoryItem';

const propTypes = {
    // The ID of the report being looked at
    reportID: PropTypes.string.isRequired,

    // These are from WithStore
    bind: PropTypes.func.isRequired,
    unbind: PropTypes.func.isRequired,
};

class ReportHistoryView extends React.Component {
    componentDidMount() {
        this.bindToStore();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.reportID !== this.props.reportID) {
            this.props.unbind();
            this.bindToStore();
        }
    }

    bindToStore() {
        // Bind this.state.reportHistory to the history in the store
        // and call fetchHistory to load it with data
        this.props.bind({
            reportHistory: {
                key: `${STOREKEYS.REPORT}_${this.props.reportID}_history`,
                loader: fetchHistory,
                loaderParams: [this.props.reportID],
            }
        }, this);
    }

    render() {
        return (
            <View style={styles.flexColumn}>
                {this.state && this.state.reportHistory && this.state.reportHistory.length === 0 && (
                    <Text>Be the first person to comment!</Text>
                )}
                {this.state && this.state.reportHistory && this.state.reportHistory.length > 0 && _.map(this.state.reportHistory, reportHistoryItem => (
                    <ReportHistoryItem
                        key={reportHistoryItem.sequenceNumber}
                        data={reportHistoryItem}
                    />
                ))}
            </View>
        );
    }
}
ReportHistoryView.propTypes = propTypes;

export default WithStore()(ReportHistoryView);
