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

import extractNavigationKeys from './Navigation/helpers/extractNavigationKeys';
import type {State} from './Navigation/types';
import Log from './Log';

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
    /** First 100 chars of textContent for unique identification (e.g., workspace name) */
    textContentPreview: string;
    dataTestId: string | null;
};

type CapturedFocus = {
    element: HTMLElement;
    /** Route key this capture belongs to, for state-based validation */
    forRoute: string | null;
};

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
        textContentPreview: (element.textContent ?? '').slice(0, 100).trim(),
        dataTestId: element.getAttribute('data-testid'),
    };
}

/**
 * Find an element in the current DOM that matches the stored identifier.
 * Uses a scoring system to find the best match.
 */
function findMatchingElement(identifier: ElementIdentifier): HTMLElement | null {
    // Query for elements with matching tagName
    const candidates = document.querySelectorAll<HTMLElement>(identifier.tagName);

    if (candidates.length === 0) {
        return null;
    }

    let bestMatch: HTMLElement | null = null;
    let bestScore = 0;

    for (const candidate of candidates) {
        let score = 0;

        // Match aria-label (high weight - often unique for list items)
        if (identifier.ariaLabel && candidate.getAttribute('aria-label') === identifier.ariaLabel) {
            score += 10;
        }

        // Match role
        if (identifier.role && candidate.getAttribute('role') === identifier.role) {
            score += 5;
        }

        // Match data-testid (highest weight if available)
        if (identifier.dataTestId && candidate.getAttribute('data-testid') === identifier.dataTestId) {
            score += 50;
        }

        // Match textContent (critical for list items like workspace rows)
        // Use startsWith for robustness against minor content changes
        const candidateText = (candidate.textContent ?? '').slice(0, 100).trim();
        if (identifier.textContentPreview && candidateText.startsWith(identifier.textContentPreview.slice(0, 20))) {
            score += 30;
        } else if (identifier.textContentPreview && candidateText === identifier.textContentPreview) {
            score += 40;
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = candidate;
        }
    }

    // Require minimum score to avoid false positives
    // aria-label match (10) + either role (5) or textContent prefix (30)
    if (bestScore >= 15) {
        return bestMatch;
    }

    return null;
}

/**
 * Capture the element being interacted with.
 * This runs in capture phase, before any click handlers.
 */
function handleInteraction(event: PointerEvent): void {
    // Mouse/touch interaction clears any pending keyboard flag
    wasKeyboardInteraction = false;

    const targetElement = event.target as HTMLElement;

    if (targetElement && targetElement !== document.body && targetElement.tagName !== 'HTML') {
        // Menu items are transient (exist only while popover is open) and will be
        // removed from DOM before focus restoration can use them. We use STATE-BASED
        // protection (not time-based) to preserve the anchor element (e.g., "More" button)
        // that opened the menu. This ensures focus restoration works regardless of how
        // long the user takes to click a menu item. See issue #76921 for details.
        //
        // The protection only applies when: (1) target is a menuitem, AND (2) prior
        // capture is NOT a menuitem (i.e., it's an anchor like "More" button).
        // Non-menuitems always capture, correctly overwriting any prior capture.
        const isMenuitem = !!targetElement.closest('[role="menuitem"]');
        const isPriorCaptureAnchor = lastInteractionCapture && !lastInteractionCapture.element.closest('[role="menuitem"]');
        if (isMenuitem && isPriorCaptureAnchor) {
            Log.info('[NavigationFocusManager] Skipped menuitem capture - preserving non-menuitem anchor', false, {
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

        lastInteractionCapture = {
            element: elementToCapture,
            forRoute: currentFocusedRouteKey,
        };

        // IMMEDIATE CAPTURE: Store element identifier for non-persistent screens
        // This enables focus restoration even after screen unmounts and remounts with new DOM
        if (currentFocusedRouteKey) {
            const identifier = extractElementIdentifier(elementToCapture);
            routeElementIdentifierMap.set(currentFocusedRouteKey, identifier);
            // Also store element reference for persistent screens (fallback)
            routeFocusMap.set(currentFocusedRouteKey, {
                element: elementToCapture,
                forRoute: currentFocusedRouteKey,
            });
        }

        Log.info('[NavigationFocusManager] Captured element on pointerdown', false, {
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

    // For Escape key (back navigation), we only need the flag, not element capture
    // Element capture is for forward navigation to know where to return focus
    if (event.key === 'Escape') {
        return;
    }

    const activeElement = document.activeElement as HTMLElement;

    if (activeElement && activeElement !== document.body && activeElement.tagName !== 'HTML') {
        // Menu items are transient - use state-based protection to preserve anchor.
        // See handleInteraction comment for full explanation. Issue #76921.
        const isMenuitem = !!activeElement.closest('[role="menuitem"]');
        const isPriorCaptureAnchor = lastInteractionCapture && !lastInteractionCapture.element.closest('[role="menuitem"]');
        if (isMenuitem && isPriorCaptureAnchor) {
            Log.info('[NavigationFocusManager] Skipped menuitem capture on keydown - preserving non-menuitem anchor', false, {
                menuitemLabel: activeElement.closest('[role="menuitem"]')?.getAttribute('aria-label'),
                anchorLabel: lastInteractionCapture?.element.getAttribute('aria-label'),
            });
            return;
        }

        lastInteractionCapture = {
            element: activeElement,
            forRoute: currentFocusedRouteKey,
        };

        // IMMEDIATE CAPTURE: Store element identifier for non-persistent screens
        if (currentFocusedRouteKey) {
            const identifier = extractElementIdentifier(activeElement);
            routeElementIdentifierMap.set(currentFocusedRouteKey, identifier);
            // Also store element reference for persistent screens (fallback)
            routeFocusMap.set(currentFocusedRouteKey, {
                element: activeElement,
                forRoute: currentFocusedRouteKey,
            });
        }

        Log.info('[NavigationFocusManager] Captured element on keydown', false, {
            tagName: activeElement.tagName,
            ariaLabel: activeElement.getAttribute('aria-label'),
            role: activeElement.getAttribute('role'),
            key: event.key,
        });
    }
}

/**
 * Initialize the manager by attaching global capture-phase listeners.
 * Should be called once at app startup.
 */
function initialize(): void {
    if (isInitialized || typeof document === 'undefined') {
        return;
    }

    // Capture phase runs BEFORE the event reaches target handlers
    // This ensures we capture the focused element before any navigation logic
    document.addEventListener('pointerdown', handleInteraction, {capture: true});
    document.addEventListener('keydown', handleKeyDown, {capture: true});

    isInitialized = true;
}

/**
 * Cleanup listeners. Should be called on app unmount.
 */
function destroy(): void {
    if (!isInitialized || typeof document === 'undefined') {
        return;
    }

    document.removeEventListener('pointerdown', handleInteraction, {capture: true});
    document.removeEventListener('keydown', handleKeyDown, {capture: true});

    isInitialized = false;
    routeFocusMap.clear();
    routeElementIdentifierMap.clear();
    lastInteractionCapture = null;
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
            // This should be rare - only happens if interaction occurs before any route is registered
            // Reject to be safe rather than potentially restoring focus to wrong screen
            Log.info('[NavigationFocusManager] Capture has no route - rejecting for safety', false, {
                requestedRoute: routeKey,
                capturedLabel: capturedElement.getAttribute('aria-label'),
            });
        } else if (!isValidCapture) {
            Log.info('[NavigationFocusManager] Capture is for different route - rejecting', false, {
                captureRoute: forRoute,
                requestedRoute: routeKey,
            });
        } else if (!isInDOM) {
            Log.info('[NavigationFocusManager] Captured element no longer in DOM - falling back to activeElement', false, {
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
        routeFocusMap.set(routeKey, {
            element: elementToStore,
            forRoute: routeKey,
        });
        Log.info('[NavigationFocusManager] Stored focus for route', false, {
            routeKey,
            source: captureSource,
            tagName: elementToStore.tagName,
            ariaLabel: elementToStore.getAttribute('aria-label'),
            role: elementToStore.getAttribute('role'),
        });
    } else {
        Log.info('[NavigationFocusManager] No valid element to store for route', false, {
            routeKey,
            activeElement: document.activeElement?.tagName,
        });
    }

    // Clear the interaction capture after use
    lastInteractionCapture = null;
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
    routeFocusMap.delete(routeKey);
    routeElementIdentifierMap.delete(routeKey);

    // Strategy 1: Try element reference (works for persistent screens)
    // No timestamp check - cleanupRemovedRoutes handles lifecycle
    if (captured && document.body.contains(captured.element)) {
        Log.info('[NavigationFocusManager] Retrieved focus for route (element reference)', false, {
            routeKey,
            tagName: captured.element.tagName,
            ariaLabel: captured.element.getAttribute('aria-label'),
        });
        return captured.element;
    }

    // Strategy 2: Use element identifier to find matching element in new DOM
    // (Critical for non-persistent screens that remounted)
    // No timestamp check - cleanupRemovedRoutes handles lifecycle
    if (identifier) {
        const matchedElement = findMatchingElement(identifier);
        if (matchedElement) {
            Log.info('[NavigationFocusManager] Retrieved focus for route (identifier match)', false, {
                routeKey,
                tagName: matchedElement.tagName,
                ariaLabel: matchedElement.getAttribute('aria-label'),
            });
            return matchedElement;
        }

        Log.info('[NavigationFocusManager] No matching element found for identifier', false, {
            routeKey,
            identifier: {
                tagName: identifier.tagName,
                ariaLabel: identifier.ariaLabel,
                textContentPreview: identifier.textContentPreview.slice(0, 30),
            },
        });
    }

    if (!captured && !identifier) {
        Log.info('[NavigationFocusManager] No stored focus for route', false, {routeKey});
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
    routeFocusMap.delete(routeKey);
    routeElementIdentifierMap.delete(routeKey);
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
 *
 * This leverages the menuitem protection logic: when a user clicks a menuitem
 * (like "Delete workspace"), the original anchor (like "More" button) is preserved.
 * This method returns that preserved anchor for focus restoration.
 *
 * @returns The captured anchor element, or null if:
 *   - No element was captured
 *   - The captured element is no longer in DOM
 *   - The captured element IS a menuitem (not an anchor)
 */
function getCapturedAnchorElement(): HTMLElement | null {
    // Only available on web where document exists
    if (typeof document === 'undefined' || !lastInteractionCapture) {
        return null;
    }

    const element = lastInteractionCapture.element;

    // Verify element is still in DOM
    if (!document.body.contains(element)) {
        Log.info('[NavigationFocusManager] getCapturedAnchorElement: element no longer in DOM');
        return null;
    }

    // Only return non-menuitem elements (anchors like "More" button)
    // Menuitems are transient and shouldn't be returned
    if (element.closest('[role="menuitem"]')) {
        Log.info('[NavigationFocusManager] getCapturedAnchorElement: element is menuitem, returning null');
        return null;
    }

    Log.info('[NavigationFocusManager] getCapturedAnchorElement: returning anchor', false, {
        tagName: element.tagName,
        ariaLabel: element.getAttribute('aria-label'),
    });

    return element;
}

/**
 * Removes focus data for routes that are no longer in the navigation state.
 * Called from handleStateChange in NavigationRoot.tsx.
 *
 * This follows the same pattern as cleanPreservedNavigatorStates and
 * cleanStaleScrollOffsets - lifecycle tied to navigation state changes.
 */
function cleanupRemovedRoutes(state: State): void {
    const activeKeys = extractNavigationKeys(state.routes);

    for (const key of routeFocusMap.keys()) {
        if (!activeKeys.has(key)) {
            routeFocusMap.delete(key);
            Log.info('[NavigationFocusManager] Cleaned up focus data for removed route', false, {routeKey: key});
        }
    }

    for (const key of routeElementIdentifierMap.keys()) {
        if (!activeKeys.has(key)) {
            routeElementIdentifierMap.delete(key);
        }
    }
}

export default {
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
