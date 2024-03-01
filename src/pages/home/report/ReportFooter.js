import PropTypes from 'prop-types';
import React, {memo, useCallback} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _, {isEqual} from 'underscore';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';
import {usePersonalDetails} from '@components/OnyxProvider';
import SwipeableView from '@components/SwipeableView';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import * as Task from '@userActions/Task';
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

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user auth token type */
        authTokenType: PropTypes.string,
    }),

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
    session: {},
};

function ReportFooter(props) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isArchivedRoom = ReportUtils.isArchivedRoom(props.report);
    const isAnonymousUser = props.session.authTokenType === CONST.AUTH_TOKEN_TYPE.ANONYMOUS;

    const isSmallSizeLayout = props.windowWidth - (props.isSmallScreenWidth ? 0 : variables.sideBarWidth) < variables.anonymousReportFooterBreakpoint;
    const hideComposer = !ReportUtils.canUserPerformWriteAction(props.report);

    const allPersonalDetails = usePersonalDetails();

    /**
     * @param {String} text
     */
    const handleCreateTask = useCallback(
        (text) => {
            /**
             * Matching task rule by group
             * Group 1: Start task rule with []
             * Group 2: Optional email group between \s+....\s* start rule with @+valid email
             * Group 3: Title is remaining characters
             */
            const taskRegex = /^\[\]\s+(?:@([^\s@]+@[\w.-]+\.[a-zA-Z]{2,}))?\s*([\s\S]*)/;

            const match = text.match(taskRegex);
            if (!match) {
                return false;
            }
            const title = match[2] ? match[2].trim().replace(/\n/g, ' ') : undefined;
            if (!title) {
                return false;
            }
            const email = match[1] ? match[1].trim() : undefined;
            let assignee = {};
            if (email) {
                assignee = _.find(_.values(allPersonalDetails), (p) => p.login === email) || {};
            }
            Task.createTaskAndNavigate(props.report.reportID, title, '', assignee.login, assignee.accountID, assignee.assigneeChatReport, props.report.policyID);
            return true;
        },
        [allPersonalDetails, props.report.policyID, props.report.reportID],
    );

    const onSubmitComment = useCallback(
        (text) => {
            const isTaskCreated = handleCreateTask(text);
            if (isTaskCreated) {
                return;
            }
            Report.addComment(props.report.reportID, text);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.report.reportID, handleCreateTask],
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
                            report={props.report}
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
            initialValue: false,
        },
        session: {
            key: ONYXKEYS.SESSION,
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
            prevProps.isReportReadyForDisplay === nextProps.isReportReadyForDisplay &&
            isEqual(prevProps.session, nextProps.session),
    ),
);
