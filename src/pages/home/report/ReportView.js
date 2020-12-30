import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionView from './ReportActionsView';
import ReportActionCompose from './ReportActionCompose';
import {addAction, subscribeToReportTypingEvents, unsubscribeFromReportChannel} from '../../../libs/actions/Report';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import Timing from '../../../libs/actions/Timing';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    // Whether or not this report is the one that is currently being viewed
    isActiveReport: PropTypes.bool.isRequired,
};

// This is a PureComponent so that it only re-renders when the reportID changes or when the report changes from
// active to inactive (or vice versa). This should greatly reduce how often comments are re-rendered.
class ReportView extends React.PureComponent {
    componentDidMount() {
        subscribeToReportTypingEvents(this.props.reportID);

        Timing.end(CONST.TIMING.SWITCH_REPORT, CONST.TIMING.COLD);
    }

    componentDidUpdate(props) {
        if (!props.isActiveReport) {
            Timing.end(CONST.TIMING.SWITCH_REPORT, CONST.TIMING.HOT);
        }
    }

    componentWillUnmount() {
        unsubscribeFromReportChannel(this.props.reportID);
    }

    render() {
        // Only display the compose form for the active report because the form needs to get focus and
        // calling focus() on 42 different forms doesn't work
        const shouldShowComposeForm = this.props.isActiveReport;
        return (
            <View style={[styles.chatContent]}>
                <ReportActionView
                    reportID={this.props.reportID}
                    isActiveReport={this.props.isActiveReport}
                />

                {shouldShowComposeForm && (
                    <ReportActionCompose
                        onSubmit={text => addAction(this.props.reportID, text)}
                        reportID={this.props.reportID}
                    />
                )}

                <KeyboardSpacer />
            </View>
        );
    }
}

ReportView.propTypes = propTypes;

export default ReportView;
