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
};

// This is a PureComponent so that it only re-renders when the reportID changes or when the report changes from
// active to inactive (or vice versa). This should greatly reduce how often comments are re-rendered.
class ReportView extends React.Component {
    componentDidMount() {
        console.log('ReportView mounted');
        subscribeToReportTypingEvents(this.props.reportID);
    }

    shouldComponentUpdate(prevProps) {
        return this.props.reportID !== prevProps.reportID;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.reportID !== this.props.reportID) {
            unsubscribeFromReportChannel(prevProps.reportID);
            subscribeToReportTypingEvents(this.props.reportID);
            Timing.end(CONST.TIMING.SWITCH_REPORT, CONST.TIMING.COLD);
        }
    }

    componentWillUnmount() {
        unsubscribeFromReportChannel(this.props.reportID);
        console.log('ReportView unmounted');
    }

    render() {
        return (
            <View style={[styles.chatContent]}>
                <ReportActionView
                    reportID={this.props.reportID}
                    isActiveReport
                />

                <ReportActionCompose
                    onSubmit={text => addAction(this.props.reportID, text)}
                    reportID={this.props.reportID}
                />
                <KeyboardSpacer />
            </View>
        );
    }
}

ReportView.propTypes = propTypes;

export default ReportView;
