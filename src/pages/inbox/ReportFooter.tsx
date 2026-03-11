import {useRoute} from '@react-navigation/native';
import {isBlockedFromChatSelector} from '@selectors/BlockedFromChat';
import {Str} from 'expensify-common';
import React, {useEffect, useState} from 'react';
import {Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import Banner from '@components/Banner';
import BlockedReportFooter from '@components/BlockedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SwipeableView from '@components/SwipeableView';
import useAgentZeroStatusIndicator from '@hooks/useAgentZeroStatusIndicator';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShortMentionsList from '@hooks/useShortMentionsList';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {addComment} from '@libs/actions/Report';
import {createTaskAndNavigate, setNewOptimisticAssignee} from '@libs/actions/Task';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {addDomainToShortMention} from '@libs/ParsingUtils';
import {
    getCombinedReportActions,
    getFilteredReportActionsForReportView,
    getOneTransactionThreadReportID,
    isCreatedAction,
    isMoneyRequestAction,
    isSentMoneyReportAction,
} from '@libs/ReportActionsUtils';
import {
    canEditReportAction,
    canUserPerformWriteAction,
    canWriteInReport as canWriteInReportUtil,
    getReportOfflinePendingActionAndErrors,
    isAdminsOnlyPostingRoom as isAdminsOnlyPostingRoomUtil,
    isArchivedNonExpenseReport,
    isConciergeChatReport,
    isPublicRoom,
    isSystemChat as isSystemChatUtil,
} from '@libs/ReportUtils';
import {generateAccountID} from '@libs/UserUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import ReportActionCompose from './report/ReportActionCompose/ReportActionCompose';
import SystemChatReportFooterMessage from './report/SystemChatReportFooterMessage';

const policyRoleSelector = (policy: OnyxEntry<OnyxTypes.Policy>) => policy?.role;
const isLoadingInitialReportActionsSelector = (reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>) => reportMetadata?.isLoadingInitialReportActions;

/**
 * Self-subscribing composer component. Combines data subscriptions
 * with footer rendering — no intermediate wrapper needed.
 */
function ReportFooter() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; reportActionID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);
    const reportActionIDFromRoute = routeParams?.reportActionID;

    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const isInSidePanel = useIsInSidePanel();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const personalDetail = useCurrentUserPersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lightbulb']);
    const isAnonymousUser = useIsAnonymousUser();

    // --- Data subscriptions (from old ReportFooter) ---
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);
    const parentReportAction = useParentReportAction(report);
    const reportID = report?.reportID;

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((transaction) => transaction.transactionID);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReportActions = getEmptyObject<OnyxTypes.ReportActions>()] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`);
    const combinedReportActions = getCombinedReportActions(reportActions, transactionThreadReportID ?? null, Object.values(transactionThreadReportActions));
    const isSentMoneyReport = reportActions.some((action) => isSentMoneyReportAction(action));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- canEditReportAction type is loose
    const lastReportAction = [...combinedReportActions, parentReportAction].find((action) => canEditReportAction(action) && !isMoneyRequestAction(action));

    const isConciergeChat = isConciergeChatReport(report);
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);
    const {sessionStartTime} = useSidePanelState();
    const hasUserSentMessage = (() => {
        if (!isConciergeSidePanel || !sessionStartTime) {
            return false;
        }
        return reportActions.some((action) => !isCreatedAction(action) && action.actorAccountID === personalDetail.accountID && action.created >= sessionStartTime);
    })();

    const {kickoffWaitingIndicator} = useAgentZeroStatusIndicator(String(report?.reportID ?? CONST.DEFAULT_NUMBER_ID), isConciergeChat);
    const shouldHideStatusIndicators = isConciergeSidePanel && !hasUserSentMessage;
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;

    // --- Footer rendering logic (from old ReportFooter) ---
    const [shouldShowComposeInput = false] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isBlockedFromChat] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CHAT, {
        selector: isBlockedFromChatSelector,
    });
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportIDFromRoute}`);
    const [policyRole] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {
        selector: policyRoleSelector,
    });
    const [isLoadingInitialReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {
        selector: isLoadingInitialReportActionsSelector,
    });

    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);
    const isUserPolicyAdmin = policyRole === CONST.POLICY.ROLE.ADMIN;
    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isArchivedRoom = isArchivedNonExpenseReport(report, isReportArchived);

    const isSmallSizeLayout = windowWidth - (shouldUseNarrowLayout ? 0 : variables.sideBarWithLHBWidth) < variables.anonymousReportFooterBreakpoint;

    const shouldShowComposerOptimistically = !isAnonymousUser && isPublicRoom(report) && !!isLoadingInitialReportActions;
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived) ?? shouldShowComposerOptimistically;
    const shouldHideComposer = !canPerformWriteAction || isBlockedFromChat;
    const canWriteInReport = canWriteInReportUtil(report);
    const isSystemChat = isSystemChatUtil(report);
    const isAdminsOnlyPostingRoom = isAdminsOnlyPostingRoomUtil(report);

    const allPersonalDetails = usePersonalDetails();
    const {availableLoginsList} = useShortMentionsList();
    const currentUserEmail = personalDetail.email ?? '';
    const ancestors = useAncestors(report);

    const handleCreateTask = (text: string): boolean => {
        const match = text.match(CONST.REGEX.TASK_TITLE_WITH_OPTIONAL_SHORT_MENTION);
        if (!match) {
            return false;
        }
        let title = match[3] ? match[3].trim().replaceAll('\n', ' ') : undefined;
        if (!title) {
            return false;
        }
        const mention = match[1] ? match[1].trim() : '';
        const currentUserPrivateDomain = isEmailPublicDomain(currentUserEmail) ? '' : Str.extractEmailDomain(currentUserEmail);
        const mentionWithDomain = addDomainToShortMention(mention, availableLoginsList, currentUserPrivateDomain) ?? mention;
        const isValidMention = Str.isValidEmail(mentionWithDomain);

        let assignee: OnyxEntry<OnyxTypes.PersonalDetails>;
        let assigneeChatReport;
        if (mentionWithDomain) {
            if (isValidMention) {
                assignee = Object.values(allPersonalDetails ?? {}).find((value) => value?.login === mentionWithDomain) ?? undefined;
                if (!Object.keys(assignee ?? {}).length) {
                    const optimisticDataForNewAssignee = setNewOptimisticAssignee(personalDetail.accountID, {
                        accountID: generateAccountID(mentionWithDomain),
                        login: mentionWithDomain,
                    });
                    assignee = optimisticDataForNewAssignee.assignee;
                    assigneeChatReport = optimisticDataForNewAssignee.assigneeReport;
                }
            } else {
                title = `@${mentionWithDomain} ${title}`;
            }
        }
        createTaskAndNavigate({
            parentReport: report,
            title,
            description: '',
            assigneeEmail: assignee?.login ?? '',
            currentUserAccountID: personalDetail.accountID,
            currentUserEmail,
            assigneeAccountID: assignee?.accountID,
            assigneeChatReport,
            policyID: report?.policyID,
            isCreatedUsingMarkdown: true,
            quickAction,
            ancestors,
        });
        return true;
    };

    const [targetReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${effectiveTransactionThreadReportID ?? reportIDFromRoute}`);
    const targetReportAncestors = useAncestors(targetReport);

    const onSubmitComment = (text: string, reportActionID?: string) => {
        const isTaskCreated = handleCreateTask(text);
        if (isTaskCreated) {
            return;
        }
        addComment({
            report: targetReport,
            notifyReportID: report?.reportID ?? '',
            ancestors: targetReportAncestors,
            text,
            timezoneParam: personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID: personalDetail.accountID,
            shouldPlaySound: true,
            isInSidePanel,
            reportActionID,
        });
    };

    const [didHideComposerInput, setDidHideComposerInput] = useState(!shouldShowComposeInput);

    useEffect(() => {
        if (didHideComposerInput || shouldShowComposeInput) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDidHideComposerInput(true);
    }, [shouldShowComposeInput, didHideComposerInput]);

    if (!isCurrentReportLoadedFromOnyx || !report) {
        return null;
    }

    // Happy path — user can compose
    if (!shouldHideComposer && (shouldShowComposeInput || !isSmallScreenWidth)) {
        return (
            <View style={[chatFooterStyles, isComposerFullSize && styles.chatFooterFullCompose]}>
                <SwipeableView onSwipeDown={Keyboard.dismiss}>
                    <ReportActionCompose
                        onSubmit={onSubmitComment}
                        reportID={report.reportID}
                        report={report}
                        lastReportAction={lastReportAction}
                        pendingAction={reportPendingAction}
                        isComposerFullSize={isComposerFullSize}
                        didHideComposerInput={didHideComposerInput}
                        reportTransactions={reportTransactions}
                        transactionThreadReportID={effectiveTransactionThreadReportID}
                        shouldHideStatusIndicators={shouldHideStatusIndicators}
                        kickoffWaitingIndicator={kickoffWaitingIndicator}
                    />
                </SwipeableView>
            </View>
        );
    }

    // Archived room
    if (isArchivedRoom) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <ArchivedReportFooter
                    report={report}
                    currentUserAccountID={personalDetail.accountID}
                />
                {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            </View>
        );
    }

    // Anonymous user
    if (isAnonymousUser) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <AnonymousReportFooter
                    report={report}
                    isSmallSizeLayout={isSmallSizeLayout || isInSidePanel}
                />
                {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            </View>
        );
    }

    // Blocked from chat
    if (isBlockedFromChat) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <BlockedReportFooter />
                {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            </View>
        );
    }

    // System chat where user can't write
    if (!canWriteInReport && isSystemChat) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <SystemChatReportFooterMessage />
                {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            </View>
        );
    }

    // Admins-only room
    if (isAdminsOnlyPostingRoom && !isUserPolicyAdmin) {
        return (
            <View style={[styles.chatFooter, styles.mt4, shouldUseNarrowLayout && styles.mb5]}>
                <Banner
                    containerStyles={[styles.chatFooterBanner]}
                    text={translate('adminOnlyCanPost')}
                    icon={expensifyIcons.Lightbulb}
                    shouldShowIcon
                />
                {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            </View>
        );
    }

    return null;
}

export default ReportFooter;
