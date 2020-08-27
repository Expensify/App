import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportHistoryView from './ReportHistoryView';
import ReportHistoryCompose from './ReportHistoryCompose';
import {addHistoryItem} from '../../../lib/actions/Report';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,
};

// This is a PureComponent so that it only re-renders when the reportID changes (and it never should change, so once
// rendered, always rendered)
class ReportView extends React.PureComponent {
    render() {
        return (
            <View style={[styles.chatContent]}>
                <ReportHistoryView reportID={this.props.reportID} />
                <ReportHistoryCompose
                    reportID={this.props.reportID}
                    onSubmit={addHistoryItem}
                />
                <KeyboardSpacer />
            </View>
        );
    }
}

ReportView.propTypes = propTypes;

export default ReportView;
