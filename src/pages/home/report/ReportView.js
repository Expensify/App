import React from 'react';
import {Keyboard, View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionsView from './ReportActionsView';
import ReportActionCompose from './ReportActionCompose';
import {addAction} from '../../../libs/actions/Report';
import compose from '../../../libs/compose';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import styles from '../../../styles/styles';
import SwipeableView from '../../../components/SwipeableView';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import withDrawerState from '../../../components/withDrawerState';
import withWindowDimensions from '../../../components/withWindowDimensions';

const propTypes = {
    /* The ID of the report the selected report */
    reportID: PropTypes.number.isRequired,

    /* Is the view ready to be displayed */
    isReady: PropTypes.bool.isRequired,

    /* Is the report view covered by the drawer */
    isDrawerOpen: PropTypes.bool.isRequired,

    /* Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: PropTypes.bool.isRequired,
};

function ReportView(props) {
    const isComposeDisabled = props.isDrawerOpen && props.isSmallScreenWidth;

    return (
        <View key={props.reportID} style={[styles.chatContent]}>
            {!props.isReady && <FullScreenLoadingIndicator />}

            <ReportActionsView reportID={props.reportID} />

            <SwipeableView onSwipeDown={() => Keyboard.dismiss()}>
                <ReportActionCompose
                    isDisabled={isComposeDisabled}
                    onSubmit={text => addAction(props.reportID, text)}
                    reportID={props.reportID}
                />
            </SwipeableView>
            <KeyboardSpacer />
        </View>
    );
}

ReportView.propTypes = propTypes;
export default compose(
    withWindowDimensions,
    withDrawerState,
)(ReportView);
