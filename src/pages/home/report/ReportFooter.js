import PropTypes from 'prop-types';
import React, {memo, useCallback} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {compose, isEqual} from 'underscore';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';
import SwipeableView from '@components/SwipeableView';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useNetwork from '@hooks/useNetwork';
import useReportScrollManager from '@hooks/useReportScrollManager';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import styles from '@styles/styles';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
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

    /** The pending action when we are adding a chat */
    pendingAction: PropTypes.string,

    /** Height of the list which the composer is part of */
    listHeight: PropTypes.number,

    /** Whetjer the report is ready for display */
    isReportReadyForDisplay: PropTypes.bool,

    /** Whether to show the compose input */
    shouldShowComposeInput: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    report: {reportID: '0'},
    pendingAction: null,
    listHeight: 0,
    isReportReadyForDisplay: true,
    lastReportAction: null,
    isEmptyChat: true,
    shouldShowComposeInput: false,
};

function ReportFooter(props) {
    const reportScrollManager = useReportScrollManager();
    const {isOffline} = useNetwork();
    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isArchivedRoom = ReportUtils.isArchivedRoom(props.report);
    const isAnonymousUser = Session.isAnonymousUser();

    const isSmallSizeLayout = props.windowWidth - (props.isSmallScreenWidth ? 0 : variables.sideBarWidth) < variables.anonymousReportFooterBreakpoint;
    const hideComposer = !ReportUtils.canUserPerformWriteAction(props.report);

    const onSubmitComment = useCallback(
        (text) => {
            Report.addComment(props.report.reportID, text);

            // We need to scroll to the bottom of the list after the comment is added
            const refID = setTimeout(() => {
                reportScrollManager.scrollToBottom();
            }, 10);

            return () => clearTimeout(refID);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

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
                            onSubmit={onSubmitComment}
                            reportID={props.report.reportID}
                            isEmptyChat={props.isEmptyChat}
                            lastReportAction={props.lastReportAction}
                            pendingAction={props.pendingAction}
                            isComposerFullSize={props.isComposerFullSize}
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
