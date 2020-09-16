import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionView from './ReportActionsView';
import ReportActionCompose from './ReportActionCompose';
import {addAction} from '../../../lib/actions/Report';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    // Whether or not to show the compose comment form
    showComposeForm: PropTypes.bool.isRequired,

    // These are styles to apply to the report view
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any.isRequired,
};

// This is a PureComponent so that it only re-renders when the reportID changes or when the report changes from
// active to inactive (or vice versa). This should greatly reduce how often comments are re-rendered.
class ReportView extends React.PureComponent {
    render() {
        return (
            <View style={[styles.chatContent, this.props.style]}>
                <ReportActionView reportID={this.props.reportID} />

                {this.props.showComposeForm && (
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
