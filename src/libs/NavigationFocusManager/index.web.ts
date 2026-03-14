/**
 * NavigationFocusManager handles focus capture and restoration during screen navigation.
 *
 * Problem: When navigating between screens, focus moves to body BEFORE the new screen's
 * FocusTrap can capture it (click -> navigation -> focus lost -> FocusTrap activates too late).
 *
 * Solution: Capture the focused element during pointerdown/keydown BEFORE navigation.
 * Each capture is tagged with the current route key for state-based validation.
 *
 * Lifecycle: cleanupRemovedRoutes() is called from NavigationRoot on state change,
 * removing focus data for routes no longer in the navigation state. Route existence
 * is the source of truth - no timestamps needed.
 *
 * Focus restoration uses `initialFocus` (trap activation), not `setReturnFocus`
 * (trap deactivation), because we restore focus when RETURNING to a screen.
 */
import Log from '@libs/Log';
import extractNavigationKeys from '@libs/Navigation/helpers/extractNavigationKeys';
import type {State} from '@libs/Navigation/types';
import {NAVIGATION_FOCUS_ROUTE_DATA_ATTRIBUTE, NAVIGATION_FOCUS_ROUTE_SELECTOR} from './constants';
import type NavigationFocusManagerModule from './types';

type InteractionType = 'keyboard' | 'pointer' | 'unknown';

type InteractionTrigger = 'enterOrSpace' | 'escape' | 'pointer' | 'unknown';

type InteractionProvenance = {
    interactionType: InteractionType;
    interactionTrigger: InteractionTrigger;
    routeKey: string | null;
};

/**
 * Scoring weights for element matching during focus restoration.
 * Higher score = higher confidence the candidate is the correct element.
 * Used by findMatchingElement() to identify elements after screen remount.
 *
 * Pattern: Follows the MATCH_RANK constant object pattern from
 * src/libs/filterArrayByMatch.ts for consistent codebase style.
 */
const ELEMENT_MATCH_SCORE = {
    /** aria-label exact match - often unique for interactive elements */
    ARIA_LABEL: 10,
    /** role attribute match - weak signal, many elements share roles */
    ROLE: 5,
    /** data-testid exact match - explicitly unique, highest confidence */
    DATA_TESTID: 50,
    /** Text content prefix match (first N chars) - fuzzy matching */
    TEXT_PREFIX: 30,
    /** Text content exact match - full text identical */
    TEXT_EXACT: 40,
} as const;

/** Minimum score required to consider an element a valid match */
const MIN_MATCH_SCORE = 15;

/** Max characters stored for text content preview */
const TEXT_CONTENT_PREVIEW_LENGTH = 100;

/** Characters to compare for fuzzy text prefix matching */
const TEXT_CONTENT_PREFIX_LENGTH = 20;

const SHOULD_LOG_DEBUG_INFO = typeof __DEV__ === 'boolean' ? __DEV__ : process.env.NODE_ENV !== 'production';

/**
 * Element identification info for restoring focus after screen remount.
 * Unlike storing DOM element references (which become invalid after unmount),
 * this stores attributes that can be used to find the equivalent element
 * in the new DOM.
 *
 * Lifecycle is managed by cleanupRemovedRoutes() - no timestamp needed.
 */
type ElementIdentifier = {
    tagName: string;
    ariaLabel: string | null;
    role: string | null;
    /** First TEXT_CONTENT_PREVIEW_LENGTH chars of textContent for unique identification (e.g., workspace name) */
    textContentPreview: string;
    dataTestId: string | null;
};

type CapturedFocus = {
    element: HTMLElement;
    /** Route key this capture belongs to, for state-based validation */
    forRoute: string | null;
};

type ElementQueryStrategy = (tagNameSelector: string) => readonly HTMLElement[];

type CandidateMatch = {
    element: HTMLElement;
    score: number;
    hasDataTestIdMatch: boolean;
    hasAriaLabelMatch: boolean;
    hasRoleMatch: boolean;
    hasTextExactMatch: boolean;
    hasTextPrefixMatch: boolean;
    isPrefixOnlyMatch: boolean;
};

const defaultElementQueryStrategy: ElementQueryStrategy = (tagNameSelector) => Array.from(document.querySelectorAll<HTMLElement>(tagNameSelector));

type ListenerRegistry = {
    pointerdown: ((event: PointerEvent) => void) | null;
    keydown: ((event: KeyboardEvent) => void) | null;
    owner: symbol | null;
};

const LISTENER_REGISTRY_KEY = Symbol.for('expensify.NavigationFocusManager.listeners');
const listenerOwnerToken = Symbol('NavigationFocusManager.instance');

function getListenerRegistry(): ListenerRegistry {
    const globalObject = globalThis as Record<PropertyKey, unknown>;
    const existingRegistry = globalObject[LISTENER_REGISTRY_KEY] as ListenerRegistry | undefined;
    if (existingRegistry) {
        return existingRegistry;
    }

    const nextRegistry: ListenerRegistry = {
        pointerdown: null,
        keydown: null,
        owner: null,
    };
    globalObject[LISTENER_REGISTRY_KEY] = nextRegistry;
    return nextRegistry;
}

// Module-level state (following ComposerFocusManager pattern)
let lastInteractionCapture: CapturedFocus | null = null;
/** Stores element identifiers for non-persistent screens (that unmount on navigation) */
const routeElementIdentifierMap = new Map<string, ElementIdentifier>();
/** Legacy: stores element references for persistent screens (that stay mounted) */
const routeFocusMap = new Map<string, CapturedFocus>();
let isInitialized = false;

// Track current focused screen's route key for immediate capture
// This allows capturing to routeFocusMap during interaction, before screen unmounts
let currentFocusedRouteKey: string | null = null;

// Track if the most recent user interaction was via keyboard (Enter/Space)
// Used by modals to determine if they should auto-focus their content on open
let wasKeyboardInteraction = false;
let lastInteractionProvenance: InteractionProvenance | null = null;

function logFocusDebug(message: string, metadata?: Record<string, unknown>): void {
    if (!SHOULD_LOG_DEBUG_INFO) {
        return;
    }
    Log.info(message, false, metadata);
}

type RouteFocusEntryUpdate = {
    element?: CapturedFocus | null;
    identifier?: ElementIdentifier | null;
};

function updateRouteFocusEntry(routeKey: string, update: RouteFocusEntryUpdate): void {
    if (update.element !== undefined) {
        if (update.element) {
            routeFocusMap.set(routeKey, update.element);
        } else {
            routeFocusMap.delete(routeKey);
        }
    }

    if (update.identifier !== undefined) {
        if (update.identifier) {
            routeElementIdentifierMap.set(routeKey, update.identifier);
        } else {
            routeElementIdentifierMap.delete(routeKey);
        }
    }
}

function clearRouteFocusEntry(routeKey: string): void {
    updateRouteFocusEntry(routeKey, {element: null, identifier: null});
}

function setInteractionProvenance(provenance: InteractionProvenance): void {
    lastInteractionProvenance = provenance;
}

function clearInteractionProvenance(): void {
    lastInteractionProvenance = null;
}

function clearInteractionProvenanceForRoute(routeKey: string): void {
    if (lastInteractionProvenance?.routeKey !== routeKey) {
        return;
    }
    clearInteractionProvenance();
}

function resolveRouteKeyForElement(element: HTMLElement | null): string | null {
    if (!element) {
        return currentFocusedRouteKey;
    }

    const routeBoundary = element.closest<HTMLElement>(NAVIGATION_FOCUS_ROUTE_SELECTOR);
    return routeBoundary?.getAttribute(NAVIGATION_FOCUS_ROUTE_DATA_ATTRIBUTE) ?? currentFocusedRouteKey;
}

function buildCandidateMatch(candidate: HTMLElement, identifier: ElementIdentifier): CandidateMatch {
    const hasAriaLabelMatch = !!identifier.ariaLabel && candidate.getAttribute('aria-label') === identifier.ariaLabel;
    const hasRoleMatch = !!identifier.role && candidate.getAttribute('role') === identifier.role;
    const hasDataTestIdMatch = !!identifier.dataTestId && candidate.getAttribute('data-testid') === identifier.dataTestId;

    const candidateText = (candidate.textContent ?? '').slice(0, TEXT_CONTENT_PREVIEW_LENGTH).trim();
    const textPrefix = identifier.textContentPreview.slice(0, TEXT_CONTENT_PREFIX_LENGTH);

    const hasTextExactMatch = !!identifier.textContentPreview && candidateText === identifier.textContentPreview;
    const hasTextPrefixMatch = !!identifier.textContentPreview && !!textPrefix && !hasTextExactMatch && candidateText.startsWith(textPrefix);

    const isPrefixOnlyMatch = hasTextPrefixMatch && !hasAriaLabelMatch && !hasRoleMatch && !hasDataTestIdMatch;

    let score = 0;
    if (hasAriaLabelMatch) {
        score += ELEMENT_MATCH_SCORE.ARIA_LABEL;
    }
    if (hasRoleMatch) {
        score += ELEMENT_MATCH_SCORE.ROLE;
    }
    if (hasDataTestIdMatch) {
        score += ELEMENT_MATCH_SCORE.DATA_TESTID;
    }
    if (hasTextExactMatch) {
        score += ELEMENT_MATCH_SCORE.TEXT_EXACT;
    } else if (hasTextPrefixMatch) {
        score += ELEMENT_MATCH_SCORE.TEXT_PREFIX;
    }

    return {
        element: candidate,
        score,
        hasDataTestIdMatch,
        hasAriaLabelMatch,
        hasRoleMatch,
        hasTextExactMatch,
        hasTextPrefixMatch,
        isPrefixOnlyMatch,
    };
}

function isCandidateBetter(candidate: CandidateMatch, bestCandidate: CandidateMatch | null): boolean {
    if (!bestCandidate) {
        return true;
    }

    if (candidate.score !== bestCandidate.score) {
        return candidate.score > bestCandidate.score;
    }

    if (candidate.hasDataTestIdMatch !== bestCandidate.hasDataTestIdMatch) {
        return candidate.hasDataTestIdMatch;
    }

    if (candidate.hasAriaLabelMatch !== bestCandidate.hasAriaLabelMatch) {
        return candidate.hasAriaLabelMatch;
    }

    if (candidate.hasTextExactMatch !== bestCandidate.hasTextExactMatch) {
        return candidate.hasTextExactMatch;
    }

    if (candidate.hasRoleMatch !== bestCandidate.hasRoleMatch) {
        return candidate.hasRoleMatch;
    }

    if (candidate.hasTextPrefixMatch !== bestCandidate.hasTextPrefixMatch) {
        return candidate.hasTextPrefixMatch;
    }

    // Preserve original DOM order for full ties by keeping existing best candidate.
    return false;
}

/**
 * Extract identification info from an element that can be used to find
 * the equivalent element in a new DOM after screen remount.
 * Lifecycle is managed by cleanupRemovedRoutes() - no timestamp needed.
 */
function extractElementIdentifier(element: HTMLElement): ElementIdentifier {
    return {
        tagName: element.tagName,
        ariaLabel: element.getAttribute('aria-label'),
        role: element.getAttribute('role'),
        textContentPreview: (element.textContent ?? '').slice(0, TEXT_CONTENT_PREVIEW_LENGTH).trim(),
        dataTestId: element.getAttribute('data-testid'),
    };
}

/**
 * Find an element in the current DOM that matches the stored identifier.
 * Uses a scoring system to find the best match.
 */
function findMatchingElement(identifier: ElementIdentifier): HTMLElement | null {
    const candidates = Array.from(defaultElementQueryStrategy(identifier.tagName));

    if (candidates.length === 0) {
        return null;
    }

    let bestMatch: CandidateMatch | null = null;
    let prefixOnlyCandidateCount = 0;

    for (const candidate of candidates) {
        const candidateMatch = buildCandidateMatch(candidate, identifier);

        if (candidateMatch.isPrefixOnlyMatch) {
            prefixOnlyCandidateCount += 1;
        }

        if (isCandidateBetter(candidateMatch, bestMatch)) {
            bestMatch = candidateMatch;
        }
    }

    if (!bestMatch || bestMatch.score < MIN_MATCH_SCORE) {
        return null;
    }

    // Prefix-only matches are weak signals. If multiple elements are prefix-only matches,
    // we avoid restoring to any of them to prevent unstable or incorrect focus targets.
    if (bestMatch.isPrefixOnlyMatch && prefixOnlyCandidateCount > 1) {
        logFocusDebug('[NavigationFocusManager] Prefix-only match is ambiguous, skipping restoration', {
            tagName: identifier.tagName,
            prefix: identifier.textContentPreview.slice(0, TEXT_CONTENT_PREFIX_LENGTH),
            candidateCount: prefixOnlyCandidateCount,
        });
        return null;
    }

    return bestMatch.element;
}

/**
 * Capture the element being interacted with.
 * This runs in capture phase, before any click handlers.
 */
function handleInteraction(event: PointerEvent): void {
    // Mouse/touch interaction clears any pending keyboard flag
    wasKeyboardInteraction = false;

    const targetElement = event.target as HTMLElement;
    const routeKey = resolveRouteKeyForElement(targetElement);

    setInteractionProvenance({
        interactionType: 'pointer',
        interactionTrigger: 'pointer',
        routeKey,
    });

    if (targetElement && targetElement !== document.body && targetElement.tagName !== 'HTML') {
        // Menu items are transient (exist only while popover is open) and will be
        // removed from DOM before focus restoration can use them. We use STATE-BASED
        // protection (not time-based) to preserve the anchor element (e.g., "More" button)
        // that opened the menu. This ensures focus restoration works regardless of how
        // long the user takes to click a menu item. See issue #76921 for details.
        const isMenuitem = !!targetElement.closest('[role="menuitem"]');
        const isPriorCaptureAnchor = lastInteractionCapture && !lastInteractionCapture.element.closest('[role="menuitem"]');
        if (isMenuitem && isPriorCaptureAnchor) {
            logFocusDebug('[NavigationFocusManager] Skipped menuitem capture - preserving non-menuitem anchor', {
                menuitemLabel: targetElement.closest('[role="menuitem"]')?.getAttribute('aria-label'),
                anchorLabel: lastInteractionCapture?.element.getAttribute('aria-label'),
            });
            return;
        }

        // Selector excludes tabindex="-1" elements (non-focusable) to skip display-only
        // elements and capture the outer interactive container for focus restoration.
        // Note: [role="menuitem"] is intentionally excluded - we skip those above.
        const interactiveElement = targetElement.closest<HTMLElement>('button, a, [role="button"], [tabindex]:not([tabindex="-1"])');
        const elementToCapture = interactiveElement ?? targetElement;
        const captureRouteKey = resolveRouteKeyForElement(elementToCapture);

        setInteractionProvenance({
            interactionType: 'pointer',
            interactionTrigger: 'pointer',
            routeKey: captureRouteKey,
        });

        lastInteractionCapture = {
            element: elementToCapture,
            forRoute: captureRouteKey,
        };

        // IMMEDIATE CAPTURE: Store element identifier for non-persistent screens
        // This enables focus restoration even after screen unmounts and remounts with new DOM
        if (captureRouteKey) {
            const identifier = extractElementIdentifier(elementToCapture);
            updateRouteFocusEntry(captureRouteKey, {
                element: {
                    element: elementToCapture,
                    forRoute: captureRouteKey,
                },
                identifier,
            });
        }

        logFocusDebug('[NavigationFocusManager] Captured element on pointerdown', {
            tagName: elementToCapture.tagName,
            ariaLabel: elementToCapture.getAttribute('aria-label'),
            role: elementToCapture.getAttribute('role'),
            isMenuitem,
        });
    }
}

/**
 * For keyboard navigation (Enter/Space key triggers navigation like a click)
 * Also tracks Escape for back navigation detection.
 */
function handleKeyDown(event: KeyboardEvent): void {
    // Track Enter/Space for forward navigation, Escape for back navigation
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Escape') {
        return;
    }

    // ALWAYS set keyboard interaction flag for modal auto-focus and navigation
    // This must happen BEFORE any early returns (e.g., menuitem protection)
    wasKeyboardInteraction = true;
    const activeElement = document.activeElement as HTMLElement;
    const routeKey = resolveRouteKeyForElement(activeElement);

    setInteractionProvenance({
        interactionType: 'keyboard',
        interactionTrigger: event.key === 'Escape' ? 'escape' : 'enterOrSpace',
        routeKey,
    });

    // For Escape key (back navigation), we only need the flag, not element capture
    // Element capture is for forward navigation to know where to return focus
    if (event.key === 'Escape') {
        return;
    }

    if (activeElement && activeElement !== document.body && activeElement.tagName !== 'HTML') {
        const isMenuitem = !!activeElement.closest('[role="menuitem"]');
        const isPriorCaptureAnchor = lastInteractionCapture && !lastInteractionCapture.element.closest('[role="menuitem"]');
        if (isMenuitem && isPriorCaptureAnchor) {
            logFocusDebug('[NavigationFocusManager] Skipped menuitem capture on keydown - preserving non-menuitem anchor', {
                menuitemLabel: activeElement.closest('[role="menuitem"]')?.getAttribute('aria-label'),
                anchorLabel: lastInteractionCapture?.element.getAttribute('aria-label'),
            });
            return;
        }

        lastInteractionCapture = {
            element: activeElement,
            forRoute: routeKey,
        };

        // IMMEDIATE CAPTURE: Store element identifier for non-persistent screens
        if (routeKey) {
            const identifier = extractElementIdentifier(activeElement);
            updateRouteFocusEntry(routeKey, {
                element: {
                    element: activeElement,
                    forRoute: routeKey,
                },
                identifier,
            });
        }

        logFocusDebug('[NavigationFocusManager] Captured element on keydown', {
            tagName: activeElement.tagName,
            ariaLabel: activeElement.getAttribute('aria-label'),
            role: activeElement.getAttribute('role'),
            key: event.key,
        });
    }
}

function clearLocalStateOnDestroy(): void {
    isInitialized = false;
    routeFocusMap.clear();
    routeElementIdentifierMap.clear();
    lastInteractionCapture = null;
    clearInteractionProvenance();
    currentFocusedRouteKey = null;
    wasKeyboardInteraction = false;
}

/**
 * Initialize the manager by attaching global capture-phase listeners.
 * Should be called once at app startup.
 */
function initialize(): void {
    if (isInitialized || typeof document === 'undefined') {
        return;
    }

    const listenerRegistry = getListenerRegistry();
    const hasCurrentListeners = listenerRegistry.pointerdown === handleInteraction && listenerRegistry.keydown === handleKeyDown;
    if (hasCurrentListeners) {
        listenerRegistry.owner = listenerOwnerToken;
        isInitialized = true;
        return;
    }

    if (listenerRegistry.pointerdown) {
        document.removeEventListener('pointerdown', listenerRegistry.pointerdown, {capture: true});
    }
    if (listenerRegistry.keydown) {
        document.removeEventListener('keydown', listenerRegistry.keydown, {capture: true});
    }

    // Capture phase runs BEFORE the event reaches target handlers
    // This ensures we capture the focused element before any navigation logic
    document.addEventListener('pointerdown', handleInteraction, {capture: true});
    document.addEventListener('keydown', handleKeyDown, {capture: true});

    listenerRegistry.pointerdown = handleInteraction;
    listenerRegistry.keydown = handleKeyDown;
    listenerRegistry.owner = listenerOwnerToken;
    isInitialized = true;
}

/**
 * Cleanup listeners. Should be called on app unmount.
 */
function destroy(): void {
    if (typeof document !== 'undefined') {
        const listenerRegistry = getListenerRegistry();

        if (listenerRegistry.pointerdown === handleInteraction) {
            document.removeEventListener('pointerdown', handleInteraction, {capture: true});
            listenerRegistry.pointerdown = null;
        }

        if (listenerRegistry.keydown === handleKeyDown) {
            document.removeEventListener('keydown', handleKeyDown, {capture: true});
            listenerRegistry.keydown = null;
        }

        if (!listenerRegistry.pointerdown && !listenerRegistry.keydown) {
            listenerRegistry.owner = null;
        } else if (listenerRegistry.owner === listenerOwnerToken && listenerRegistry.pointerdown !== handleInteraction && listenerRegistry.keydown !== handleKeyDown) {
            listenerRegistry.owner = null;
        }
    }

    clearLocalStateOnDestroy();
}

/**
 * Called when a screen loses focus (isFocused becomes false).
 * Stores the most recently captured element for this route.
 *
 * Uses state-based validation: capture is valid if it belongs to this specific route.
 * This replaces time-based validation which had edge cases on slow devices and
 * incorrectly accepted captures from wrong routes.
 *
 * @param routeKey - The route.key from React Navigation
 */
function captureForRoute(routeKey: string): void {
    let elementToStore: HTMLElement | null = null;
    let captureSource: 'interaction' | 'activeElement' | 'none' = 'none';

    // Try to use the element captured during user interaction if it belongs to this route
    if (lastInteractionCapture) {
        const {element: capturedElement, forRoute} = lastInteractionCapture;
        const isInDOM = document.body.contains(capturedElement);

        // State-based validity: capture MUST be for THIS specific route
        // Reject null forRoute - if we don't know the origin, we can't validate it
        const isValidCapture = forRoute === routeKey;

        if (forRoute === null) {
            logFocusDebug('[NavigationFocusManager] Capture has no route - rejecting for safety', {
                requestedRoute: routeKey,
                capturedLabel: capturedElement.getAttribute('aria-label'),
            });
        } else if (!isValidCapture) {
            logFocusDebug('[NavigationFocusManager] Capture is for different route - rejecting', {
                captureRoute: forRoute,
                requestedRoute: routeKey,
            });
        } else if (!isInDOM) {
            logFocusDebug('[NavigationFocusManager] Captured element no longer in DOM - falling back to activeElement', {
                routeKey,
                capturedLabel: capturedElement.getAttribute('aria-label'),
            });
        } else {
            elementToStore = capturedElement;
            captureSource = 'interaction';
        }
    }

    // Fallback: use current activeElement if captured element is invalid or missing
    // This is critical for dropdown menus where the clicked menu item is removed,
    // but focus has been restored to the anchor button (via onModalHide focus call)
    if (!elementToStore) {
        const activeElement = document.activeElement as HTMLElement;
        // Exclude document.body and document.documentElement:
        // - body: Common fallback when no element is focused
        // - documentElement (HTML): Can be activeElement in edge cases, e.g., after
        //   all focusable elements are removed, or in certain browser/JSDOM states.
        //   Neither represents a meaningful focus target for restoration.
        if (activeElement && activeElement !== document.body && activeElement !== document.documentElement) {
            elementToStore = activeElement;
            captureSource = 'activeElement';
        }
    }

    // Store the element if we found a valid one
    if (elementToStore) {
        updateRouteFocusEntry(routeKey, {
            element: {
                element: elementToStore,
                forRoute: routeKey,
            },
        });
        logFocusDebug('[NavigationFocusManager] Stored focus for route', {
            routeKey,
            source: captureSource,
            tagName: elementToStore.tagName,
            ariaLabel: elementToStore.getAttribute('aria-label'),
            role: elementToStore.getAttribute('role'),
        });
    } else {
        logFocusDebug('[NavigationFocusManager] No valid element to store for route', {
            routeKey,
            activeElement: document.activeElement?.tagName,
        });
    }

    // Clear the interaction capture after use
    lastInteractionCapture = null;
    clearInteractionProvenance();
}

/**
 * Called when a screen regains focus (via initialFocus callback).
 * Returns the stored element if it's still valid, or finds a matching element
 * in the new DOM for non-persistent screens that remounted.
 *
 * Lifecycle is managed by cleanupRemovedRoutes() - if data exists, it's valid.
 * No time-based expiry checks needed.
 *
 * @param routeKey - The route.key from React Navigation
 * @returns The element to focus, or null if none available
 */
function retrieveForRoute(routeKey: string): HTMLElement | null {
    const captured = routeFocusMap.get(routeKey);
    const identifier = routeElementIdentifierMap.get(routeKey);

    // Remove from maps regardless (one-time use)
    clearRouteFocusEntry(routeKey);

    // Strategy 1: Try element reference (works for persistent screens)
    if (captured && document.body.contains(captured.element)) {
        logFocusDebug('[NavigationFocusManager] Retrieved focus for route (element reference)', {
            routeKey,
            tagName: captured.element.tagName,
            ariaLabel: captured.element.getAttribute('aria-label'),
        });
        return captured.element;
    }

    // Strategy 2: Use element identifier to find matching element in new DOM
    if (identifier) {
        const matchedElement = findMatchingElement(identifier);
        if (matchedElement) {
            logFocusDebug('[NavigationFocusManager] Retrieved focus for route (identifier match)', {
                routeKey,
                tagName: matchedElement.tagName,
                ariaLabel: matchedElement.getAttribute('aria-label'),
            });
            return matchedElement;
        }

        logFocusDebug('[NavigationFocusManager] No matching element found for identifier', {
            routeKey,
            identifier: {
                tagName: identifier.tagName,
                ariaLabel: identifier.ariaLabel,
                textContentPreview: identifier.textContentPreview.slice(0, 30),
            },
        });
    }

    if (!captured && !identifier) {
        logFocusDebug('[NavigationFocusManager] No stored focus for route', {routeKey});
    }

    return null;
}

/**
 * Clear the stored focus element for a specific route.
 * Useful when a route is being unmounted or reset.
 *
 * @param routeKey - The route.key from React Navigation
 */
function clearForRoute(routeKey: string): void {
    clearRouteFocusEntry(routeKey);
    clearInteractionProvenanceForRoute(routeKey);
}

/**
 * Check if there's a stored element for a route (without consuming it).
 * Useful for determining if focus restoration should be attempted.
 *
 * @param routeKey - The route.key from React Navigation
 * @returns true if there's a stored element or identifier for this route
 */
function hasStoredFocus(routeKey: string): boolean {
    return routeFocusMap.has(routeKey) || routeElementIdentifierMap.has(routeKey);
}

/**
 * Register the currently focused screen's route key.
 * This enables immediate capture to routeFocusMap during interactions,
 * which is critical for non-persistent screens that unmount before
 * captureForRoute() can be called.
 *
 * @param routeKey - The route.key from React Navigation
 */
function registerFocusedRoute(routeKey: string): void {
    if (currentFocusedRouteKey !== routeKey) {
        clearInteractionProvenance();
    }
    currentFocusedRouteKey = routeKey;
}

/**
 * Unregister the focused route when screen loses focus or unmounts.
 *
 * @param routeKey - The route.key to unregister (only clears if it matches current)
 */
function unregisterFocusedRoute(routeKey: string): void {
    if (currentFocusedRouteKey !== routeKey) {
        return;
    }
    currentFocusedRouteKey = null;
}

/**
 * Check if the most recent user interaction was via keyboard (Enter/Space).
 * Used by modals to determine if they should auto-focus their content.
 */
function wasRecentKeyboardInteraction(): boolean {
    return wasKeyboardInteraction;
}

/**
 * Clear the keyboard interaction flag after it has been consumed.
 * Call this immediately after reading the flag to prevent stale reads.
 */
function clearKeyboardInteractionFlag(): void {
    wasKeyboardInteraction = false;
}

/**
 * Get the last captured element that is NOT a menuitem.
 * Used for focus restoration when a modal triggered from a menu closes.
 */
function getCapturedAnchorElement(): HTMLElement | null {
    // Only available on web where document exists
    if (typeof document === 'undefined' || !lastInteractionCapture) {
        return null;
    }

    const element = lastInteractionCapture.element;

    // Verify element is still in DOM
    if (!document.body.contains(element)) {
        logFocusDebug('[NavigationFocusManager] getCapturedAnchorElement: element no longer in DOM');
        return null;
    }

    // Only return non-menuitem elements (anchors like "More" button)
    if (element.closest('[role="menuitem"]')) {
        logFocusDebug('[NavigationFocusManager] getCapturedAnchorElement: element is menuitem, returning null');
        return null;
    }

    logFocusDebug('[NavigationFocusManager] getCapturedAnchorElement: returning anchor', {
        tagName: element.tagName,
        ariaLabel: element.getAttribute('aria-label'),
    });

    return element;
}

/**
 * Removes focus data for routes that are no longer in the navigation state.
 * Called from handleStateChange in NavigationRoot.tsx.
 */
function cleanupRemovedRoutes(state: State): void {
    const activeKeys = extractNavigationKeys(state.routes);
    const knownRouteKeys = new Set<string>([...routeFocusMap.keys(), ...routeElementIdentifierMap.keys()]);
    const provenanceRouteKey = lastInteractionProvenance?.routeKey;
    if (provenanceRouteKey) {
        knownRouteKeys.add(provenanceRouteKey);
    }

    for (const key of knownRouteKeys) {
        if (activeKeys.has(key)) {
            continue;
        }

        clearRouteFocusEntry(key);
        clearInteractionProvenanceForRoute(key);
        logFocusDebug('[NavigationFocusManager] Cleaned up focus data for removed route', {routeKey: key});
    }
}

const NavigationFocusManager: NavigationFocusManagerModule = {
    initialize,
    destroy,
    captureForRoute,
    retrieveForRoute,
    clearForRoute,
    hasStoredFocus,
    registerFocusedRoute,
    unregisterFocusedRoute,
    wasRecentKeyboardInteraction,
    clearKeyboardInteractionFlag,
    getCapturedAnchorElement,
    cleanupRemovedRoutes,
};

export default NavigationFocusManager;
