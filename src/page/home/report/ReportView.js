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

    // Whether or not this report is the one that is currently being viewed
    isActiveReport: PropTypes.bool.isRequired,
};

// This is a PureComponent so that it only re-renders when the reportID changes or the report is active
// or not. This should greatly reduce how often comments are re-rendered.
class ReportView extends React.PureComponent {
    render() {
        // Only display the compose form for the active report because the form needs to get focus and
        // calling focus() on 42 different forms doesn't work
        const shouldShowComposeForm = this.props.isActiveReport;
        return (
            <View style={[styles.chatContent]}>
                <ReportHistoryView reportID={this.props.reportID} />

                {shouldShowComposeForm && (
                    <ReportHistoryCompose
                        reportID={this.props.reportID}
                        onSubmit={addHistoryItem}
                    />
                )}

                <KeyboardSpacer />
            </View>
        );
    }
}

ReportView.propTypes = propTypes;

export default ReportView;
