import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View, Keyboard} from 'react-native';
import CONST from '../../../CONST';
import ReportActionCompose from './ReportActionCompose';
import AnonymousReportFooter from '../../../components/AnonymousReportFooter';
import SwipeableView from '../../../components/SwipeableView';
import OfflineIndicator from '../../../components/OfflineIndicator';
import ArchivedReportFooter from '../../../components/ArchivedReportFooter';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import reportActionPropTypes from './reportActionPropTypes';
import reportPropTypes from '../../reportPropTypes';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as Session from '../../../libs/actions/Session';

const propTypes = {
    /** Report object for the current report */
    report: reportPropTypes,

    /** Report actions for the current report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

    /** Offline status */
    isOffline: PropTypes.bool.isRequired,

    /** Callback fired when the comment is submitted */
    onSubmitComment: PropTypes.func,

    /** Any errors associated with an attempt to create a chat */
    // eslint-disable-next-line react/forbid-prop-types
    errors: PropTypes.object,

    /** The pending action when we are adding a chat */
    pendingAction: PropTypes.string,

    /** Whether the composer input should be shown */
    shouldShowComposeInput: PropTypes.bool,

    /** Whether user interactions should be disabled */
    shouldDisableCompose: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    report: {reportID: '0'},
    reportActions: [],
    onSubmitComment: () => {},
    errors: {},
    pendingAction: null,
    shouldShowComposeInput: true,
    shouldDisableCompose: false,
};

function ReportFooter(props) {
    const chatFooterStyles = {...styles.chatFooter, minHeight: !props.isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isArchivedRoom = ReportUtils.isArchivedRoom(props.report);
    const isAnonymousUser = Session.isAnonymousUser();

    const isSmallSizeLayout = props.windowWidth - (props.isSmallScreenWidth ? 0 : variables.sideBarWidth) < variables.anonymousReportFooterBreakpoint;
    const hideComposer = ReportUtils.shouldHideComposer(props.report, props.errors);

    return (
        <>
            {hideComposer && (
                <View style={[styles.chatFooter, props.isSmallScreenWidth ? styles.mb5 : null]}>
                    {isAnonymousUser && !isArchivedRoom && (
                        <AnonymousReportFooter
                            report={props.report}
                            isSmallSizeLayout={isSmallSizeLayout}
                        />
                    )}
                    {isArchivedRoom && <ArchivedReportFooter report={props.report} />}
                    {!props.isSmallScreenWidth && (
                        <View style={styles.offlineIndicatorRow}>{hideComposer && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}</View>
                    )}
                </View>
            )}
            {!hideComposer && (props.shouldShowComposeInput || !props.isSmallScreenWidth) && (
                <View style={[chatFooterStyles, props.isComposerFullSize && styles.chatFooterFullCompose]}>
                    <SwipeableView onSwipeDown={Keyboard.dismiss}>
                        <ReportActionCompose
                            onSubmit={props.onSubmitComment}
                            reportID={props.report.reportID.toString()}
                            reportActions={props.reportActions}
                            report={props.report}
                            pendingAction={props.pendingAction}
                            isComposerFullSize={props.isComposerFullSize}
                            disabled={props.shouldDisableCompose}
                        />
                    </SwipeableView>
                </View>
            )}
        </>
    );
}

ReportFooter.displayName = 'ReportFooter';
ReportFooter.propTypes = propTypes;
ReportFooter.defaultProps = defaultProps;
export default compose(
    withWindowDimensions,
    withOnyx({
        shouldShowComposeInput: {key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT},
    }),
)(ReportFooter);
