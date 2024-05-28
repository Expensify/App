import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import BlockedReportFooter from '@components/BlockedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';
import {usePersonalDetails} from '@components/OnyxProvider';
import SwipeableView from '@components/SwipeableView';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import ReportActionCompose from './ReportActionCompose/ReportActionCompose';
import SystemChatReportFooterMessage from './SystemChatReportFooterMessage';

type ReportFooterOnyxProps = {
    /** Whether to show the compose input */
    shouldShowComposeInput: OnyxEntry<boolean>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;

    /** Whether user is blocked from chat. */
    blockedFromChat: OnyxEntry<string>;
};

type ReportFooterProps = ReportFooterOnyxProps & {
    /** Report object for the current report */
    report?: OnyxTypes.Report;

    reportNameValuePairs?: OnyxEntry<OnyxTypes.ReportNameValuePairs>;

    /** The last report action */
    lastReportAction?: OnyxEntry<OnyxTypes.ReportAction>;

    /** Whether the chat is empty */
    isEmptyChat?: boolean;

    /** The pending action when we are adding a chat */
    pendingAction?: PendingAction;

    /** Height of the list which the composer is part of */
    listHeight?: number;

    /** Whether the report is ready for display */
    isReportReadyForDisplay?: boolean;

    /** Whether the composer is in full size */
    isComposerFullSize?: boolean;

    /** A method to call when the input is focus */
    onComposerFocus: () => void;

    /** A method to call when the input is blur */
    onComposerBlur: () => void;
};

function ReportFooter({
    lastReportAction,
    pendingAction,
    session,
    report = {reportID: '0'},
    reportNameValuePairs,
    shouldShowComposeInput = false,
    isEmptyChat = true,
    isReportReadyForDisplay = true,
    listHeight = 0,
    isComposerFullSize = false,
    blockedFromChat,
    onComposerBlur,
    onComposerFocus,
}: ReportFooterProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isArchivedRoom = ReportUtils.isArchivedRoom(report, reportNameValuePairs);
    const isAnonymousUser = session?.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;

    const isSmallSizeLayout = windowWidth - (isSmallScreenWidth ? 0 : variables.sideBarWidth) < variables.anonymousReportFooterBreakpoint;
    const hideComposer = !ReportUtils.canUserPerformWriteAction(report, reportNameValuePairs) || blockedFromChat;
    const canWriteInReport = ReportUtils.canWriteInReport(report);
    const isSystemChat = ReportUtils.isSystemChat(report);

    const allPersonalDetails = usePersonalDetails();

    const handleCreateTask = useCallback(
        (text: string): boolean => {
            /**
             * Matching task rule by group
             * Group 1: Start task rule with []
             * Group 2: Optional email group between \s+....\s* start rule with @+valid email or short mention
             * Group 3: Title is remaining characters
             */
            const taskRegex = /^\[\]\s+(?:@([^\s@]+(?:@\w+\.\w+)?))?\s*([\s\S]*)/;

            const match = text.match(taskRegex);
            if (!match) {
                return false;
            }
            const title = match[2] ? match[2].trim().replace(/\n/g, ' ') : undefined;
            if (!title) {
                return false;
            }

            const mention = match[1] ? match[1].trim() : undefined;
            const mentionWithDomain = ReportUtils.addDomainToShortMention(mention ?? '') ?? mention;

            let assignee: OnyxTypes.PersonalDetails | EmptyObject = {};
            let assigneeChatReport;
            if (mentionWithDomain) {
                assignee = Object.values(allPersonalDetails).find((value) => value?.login === mentionWithDomain) ?? {};
                if (!Object.keys(assignee).length) {
                    const assigneeAccountID = UserUtils.generateAccountID(mentionWithDomain);
                    const optimisticDataForNewAssignee = Task.setNewOptimisticAssignee(mentionWithDomain, assigneeAccountID);
                    assignee = optimisticDataForNewAssignee.assignee;
                    assigneeChatReport = optimisticDataForNewAssignee.assigneeReport;
                }
            }
            Task.createTaskAndNavigate(report.reportID, title, '', assignee?.login ?? '', assignee.accountID, assigneeChatReport, report.policyID);
            return true;
        },
        [allPersonalDetails, report.policyID, report.reportID],
    );

    const onSubmitComment = useCallback(
        (text: string) => {
            const isTaskCreated = handleCreateTask(text);
            if (isTaskCreated) {
                return;
            }
            Report.addComment(report.reportID, text);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [report.reportID, handleCreateTask],
    );

    return (
        <>
            {hideComposer && (
                <View style={[styles.chatFooter, isArchivedRoom || isAnonymousUser || !canWriteInReport ? styles.mt4 : {}, isSmallScreenWidth ? styles.mb5 : null]}>
                    {isAnonymousUser && !isArchivedRoom && (
                        <AnonymousReportFooter
                            report={report}
                            isSmallSizeLayout={isSmallSizeLayout}
                        />
                    )}
                    {isArchivedRoom && <ArchivedReportFooter report={report} />}
                    {!isArchivedRoom && blockedFromChat && <BlockedReportFooter />}
                    {!isAnonymousUser && !canWriteInReport && isSystemChat && <SystemChatReportFooterMessage />}
                    {!isSmallScreenWidth && <View style={styles.offlineIndicatorRow}>{hideComposer && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}</View>}
                </View>
            )}
            {!hideComposer && (!!shouldShowComposeInput || !isSmallScreenWidth) && (
                <View style={[chatFooterStyles, isComposerFullSize && styles.chatFooterFullCompose]}>
                    <SwipeableView onSwipeDown={Keyboard.dismiss}>
                        <ReportActionCompose
                            onSubmit={onSubmitComment}
                            onComposerFocus={onComposerFocus}
                            onComposerBlur={onComposerBlur}
                            reportID={report.reportID}
                            report={report}
                            isEmptyChat={isEmptyChat}
                            lastReportAction={lastReportAction}
                            pendingAction={pendingAction}
                            isComposerFullSize={isComposerFullSize}
                            listHeight={listHeight}
                            isReportReadyForDisplay={isReportReadyForDisplay}
                        />
                    </SwipeableView>
                </View>
            )}
        </>
    );
}

ReportFooter.displayName = 'ReportFooter';

export default withOnyx<ReportFooterProps, ReportFooterOnyxProps>({
    shouldShowComposeInput: {
        key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
        initialValue: false,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    blockedFromChat: {
        key: ONYXKEYS.NVP_BLOCKED_FROM_CHAT,
    },
})(
    memo(
        ReportFooter,
        (prevProps, nextProps) =>
            lodashIsEqual(prevProps.report, nextProps.report) &&
            prevProps.pendingAction === nextProps.pendingAction &&
            prevProps.listHeight === nextProps.listHeight &&
            prevProps.isComposerFullSize === nextProps.isComposerFullSize &&
            prevProps.isEmptyChat === nextProps.isEmptyChat &&
            prevProps.lastReportAction === nextProps.lastReportAction &&
            prevProps.shouldShowComposeInput === nextProps.shouldShowComposeInput &&
            prevProps.isReportReadyForDisplay === nextProps.isReportReadyForDisplay &&
            lodashIsEqual(prevProps.session, nextProps.session),
    ),
);
