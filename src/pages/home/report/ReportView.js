import React from 'react';
import {Keyboard, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ReportActionsView from './ReportActionsView';
import ReportActionCompose from './ReportActionCompose';
import {addAction} from '../../../libs/actions/Report';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import styles from '../../../styles/styles';
import SwipeableView from '../../../components/SwipeableView';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';

const propTypes = {
    /** The ID of the report the selected report */
    reportID: PropTypes.number.isRequired,

    /* Onyx Keys */

    /** Whether or not to show the Compose Input */
    session: PropTypes.shape({
        shouldShowComposeInput: PropTypes.bool,
    }),

    /** Used to defer rendering the report view until after the sidebar has loaded */
    isSidebarLoaded: PropTypes.bool,
};

const defaultProps = {
    session: {
        shouldShowComposeInput: true,
    },
    isSidebarLoaded: false,
};

const ReportView = ({reportID, session, isSidebarLoaded}) => {
    if (!isSidebarLoaded) {
        return null;
    }

    return (
        <View nativeID={CONST.REPORT.DROP_NATIVE_ID} key={reportID} style={[styles.flex1, styles.justifyContentEnd]}>
            <ReportActionsView reportID={reportID} />

            {session.shouldShowComposeInput && (
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
};

ReportView.propTypes = propTypes;
ReportView.defaultProps = defaultProps;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    isSidebarLoaded: {
        key: ONYXKEYS.IS_SIDEBAR_LOADED,
    },
})(ReportView);
