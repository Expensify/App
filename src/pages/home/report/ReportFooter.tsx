import {Str} from 'expensify-common';
import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback} from 'react';
import {Keyboard, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import Banner from '@components/Banner';
import BlockedReportFooter from '@components/BlockedReportFooter';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineIndicator from '@components/OfflineIndicator';
import {usePersonalDetails} from '@components/OnyxProvider';
import SwipeableView from '@components/SwipeableView';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Log from '@libs/Log';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import ReportActionCompose from './ReportActionCompose/ReportActionCompose';
import SystemChatReportFooterMessage from './SystemChatReportFooterMessage';

type ReportFooterProps = {
    /** Report object for the current report */
    report?: OnyxTypes.Report;

    /** Report metadata */
    reportMetadata?: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The last report action */
    lastReportAction?: OnyxEntry<OnyxTypes.ReportAction>;

    /** Whether to show educational tooltip in workspace chat for first-time user */
    workspaceTooltip: OnyxEntry<OnyxTypes.WorkspaceTooltip>;

    /** The pending action when we are adding a chat */
    pendingAction?: PendingAction;

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
    report = {reportID: '-1'},
    reportMetadata,
    policy,
    isReportReadyForDisplay = true,
    isComposerFullSize = false,
    workspaceTooltip,
    onComposerBlur,
    onComposerFocus,
}: ReportFooterProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();

    const [shouldShowComposeInput] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT, {initialValue: false});
    const [isAnonymousUser = false] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
    const [isBlockedFromChat] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CHAT, {
        selector: (dateString) => {
            if (!dateString) {
                return false;
            }
            try {
                return new Date(dateString) >= new Date();
            } catch (error) {
                // If the NVP is malformed, we'll assume the user is not blocked from chat. This is not expected, so if it happens we'll log an alert.
                Log.alert(`[${CONST.ERROR.ENSURE_BUGBOT}] Found malformed ${ONYXKEYS.NVP_BLOCKED_FROM_CHAT} nvp`, dateString);
                return false;
            }
        },
    });
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID ?? -1}`);

    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isArchivedRoom = ReportUtils.isArchivedRoom(report, reportNameValuePairs);

    const isSmallSizeLayout = windowWidth - (shouldUseNarrowLayout ? 0 : variables.sideBarWidth) < variables.anonymousReportFooterBreakpoint;

    // If a user just signed in and is viewing a public report, optimistically show the composer while loading the report, since they will have write access when the response comes back.
    const shouldShowComposerOptimistically = !isAnonymousUser && ReportUtils.isPublicRoom(report) && !!reportMetadata?.isLoadingInitialReportActions;
    const canPerformWriteAction = ReportUtils.canUserPerformWriteAction(report) ?? shouldShowComposerOptimistically;
    const shouldHideComposer = !canPerformWriteAction || isBlockedFromChat;
    const canWriteInReport = ReportUtils.canWriteInReport(report);
    const isSystemChat = ReportUtils.isSystemChat(report);
    const isAdminsOnlyPostingRoom = ReportUtils.isAdminsOnlyPostingRoom(report);
    const isUserPolicyAdmin = PolicyUtils.isPolicyAdmin(policy);
    const shouldShowEducationalTooltip = !!workspaceTooltip?.shouldShow && !isUserPolicyAdmin;

    const allPersonalDetails = usePersonalDetails();

    const handleCreateTask = useCallback(
        (text: string): boolean => {
            /**
             * Matching task rule by group
             * Group 1: Start task rule with []
             * Group 2: Optional email group between \s+....\s* start rule with @+valid email or short mention
             * Group 3: Title is remaining characters
             */
            // The regex is copied from the expensify-common CONST file, but the domain is optional to accept short mention
            const emailWithOptionalDomainRegex =
                /(?=((?=[\w'#%+-]+(?:\.[\w'#%+-]+)*@?)[\w.'#%+-]{1,64}(?:@(?:(?=[a-z\d]+(?:-+[a-z\d]+)*\.)(?:[a-z\d-]{1,63}\.)+[a-z]{2,63}))?(?= |_|\b))(?<end>.*))\S{3,254}(?=\k<end>$)/;
            const taskRegex = `^\\[\\]\\s+(?:@(?:${emailWithOptionalDomainRegex.source}))?\\s*([\\s\\S]*)`;

            const match = text.match(taskRegex);
            if (!match) {
                return false;
            }
            let title = match[3] ? match[3].trim().replace(/\n/g, ' ') : undefined;
            if (!title) {
                return false;
            }

            const mention = match[1] ? match[1].trim() : '';
            const mentionWithDomain = ReportUtils.addDomainToShortMention(mention) ?? mention;
            const isValidMention = Str.isValidEmail(mentionWithDomain);

            let assignee: OnyxEntry<OnyxTypes.PersonalDetails>;
            let assigneeChatReport;
            if (mentionWithDomain) {
                if (isValidMention) {
                    assignee = Object.values(allPersonalDetails).find((value) => value?.login === mentionWithDomain) ?? undefined;
                    if (!Object.keys(assignee ?? {}).length) {
                        const assigneeAccountID = UserUtils.generateAccountID(mentionWithDomain);
                        const optimisticDataForNewAssignee = Task.setNewOptimisticAssignee(mentionWithDomain, assigneeAccountID);
                        assignee = optimisticDataForNewAssignee.assignee;
                        assigneeChatReport = optimisticDataForNewAssignee.assigneeReport;
                    }
                } else {
                    // If the mention is not valid, include it on the title.
                    // The mention could be invalid if it's a short mention and failed to be converted to a full mention.
                    title = `@${mentionWithDomain} ${title}`;
                }
            }
            Task.createTaskAndNavigate(report.reportID, title, '', assignee?.login ?? '', assignee?.accountID, assigneeChatReport, report.policyID);
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [report.reportID, handleCreateTask],
    );

    return (
        <>
            {shouldHideComposer && (
                <View
                    style={[
                        styles.chatFooter,
                        isArchivedRoom || isAnonymousUser || !canWriteInReport || (isAdminsOnlyPostingRoom && !isUserPolicyAdmin) ? styles.mt4 : {},
                        shouldUseNarrowLayout ? styles.mb5 : null,
                    ]}
                >
                    {isAnonymousUser && !isArchivedRoom && (
                        <AnonymousReportFooter
                            report={report}
                            isSmallSizeLayout={isSmallSizeLayout}
                        />
                    )}
                    {isArchivedRoom && <ArchivedReportFooter report={report} />}
                    {!isArchivedRoom && isBlockedFromChat && <BlockedReportFooter />}
                    {!isAnonymousUser && !canWriteInReport && isSystemChat && <SystemChatReportFooterMessage />}
                    {isAdminsOnlyPostingRoom && !isUserPolicyAdmin && !isArchivedRoom && !isAnonymousUser && !isBlockedFromChat && (
                        <Banner
                            containerStyles={[styles.chatFooterBanner]}
                            text={translate('adminOnlyCanPost')}
                            icon={Expensicons.Lightbulb}
                            shouldShowIcon
                        />
                    )}
                    {!shouldUseNarrowLayout && (
                        <View style={styles.offlineIndicatorRow}>{shouldHideComposer && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}</View>
                    )}
                </View>
            )}
            {!shouldHideComposer && (!!shouldShowComposeInput || !shouldUseNarrowLayout) && (
                <View style={[chatFooterStyles, isComposerFullSize && styles.chatFooterFullCompose]}>
                    <SwipeableView onSwipeDown={Keyboard.dismiss}>
                        <ReportActionCompose
                            onSubmit={onSubmitComment}
                            onComposerFocus={onComposerFocus}
                            onComposerBlur={onComposerBlur}
                            reportID={report.reportID}
                            report={report}
                            lastReportAction={lastReportAction}
                            pendingAction={pendingAction}
                            isComposerFullSize={isComposerFullSize}
                            isReportReadyForDisplay={isReportReadyForDisplay}
                            shouldShowEducationalTooltip={didScreenTransitionEnd && shouldShowEducationalTooltip}
                        />
                    </SwipeableView>
                </View>
            )}
        </>
    );
}

ReportFooter.displayName = 'ReportFooter';

export default memo(
    ReportFooter,
    (prevProps, nextProps) =>
        lodashIsEqual(prevProps.report, nextProps.report) &&
        prevProps.pendingAction === nextProps.pendingAction &&
        prevProps.isComposerFullSize === nextProps.isComposerFullSize &&
        prevProps.lastReportAction === nextProps.lastReportAction &&
        prevProps.isReportReadyForDisplay === nextProps.isReportReadyForDisplay &&
        prevProps.workspaceTooltip?.shouldShow === nextProps.workspaceTooltip?.shouldShow &&
        lodashIsEqual(prevProps.reportMetadata, nextProps.reportMetadata) &&
        lodashIsEqual(prevProps.policy?.employeeList, nextProps.policy?.employeeList) &&
        lodashIsEqual(prevProps.policy?.role, nextProps.policy?.role),
);
