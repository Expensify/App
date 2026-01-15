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
        it('should return null when element is not in DOM at retrieval time', () => {
            // Given: A button that was captured
            const button = document.createElement('button');
            button.id = 'virtualized-button';
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

            // Then: Retrieval should return the element (it's the caller's responsibility to check focusability)
            // The NavigationFocusManager just stores/retrieves, isElementFocusable() checks DOM presence
            const retrieved = NavigationFocusManager.retrieveForRoute('test-route-1');

            // Element is returned but not in DOM - this is expected
            // The FocusTrapForScreen's isElementFocusable() will return false
            expect(retrieved).toBe(button);
            expect(document.body.contains(button)).toBe(false);
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

        it('should capture inner menuitem when it HAS role="menuitem" (pre-fix behavior, standalone menus)', () => {
            // Given: A button containing a div WITH role="menuitem" (standalone menu items should still work)
            const outerButton = document.createElement('div');
            outerButton.setAttribute('role', 'button');
            outerButton.id = 'menu-anchor';

            const innerMenuItem = document.createElement('div');
            innerMenuItem.setAttribute('role', 'menuitem');
            innerMenuItem.id = 'actual-menu-item';
            innerMenuItem.textContent = 'Menu Option';

            outerButton.appendChild(innerMenuItem);
            document.body.appendChild(outerButton);

            // When: Pointerdown on the inner menu item
            const pointerEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerEvent, 'target', {value: innerMenuItem});
            document.dispatchEvent(pointerEvent);

            NavigationFocusManager.captureForRoute('standalone-menuitem-route');

            // Then: Should capture the inner menuitem (closest() finds it first)
            // This is CORRECT for standalone menu items like PopoverMenu
            const retrieved = NavigationFocusManager.retrieveForRoute('standalone-menuitem-route');
            expect(retrieved).toBe(innerMenuItem);
            expect(retrieved?.id).toBe('actual-menu-item');
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
});
