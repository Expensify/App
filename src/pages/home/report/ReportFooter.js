import PropTypes from 'prop-types';
import React from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';
import participantPropTypes from '@components/participantPropTypes';
import SwipeableView from '@components/SwipeableView';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useNetwork from '@hooks/useNetwork';
import compose from '@libs/compose';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionCompose from './ReportActionCompose/ReportActionCompose';
import reportActionPropTypes from './reportActionPropTypes';

const propTypes = {
    /** Report object for the current report */
    report: reportPropTypes,

    /** Report actions for the current report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

    /** Callback fired when the comment is submitted */
    onSubmitComment: PropTypes.func,

    /** The pending action when we are adding a chat */
    pendingAction: PropTypes.string,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** Whether the composer input should be shown */
    shouldShowComposeInput: PropTypes.bool,

    /** Whether user interactions should be disabled */
    shouldDisableCompose: PropTypes.bool,

    /** Height of the list which the composer is part of */
    listHeight: PropTypes.number,

    /** Whetjer the report is ready for display */
    isReportReadyForDisplay: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    report: {reportID: '0'},
    reportActions: [],
    onSubmitComment: () => {},
    pendingAction: null,
    personalDetails: {},
    shouldShowComposeInput: true,
    shouldDisableCompose: false,
    listHeight: 0,
    isReportReadyForDisplay: true,
};

function ReportFooter(props) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isArchivedRoom = ReportUtils.isArchivedRoom(props.report);
    const isAnonymousUser = Session.isAnonymousUser();

    const isSmallSizeLayout = props.windowWidth - (props.isSmallScreenWidth ? 0 : variables.sideBarWidth) < variables.anonymousReportFooterBreakpoint;
    const hideComposer = !ReportUtils.canUserPerformWriteAction(props.report);

    return (
        <>
            {hideComposer && (
                <View style={[styles.chatFooter, isArchivedRoom || isAnonymousUser ? styles.mt4 : {}, props.isSmallScreenWidth ? styles.mb5 : null]}>
                    {isAnonymousUser && !isArchivedRoom && (
                        <AnonymousReportFooter
                            report={props.report}
                            isSmallSizeLayout={isSmallSizeLayout}
                            personalDetails={props.personalDetails}
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
                            listHeight={props.listHeight}
                            isReportReadyForDisplay={props.isReportReadyForDisplay}
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
        shouldShowComposeInput: {
            key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
            initialValue: false,
        },
    }),
)(ReportFooter);
