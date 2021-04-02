import React from 'react';
import {Keyboard, View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionsView from './ReportActionsView';
import ReportActionCompose from './ReportActionCompose';
import {addAction} from '../../../libs/actions/Report';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import styles from '../../../styles/styles';
import SwipeableView from '../../../components/SwipeableView';
import FullScreenLoadingIndicator from '../../../components/Loading/FullscreenLoading';
import withDrawerState from '../../../components/withDrawerState';

const propTypes = {
    /* The ID of the report the selected report */
    reportID: PropTypes.number.isRequired,

    /* Is the view ready to be displayed */
    loaded: PropTypes.bool.isRequired,

    /* Is the report view covered by the drawer */
    isDrawerOpen: PropTypes.bool.isRequired,
};

function ReportView({reportID, isDrawerOpen, loaded}) {
    return (
        <View style={[styles.chatContent]}>
            {
                !isDrawerOpen && loaded
                    ? <ReportActionsView reportID={reportID} />
                    : <FullScreenLoadingIndicator />
            }
            {!isDrawerOpen && (
                <SwipeableView onSwipeDown={() => Keyboard.dismiss()}>
                    <ReportActionCompose
                        onSubmit={text => addAction(reportID, text)}
                        reportID={reportID}
                    />
                </SwipeableView>
            )}
            <KeyboardSpacer />
        </View>
    );
}

ReportView.propTypes = propTypes;
export default withDrawerState(ReportView);
