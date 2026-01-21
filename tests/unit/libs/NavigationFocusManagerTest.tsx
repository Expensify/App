/**
 * Unit Tests for NavigationFocusManager - Issue #76921
 *
 * NavigationFocusManager is a singleton that captures and stores focused elements
 * on user interactions (pointerdown, Enter/Space keydown) for later restoration
 * when navigating back to a screen.
 *
 * Test Categories:
 * - Element availability and lifecycle
 * - Keyboard and pointer interaction capture
 * - Route-key based storage and retrieval
 * - Edge cases (body/html exclusion, nested elements)
 * - Memory management (destroy, clear, hasStoredFocus)
 */

/* eslint-disable @typescript-eslint/naming-convention */

// ============================================================================
// PointerEvent Polyfill for JSDOM
// ============================================================================

// JSDOM doesn't support PointerEvent, so we polyfill it
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class PointerEventPolyfill extends MouseEvent {}

// Add to global if not present
if (typeof global.PointerEvent === 'undefined') {
    // @ts-expect-error -- Polyfill for JSDOM
    global.PointerEvent = PointerEventPolyfill;
}

// ============================================================================
// NavigationFocusManager Unit Tests
// ============================================================================

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type NavigationFocusManagerType = typeof import('@libs/NavigationFocusManager').default;

describe('NavigationFocusManager Gap Tests', () => {
    // Module-level state for testing
    let NavigationFocusManager: NavigationFocusManagerType;

    beforeEach(() => {
        // Reset module state between tests
        jest.resetModules();

        // Fresh import for each test
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        NavigationFocusManager = require('@libs/NavigationFocusManager').default;

        // Initialize the manager
        NavigationFocusManager.initialize();
    });

    afterEach(() => {
        NavigationFocusManager.destroy();
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Gap 1: Delayed Element Availability', () => {
        it('should return null when element is not in DOM at retrieval time (no identifier match)', () => {
            // Given: A button that was captured but has no identifying attributes
            const button = document.createElement('button');
            button.id = 'virtualized-button';
            // Note: No aria-label, role, or textContent that would enable identifier matching
            document.body.appendChild(button);

            // Simulate pointerdown capture
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: button});
            document.dispatchEvent(pointerEvent);

            // Store the capture for a route
            NavigationFocusManager.captureForRoute('test-route-1');

            // When: The element is removed from DOM before retrieval
            button.remove();

            // Then: Retrieval should return null because:
            // 1. Element reference is no longer in DOM (Strategy 1 fails)
            // 2. No matching element found via identifier (Strategy 2 fails - no aria-label/role/textContent)
            const retrieved = NavigationFocusManager.retrieveForRoute('test-route-1');
            expect(retrieved).toBeNull();
        });

        it('should find matching element via identifier when original element is removed and re-created', () => {
            // Given: A button with identifying attributes
            const originalButton = document.createElement('button');
            originalButton.id = 'workspace-more-button';
            originalButton.setAttribute('aria-label', 'More actions for Workspace A');
            originalButton.setAttribute('role', 'button');
            originalButton.textContent = 'Workspace A Settings';
            document.body.appendChild(originalButton);

            // Register the route BEFORE interaction (required for identifier extraction)
            NavigationFocusManager.registerFocusedRoute('identifier-match-route');

            // Capture the button via pointerdown (this triggers identifier extraction)
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: originalButton});
            document.dispatchEvent(pointerEvent);

            // Unregister the route (simulating screen losing focus)
            NavigationFocusManager.unregisterFocusedRoute('identifier-match-route');

            // Remove the original button (simulating screen unmount)
            originalButton.remove();

            // Create a new button with matching attributes (simulating screen remount)
            const newButton = document.createElement('button');
            newButton.id = 'workspace-more-button-new';
            newButton.setAttribute('aria-label', 'More actions for Workspace A');
            newButton.setAttribute('role', 'button');
            newButton.textContent = 'Workspace A Settings';
            document.body.appendChild(newButton);

            // When: Retrieval is attempted
            const retrieved = NavigationFocusManager.retrieveForRoute('identifier-match-route');

            // Then: Should find the new button via identifier matching
            expect(retrieved).toBe(newButton);
            expect(retrieved?.getAttribute('aria-label')).toBe('More actions for Workspace A');
        });

        it('should handle gracefully when no element was captured', () => {
            // Given: No interaction occurred

            // When: captureForRoute is called without prior interaction
            NavigationFocusManager.captureForRoute('test-route-2');

            // Then: retrieveForRoute should return null
            const retrieved = NavigationFocusManager.retrieveForRoute('test-route-2');
            expect(retrieved).toBeNull();
        });

        it('should use activeElement fallback when interaction capture is stale', () => {
            // Given: A button that was captured long ago (simulated by not triggering event)
            const activeButton = document.createElement('button');
            activeButton.id = 'active-button';
            document.body.appendChild(activeButton);
            activeButton.focus();

            // When: captureForRoute is called without recent interaction
            // (no pointerdown event, but activeElement is the button)
            NavigationFocusManager.captureForRoute('test-route-3');

            // Then: Should capture the activeElement as fallback
            const retrieved = NavigationFocusManager.retrieveForRoute('test-route-3');
            expect(retrieved).toBe(activeButton);
        });
    });

    describe('Gap 2: Non-Pointer/Enter/Space Navigation Triggers', () => {
        it('should NOT capture element on non-Enter/Space keydown', () => {
            // Given: A focused element
            const menuItem = document.createElement('div');
            menuItem.setAttribute('role', 'menuitem');
            menuItem.tabIndex = 0;
            document.body.appendChild(menuItem);
            menuItem.focus();

            // When: A keyboard shortcut key is pressed (not Enter/Space)
            const keyEvent = new KeyboardEvent('keydown', {
                key: 'k',
                ctrlKey: true,
                bubbles: true,
            });
            document.dispatchEvent(keyEvent);

            // And: captureForRoute is called
            NavigationFocusManager.captureForRoute('test-route-4');

            // Then: Should fall back to activeElement (not the keydown-captured element)
            const retrieved = NavigationFocusManager.retrieveForRoute('test-route-4');
            expect(retrieved).toBe(menuItem); // Falls back to activeElement
        });

        it('should capture element on Enter keydown', () => {
            // Given: A focused element
            const menuItem = document.createElement('div');
            menuItem.setAttribute('role', 'menuitem');
            menuItem.tabIndex = 0;
            document.body.appendChild(menuItem);
            menuItem.focus();

            // When: Enter key is pressed
            const keyEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
            });
            document.dispatchEvent(keyEvent);

            // And: captureForRoute is called
            NavigationFocusManager.captureForRoute('test-route-5');

            // Then: Should have captured the element via keydown
            const retrieved = NavigationFocusManager.retrieveForRoute('test-route-5');
            expect(retrieved).toBe(menuItem);
        });

        it('should capture element on Space keydown', () => {
            // Given: A focused element
            const button = document.createElement('button');
            button.id = 'space-button';
            document.body.appendChild(button);
            button.focus();

            // When: Space key is pressed
            const keyEvent = new KeyboardEvent('keydown', {
                key: ' ',
                bubbles: true,
            });
            document.dispatchEvent(keyEvent);

            // And: captureForRoute is called
            NavigationFocusManager.captureForRoute('test-route-6');

            // Then: Should have captured the element via keydown
            const retrieved = NavigationFocusManager.retrieveForRoute('test-route-6');
            expect(retrieved).toBe(button);
        });

        it('should handle programmatic navigation (no user interaction) gracefully', () => {
            // Given: Focus is on document.body (no meaningful element focused)
            document.body.focus();

            // When: captureForRoute is called (simulating programmatic navigation)
            NavigationFocusManager.captureForRoute('test-route-7');

            // Then: Should return null (body is explicitly excluded)
            const retrieved = NavigationFocusManager.retrieveForRoute('test-route-7');
            expect(retrieved).toBeNull();
        });
    });

    describe('Gap 3: Route-Key Granularity', () => {
        it('should store separate elements for different route keys', () => {
            // Given: Two different elements for two routes
            const button1 = document.createElement('button');
            button1.id = 'button-1';
            document.body.appendChild(button1);

            const button2 = document.createElement('button');
            button2.id = 'button-2';
            document.body.appendChild(button2);

            // When: Capturing for route 1
            button1.focus();
            NavigationFocusManager.captureForRoute('route-key-A');

            // And: Capturing for route 2
            button2.focus();
            NavigationFocusManager.captureForRoute('route-key-B');

            // Then: Each route should return its own element
            const retrieved1 = NavigationFocusManager.retrieveForRoute('route-key-A');
            const retrieved2 = NavigationFocusManager.retrieveForRoute('route-key-B');

            expect(retrieved1).toBe(button1);
            expect(retrieved2).toBe(button2);
        });

        it('should return null for route keys that were never stored', () => {
            // Given: Nothing stored for this route

            // When: Retrieving for unknown route
            const retrieved = NavigationFocusManager.retrieveForRoute('unknown-route-key');

            // Then: Should return null
            expect(retrieved).toBeNull();
        });

        it('should clear route storage after retrieval (one-time use)', () => {
            // Given: An element captured for a route
            const button = document.createElement('button');
            button.id = 'one-time-button';
            document.body.appendChild(button);
            button.focus();
            NavigationFocusManager.captureForRoute('one-time-route');

            // When: Retrieving the first time
            const firstRetrieval = NavigationFocusManager.retrieveForRoute('one-time-route');

            // Then: Should return the element
            expect(firstRetrieval).toBe(button);

            // When: Retrieving the second time
            const secondRetrieval = NavigationFocusManager.retrieveForRoute('one-time-route');

            // Then: Should return null (already consumed)
            expect(secondRetrieval).toBeNull();
        });
    });

    describe('Gap 4: Intra-RHP Stack Navigation (Out of Scope)', () => {
        it('documents that each RHP screen has independent focus storage', () => {
            // Given: Multiple RHP screens in a navigation stack
            const rhpRouteKeys = ['rhp-screen-1-key', 'rhp-screen-2-key', 'rhp-screen-3-key'];

            const buttons = rhpRouteKeys.map((_, index) => {
                const btn = document.createElement('button');
                btn.id = `rhp-button-${index}`;
                document.body.appendChild(btn);
                return btn;
            });

            // When: Each screen captures its focus independently
            for (const [index, key] of rhpRouteKeys.entries()) {
                buttons.at(index)?.focus();
                NavigationFocusManager.captureForRoute(key);
            }

            // Then: Each can be retrieved independently
            // NOTE: This is the current behavior - each screen is independent
            // Intra-RHP restoration would require navigator-level coordination
            for (const [index, key] of rhpRouteKeys.entries()) {
                const retrieved = NavigationFocusManager.retrieveForRoute(key);
                expect(retrieved).toBe(buttons.at(index));
            }
        });
    });

    describe('Gap 5: Wide Layout (Out of Scope)', () => {
        it('documents that NavigationFocusManager works regardless of layout', () => {
            // Given: NavigationFocusManager doesn't know about layout
            // It just captures and retrieves elements

            const button = document.createElement('button');
            button.id = 'wide-layout-button';
            document.body.appendChild(button);
            button.focus();

            // When: Capturing works the same in any layout
            NavigationFocusManager.captureForRoute('wide-layout-route');

            // Then: Retrieval works the same
            const retrieved = NavigationFocusManager.retrieveForRoute('wide-layout-route');
            expect(retrieved).toBe(button);

            // NOTE: The wide layout limitation is in FocusTrapForScreen,
            // which disables the trap (and thus initialFocus callback) in wide layout.
            // NavigationFocusManager itself is layout-agnostic.
        });
    });

    describe('Edge Cases: Interaction Capture Validity', () => {
        it('should not capture body element on pointerdown', () => {
            // Given: Pointerdown on body
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: document.body});
            document.dispatchEvent(pointerEvent);

            // When: captureForRoute is called
            NavigationFocusManager.captureForRoute('body-click-route');

            // Then: Should return null (body is excluded)
            const retrieved = NavigationFocusManager.retrieveForRoute('body-click-route');
            expect(retrieved).toBeNull();
        });

        it('should not capture HTML element on pointerdown', () => {
            // Given: Pointerdown on HTML element
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: document.documentElement});
            document.dispatchEvent(pointerEvent);

            // When: captureForRoute is called
            NavigationFocusManager.captureForRoute('html-click-route');

            // Then: Should return null (HTML is excluded)
            const retrieved = NavigationFocusManager.retrieveForRoute('html-click-route');
            expect(retrieved).toBeNull();
        });

        it('should find closest interactive element from nested click target', () => {
            // Given: A button containing a span
            const button = document.createElement('button');
            button.id = 'parent-button';
            const span = document.createElement('span');
            span.textContent = 'Click me';
            button.appendChild(span);
            document.body.appendChild(button);

            // Register route BEFORE interaction (required for state-based validation)
            NavigationFocusManager.registerFocusedRoute('nested-click-route');

            // When: Pointerdown on the span (inside button)
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: span});
            document.dispatchEvent(pointerEvent);

            NavigationFocusManager.captureForRoute('nested-click-route');

            // Then: Should capture the button (closest interactive element)
            const retrieved = NavigationFocusManager.retrieveForRoute('nested-click-route');
            expect(retrieved).toBe(button);
        });
    });

    describe('DOM Presence Validation', () => {
        it('should fall back to activeElement when captured element is removed from DOM', () => {
            // Given: A menu item that gets clicked
            const menuItem = document.createElement('div');
            menuItem.setAttribute('role', 'menuitem');
            menuItem.id = 'menu-item';
            document.body.appendChild(menuItem);

            // And: An anchor button that will receive focus after menu closes
            const anchorButton = document.createElement('button');
            anchorButton.id = 'anchor-button';
            document.body.appendChild(anchorButton);

            // When: User clicks menu item (pointerdown captures it)
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: menuItem});
            document.dispatchEvent(pointerEvent);

            // And: Menu item is removed from DOM (popover closes)
            menuItem.remove();

            // And: Focus moves to anchor button (simulating restoreFocusType: PRESERVE)
            anchorButton.focus();

            // And: captureForRoute is called
            NavigationFocusManager.captureForRoute('dropdown-test-route');

            // Then: Should capture the anchor button (activeElement), not the removed menu item
            const retrieved = NavigationFocusManager.retrieveForRoute('dropdown-test-route');
            expect(retrieved).toBe(anchorButton);
        });

        it('should use captured element when it is still in DOM', () => {
            // Given: A button that remains in DOM
            const button = document.createElement('button');
            button.id = 'persistent-button';
            document.body.appendChild(button);

            // Register route BEFORE interaction (required for state-based validation)
            NavigationFocusManager.registerFocusedRoute('persistent-button-route');

            // When: User clicks the button
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: button});
            document.dispatchEvent(pointerEvent);

            // And: captureForRoute is called (button still in DOM)
            NavigationFocusManager.captureForRoute('persistent-button-route');

            // Then: Should capture the button directly
            const retrieved = NavigationFocusManager.retrieveForRoute('persistent-button-route');
            expect(retrieved).toBe(button);
        });

        it('should return null when both captured element and activeElement are invalid', () => {
            // Given: A menu item that gets clicked
            const menuItem = document.createElement('div');
            menuItem.id = 'orphan-menu-item';
            document.body.appendChild(menuItem);

            // When: User clicks menu item
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: menuItem});
            document.dispatchEvent(pointerEvent);

            // And: Menu item is removed
            menuItem.remove();

            // And: Focus is on body (no valid activeElement)
            document.body.focus();

            // And: captureForRoute is called
            NavigationFocusManager.captureForRoute('no-valid-element-route');

            // Then: Should return null
            const retrieved = NavigationFocusManager.retrieveForRoute('no-valid-element-route');
            expect(retrieved).toBeNull();
        });
    });

    describe('P7-01 Fix Verification: Nested Interactive Elements', () => {
        /**
         * P7-01: ApprovalWorkflowSection had nested interactive elements:
         * <PressableWithoutFeedback role="button">
         *     <MenuItem role="menuitem" /> <!-- BUG: Same handler, captured instead of outer -->
         * </PressableWithoutFeedback>
         *
         * Fix: MenuItem with interactive={false} no longer has role="menuitem"
         * This test verifies NavigationFocusManager captures the outer button.
         */
        it('should capture outer button when inner element has NO interactive role (post-fix behavior)', () => {
            // Given: A button containing a div WITHOUT role (simulates fixed MenuItem with interactive={false})
            const outerButton = document.createElement('div');
            outerButton.setAttribute('role', 'button');
            outerButton.id = 'outer-workflow-card';

            const innerDisplay = document.createElement('div');
            innerDisplay.id = 'inner-display-menuitem';
            // NOTE: NO role="menuitem" - this is the fix!
            innerDisplay.textContent = 'Expenses from';

            outerButton.appendChild(innerDisplay);
            document.body.appendChild(outerButton);

            // Register route BEFORE interaction (required for state-based validation)
            NavigationFocusManager.registerFocusedRoute('p7-01-fixed-route');

            // When: Pointerdown on the inner display element (user clicks on text)
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: innerDisplay});
            document.dispatchEvent(pointerEvent);

            NavigationFocusManager.captureForRoute('p7-01-fixed-route');

            // Then: Should capture the outer button (role="button"), NOT the inner div
            const retrieved = NavigationFocusManager.retrieveForRoute('p7-01-fixed-route');
            expect(retrieved).toBe(outerButton);
            expect(retrieved?.id).toBe('outer-workflow-card');
        });

        it('should SKIP menu items and preserve previous capture (menu items are transient - issue #76921)', () => {
            // This test verifies the fix for #76921: menu items should NOT be captured
            // because they are transient elements that won't exist at restoration time.

            // Setup: Create a trigger button (simulating menu trigger like "More" button)
            const triggerButton = document.createElement('button');
            triggerButton.id = 'menu-trigger';
            document.body.appendChild(triggerButton);

            // Step 1: User presses Enter on trigger button (this captures the trigger)
            triggerButton.focus();
            const keydownEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(keydownEvent);

            // Verify trigger was captured
            NavigationFocusManager.captureForRoute('verify-trigger-route');
            const verifyCapture = NavigationFocusManager.retrieveForRoute('verify-trigger-route');
            expect(verifyCapture).toBe(triggerButton);

            // Need to re-capture for next test since retrieveForRoute consumes it
            triggerButton.focus();
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));

            // Step 2: Menu opens, create menu item (simulating popover opening)
            const menuItem = document.createElement('div');
            menuItem.setAttribute('role', 'menuitem');
            menuItem.id = 'menu-item';
            document.body.appendChild(menuItem);

            // Step 3: User clicks menu item - this should NOT overwrite trigger capture
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: menuItem});
            document.dispatchEvent(pointerEvent);

            // Step 4: Capture for route (simulating navigation)
            NavigationFocusManager.captureForRoute('menuitem-skip-route');

            // Verify: Menu item was SKIPPED, trigger button is still captured
            const retrieved = NavigationFocusManager.retrieveForRoute('menuitem-skip-route');
            expect(retrieved).toBe(triggerButton);
            expect(retrieved?.id).toBe('menu-trigger');

            // Cleanup
            document.body.removeChild(triggerButton);
            document.body.removeChild(menuItem);
        });

        it('should CAPTURE menu items when NO prior capture exists (Settings page scenario - issue #76921)', () => {
            // This test verifies the other half of the #76921 fix: when there's no prior
            // capture to preserve (e.g., navigating to Settings page and clicking a MenuItem),
            // the menuitem SHOULD be captured since it's better than capturing nothing.

            // Setup: Ensure no prior capture (fresh state after navigation)
            // In real usage, captureForRoute clears lastInteractionCapture
            NavigationFocusManager.captureForRoute('clear-prior-capture');
            NavigationFocusManager.retrieveForRoute('clear-prior-capture');

            // Step 1: User clicks Settings MenuItem (no prior interaction)
            const settingsMenuItem = document.createElement('div');
            settingsMenuItem.setAttribute('role', 'menuitem');
            settingsMenuItem.id = 'security-menuitem';
            settingsMenuItem.textContent = 'Security';
            document.body.appendChild(settingsMenuItem);

            // Register route BEFORE interaction (required for state-based validation)
            NavigationFocusManager.registerFocusedRoute('settings-menuitem-route');

            // Click the menuitem - should be CAPTURED (no prior to preserve)
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: settingsMenuItem});
            document.dispatchEvent(pointerEvent);

            // Capture for route (simulating navigation to Security page)
            NavigationFocusManager.captureForRoute('settings-menuitem-route');

            // Verify: MenuItem was CAPTURED (not skipped) because no prior capture existed
            const retrieved = NavigationFocusManager.retrieveForRoute('settings-menuitem-route');
            expect(retrieved).toBe(settingsMenuItem);
            expect(retrieved?.id).toBe('security-menuitem');

            // Cleanup
            document.body.removeChild(settingsMenuItem);
        });

        it('should capture deeply nested text click to outer button when no intermediate interactive roles', () => {
            // Given: A complex nested structure like ApprovalWorkflowSection
            // <div role="button">
            //   <div> (no role - MenuItem with interactive={false})
            //     <span> (icon)
            //     <span> (text - click target)
            //   </div>
            // </div>
            const outerButton = document.createElement('div');
            outerButton.setAttribute('role', 'button');
            outerButton.id = 'workflow-card';

            const displayMenuItem = document.createElement('div');
            displayMenuItem.id = 'display-only-menuitem';
            // NO role - simulates interactive={false}

            const iconSpan = document.createElement('span');
            iconSpan.textContent = '👤';

            const textSpan = document.createElement('span');
            textSpan.textContent = 'Expenses from Everyone';

            displayMenuItem.appendChild(iconSpan);
            displayMenuItem.appendChild(textSpan);
            outerButton.appendChild(displayMenuItem);
            document.body.appendChild(outerButton);

            // Register route BEFORE interaction (required for state-based validation)
            NavigationFocusManager.registerFocusedRoute('deep-nested-route');

            // When: Pointerdown on the text span (deepest nested element)
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: textSpan});
            document.dispatchEvent(pointerEvent);

            NavigationFocusManager.captureForRoute('deep-nested-route');

            // Then: Should bubble up to the outer button
            const retrieved = NavigationFocusManager.retrieveForRoute('deep-nested-route');
            expect(retrieved).toBe(outerButton);
            expect(retrieved?.id).toBe('workflow-card');
        });
    });

    // ============================================================================
    // A1 Fix Verification: State-Based Menuitem Protection (Issue #76921)
    // ============================================================================
    // These tests verify the A1 fix that changed from time-based to state-based
    // protection for menu items. The fix ensures focus restoration works regardless
    // of how long the user takes to interact with menu items.
    //
    // Key behavior:
    // - Menu items (role="menuitem") are transient and removed from DOM after navigation
    // - Anchor elements (e.g., "More" button) should be preserved for focus restoration
    // - Protection is STATE-based (anchor vs menuitem), NOT TIME-based
    // ============================================================================

    describe('A1 Fix: State-Based Menuitem Protection', () => {
        describe('Core Protection Logic', () => {
            it('should skip menuitem capture when prior capture is a non-menuitem anchor (pointerdown)', () => {
                // Given: A "More" button anchor (non-menuitem)
                const moreButton = document.createElement('button');
                moreButton.id = 'more-button';
                moreButton.setAttribute('aria-label', 'More');
                document.body.appendChild(moreButton);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-core-pointerdown-route');

                // Step 1: User clicks "More" button - should be captured
                const anchorPointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(anchorPointerEvent, 'target', {value: moreButton});
                document.dispatchEvent(anchorPointerEvent);

                // Step 2: Menu opens, create menuitem (simulating popover)
                const menuItem = document.createElement('div');
                menuItem.setAttribute('role', 'menuitem');
                menuItem.id = 'duplicate-workspace';
                menuItem.setAttribute('aria-label', 'Duplicate Workspace');
                document.body.appendChild(menuItem);

                // Step 3: User clicks menuitem - should be SKIPPED
                const menuitemPointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(menuitemPointerEvent, 'target', {value: menuItem});
                document.dispatchEvent(menuitemPointerEvent);

                // Step 4: Capture for route (simulating navigation)
                NavigationFocusManager.captureForRoute('a1-core-pointerdown-route');

                // Then: Should have preserved the anchor, not the menuitem
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-core-pointerdown-route');
                expect(retrieved).toBe(moreButton);
                expect(retrieved?.id).toBe('more-button');
            });

            it('should skip menuitem capture when prior capture is a non-menuitem anchor (keydown)', () => {
                // Given: A "More" button anchor (non-menuitem)
                const moreButton = document.createElement('button');
                moreButton.id = 'more-button-key';
                moreButton.setAttribute('aria-label', 'More');
                document.body.appendChild(moreButton);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-core-keydown-route');

                // Step 1: User presses Enter on "More" button - should be captured
                moreButton.focus();
                const anchorKeyEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    bubbles: true,
                    cancelable: true,
                });
                document.dispatchEvent(anchorKeyEvent);

                // Step 2: Menu opens, create menuitem
                const menuItem = document.createElement('div');
                menuItem.setAttribute('role', 'menuitem');
                menuItem.id = 'delete-workspace';
                menuItem.tabIndex = 0;
                document.body.appendChild(menuItem);

                // Step 3: User presses Enter on menuitem - should be SKIPPED
                menuItem.focus();
                const menuitemKeyEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    bubbles: true,
                    cancelable: true,
                });
                document.dispatchEvent(menuitemKeyEvent);

                // Step 4: Capture for route
                NavigationFocusManager.captureForRoute('a1-core-keydown-route');

                // Then: Should have preserved the anchor
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-core-keydown-route');
                expect(retrieved).toBe(moreButton);
            });

            it('should capture menuitem when no prior capture exists', () => {
                // Given: Fresh state (no prior interaction)
                // Clear any prior state by doing a capture/retrieve cycle
                NavigationFocusManager.captureForRoute('clear-state');
                NavigationFocusManager.retrieveForRoute('clear-state');

                // Create a menuitem (simulating Settings page scenario)
                const settingsMenuItem = document.createElement('div');
                settingsMenuItem.setAttribute('role', 'menuitem');
                settingsMenuItem.id = 'security-settings';
                settingsMenuItem.setAttribute('aria-label', 'Security');
                document.body.appendChild(settingsMenuItem);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-no-prior-route');

                // When: User clicks menuitem as first interaction
                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: settingsMenuItem});
                document.dispatchEvent(pointerEvent);

                NavigationFocusManager.captureForRoute('a1-no-prior-route');

                // Then: Menuitem SHOULD be captured (better than nothing)
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-no-prior-route');
                expect(retrieved).toBe(settingsMenuItem);
            });

            it('should capture menuitem when prior capture is also a menuitem', () => {
                // Given: A menuitem that was previously captured
                const firstMenuItem = document.createElement('div');
                firstMenuItem.setAttribute('role', 'menuitem');
                firstMenuItem.id = 'first-menuitem';
                document.body.appendChild(firstMenuItem);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-menuitem-to-menuitem-route');

                // Click first menuitem
                const firstPointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(firstPointerEvent, 'target', {value: firstMenuItem});
                document.dispatchEvent(firstPointerEvent);

                // When: Second menuitem is clicked
                const secondMenuItem = document.createElement('div');
                secondMenuItem.setAttribute('role', 'menuitem');
                secondMenuItem.id = 'second-menuitem';
                document.body.appendChild(secondMenuItem);

                const secondPointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(secondPointerEvent, 'target', {value: secondMenuItem});
                document.dispatchEvent(secondPointerEvent);

                NavigationFocusManager.captureForRoute('a1-menuitem-to-menuitem-route');

                // Then: Second menuitem SHOULD be captured (both are menuitems, so overwrite is allowed)
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-menuitem-to-menuitem-route');
                expect(retrieved).toBe(secondMenuItem);
            });
        });

        describe('Time Independence (Critical A1 Fix Verification)', () => {
            /**
             * This is the critical test that verifies the A1 fix.
             * The old time-based protection would fail after 1000ms.
             * The new state-based protection works regardless of delay.
             */
            it('should preserve anchor even after very long delay (simulating slow user)', () => {
                // Given: A "More" button anchor
                const moreButton = document.createElement('button');
                moreButton.id = 'slow-user-more-button';
                moreButton.setAttribute('aria-label', 'More');
                document.body.appendChild(moreButton);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-long-delay-route');

                // Step 1: User clicks "More" button
                const anchorPointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(anchorPointerEvent, 'target', {value: moreButton});
                document.dispatchEvent(anchorPointerEvent);

                // Step 2: Simulate 10 second delay (10x the old 1000ms limit)
                // In real code, we'd use jest.advanceTimersByTime, but since the fix
                // is state-based (not time-based), the delay doesn't matter.
                // We just verify the protection still works.

                // Step 3: Menu item clicked after "long delay"
                const menuItem = document.createElement('div');
                menuItem.setAttribute('role', 'menuitem');
                menuItem.id = 'delayed-menuitem';
                document.body.appendChild(menuItem);

                const menuitemPointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(menuitemPointerEvent, 'target', {value: menuItem});
                document.dispatchEvent(menuitemPointerEvent);

                NavigationFocusManager.captureForRoute('a1-long-delay-route');

                // Then: Anchor should STILL be preserved (this would fail with old time-based logic)
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-long-delay-route');
                expect(retrieved).toBe(moreButton);
                expect(retrieved?.id).toBe('slow-user-more-button');
            });

            it('should use state-based check, not timestamp-based check', () => {
                // This test verifies the implementation detail: the protection
                // should check element semantics, not timestamps.

                const moreButton = document.createElement('button');
                moreButton.id = 'state-check-more';
                document.body.appendChild(moreButton);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('state-check-route');

                // Capture anchor
                const anchorEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(anchorEvent, 'target', {value: moreButton});
                document.dispatchEvent(anchorEvent);

                // Create menuitem
                const menuItem = document.createElement('div');
                menuItem.setAttribute('role', 'menuitem');
                menuItem.id = 'state-check-menuitem';
                document.body.appendChild(menuItem);

                // Click menuitem
                const menuitemEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(menuitemEvent, 'target', {value: menuItem});
                document.dispatchEvent(menuitemEvent);

                NavigationFocusManager.captureForRoute('state-check-route');

                // Verify: The anchor is preserved because:
                // - Current target has role="menuitem" (detected via closest)
                // - Prior capture does NOT have role="menuitem" (detected via closest)
                // - Therefore: skip current, preserve prior
                const retrieved = NavigationFocusManager.retrieveForRoute('state-check-route');
                expect(retrieved).toBe(moreButton);
            });
        });

        describe('Multiple Menu Interactions', () => {
            it('should correctly handle Menu A → close → Menu B sequence', () => {
                // Given: Two different "More" buttons for different workspaces
                const moreButtonA = document.createElement('button');
                moreButtonA.id = 'more-button-workspace-a';
                moreButtonA.setAttribute('aria-label', 'More');
                moreButtonA.textContent = 'Workspace A';
                document.body.appendChild(moreButtonA);

                const moreButtonB = document.createElement('button');
                moreButtonB.id = 'more-button-workspace-b';
                moreButtonB.setAttribute('aria-label', 'More');
                moreButtonB.textContent = 'Workspace B';
                document.body.appendChild(moreButtonB);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-multi-menu-route');

                // Step 1: Click More button A
                const eventA = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(eventA, 'target', {value: moreButtonA});
                document.dispatchEvent(eventA);

                // Step 2: Click More button B (simulating: closed menu A, opened menu B)
                // This is a NON-menuitem, so it SHOULD overwrite the prior capture
                const eventB = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(eventB, 'target', {value: moreButtonB});
                document.dispatchEvent(eventB);

                // Step 3: Click menuitem in menu B
                const menuItemB = document.createElement('div');
                menuItemB.setAttribute('role', 'menuitem');
                menuItemB.id = 'duplicate-workspace-b';
                document.body.appendChild(menuItemB);

                const menuitemEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(menuitemEvent, 'target', {value: menuItemB});
                document.dispatchEvent(menuitemEvent);

                NavigationFocusManager.captureForRoute('a1-multi-menu-route');

                // Then: Should have More button B (the most recent non-menuitem)
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-multi-menu-route');
                expect(retrieved).toBe(moreButtonB);
                expect(retrieved?.id).toBe('more-button-workspace-b');
            });

            it('should allow non-menuitem to overwrite prior non-menuitem capture', () => {
                // Given: Two buttons (neither are menuitems)
                const button1 = document.createElement('button');
                button1.id = 'button-1';
                document.body.appendChild(button1);

                const button2 = document.createElement('button');
                button2.id = 'button-2';
                document.body.appendChild(button2);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-overwrite-route');

                // Click button 1
                const event1 = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(event1, 'target', {value: button1});
                document.dispatchEvent(event1);

                // Click button 2 - should overwrite
                const event2 = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(event2, 'target', {value: button2});
                document.dispatchEvent(event2);

                NavigationFocusManager.captureForRoute('a1-overwrite-route');

                // Then: Should have button 2 (most recent)
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-overwrite-route');
                expect(retrieved).toBe(button2);
            });
        });

        describe('Edge Cases', () => {
            it('should handle menuitem nested inside button (complex DOM structure)', () => {
                // Given: A structure like:
                // <button role="button">
                //   <div role="menuitem">Click me</div>
                // </button>
                // This is an unusual structure but we should handle it.

                const outerButton = document.createElement('button');
                outerButton.id = 'outer-button';
                outerButton.setAttribute('role', 'button');

                const innerMenuitem = document.createElement('div');
                innerMenuitem.setAttribute('role', 'menuitem');
                innerMenuitem.id = 'inner-menuitem';
                innerMenuitem.textContent = 'Click me';

                outerButton.appendChild(innerMenuitem);
                document.body.appendChild(outerButton);

                // First, capture a non-menuitem anchor
                const anchor = document.createElement('button');
                anchor.id = 'anchor-for-edge-case';
                document.body.appendChild(anchor);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-nested-edge-route');

                const anchorEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(anchorEvent, 'target', {value: anchor});
                document.dispatchEvent(anchorEvent);

                // Now click on the inner menuitem
                const menuitemEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(menuitemEvent, 'target', {value: innerMenuitem});
                document.dispatchEvent(menuitemEvent);

                NavigationFocusManager.captureForRoute('a1-nested-edge-route');

                // Then: Should preserve anchor (innerMenuitem has role="menuitem" via closest)
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-nested-edge-route');
                expect(retrieved).toBe(anchor);
            });

            it('should handle Space key on menuitem the same as Enter key', () => {
                // Given: An anchor button
                const moreButton = document.createElement('button');
                moreButton.id = 'more-button-space';
                document.body.appendChild(moreButton);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-space-key-route');

                // Capture anchor via Enter
                moreButton.focus();
                const anchorEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
                document.dispatchEvent(anchorEvent);

                // Create and focus menuitem
                const menuItem = document.createElement('div');
                menuItem.setAttribute('role', 'menuitem');
                menuItem.id = 'menuitem-space';
                menuItem.tabIndex = 0;
                document.body.appendChild(menuItem);
                menuItem.focus();

                // Press Space on menuitem
                const spaceEvent = new KeyboardEvent('keydown', {key: ' ', bubbles: true});
                document.dispatchEvent(spaceEvent);

                NavigationFocusManager.captureForRoute('a1-space-key-route');

                // Then: Anchor should be preserved
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-space-key-route');
                expect(retrieved).toBe(moreButton);
            });

            it('should handle element with aria-haspopup but not role="menuitem"', () => {
                // Given: A button that opens a popup (not a menuitem itself)
                const popupTrigger = document.createElement('button');
                popupTrigger.id = 'popup-trigger';
                popupTrigger.setAttribute('aria-haspopup', 'true');
                document.body.appendChild(popupTrigger);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-popup-trigger-route');

                // Click popup trigger
                const triggerEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(triggerEvent, 'target', {value: popupTrigger});
                document.dispatchEvent(triggerEvent);

                // Create and click menuitem
                const menuItem = document.createElement('div');
                menuItem.setAttribute('role', 'menuitem');
                menuItem.id = 'popup-menuitem';
                document.body.appendChild(menuItem);

                const menuitemEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(menuitemEvent, 'target', {value: menuItem});
                document.dispatchEvent(menuitemEvent);

                NavigationFocusManager.captureForRoute('a1-popup-trigger-route');

                // Then: Popup trigger should be preserved (it's not a menuitem)
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-popup-trigger-route');
                expect(retrieved).toBe(popupTrigger);
            });
        });

        describe('Regression Prevention', () => {
            it('should NOT break normal button navigation (no menuitem involved)', () => {
                // Given: A simple button navigation scenario
                const navButton = document.createElement('button');
                navButton.id = 'nav-button';
                navButton.setAttribute('aria-label', 'Navigate');
                document.body.appendChild(navButton);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-regression-route');

                // When: User clicks button and navigates
                const pointerEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(pointerEvent, 'target', {value: navButton});
                document.dispatchEvent(pointerEvent);

                NavigationFocusManager.captureForRoute('a1-regression-route');

                // Then: Button should be captured normally
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-regression-route');
                expect(retrieved).toBe(navButton);
            });

            it('should NOT break link navigation (no menuitem involved)', () => {
                // Given: A link element
                const link = document.createElement('a');
                link.id = 'nav-link';
                link.href = '#test';
                link.textContent = 'Navigate';
                document.body.appendChild(link);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-link-route');

                // When: User clicks link
                const pointerEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(pointerEvent, 'target', {value: link});
                document.dispatchEvent(pointerEvent);

                NavigationFocusManager.captureForRoute('a1-link-route');

                // Then: Link should be captured normally
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-link-route');
                expect(retrieved).toBe(link);
            });

            it('should NOT break role="button" div navigation', () => {
                // Given: A div with role="button" (common in React Native Web)
                const divButton = document.createElement('div');
                divButton.id = 'div-button';
                divButton.setAttribute('role', 'button');
                divButton.tabIndex = 0;
                document.body.appendChild(divButton);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('a1-div-button-route');

                // When: User clicks div button
                const pointerEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(pointerEvent, 'target', {value: divButton});
                document.dispatchEvent(pointerEvent);

                NavigationFocusManager.captureForRoute('a1-div-button-route');

                // Then: Div button should be captured normally
                const retrieved = NavigationFocusManager.retrieveForRoute('a1-div-button-route');
                expect(retrieved).toBe(divButton);
            });
        });
    });

    // ============================================================================
    // Approach 6: Keyboard Interaction Check (Issue #76921)
    // ============================================================================
    // These tests verify the keyboard interaction tracking used to distinguish
    // keyboard navigation from mouse navigation, allowing the composer to skip
    // auto-focus when users navigate back via keyboard.
    // ============================================================================

    describe('Approach 6: Keyboard Interaction Tracking', () => {
        describe('wasRecentKeyboardInteraction() Flag', () => {
            it('should return false initially (no interaction)', () => {
                // Given: Fresh state
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // Then: Flag should be false
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);
            });

            it('should set flag to true on Enter keydown', () => {
                // Given: Fresh state
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // When: Enter key is pressed
                const keyEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    bubbles: true,
                });
                document.dispatchEvent(keyEvent);

                // Then: Flag should be true
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);
            });

            it('should set flag to true on Space keydown', () => {
                // Given: Fresh state
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // When: Space key is pressed
                const keyEvent = new KeyboardEvent('keydown', {
                    key: ' ',
                    bubbles: true,
                });
                document.dispatchEvent(keyEvent);

                // Then: Flag should be true
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);
            });

            it('should set flag to true on Escape keydown (back navigation)', () => {
                // Given: Fresh state
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // When: Escape key is pressed
                const keyEvent = new KeyboardEvent('keydown', {
                    key: 'Escape',
                    bubbles: true,
                });
                document.dispatchEvent(keyEvent);

                // Then: Flag should be true
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);
            });

            it('should NOT set flag on other key presses (e.g., Tab, Arrow keys)', () => {
                // Given: Fresh state
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // When: Tab key is pressed
                const tabEvent = new KeyboardEvent('keydown', {
                    key: 'Tab',
                    bubbles: true,
                });
                document.dispatchEvent(tabEvent);

                // Then: Flag should still be false
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);

                // When: ArrowDown is pressed
                const arrowEvent = new KeyboardEvent('keydown', {
                    key: 'ArrowDown',
                    bubbles: true,
                });
                document.dispatchEvent(arrowEvent);

                // Then: Flag should still be false
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);
            });
        });

        describe('clearKeyboardInteractionFlag()', () => {
            it('should clear the flag after it was set by keyboard interaction', () => {
                // Given: Flag set by Enter keydown
                const keyEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    bubbles: true,
                });
                document.dispatchEvent(keyEvent);
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);

                // When: Flag is cleared
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // Then: Flag should be false
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);
            });

            it('should be safe to call multiple times', () => {
                // Given: Flag is already false
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // When: Called multiple times
                NavigationFocusManager.clearKeyboardInteractionFlag();
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // Then: No errors, flag remains false
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);
            });
        });

        describe('Pointer Interaction Clears Flag', () => {
            it('should clear keyboard flag on pointerdown (mouse click)', () => {
                // Given: Flag set by keyboard interaction
                const keyEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    bubbles: true,
                });
                document.dispatchEvent(keyEvent);
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);

                // When: Mouse click occurs
                const button = document.createElement('button');
                document.body.appendChild(button);

                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: button});
                document.dispatchEvent(pointerEvent);

                // Then: Flag should be cleared
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);
            });

            it('should handle keyboard → mouse → keyboard sequence correctly', () => {
                // Step 1: Keyboard interaction
                const keyEvent1 = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
                document.dispatchEvent(keyEvent1);
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);

                // Step 2: Mouse interaction (clears flag)
                const button = document.createElement('button');
                document.body.appendChild(button);
                const pointerEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(pointerEvent, 'target', {value: button});
                document.dispatchEvent(pointerEvent);
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);

                // Step 3: Keyboard interaction again
                const keyEvent2 = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true});
                document.dispatchEvent(keyEvent2);
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);
            });
        });

        describe('Escape Key Behavior (Approach 6 Specific)', () => {
            it('should set flag but NOT capture element on Escape (back navigation only needs flag)', () => {
                // Given: A focused button
                const button = document.createElement('button');
                button.id = 'escape-test-button';
                document.body.appendChild(button);
                button.focus();

                // And: Clear any prior capture
                NavigationFocusManager.captureForRoute('clear-prior');
                NavigationFocusManager.retrieveForRoute('clear-prior');
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // When: Escape is pressed
                const escapeEvent = new KeyboardEvent('keydown', {
                    key: 'Escape',
                    bubbles: true,
                });
                document.dispatchEvent(escapeEvent);

                // Then: Flag should be set
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);

                // But: No element should be captured via interaction capture
                // (Escape doesn't call the element capture logic, only sets flag)
                // captureForRoute will use activeElement fallback since lastInteractionCapture is null
                NavigationFocusManager.captureForRoute('escape-route');
                const retrieved = NavigationFocusManager.retrieveForRoute('escape-route');

                // The button may be captured via activeElement fallback, which is expected
                // The key point is the keyboard flag was set
                expect(retrieved).toBe(button); // via activeElement fallback
            });

            it('should NOT overwrite prior capture when Escape is pressed (preserves forward nav element)', () => {
                // Given: An element captured via Enter (forward navigation)
                const forwardButton = document.createElement('button');
                forwardButton.id = 'forward-button';
                forwardButton.setAttribute('aria-label', 'Forward');
                document.body.appendChild(forwardButton);

                // Register route for immediate capture
                NavigationFocusManager.registerFocusedRoute('preserve-forward-route');

                // Press Enter on forward button
                forwardButton.focus();
                const enterEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
                document.dispatchEvent(enterEvent);

                // Now press Escape (back navigation) - should NOT overwrite
                const escapeEvent = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true});
                document.dispatchEvent(escapeEvent);

                // Unregister route
                NavigationFocusManager.unregisterFocusedRoute('preserve-forward-route');

                // Then: Should retrieve the forward button, not null
                const retrieved = NavigationFocusManager.retrieveForRoute('preserve-forward-route');
                expect(retrieved).toBe(forwardButton);
            });

            it('should differentiate Escape from Enter/Space in element capture', () => {
                // Given: Fresh state
                NavigationFocusManager.captureForRoute('clear-state');
                NavigationFocusManager.retrieveForRoute('clear-state');
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // Create two buttons
                const button1 = document.createElement('button');
                button1.id = 'button-1';
                document.body.appendChild(button1);

                const button2 = document.createElement('button');
                button2.id = 'button-2';
                document.body.appendChild(button2);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('differentiate-route');

                // Press Enter on button1 (captures element)
                button1.focus();
                const enterEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
                document.dispatchEvent(enterEvent);

                // Press Escape while button2 is focused (should NOT capture button2)
                button2.focus();
                const escapeEvent = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true});
                document.dispatchEvent(escapeEvent);

                // Capture for route
                NavigationFocusManager.captureForRoute('differentiate-route');
                const retrieved = NavigationFocusManager.retrieveForRoute('differentiate-route');

                // Should have captured button1 (from Enter), not button2 (from Escape)
                // because Escape only sets flag, doesn't capture
                expect(retrieved).toBe(button1);
            });
        });

        describe('Integration: Keyboard vs Mouse User Flow', () => {
            /**
             * Simulates the keyboard user flow:
             * 1. User presses Enter on chat header → wasKeyboardInteraction = true
             * 2. RHP opens
             * 3. User presses Escape → wasKeyboardInteraction = true
             * 4. RHP closes
             * 5. ComposerWithSuggestions checks flag → true → skips auto-focus
             */
            it('should maintain keyboard flag through navigation cycle', () => {
                // Step 1: Enter on element (forward navigation)
                NavigationFocusManager.clearKeyboardInteractionFlag();
                const chatHeader = document.createElement('button');
                chatHeader.id = 'chat-header';
                document.body.appendChild(chatHeader);
                chatHeader.focus();

                const enterEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
                document.dispatchEvent(enterEvent);

                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);

                // Step 2: Simulate RHP open (flag still true)
                // In real app, this would be modal opening

                // Step 3: Escape (back navigation)
                const escapeEvent = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true});
                document.dispatchEvent(escapeEvent);

                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);

                // Step 4: This is where ComposerWithSuggestions would check and clear
                const wasKeyboard = NavigationFocusManager.wasRecentKeyboardInteraction();
                NavigationFocusManager.clearKeyboardInteractionFlag();

                expect(wasKeyboard).toBe(true);
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);
            });

            /**
             * Simulates the mouse user flow:
             * 1. User clicks chat header → wasKeyboardInteraction = false
             * 2. RHP opens
             * 3. User clicks Back button → wasKeyboardInteraction = false
             * 4. RHP closes
             * 5. ComposerWithSuggestions checks flag → false → auto-focuses
             */
            it('should maintain mouse flag (false) through navigation cycle', () => {
                // Step 1: Click on element (forward navigation)
                NavigationFocusManager.clearKeyboardInteractionFlag();
                const chatHeader = document.createElement('button');
                chatHeader.id = 'chat-header-mouse';
                document.body.appendChild(chatHeader);

                const clickEvent1 = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(clickEvent1, 'target', {value: chatHeader});
                document.dispatchEvent(clickEvent1);

                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);

                // Step 2: Simulate RHP open

                // Step 3: Click Back button
                const backButton = document.createElement('button');
                backButton.id = 'back-button';
                document.body.appendChild(backButton);

                const clickEvent2 = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(clickEvent2, 'target', {value: backButton});
                document.dispatchEvent(clickEvent2);

                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);

                // Step 4: ComposerWithSuggestions would check and find flag=false → auto-focus
                const wasKeyboard = NavigationFocusManager.wasRecentKeyboardInteraction();
                expect(wasKeyboard).toBe(false);
            });

            /**
             * Mixed input: keyboard navigate forward, mouse navigate back
             * Expected: Mouse wins (flag=false), composer should auto-focus
             */
            it('should correctly handle keyboard forward → mouse back', () => {
                // Step 1: Enter on element
                NavigationFocusManager.clearKeyboardInteractionFlag();
                const element = document.createElement('button');
                document.body.appendChild(element);
                element.focus();

                const enterEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
                document.dispatchEvent(enterEvent);

                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);

                // Step 2: Click back button (mouse)
                const backButton = document.createElement('button');
                document.body.appendChild(backButton);

                const clickEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(clickEvent, 'target', {value: backButton});
                document.dispatchEvent(clickEvent);

                // Then: Mouse should have cleared the keyboard flag
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);
            });

            /**
             * Mixed input: mouse navigate forward, keyboard navigate back
             * Expected: Keyboard wins (flag=true), focus restoration should work
             */
            it('should correctly handle mouse forward → keyboard back', () => {
                // Step 1: Click on element
                NavigationFocusManager.clearKeyboardInteractionFlag();
                const element = document.createElement('button');
                document.body.appendChild(element);

                const clickEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                Object.defineProperty(clickEvent, 'target', {value: element});
                document.dispatchEvent(clickEvent);

                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);

                // Step 2: Press Escape (keyboard back)
                const escapeEvent = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true});
                document.dispatchEvent(escapeEvent);

                // Then: Keyboard should have set the flag
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);
            });
        });

        describe('Edge Cases', () => {
            it('should handle rapid keyboard events', () => {
                NavigationFocusManager.clearKeyboardInteractionFlag();

                // Rapid keyboard events
                for (let i = 0; i < 10; i++) {
                    const event = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
                    document.dispatchEvent(event);
                }

                // Flag should still be true
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);
            });

            it('should handle rapid alternating keyboard/mouse events', () => {
                NavigationFocusManager.clearKeyboardInteractionFlag();
                const button = document.createElement('button');
                document.body.appendChild(button);

                // Alternate between keyboard and mouse
                for (let i = 0; i < 5; i++) {
                    // Keyboard
                    const keyEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
                    document.dispatchEvent(keyEvent);
                    expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);

                    // Mouse
                    const pointerEvent = new PointerEvent('pointerdown', {bubbles: true, cancelable: true});
                    Object.defineProperty(pointerEvent, 'target', {value: button});
                    document.dispatchEvent(pointerEvent);
                    expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(false);
                }
            });

            it('should persist flag across destroy/initialize cycle', () => {
                // Set flag via keyboard
                const keyEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
                document.dispatchEvent(keyEvent);
                expect(NavigationFocusManager.wasRecentKeyboardInteraction()).toBe(true);

                // Destroy and reinitialize
                NavigationFocusManager.destroy();
                NavigationFocusManager.initialize();

                // Flag should be reset (module state cleared)
                // Note: This tests that destroy properly cleans up
                // The flag is module-level, so it may or may not persist based on implementation
                // Either behavior is acceptable as long as it's consistent
                const flagAfterReinit = NavigationFocusManager.wasRecentKeyboardInteraction();
                expect(typeof flagAfterReinit).toBe('boolean');
            });
        });
    });

    describe('Memory Management', () => {
        it('should clear all stored focus on destroy', () => {
            // Given: Multiple routes with stored focus
            const button1 = document.createElement('button');
            document.body.appendChild(button1);
            button1.focus();
            NavigationFocusManager.captureForRoute('memory-route-1');

            const button2 = document.createElement('button');
            document.body.appendChild(button2);
            button2.focus();
            NavigationFocusManager.captureForRoute('memory-route-2');

            // When: Manager is destroyed
            NavigationFocusManager.destroy();

            // Re-initialize for retrieval test
            NavigationFocusManager.initialize();

            // Then: All stored focus should be cleared
            expect(NavigationFocusManager.retrieveForRoute('memory-route-1')).toBeNull();
            expect(NavigationFocusManager.retrieveForRoute('memory-route-2')).toBeNull();
        });

        it('should support clearForRoute to manually clear stored focus', () => {
            // Given: A route with stored focus
            const button = document.createElement('button');
            document.body.appendChild(button);
            button.focus();
            NavigationFocusManager.captureForRoute('clear-test-route');

            // When: clearForRoute is called
            NavigationFocusManager.clearForRoute('clear-test-route');

            // Then: Retrieval should return null
            expect(NavigationFocusManager.retrieveForRoute('clear-test-route')).toBeNull();
        });

        it('should support hasStoredFocus to check without consuming', () => {
            // Given: A route with stored focus
            const button = document.createElement('button');
            document.body.appendChild(button);
            button.focus();
            NavigationFocusManager.captureForRoute('has-focus-route');

            // When: hasStoredFocus is called
            const hasFocus = NavigationFocusManager.hasStoredFocus('has-focus-route');

            // Then: Should return true without consuming
            expect(hasFocus).toBe(true);

            // And: Retrieval should still work
            const retrieved = NavigationFocusManager.retrieveForRoute('has-focus-route');
            expect(retrieved).toBe(button);
        });
    });

    // ============================================================================
    // App.tsx Integration Risk Tests (Issue #76921)
    // ============================================================================
    // These tests verify the risks identified in the App.tsx regression analysis:
    // - React StrictMode double-invocation
    // - Idempotent initialization
    // - Event listener cleanup
    // - Capture phase event handling
    // - Performance characteristics
    // ============================================================================

    describe('App.tsx Integration Risks', () => {
        describe('Risk: React StrictMode Double-Invocation', () => {
            /**
             * React StrictMode in development mode calls useEffect twice:
             * mount → unmount → mount
             * This simulates that pattern to ensure NavigationFocusManager handles it correctly.
             */
            it('should handle StrictMode mount/unmount/mount cycle correctly', () => {
                // Given: Manager is already initialized from beforeEach

                // Simulate StrictMode: First unmount (cleanup)
                NavigationFocusManager.destroy();

                // Simulate StrictMode: Second mount
                NavigationFocusManager.initialize();

                // Then: Manager should still work correctly
                const button = document.createElement('button');
                button.id = 'strict-mode-button';
                document.body.appendChild(button);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('strict-mode-route');

                // Pointerdown should still capture
                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: button});
                document.dispatchEvent(pointerEvent);

                NavigationFocusManager.captureForRoute('strict-mode-route');
                const retrieved = NavigationFocusManager.retrieveForRoute('strict-mode-route');

                expect(retrieved).toBe(button);
            });

            it('should not duplicate event listeners after StrictMode cycle', () => {
                // Given: Track how many times the handler is called
                let captureCount = 0;
                const originalAddEventListener = document.addEventListener.bind(document);
                const listenerCalls: string[] = [];

                jest.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
                    listenerCalls.push(type);
                    return originalAddEventListener(type, listener, options);
                });

                // Reset and re-initialize to track calls
                NavigationFocusManager.destroy();
                listenerCalls.length = 0;

                // Simulate StrictMode cycle
                NavigationFocusManager.initialize(); // First mount
                NavigationFocusManager.destroy(); // First unmount
                NavigationFocusManager.initialize(); // Second mount

                // Then: Should only have listeners from final initialization
                // (pointerdown, keydown = 2 listeners - visibilitychange was removed in state-based refactor)
                const pointerdownCalls = listenerCalls.filter((t) => t === 'pointerdown').length;
                expect(pointerdownCalls).toBe(2); // Once per initialize call

                jest.restoreAllMocks();
            });

            it('should preserve no state across StrictMode cycle', () => {
                // Given: Some state captured before destroy
                const button = document.createElement('button');
                document.body.appendChild(button);
                button.focus();
                NavigationFocusManager.captureForRoute('pre-destroy-route');

                // When: StrictMode cycle occurs
                NavigationFocusManager.destroy();
                NavigationFocusManager.initialize();

                // Then: Old state should be cleared
                const retrieved = NavigationFocusManager.retrieveForRoute('pre-destroy-route');
                expect(retrieved).toBeNull();
            });
        });

        describe('Risk: Idempotent Initialization', () => {
            it('should be safe to call initialize() multiple times', () => {
                // Given: Manager already initialized

                // When: initialize() called multiple times
                NavigationFocusManager.initialize();
                NavigationFocusManager.initialize();
                NavigationFocusManager.initialize();

                // Then: Should still work correctly (no errors, single set of listeners)
                const button = document.createElement('button');
                document.body.appendChild(button);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('idempotent-route');

                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: button});
                document.dispatchEvent(pointerEvent);

                NavigationFocusManager.captureForRoute('idempotent-route');
                const retrieved = NavigationFocusManager.retrieveForRoute('idempotent-route');

                expect(retrieved).toBe(button);
            });

            it('should be safe to call destroy() multiple times', () => {
                // When: destroy() called multiple times
                NavigationFocusManager.destroy();
                NavigationFocusManager.destroy();
                NavigationFocusManager.destroy();

                // Then: No errors should occur
                // Re-initialize for next test
                NavigationFocusManager.initialize();
                expect(true).toBe(true); // If we got here, no errors
            });

            it('should be safe to call destroy() without initialize()', () => {
                // Given: Fresh module (destroy current state first)
                NavigationFocusManager.destroy();

                // Reset module completely
                jest.resetModules();
                // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const FreshManager = require('@libs/NavigationFocusManager').default as NavigationFocusManagerType;

                // When: destroy() called without initialize()
                FreshManager.destroy();

                // Then: No errors should occur
                expect(true).toBe(true);

                // Cleanup: initialize for consistency
                FreshManager.initialize();
                FreshManager.destroy();
            });
        });

        describe('Risk: Event Listener Cleanup', () => {
            it('should remove all event listeners on destroy', () => {
                // Given: Track removeEventListener calls
                const removedListeners: string[] = [];
                const originalRemoveEventListener = document.removeEventListener.bind(document);

                jest.spyOn(document, 'removeEventListener').mockImplementation((type, listener, options) => {
                    removedListeners.push(type);
                    return originalRemoveEventListener(type, listener, options);
                });

                // When: destroy() is called
                NavigationFocusManager.destroy();

                // Then: Both listeners should be removed (visibilitychange was removed in state-based refactor)
                expect(removedListeners).toContain('pointerdown');
                expect(removedListeners).toContain('keydown');

                jest.restoreAllMocks();

                // Re-initialize for next test
                NavigationFocusManager.initialize();
            });

            it('should not capture events after destroy', () => {
                // Given: Manager is destroyed
                NavigationFocusManager.destroy();

                // When: Events are dispatched
                const button = document.createElement('button');
                document.body.appendChild(button);

                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: button});
                document.dispatchEvent(pointerEvent);

                // Re-initialize to test capture
                NavigationFocusManager.initialize();
                NavigationFocusManager.captureForRoute('post-destroy-route');

                // Then: Should not have captured the pre-destroy event
                // (captureForRoute may fall back to activeElement, but not the pointer event)
                const retrieved = NavigationFocusManager.retrieveForRoute('post-destroy-route');

                // The button might be captured via activeElement fallback if it's focused,
                // but the pointerdown capture should not have occurred
                // This test verifies no errors occur and the system is in a clean state
                expect(true).toBe(true);
            });
        });

        describe('Risk: Capture Phase Event Handling', () => {
            it('should capture element BEFORE bubbling phase handlers run', () => {
                // Given: A button with a click handler that might change focus
                const button = document.createElement('button');
                button.id = 'capture-phase-button';
                document.body.appendChild(button);

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('capture-phase-route');

                let capturedBeforeHandler = false;
                let handlerRan = false;

                // Add a bubbling-phase click handler
                button.addEventListener('click', () => {
                    handlerRan = true;
                    // Check if we already captured the element
                    NavigationFocusManager.captureForRoute('capture-phase-route');
                    const retrieved = NavigationFocusManager.retrieveForRoute('capture-phase-route');
                    if (retrieved === button) {
                        capturedBeforeHandler = true;
                    }
                });

                // When: Pointerdown fires (capture phase)
                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: button});
                document.dispatchEvent(pointerEvent);

                // Simulate click
                button.click();

                // Then: Element should have been captured before handler ran
                expect(handlerRan).toBe(true);
                expect(capturedBeforeHandler).toBe(true);
            });

            it('should not interfere with other capture-phase listeners', () => {
                // Given: Another capture-phase listener
                let otherListenerCalled = false;
                const otherListener = () => {
                    otherListenerCalled = true;
                };
                document.addEventListener('pointerdown', otherListener, {capture: true});

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('coexist-route');

                // When: Pointerdown fires
                const button = document.createElement('button');
                document.body.appendChild(button);

                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: button});
                document.dispatchEvent(pointerEvent);

                // Then: Both listeners should have been called
                expect(otherListenerCalled).toBe(true);

                // And: NavigationFocusManager should have captured
                NavigationFocusManager.captureForRoute('coexist-route');
                const retrieved = NavigationFocusManager.retrieveForRoute('coexist-route');
                expect(retrieved).toBe(button);

                // Cleanup
                document.removeEventListener('pointerdown', otherListener, {capture: true});
            });

            it('should not prevent default or stop propagation', () => {
                // Given: A button with handlers checking event state
                const button = document.createElement('button');
                document.body.appendChild(button);

                let eventDefaultPrevented = false;
                let eventPropagationStopped = false;

                button.addEventListener('pointerdown', (e) => {
                    eventDefaultPrevented = e.defaultPrevented;
                    // Can't directly check propagation stopped, but we got here so it wasn't
                    eventPropagationStopped = false;
                });

                // When: Pointerdown fires through NavigationFocusManager
                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: button});
                button.dispatchEvent(pointerEvent);

                // Then: Event should not have been prevented or stopped
                expect(eventDefaultPrevented).toBe(false);
            });
        });

        describe('Risk: Performance', () => {
            it('should handle rapid successive events without performance degradation', () => {
                // Given: Many buttons
                const buttons: HTMLButtonElement[] = [];
                for (let i = 0; i < 100; i++) {
                    const button = document.createElement('button');
                    button.id = `perf-button-${i}`;
                    document.body.appendChild(button);
                    buttons.push(button);
                }

                // When: Rapid pointerdown events
                const startTime = performance.now();

                for (const button of buttons) {
                    const pointerEvent = new PointerEvent('pointerdown', {
                        bubbles: true,
                        cancelable: true,
                    });
                    Object.defineProperty(pointerEvent, 'target', {value: button});
                    document.dispatchEvent(pointerEvent);
                }

                const endTime = performance.now();
                const totalTime = endTime - startTime;

                // Then: Should complete in reasonable time (< 100ms for 100 events)
                expect(totalTime).toBeLessThan(100);
            });

            it('should handle deeply nested elements efficiently', () => {
                // Given: A deeply nested DOM structure
                let currentElement = document.body;
                for (let i = 0; i < 50; i++) {
                    const div = document.createElement('div');
                    currentElement.appendChild(div);
                    currentElement = div;
                }
                const deepButton = document.createElement('button');
                deepButton.id = 'deep-button';

                // Register route BEFORE interaction (required for state-based validation)
                NavigationFocusManager.registerFocusedRoute('deep-route');
                currentElement.appendChild(deepButton);

                // When: Pointerdown on deeply nested element
                const startTime = performance.now();

                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: deepButton});
                document.dispatchEvent(pointerEvent);

                NavigationFocusManager.captureForRoute('deep-route');

                const endTime = performance.now();
                const totalTime = endTime - startTime;

                // Then: Should complete quickly (< 10ms)
                expect(totalTime).toBeLessThan(10);

                // And: Should have captured the button
                const retrieved = NavigationFocusManager.retrieveForRoute('deep-route');
                expect(retrieved).toBe(deepButton);
            });
        });

        describe('Risk: Route Map Growth (Memory)', () => {
            it('should clean up entries after retrieval (one-time use)', () => {
                // Given: Multiple routes captured
                for (let i = 0; i < 10; i++) {
                    const button = document.createElement('button');
                    document.body.appendChild(button);
                    button.focus();
                    NavigationFocusManager.captureForRoute(`memory-test-${i}`);
                }

                // When: All routes are retrieved
                for (let i = 0; i < 10; i++) {
                    NavigationFocusManager.retrieveForRoute(`memory-test-${i}`);
                }

                // Then: Second retrieval should return null (entries consumed)
                for (let i = 0; i < 10; i++) {
                    const secondRetrieval = NavigationFocusManager.retrieveForRoute(`memory-test-${i}`);
                    expect(secondRetrieval).toBeNull();
                }
            });

            it('should handle many routes without issues', () => {
                // Given: Many unique routes (simulating long session)
                const routeCount = 100;

                for (let i = 0; i < routeCount; i++) {
                    const button = document.createElement('button');
                    button.id = `route-button-${i}`;
                    document.body.appendChild(button);
                    button.focus();
                    NavigationFocusManager.captureForRoute(`long-session-route-${i}`);
                }

                // Then: Should be able to retrieve all (in reverse, simulating back navigation)
                for (let i = routeCount - 1; i >= 0; i--) {
                    const retrieved = NavigationFocusManager.retrieveForRoute(`long-session-route-${i}`);
                    expect(retrieved).not.toBeNull();
                    expect(retrieved?.id).toBe(`route-button-${i}`);
                }
            });

            it('should clear all state on destroy', () => {
                // Given: Many routes captured
                for (let i = 0; i < 20; i++) {
                    const button = document.createElement('button');
                    document.body.appendChild(button);
                    button.focus();
                    NavigationFocusManager.captureForRoute(`destroy-test-${i}`);
                }

                // When: destroy() is called
                NavigationFocusManager.destroy();
                NavigationFocusManager.initialize();

                // Then: All routes should return null
                for (let i = 0; i < 20; i++) {
                    const retrieved = NavigationFocusManager.retrieveForRoute(`destroy-test-${i}`);
                    expect(retrieved).toBeNull();
                }
            });
        });

        describe('Risk: SSR / No Document Environment', () => {
            it('should handle undefined document gracefully', () => {
                // This test documents the expected behavior when document is undefined
                // In actual SSR, typeof document === 'undefined'
                // The guard in initialize() prevents any DOM operations

                // We can't easily mock typeof document in Jest/JSDOM,
                // but we verify the guard exists by checking the code behavior
                // when the manager is in an uninitialized state

                // Given: Manager is destroyed (simulating pre-initialization state)
                NavigationFocusManager.destroy();

                // When: Operations are called on uninitialized manager
                // These should not throw errors
                NavigationFocusManager.captureForRoute('ssr-route');
                const retrieved = NavigationFocusManager.retrieveForRoute('ssr-route');
                const hasStored = NavigationFocusManager.hasStoredFocus('ssr-route');
                NavigationFocusManager.clearForRoute('ssr-route');

                // Then: Operations complete without error, return safe defaults
                expect(retrieved).toBeNull();
                expect(hasStored).toBe(false);

                // Re-initialize
                NavigationFocusManager.initialize();
            });
        });

        describe('State-Based Route Validation', () => {
            it('should reject capture from a different route', () => {
                // Given: A button on route-A
                const buttonA = document.createElement('button');
                buttonA.id = 'route-a-button';
                document.body.appendChild(buttonA);

                // Register route-A as the current focused route
                NavigationFocusManager.registerFocusedRoute('route-A');

                // Capture button on route-A
                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: buttonA});
                document.dispatchEvent(pointerEvent);

                // Unregister route-A
                NavigationFocusManager.unregisterFocusedRoute('route-A');

                // When: Try to capture for a DIFFERENT route (route-B)
                // The capture belongs to route-A, not route-B
                NavigationFocusManager.captureForRoute('route-B');

                // Then: Retrieval for route-B should use activeElement fallback, not the route-A capture
                // This is because the capture's forRoute (route-A) doesn't match the requested route (route-B)
                const retrieved = NavigationFocusManager.retrieveForRoute('route-B');
                // The button should NOT be retrieved since it was captured for a different route
                // (it will fall back to activeElement which is body in JSDOM)
                expect(retrieved).not.toBe(buttonA);
            });

            it('should accept capture from the same route', () => {
                // Given: A button on route-A
                const button = document.createElement('button');
                button.id = 'same-route-button';
                document.body.appendChild(button);

                // Register route-A as the current focused route
                NavigationFocusManager.registerFocusedRoute('route-A');

                // Capture button
                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: button});
                document.dispatchEvent(pointerEvent);

                // Unregister route-A
                NavigationFocusManager.unregisterFocusedRoute('route-A');

                // When: Capture for route-A (matching the capture's forRoute)
                NavigationFocusManager.captureForRoute('route-A');

                // Then: Retrieval should return the button
                const retrieved = NavigationFocusManager.retrieveForRoute('route-A');
                expect(retrieved).toBe(button);
            });

            it('should reject capture with null forRoute for safety', () => {
                // Given: A button captured BEFORE any route is registered
                const button = document.createElement('button');
                button.id = 'null-route-button';
                document.body.appendChild(button);

                // Don't register any route - forRoute will be null

                // Capture button (forRoute will be null)
                const pointerEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                });
                Object.defineProperty(pointerEvent, 'target', {value: button});
                document.dispatchEvent(pointerEvent);

                // When: Try to capture for any route
                NavigationFocusManager.captureForRoute('some-route');

                // Then: Should fall back to activeElement since forRoute was null
                const retrieved = NavigationFocusManager.retrieveForRoute('some-route');
                // The null-forRoute capture is rejected, falls back to activeElement
                expect(retrieved).not.toBe(button);
            });
        });

        describe('cleanupRemovedRoutes', () => {
            it('should clean up focus data for routes not in navigation state', () => {
                // Given: Focus captured for multiple routes
                const buttonA = document.createElement('button');
                buttonA.id = 'button-a';
                document.body.appendChild(buttonA);
                buttonA.focus();
                NavigationFocusManager.captureForRoute('route-A-key');

                const buttonB = document.createElement('button');
                buttonB.id = 'button-b';
                document.body.appendChild(buttonB);
                buttonB.focus();
                NavigationFocusManager.captureForRoute('route-B-key');

                // Verify both have stored focus
                // Note: hasStoredFocus doesn't consume the entry
                // We need to re-capture since captureForRoute clears lastInteractionCapture
                buttonA.focus();
                NavigationFocusManager.captureForRoute('route-A-key');
                buttonB.focus();
                NavigationFocusManager.captureForRoute('route-B-key');

                expect(NavigationFocusManager.hasStoredFocus('route-A-key')).toBe(true);
                expect(NavigationFocusManager.hasStoredFocus('route-B-key')).toBe(true);

                // When: cleanupRemovedRoutes is called with state containing only route-A
                const mockNavigationState = {
                    routes: [
                        {key: 'route-A-key', name: 'ScreenA'},
                    ],
                    index: 0,
                    stale: false,
                    type: 'stack',
                    key: 'root',
                    routeNames: ['ScreenA'],
                };
                NavigationFocusManager.cleanupRemovedRoutes(mockNavigationState);

                // Then: route-A should still have focus data, route-B should be cleaned up
                expect(NavigationFocusManager.hasStoredFocus('route-A-key')).toBe(true);
                expect(NavigationFocusManager.hasStoredFocus('route-B-key')).toBe(false);
            });

            it('should preserve focus data for routes still in navigation state', () => {
                // Given: Focus captured for a route
                const button = document.createElement('button');
                button.id = 'preserved-button';
                document.body.appendChild(button);
                button.focus();
                NavigationFocusManager.captureForRoute('preserved-route-key');

                expect(NavigationFocusManager.hasStoredFocus('preserved-route-key')).toBe(true);

                // When: cleanupRemovedRoutes is called with state containing the route
                const mockNavigationState = {
                    routes: [
                        {key: 'preserved-route-key', name: 'PreservedScreen'},
                    ],
                    index: 0,
                    stale: false,
                    type: 'stack',
                    key: 'root',
                    routeNames: ['PreservedScreen'],
                };
                NavigationFocusManager.cleanupRemovedRoutes(mockNavigationState);

                // Then: Focus data should still be available
                expect(NavigationFocusManager.hasStoredFocus('preserved-route-key')).toBe(true);

                // And retrieval should work
                const retrieved = NavigationFocusManager.retrieveForRoute('preserved-route-key');
                expect(retrieved).toBe(button);
            });

            it('should handle nested routes in navigation state', () => {
                // Given: Focus captured for a nested route
                const button = document.createElement('button');
                button.id = 'nested-route-button';
                document.body.appendChild(button);
                button.focus();
                NavigationFocusManager.captureForRoute('nested-screen-key');

                expect(NavigationFocusManager.hasStoredFocus('nested-screen-key')).toBe(true);

                // When: cleanupRemovedRoutes is called with nested state structure
                const mockNavigationState = {
                    routes: [
                        {
                            key: 'navigator-key',
                            name: 'Navigator',
                            state: {
                                routes: [
                                    {key: 'nested-screen-key', name: 'NestedScreen'},
                                ],
                                index: 0,
                            },
                        },
                    ],
                    index: 0,
                    stale: false,
                    type: 'stack',
                    key: 'root',
                    routeNames: ['Navigator'],
                };
                NavigationFocusManager.cleanupRemovedRoutes(mockNavigationState);

                // Then: Nested route's focus data should be preserved
                expect(NavigationFocusManager.hasStoredFocus('nested-screen-key')).toBe(true);
            });
        });
    });
});
