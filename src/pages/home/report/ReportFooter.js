import PropTypes from 'prop-types';
import React, {memo} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {isEqual} from 'underscore';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';
import SwipeableView from '@components/SwipeableView';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionCompose from './ReportActionCompose/ReportActionCompose';
import reportActionPropTypes from './reportActionPropTypes';

const propTypes = {
    /** Report object for the current report */
    report: reportPropTypes,

    lastReportAction: PropTypes.shape(reportActionPropTypes),

    isEmptyChat: PropTypes.bool,

    /** Callback fired when the comment is submitted */
    onSubmitComment: PropTypes.func,

    /** The pending action when we are adding a chat */
    pendingAction: PropTypes.string,

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
    onSubmitComment: () => {},
    pendingAction: null,
    shouldShowComposeInput: true,
    shouldDisableCompose: false,
    listHeight: 0,
    isReportReadyForDisplay: true,
    lastReportAction: null,
    isEmptyChat: true,
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
                            isEmptyChat={props.isEmptyChat}
                            lastReportAction={props.lastReportAction}
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
)(
    memo(
        ReportFooter,
        (prevProps, nextProps) =>
            isEqual(prevProps.report, nextProps.report) &&
            prevProps.pendingAction === nextProps.pendingAction &&
            prevProps.listHeight === nextProps.listHeight &&
            prevProps.isComposerFullSize === nextProps.isComposerFullSize &&
            prevProps.isEmptyChat === nextProps.isEmptyChat &&
            prevProps.lastReportAction === nextProps.lastReportAction &&
            prevProps.shouldShowComposeInput === nextProps.shouldShowComposeInput &&
            prevProps.windowWidth === nextProps.windowWidth &&
            prevProps.isSmallScreenWidth === nextProps.isSmallScreenWidth &&
            prevProps.isReportReadyForDisplay === nextProps.isReportReadyForDisplay,
    ),
);
