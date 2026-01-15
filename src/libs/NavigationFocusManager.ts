/**
 * NavigationFocusManager handles focus capture and restoration during screen navigation.
 *
 * The Problem:
 * When navigating between screens, focus moves from the clicked element to body
 * BEFORE the new screen's FocusTrap can capture it. This happens because:
 * 1. User clicks element (focus moves to element)
 * 2. Click handler triggers navigation
 * 3. React processes state change
 * 4. Focus moves to body (during transition)
 * 5. New FocusTrap activates (too late - body is already focused)
 *
 * The Solution:
 * Capture the focused element during user interaction (pointerdown/keydown),
 * BEFORE any navigation or focus changes happen. This is the same pattern
 * used by ComposerFocusManager for modal focus restoration.
 *
 * API Design Note:
 * Focus restoration uses `initialFocus` (called on trap activation), NOT
 * `setReturnFocus` (called on trap deactivation). This is because we want
 * to restore focus when RETURNING to a screen, not when LEAVING it.
 */

type CapturedFocus = {
    element: HTMLElement;
    timestamp: number;
};

// Maximum time (ms) a captured element is considered valid for route storage
// Set to 1000ms to account for slower devices and heavy DOM operations
// (Live testing showed ~563ms between click and screen transition)
const CAPTURE_VALIDITY_MS = 1000;

// Maximum time (ms) to store a route's focus element before cleanup
const ROUTE_FOCUS_VALIDITY_MS = 60000; // 1 minute

// Module-level state (following ComposerFocusManager pattern)
let lastInteractionCapture: CapturedFocus | null = null;
const routeFocusMap = new Map<string, CapturedFocus>();
let isInitialized = false;

/**
 * Capture the element being interacted with.
 * This runs in capture phase, before any click handlers.
 */
function handleInteraction(event: PointerEvent): void {
    const targetElement = event.target as HTMLElement;

    if (targetElement && targetElement !== document.body && targetElement.tagName !== 'HTML') {
        // Selector excludes tabindex="-1" elements (non-focusable) to skip display-only
        // elements and capture the outer interactive container for focus restoration.
        const interactiveElement = targetElement.closest<HTMLElement>('button, a, [role="menuitem"], [role="button"], [tabindex]:not([tabindex="-1"])');
        const elementToCapture = interactiveElement ?? targetElement;

        lastInteractionCapture = {
            element: elementToCapture,
            timestamp: Date.now(),
        };
    }
}

/**
 * For keyboard navigation (Enter/Space key triggers navigation like a click)
 */
function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
        return;
    }

    const activeElement = document.activeElement as HTMLElement;

    if (activeElement && activeElement !== document.body && activeElement.tagName !== 'HTML') {
        lastInteractionCapture = {
            element: activeElement,
            timestamp: Date.now(),
        };
    }
}

/**
 * Remove entries older than ROUTE_FOCUS_VALIDITY_MS to prevent memory leaks.
 */
function cleanupOldEntries(): void {
    const now = Date.now();

    for (const [key, value] of routeFocusMap.entries()) {
        if (now - value.timestamp > ROUTE_FOCUS_VALIDITY_MS) {
            routeFocusMap.delete(key);
        }
    }
}

/**
 * Cleanup stale entries when tab becomes hidden to prevent memory buildup
 */
function handleVisibilityChange(): void {
    if (!document.hidden) {
        return;
    }
    cleanupOldEntries();
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
    document.addEventListener('visibilitychange', handleVisibilityChange);

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
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    isInitialized = false;
    routeFocusMap.clear();
    lastInteractionCapture = null;
}

/**
 * Called when a screen loses focus (isFocused becomes false).
 * Stores the most recently captured element for this route.
 *
 * @param routeKey - The route.key from React Navigation
 */
function captureForRoute(routeKey: string): void {
    const now = Date.now();
    let elementToStore: HTMLElement | null = null;

    // Try to use the element captured during user interaction if it's recent enough
    if (lastInteractionCapture && now - lastInteractionCapture.timestamp < CAPTURE_VALIDITY_MS) {
        const capturedElement = lastInteractionCapture.element;

        // Validate that the captured element is still in the DOM
        // This handles cases where the element was removed (e.g., popover menu item)
        if (document.body.contains(capturedElement)) {
            elementToStore = capturedElement;
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
        }
    }

    // Store the element if we found a valid one
    if (elementToStore) {
        routeFocusMap.set(routeKey, {
            element: elementToStore,
            timestamp: now,
        });
    }

    // Clear the interaction capture after use
    lastInteractionCapture = null;

    // Cleanup old entries to prevent memory leaks
    cleanupOldEntries();
}

/**
 * Called when a screen regains focus (via initialFocus callback).
 * Returns the stored element if it's still valid.
 *
 * @param routeKey - The route.key from React Navigation
 * @returns The element to focus, or null if none available
 */
function retrieveForRoute(routeKey: string): HTMLElement | null {
    const captured = routeFocusMap.get(routeKey);

    // Remove from map regardless (one-time use)
    routeFocusMap.delete(routeKey);

    if (!captured) {
        return null;
    }

    // Check if capture is still valid (not too old)
    if (Date.now() - captured.timestamp > ROUTE_FOCUS_VALIDITY_MS) {
        return null;
    }

    return captured.element;
}

/**
 * Clear the stored focus element for a specific route.
 * Useful when a route is being unmounted or reset.
 *
 * @param routeKey - The route.key from React Navigation
 */
function clearForRoute(routeKey: string): void {
    routeFocusMap.delete(routeKey);
}

/**
 * Check if there's a stored element for a route (without consuming it).
 * Useful for determining if focus restoration should be attempted.
 *
 * @param routeKey - The route.key from React Navigation
 * @returns true if there's a stored element for this route
 */
function hasStoredFocus(routeKey: string): boolean {
    return routeFocusMap.has(routeKey);
}

export default {
    initialize,
    destroy,
    captureForRoute,
    retrieveForRoute,
    clearForRoute,
    hasStoredFocus,
};
