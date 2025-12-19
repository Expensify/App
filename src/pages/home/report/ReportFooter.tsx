import {isBlockedFromChatSelector} from '@selectors/BlockedFromChat';
import {Str} from 'expensify-common';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AnonymousReportFooter from '@components/AnonymousReportFooter';
import ArchivedReportFooter from '@components/ArchivedReportFooter';
import Banner from '@components/Banner';
import BlockedReportFooter from '@components/BlockedReportFooter';
import OfflineIndicator from '@components/OfflineIndicator';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SwipeableView from '@components/SwipeableView';
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

    /** Whether the report is displayed in the Concierge side panel */
    isInSidePanel?: boolean;
};

/**
 * Extracts page information in a simplified XML-like format for LLM understanding
 * Uses semantic tags to describe what each element represents
 */
function extractPageContext(element: Element, depth = 0): string[] {
    const context: string[] = [];
    const indent = '  '.repeat(depth);

    // Skip hidden elements
    if (element instanceof HTMLElement) {
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || element.getAttribute('aria-hidden') === 'true') {
            return context;
        }
    }

    const tagName = element.tagName.toLowerCase();

    // Skip non-content elements
    if (['script', 'style', 'noscript', 'svg', 'iframe', 'canvas', 'img', 'video', 'audio', 'input', 'textarea'].includes(tagName)) {
        return context;
    }

    // Get direct text content (not from children)
    const directText = Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim())
        .filter((text) => text && text.length > 0)
        .join(' ')
        .trim();

    // Get relevant attributes for context
    const role = element.getAttribute('role') || '';
    const ariaLabel = element.getAttribute('aria-label') || '';
    const testId = element.getAttribute('data-testid') || '';
    const className = element.className || '';

    // Determine semantic tag based on element type and attributes
    let semanticTag = '';
    let hasChildren = element.children.length > 0;

    if (tagName === 'button' || role === 'button') {
        semanticTag = 'button';
    } else if (tagName === 'a' || role === 'link') {
        semanticTag = 'link';
    } else if (tagName.match(/^h[1-6]$/)) {
        semanticTag = `heading level="${tagName.slice(1)}"`;
    } else if (tagName === 'li') {
        semanticTag = 'list-item';
    } else if (role === 'navigation' || tagName === 'nav') {
        semanticTag = 'navigation';
    } else if (role === 'menu' || role === 'menubar') {
        semanticTag = 'menu';
    } else if (role === 'table' || tagName === 'table') {
        semanticTag = 'table';
    } else if (testId.includes('report') || className.includes('report')) {
        semanticTag = 'report-section';
    } else if (testId || ariaLabel) {
        // Use data-testid or aria-label as semantic hint
        const hint = testId || ariaLabel;
        semanticTag = `section name="${hint.replace(/"/g, "'")}"`;
    } else if (['section', 'article', 'aside', 'main', 'header', 'footer'].includes(tagName)) {
        semanticTag = tagName;
    } else if (hasChildren && directText) {
        semanticTag = 'group';
    } else if (directText && directText.length > 2) {
        semanticTag = 'text';
    }

    // Output opening tag with text if meaningful
    if (semanticTag && directText && directText.length > 2) {
        // Self-closing tag with content
        context.push(`${indent}<${semanticTag}>${directText}</${semanticTag.split(' ')[0]}>`);
    } else if (semanticTag && hasChildren) {
        // Opening tag for container
        context.push(`${indent}<${semanticTag}>`);
        
        // Process children
        Array.from(element.children).forEach((child) => {
            context.push(...extractPageContext(child, depth + 1));
        });
        
        // Closing tag
        context.push(`${indent}</${semanticTag.split(' ')[0]}>`);
        return context;
    } else if (directText && directText.length > 2) {
        // Plain text without semantic meaning
        context.push(`${indent}${directText}`);
    }

    // Process children if we didn't already (for non-container semantic elements)
    if (!hasChildren || !semanticTag) {
        Array.from(element.children).forEach((child) => {
            context.push(...extractPageContext(child, depth));
        });
    }

    return context;
}

/**
 * Captures simplified, structured text of the main page content (excluding the side panel)
 * This is used to provide context to the LLM when the user sends a message from the Concierge side panel
 * Only works on web - returns empty string on native platforms
 */
function captureSimplifiedPageHTML(): string {
    // Only works on web where document exists
    if (typeof document === 'undefined') {
        return '';
    }

    try {
        // The side panel is rendered in a ModalPortal (outside #root), so querying #root gives us the main content
        const rootElement = document.getElementById('root');
        if (!rootElement) {
            return '';
        }

        // Get the current page URL/path
        const currentPath = window.location.pathname + window.location.search;

        // Extract all context items with hierarchy (starting at depth 1 for page content)
        const contextItems = extractPageContext(rootElement, 1);

        // Filter out only truly meaningless items
        const filtered = contextItems.filter((item) => {
            const trimmed = item.trim();
            // Remove empty lines
            if (trimmed.length === 0) {
                return false;
            }
            // Remove single-character items
            if (trimmed.length === 1) {
                return false;
            }
            // Keep everything else (including duplicates since indentation provides context)
            return true;
        });

        // Wrap in a page tag with URL attribute, using XML-like structure
        const structuredText = [`<page url="${currentPath}">`, ...filtered, '</page>'].join('\n');

        // Limit to ~10KB to avoid sending too much data to the LLM
        const maxLength = 10000;
        if (structuredText.length > maxLength) {
            return `${structuredText.substring(0, maxLength)}\n... [truncated]`;
        }

        // Only return if we have meaningful content
        if (structuredText.length < 50) {
            return '';
        }

        return structuredText;
    } catch (error) {
        return '';
    }
}

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
    isInSidePanel = false,
}: ReportFooterProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
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
            const targetReportID = transactionThreadReportID ?? report.reportID;

            // When sending from the Concierge side panel, capture the HTML of the main page to provide context to the LLM
            const pageHTML = isInSidePanel ? captureSimplifiedPageHTML() : undefined;

            addComment(targetReportID, report.reportID, targetReportAncestors, text, personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE, true, pageHTML);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [report.reportID, handleCreateTask, transactionThreadReportID, targetReportAncestors, isInSidePanel],
    );

    const [didHideComposerInput, setDidHideComposerInput] = useState(!shouldShowComposeInput);

    useEffect(() => {
        if (didHideComposerInput || shouldShowComposeInput) {
            return;
        }
        setDidHideComposerInput(true);
    }, [shouldShowComposeInput, didHideComposerInput]);

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
                            isSmallSizeLayout={isSmallSizeLayout}
                        />
                    )}
                    {isArchivedRoom && <ArchivedReportFooter report={report} />}
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
                            didHideComposerInput={didHideComposerInput}
                            reportTransactions={reportTransactions}
                            transactionThreadReportID={transactionThreadReportID}
                        />
                    </SwipeableView>
                </View>
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
