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
    /* The ID of the report the selected report */
    reportID: PropTypes.number.isRequired,
};

const ReportView = ({reportID}) => (
    <View key={reportID} style={[styles.flex1, styles.justifyContentEnd]}>
        <ReportActionsView reportID={reportID} />

        <SwipeableView onSwipeDown={() => Keyboard.dismiss()}>
            <ReportActionCompose
                onSubmit={text => addAction(reportID, text)}
                reportID={reportID}
            />
        </SwipeableView>
        <KeyboardSpacer />
    </View>
);

ReportView.propTypes = propTypes;
export default ReportView;
