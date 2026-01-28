import {isBlockedFromChatSelector} from '@selectors/BlockedFromChat';
import {Str} from 'expensify-common';
import React, {memo, useCallback, useEffect, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated from 'react-native-reanimated';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import Banner from '@components/Banner';
import BlockedReportFooter from '@components/BlockedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShortMentionsList from '@hooks/useShortMentionsList';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {addComment} from '@libs/actions/Report';
import {createTaskAndNavigate, setNewOptimisticAssignee} from '@libs/actions/Task';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import {addDomainToShortMention} from '@libs/ParsingUtils';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {
    canUserPerformWriteAction,
    canWriteInReport as canWriteInReportUtil,
    isAdminsOnlyPostingRoom as isAdminsOnlyPostingRoomUtil,
    isArchivedNonExpenseReport,
    isPublicRoom,
    isSystemChat as isSystemChatUtil,
} from '@libs/ReportUtils';
import {generateAccountID} from '@libs/UserUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import ReportActionCompose from './ReportActionCompose/ReportActionCompose';
import SystemChatReportFooterMessage from './SystemChatReportFooterMessage';
import useReportFooterStyles from './useReportFooterStyles';

type ReportFooterProps = {
    /** Report object for the current report */
    report?: OnyxTypes.Report;

    /** Report metadata */
    reportMetadata?: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** Report transactions */
    reportTransactions?: OnyxEntry<OnyxTypes.Transaction[]>;

    /** The ID of the transaction thread report if there is a single transaction */
    transactionThreadReportID?: string;

    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The last report action */
    lastReportAction?: OnyxEntry<OnyxTypes.ReportAction>;

    /** The pending action when we are adding a chat */
    pendingAction?: PendingAction;

    /** Whether the composer is in full size */
    isComposerFullSize?: boolean;

    /** A method to call when the input is focus */
    onComposerFocus?: () => void;

    /** A method to call when the input is blur */
    onComposerBlur?: () => void;

    /** Whether the report screen is being displayed in the side panel */
    isInSidePanel?: boolean;

    /** The native ID for this component */
    nativeID?: string;

    /** Callback when layout of composer changes */
    onLayout: (height: number) => void;

    /** The current fixed header height of the chat */
    headerHeight: number;
};

function ReportFooter({
    lastReportAction,
    pendingAction,
    report = {reportID: '-1'},
    reportMetadata,
    policy,
    isComposerFullSize = false,
    onComposerBlur,
    onComposerFocus,
    reportTransactions,
    transactionThreadReportID,
    isInSidePanel,
    onLayout,
    headerHeight,
    nativeID,
}: ReportFooterProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [composerHeight, setComposerHeight] = useState<number>(CONST.CHAT_FOOTER_MIN_HEIGHT);
    const reportFooterStyles = useReportFooterStyles({composerHeight, headerHeight, isComposerFullSize});

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const personalDetail = useCurrentUserPersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lightbulb']);

    const [shouldShowComposeInput = false] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const isAnonymousUser = useIsAnonymousUser();
    const [isBlockedFromChat] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CHAT, {
        selector: isBlockedFromChatSelector,
        canBeMissing: true,
    });

    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isReportArchived = useReportIsArchived(report?.reportID);
    const ancestors = useAncestors(report);
    const isArchivedRoom = isArchivedNonExpenseReport(report, isReportArchived);

    const isSmallSizeLayout = windowWidth - (shouldUseNarrowLayout ? 0 : variables.sideBarWithLHBWidth) < variables.anonymousReportFooterBreakpoint;

    // If a user just signed in and is viewing a public report, optimistically show the composer while loading the report, since they will have write access when the response comes back.
    const shouldShowComposerOptimistically = !isAnonymousUser && isPublicRoom(report) && !!reportMetadata?.isLoadingInitialReportActions;
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived) ?? shouldShowComposerOptimistically;
    const shouldHideComposer = !canPerformWriteAction || isBlockedFromChat;
    const canWriteInReport = canWriteInReportUtil(report);
    const isSystemChat = isSystemChatUtil(report);
    const isAdminsOnlyPostingRoom = isAdminsOnlyPostingRoomUtil(report);
    const isUserPolicyAdmin = isPolicyAdmin(policy);

    const allPersonalDetails = usePersonalDetails();
    const {availableLoginsList} = useShortMentionsList();
    const currentUserEmail = personalDetail.email ?? '';

    const handleCreateTask = useCallback(
        (text: string): boolean => {
            const match = text.match(CONST.REGEX.TASK_TITLE_WITH_OPTIONAL_SHORT_MENTION);
            if (!match) {
                return false;
            }
            let title = match[3] ? match[3].trim().replaceAll('\n', ' ') : undefined;
            if (!title) {
                return false;
            }

            const mention = match[1] ? match[1].trim() : '';
            const currentUserPrivateDomain = isEmailPublicDomain(currentUserEmail ?? '') ? '' : Str.extractEmailDomain(currentUserEmail ?? '');
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
                    // If the mention is not valid, include it on the title.
                    // The mention could be invalid if it's a short mention and failed to be converted to a full mention.
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
                policyID: report.policyID,
                isCreatedUsingMarkdown: true,
                quickAction,
                ancestors,
            });
            return true;
        },
        [allPersonalDetails, ancestors, availableLoginsList, currentUserEmail, personalDetail.accountID, quickAction, report],
    );

    const [targetReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID ?? report.reportID}`, {canBeMissing: true});
    const targetReportAncestors = useAncestors(targetReport);

    const onSubmitComment = useCallback(
        (text: string) => {
            const isTaskCreated = handleCreateTask(text);
            if (isTaskCreated) {
                return;
            }
            // If we are adding an action on an expense report that only has a single transaction thread child report, we need to add the action to the transaction thread instead.
            // This is because we need it to be associated with the transaction thread and not the expense report in order for conversational corrections to work as expected.
            addComment(targetReport, report.reportID, targetReportAncestors, text, personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE, true, isInSidePanel);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [report.reportID, handleCreateTask, targetReport, targetReportAncestors, isInSidePanel],
    );

    const [didHideComposerInput, setDidHideComposerInput] = useState(!shouldShowComposeInput);

    useEffect(() => {
        if (didHideComposerInput || shouldShowComposeInput) {
            return;
        }
        setDidHideComposerInput(true);
    }, [shouldShowComposeInput, didHideComposerInput]);

    const onLayoutInternal = useCallback(
        (event: LayoutChangeEvent) => {
            const {height} = event.nativeEvent.layout;

            setComposerHeight(height);
            onLayout(height);
        },
        [onLayout],
    );

    return (
        <>
            {!!shouldHideComposer && (
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
                            isSmallSizeLayout={isSmallSizeLayout || isInSidePanel}
                        />
                    )}
                    {isArchivedRoom && (
                        <ArchivedReportFooter
                            report={report}
                            currentUserAccountID={personalDetail.accountID}
                        />
                    )}
                    {!isArchivedRoom && !!isBlockedFromChat && <BlockedReportFooter />}
                    {!isAnonymousUser && !canWriteInReport && isSystemChat && <SystemChatReportFooterMessage />}
                    {isAdminsOnlyPostingRoom && !isUserPolicyAdmin && !isArchivedRoom && !isAnonymousUser && !isBlockedFromChat && (
                        <Banner
                            containerStyles={[styles.chatFooterBanner]}
                            text={translate('adminOnlyCanPost')}
                            icon={expensifyIcons.Lightbulb}
                            shouldShowIcon
                        />
                    )}
                    {!shouldUseNarrowLayout && (
                        <View style={styles.offlineIndicatorContainer}>{shouldHideComposer && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}</View>
                    )}
                </View>
            )}
            {!shouldHideComposer && (!!shouldShowComposeInput || !isSmallScreenWidth) && (
                <Animated.View style={[chatFooterStyles, reportFooterStyles]}>
                    <ReportActionCompose
                        onSubmit={onSubmitComment}
                        onComposerFocus={onComposerFocus}
                        onComposerBlur={onComposerBlur}
                        reportID={report.reportID}
                        report={report}
                        lastReportAction={lastReportAction}
                        pendingAction={pendingAction}
                        isComposerFullSize={isComposerFullSize}
                        didHideComposerInput={didHideComposerInput}
                        reportTransactions={reportTransactions}
                        transactionThreadReportID={transactionThreadReportID}
                        isInSidePanel={isInSidePanel}
                        nativeID={nativeID}
                        onLayout={onLayoutInternal}
                    />
                </Animated.View>
            )}
        </>
    );
}

export default memo(
    ReportFooter,
    (prevProps, nextProps) =>
        // Report comes from useOnyx - reference is stable
        prevProps.report === nextProps.report &&
        prevProps.pendingAction === nextProps.pendingAction &&
        prevProps.isComposerFullSize === nextProps.isComposerFullSize &&
        prevProps.lastReportAction === nextProps.lastReportAction &&
        // reportMetadata comes from useOnyx - reference is stable
        prevProps.reportMetadata === nextProps.reportMetadata &&
        // policy comes from useOnyx - comparing nested properties which may be stable
        prevProps.policy?.employeeList === nextProps.policy?.employeeList &&
        prevProps.policy?.role === nextProps.policy?.role &&
        // reportTransactions comes from useOnyx - reference is stable
        prevProps.reportTransactions === nextProps.reportTransactions,
);
