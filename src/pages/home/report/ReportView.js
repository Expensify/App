import React from 'react';
import {Keyboard, View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionsView from './ReportActionsView';
import ReportActionCompose from './ReportActionCompose';
import {addAction} from '../../../libs/actions/Report';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import styles from '../../../styles/styles';
import SwipeableView from '../../../components/SwipeableView';

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,
};

// This is a PureComponent so that it only re-renders when the reportID changes or when the report changes from
// active to inactive (or vice versa). This should greatly reduce how often comments are re-rendered.
class ReportView extends React.Component {
    shouldComponentUpdate(prevProps) {
        return this.props.reportID !== prevProps.reportID;
    }

    render() {
        return (
            <View style={[styles.chatContent]}>
                <ReportActionsView
                    reportID={this.props.reportID}
                />
                <SwipeableView onSwipeDown={() => Keyboard.dismiss()}>
                    <ReportActionCompose
                        onSubmit={text => addAction(this.props.reportID, text)}
                        reportID={this.props.reportID}
                        key={this.props.reportID}
                    />
                </SwipeableView>
                <KeyboardSpacer />
            </View>
        );
    }
}

ReportView.propTypes = propTypes;
export default ReportView;
