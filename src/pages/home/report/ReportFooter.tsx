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

// Elements to skip entirely during page content extraction
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'svg', 'canvas', 'iframe', 'video', 'audio', 'template', 'slot', 'meta', 'link']);

// Pattern to match SVG CSS garbage that leaks through innerText
const SVG_GARBAGE_PATTERN = /\.[a-zA-Z0-9_-]+_svg__[a-zA-Z0-9]+\{[^}]+\}/g;

/**
 * Clean SVG CSS garbage from text that leaks through innerText
 */
function cleanSvgGarbage(text: string): string {
    return text.replaceAll(SVG_GARBAGE_PATTERN, '').trim();
}

/**
 * Check if an element is actually visible on screen
 * Elements can be in DOM but hidden via CSS, off-screen, or in collapsed panels
 */
function isElementVisible(element: Element): boolean {
    const htmlElement = element as HTMLElement;

    // Check computed styles for display/visibility
    const style = window.getComputedStyle(htmlElement);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
    }

    // Check if element has size and is in viewport (or reasonably close)
    const rect = htmlElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        return false;
    }

    // Check if element is reasonably within the viewport (allow some buffer for scrolling)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buffer = 100; // Small buffer for elements just outside viewport

    if (rect.right < -buffer || rect.left > viewportWidth + buffer) {
        return false;
    }
    if (rect.bottom < -buffer || rect.top > viewportHeight + buffer) {
        return false;
    }

    return true;
}

// Map ARIA roles to semantic tag names for cleaner output
const ROLE_TO_TAG: Record<string, string> = {
    button: 'button',
    link: 'a',
    heading: 'h',
    navigation: 'nav',
    main: 'main',
    banner: 'header',
    contentinfo: 'footer',
    complementary: 'aside',
    form: 'form',
    search: 'search',
    list: 'ul',
    listitem: 'li',
    table: 'table',
    row: 'tr',
    cell: 'td',
    columnheader: 'th',
    rowheader: 'th',
    dialog: 'dialog',
    alert: 'alert',
    menu: 'menu',
    menuitem: 'menuitem',
    tab: 'tab',
    tabpanel: 'tabpanel',
    textbox: 'input',
    checkbox: 'checkbox',
    radio: 'radio',
    img: 'img',
};

// Native semantic HTML tags (when no role override)
const SEMANTIC_TAGS = new Set([
    'main', 'header', 'footer', 'nav', 'aside', 'section', 'article',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'blockquote', 'pre', 'code',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'form', 'fieldset', 'label', 'input', 'textarea', 'select', 'button',
    'a', 'details', 'summary', 'dialog',
    'img', 'figure', 'figcaption',
]);

/**
 * Get the semantic tag name for an element, considering both native tag and ARIA role
 */
function getSemanticTag(element: Element): string | null {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');

    // Check ARIA role first (React Native Web uses these heavily)
    if (role && ROLE_TO_TAG[role]) {
        let mappedTag = ROLE_TO_TAG[role];

        // Special handling for headings with aria-level
        if (role === 'heading') {
            const level = element.getAttribute('aria-level') ?? '2';
            mappedTag = `h${level}`;
        }

        return mappedTag;
    }

    // Fall back to native semantic tags
    if (SEMANTIC_TAGS.has(tagName)) {
        return tagName;
    }

    return null;
}

/**
 * Escape special characters in attribute values
 */
function escapeAttributeValue(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/**
 * Build clean attributes string for output
 */
function buildCleanAttributes(element: Element, semanticTag: string): string {
    const attrs: string[] = [];

    // Add href for links
    if (semanticTag === 'a') {
        const href = element.getAttribute('href');
        if (href) {
            attrs.push(`href="${escapeAttributeValue(href)}"`);
        }
    }

    // Add aria-label only if it provides useful info (not redundant with tag name or text)
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.toLowerCase() !== semanticTag) {
        attrs.push(`aria-label="${escapeAttributeValue(ariaLabel)}"`);
    }

    const alt = element.getAttribute('alt');
    if (alt) {
        attrs.push(`alt="${escapeAttributeValue(alt)}"`);
    }

    const placeholder = element.getAttribute('placeholder');
    if (placeholder) {
        attrs.push(`placeholder="${escapeAttributeValue(placeholder)}"`);
    }

    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}

/**
 * Captures page content for LLM context by walking the DOM
 * - Semantic elements (button, link, heading, etc.) are output with their text
 * - Non-semantic wrappers (div, span) are unwrapped and their children processed
 * - Scripts, SVGs, styles are skipped entirely
 * Only works on web - returns empty string on native platforms
 */
function captureSimplifiedPageHTML(): string {
    if (typeof document === 'undefined') {
        return '';
    }

    try {
        const rootElement = document.getElementById('root');
        if (!rootElement) {
            return '';
        }

        // rootInnerText only contains truly visible text - use it to filter hidden content
        const rootInnerText = rootElement.innerText ?? '';
        const currentPath = window.location.pathname + window.location.search;

        // Track seen semantic elements to deduplicate (e.g. nav buttons that appear multiple times)
        const seenSemanticContent = new Set<string>();
        // React Native Web generates very deeply nested DOMs, so we need a high limit
        const maxDepth = 100;

        const extractContent = (element: Element, depth = 0): string[] => {
            if (depth > maxDepth) {
                return [];
            }

            const tagName = element.tagName.toLowerCase();
            const htmlElement = element as HTMLElement;

            // Skip non-content elements entirely
            if (SKIP_TAGS.has(tagName)) {
                return [];
            }

            // Get semantic tag (from ARIA role or native tag)
            const semanticTag = getSemanticTag(element);

            if (semanticTag) {
                // Skip hidden semantic elements
                if (!isElementVisible(element)) {
                    return [];
                }

                // Use innerText and clean SVG garbage
                const rawText = htmlElement.innerText?.trim();
                const text = rawText ? cleanSvgGarbage(rawText) : '';

                if (text && text.length > 0) {
                    // Deduplicate semantic elements (same button text shouldn't appear twice)
                    const contentKey = `${semanticTag}:${text}`;
                    if (!seenSemanticContent.has(contentKey)) {
                        seenSemanticContent.add(contentKey);
                        const attrs = buildCleanAttributes(element, semanticTag);
                        return [`<${semanticTag}${attrs}>${text}</${semanticTag}>`];
                    }
                }
                return [];
            }

            // Non-semantic element (div, span) - capture direct text and recurse into children
            const results: string[] = [];

            // Capture text nodes if text appears in rootInnerText (the browser's visible text)
            // We trust rootInnerText as the source of truth for visibility rather than checking
            // each parent's visibility, which can fail for complex layouts like expense tables
            for (const child of Array.from(element.childNodes)) {
                if (child.nodeType === Node.TEXT_NODE) {
                    const rawText = child.textContent?.trim();
                    const text = rawText ? cleanSvgGarbage(rawText) : '';
                    if (text && text.length > 1 && rootInnerText.includes(text)) {
                        results.push(text);
                    }
                }
            }

            // Recurse into child elements
            for (const child of Array.from(element.children)) {
                results.push(...extractContent(child, depth + 1));
            }
            return results;
        };

        const output = extractContent(rootElement);
        const content = output.join('\n');
        const structuredText = `<page url="${currentPath}">\n${content}\n</page>`;

        // Limit to ~10KB
        const maxLength = 10000;
        if (structuredText.length > maxLength) {
            return `${structuredText.substring(0, maxLength)}\n... [truncated]`;
        }

        if (structuredText.length < 50) {
            return '';
        }

        return structuredText;
    } catch (error) {
        // Log but don't crash - page context is non-critical for chat functionality
        console.error('[captureSimplifiedPageHTML] Error extracting page content:', error);
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
