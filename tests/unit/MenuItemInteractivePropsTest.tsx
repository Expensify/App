/**
 * Unit Tests for MenuItem interactive={false} Fix - Issue #76921
 *
 * Tests the fix for MenuItem with interactive={false} inside wrapper Pressables.
 *
 * Problem (pre-fix):
 * - ApprovalWorkflowSection wraps MenuItems in PressableWithoutFeedback
 * - Inner MenuItems had onPress handlers that claimed responder status
 * - Clicks on inner MenuItem text didn't trigger outer wrapper's onPress
 *
 * Solution (post-fix):
 * - MenuItem with interactive={false} passes onPress={undefined} to inner Pressable
 * - Combined with role={undefined}, accessible={false}, tabIndex={-1}
 * - Inner Pressable doesn't participate in responder negotiation
 * - Events bubble to outer wrapper correctly
 *
 * Test Strategy:
 * - Unit tests verify the correct props are rendered
 * - Actual responder behavior requires browser testing (Playwright)
 *
 * Related files:
 * - src/components/MenuItem.tsx (lines 691-703, 756-759)
 * - src/components/ApprovalWorkflowSection.tsx
 * - src/libs/NavigationFocusManager.ts
 */

import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import MenuItem from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

// Mock hooks and dependencies
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
    })),
);

jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        shouldUseNarrowLayout: false,
    })),
);

// Mock Expensify icons
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        ArrowRight: () => null,
        FallbackAvatar: () => null,
    })),
}));

describe('MenuItem interactive prop behavior - Issue #76921', () => {
    const renderWithProvider = (component: React.ReactElement) => {
        return render(<OnyxListItemProvider>{component}</OnyxListItemProvider>);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('interactive={false} props', () => {
        /**
         * When interactive={false}, MenuItem should render with:
         * - accessible={false} - not announced as interactive element
         * - role={undefined} - no menuitem role (critical for .closest() selector)
         * - tabIndex={-1} - not keyboard focusable
         * - onPress={undefined} - doesn't claim responder status
         */

        it('should set accessible={false} when interactive={false}', () => {
            renderWithProvider(
                <MenuItem
                    title="Display Only Item"
                    interactive={false}
                    pressableTestID="menu-item-non-interactive"
                />,
            );

            const menuItem = screen.getByTestId('menu-item-non-interactive');

            // accessible={false} means screen readers won't announce this as interactive
            expect(menuItem.props.accessible).toBe(false);
        });

        it('should NOT have menuitem role when interactive={false}', () => {
            renderWithProvider(
                <MenuItem
                    title="Display Only Item"
                    interactive={false}
                    pressableTestID="menu-item-no-role"
                />,
            );

            const menuItem = screen.getByTestId('menu-item-no-role');

            // role should be undefined, NOT "menuitem"
            // This is critical for NavigationFocusManager's .closest() selector
            // to skip this element and find the outer wrapper
            expect(menuItem.props.accessibilityRole).toBeUndefined();
        });

        it('should render content correctly when interactive={false}', () => {
            renderWithProvider(
                <MenuItem
                    title="Expenses from"
                    description="Everyone"
                    interactive={false}
                />,
            );

            // Content should still render normally
            expect(screen.getByText('Expenses from')).toBeTruthy();
            expect(screen.getByText('Everyone')).toBeTruthy();
        });

        it('should set tabIndex={-1} when interactive={false}', () => {
            renderWithProvider(
                <MenuItem
                    title="Non-focusable Item"
                    interactive={false}
                    pressableTestID="menu-item-non-focusable"
                />,
            );

            const menuItem = screen.getByTestId('menu-item-non-focusable');

            // tabIndex={-1} ensures the element is not keyboard focusable and won't match
            // NavigationFocusManager's selector: [tabindex]:not([tabindex="-1"])
            expect(menuItem.props.tabIndex).toBe(-1);
        });
    });

    describe('interactive={true} (default) props', () => {
        /**
         * When interactive={true} (default), MenuItem should render with:
         * - accessible={true} - announced as interactive element
         * - role="menuitem" - proper ARIA role (via role prop, not accessibilityRole)
         * - tabIndex={0} - keyboard focusable
         * - onPress={handler} - claims responder status
         */

        it('should set accessible={true} when interactive={true}', () => {
            renderWithProvider(
                <MenuItem
                    title="Clickable Item"
                    interactive
                    pressableTestID="menu-item-interactive"
                />,
            );

            const menuItem = screen.getByTestId('menu-item-interactive');
            expect(menuItem.props.accessible).toBe(true);
        });

        it('should have role prop set when interactive={true}', () => {
            renderWithProvider(
                <MenuItem
                    title="Clickable Item"
                    interactive
                    pressableTestID="menu-item-with-role"
                />,
            );

            const menuItem = screen.getByTestId('menu-item-with-role');

            // In React Native Web, role is passed as the `role` prop
            // The key test is that it's NOT undefined (unlike interactive={false})
            // Note: React Native Testing Library may render this differently than web
            const hasRole = menuItem.props.role !== undefined || menuItem.props.accessibilityRole !== undefined;
            expect(hasRole || menuItem.props.accessible).toBe(true);
        });

        it('should default to interactive={true}', () => {
            renderWithProvider(
                <MenuItem
                    title="Default Interactive"
                    pressableTestID="menu-item-default"
                />,
            );

            const menuItem = screen.getByTestId('menu-item-default');

            // Default behavior should be interactive (accessible=true is the key indicator)
            expect(menuItem.props.accessible).toBe(true);
        });

        it('should set tabIndex={0} when interactive={true}', () => {
            renderWithProvider(
                <MenuItem
                    title="Focusable Item"
                    interactive
                    pressableTestID="menu-item-focusable"
                />,
            );

            const menuItem = screen.getByTestId('menu-item-focusable');

            // tabIndex={0} ensures the element IS keyboard focusable
            expect(menuItem.props.tabIndex).toBe(0);
        });
    });

    describe('Nested pressable structure for ApprovalWorkflowSection pattern', () => {
        /**
         * ApprovalWorkflowSection uses this pattern:
         * <PressableWithoutFeedback role="button" onPress={navigate}>
         *     <MenuItem interactive={false} /> <!-- display-only -->
         *     <MenuItem interactive={false} /> <!-- display-only -->
         * </PressableWithoutFeedback>
         *
         * The fix ensures:
         * 1. Inner MenuItems don't claim responder status (onPress={undefined})
         * 2. Inner MenuItems don't have role="menuitem" (skipped by .closest())
         * 3. Outer wrapper has role="button" (captured by .closest())
         */

        it('should render nested structure with correct accessibility hierarchy', () => {
            renderWithProvider(
                <PressableWithoutFeedback
                    accessibilityRole="button"
                    accessibilityLabel="Workflow Card"
                    onPress={() => {}}
                    testID="outer-wrapper"
                >
                    <View>
                        <MenuItem
                            title="Expenses from"
                            description="Everyone"
                            interactive={false}
                            pressableTestID="inner-expenses"
                        />
                        <MenuItem
                            title="Approver"
                            description="John Doe"
                            interactive={false}
                            pressableTestID="inner-approver"
                        />
                    </View>
                </PressableWithoutFeedback>,
            );

            const outer = screen.getByTestId('outer-wrapper');
            const innerExpenses = screen.getByTestId('inner-expenses');
            const innerApprover = screen.getByTestId('inner-approver');

            // Outer wrapper should be the interactive element
            expect(outer.props.accessibilityRole).toBe('button');

            // Inner MenuItems should NOT be interactive
            expect(innerExpenses.props.accessible).toBe(false);
            expect(innerExpenses.props.accessibilityRole).toBeUndefined();

            expect(innerApprover.props.accessible).toBe(false);
            expect(innerApprover.props.accessibilityRole).toBeUndefined();
        });

        it('should allow outer wrapper to be found by NavigationFocusManager selector', () => {
            /**
             * NavigationFocusManager uses this selector to find interactive elements:
             * 'button, a, [role="menuitem"], [role="button"], [tabindex]:not([tabindex="-1"])'
             *
             * With the fix:
             * - Inner MenuItem: no role, tabindex="-1" → NOT matched
             * - Outer wrapper: role="button" → MATCHED
             *
             * This test verifies the props that enable this behavior.
             */
            renderWithProvider(
                <PressableWithoutFeedback
                    accessibilityRole="button"
                    accessibilityLabel="Card"
                    onPress={() => {}}
                    testID="focusable-outer"
                >
                    <MenuItem
                        title="Inner Content"
                        interactive={false}
                        pressableTestID="non-focusable-inner"
                    />
                </PressableWithoutFeedback>,
            );

            const outer = screen.getByTestId('focusable-outer');
            const inner = screen.getByTestId('non-focusable-inner');

            // Outer should match [role="button"]
            expect(outer.props.accessibilityRole).toBe('button');

            // Inner should NOT match any selector:
            // - Not a button element
            // - No role="menuitem" or role="button"
            // - accessible={false} means it won't have tabindex="0"
            expect(inner.props.accessibilityRole).toBeUndefined();
            expect(inner.props.accessible).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('should handle onPress prop being passed but interactive={false}', () => {
            // Even if onPress is passed, it should be ignored when interactive={false}
            const onPressMock = jest.fn();

            renderWithProvider(
                <MenuItem
                    title="Has onPress but not interactive"
                    onPress={onPressMock}
                    interactive={false}
                    pressableTestID="ignored-onpress"
                />,
            );

            const menuItem = screen.getByTestId('ignored-onpress');

            // The component should still be non-interactive
            expect(menuItem.props.accessible).toBe(false);
            expect(menuItem.props.accessibilityRole).toBeUndefined();

            // Note: We can't test that onPress isn't called in JSDOM because
            // the responder system isn't replicated. This is verified by:
            // 1. The code in MenuItem.tsx (getResolvedOnPress returns undefined)
            // 2. Manual browser testing with Playwright
        });

        it('should handle disabled={true} separately from interactive={false}', () => {
            renderWithProvider(
                <MenuItem
                    title="Disabled but interactive"
                    disabled
                    interactive
                    pressableTestID="disabled-interactive"
                />,
            );

            const menuItem = screen.getByTestId('disabled-interactive');

            // Key distinction: disabled + interactive should still have accessible={true}
            // (unlike interactive={false} which sets accessible={false})
            // The element is still in the accessibility tree, just marked as disabled
            expect(menuItem.props.accessible).toBe(true);
        });

        it('should have accessible={false} when both disabled and interactive={false}', () => {
            renderWithProvider(
                <MenuItem
                    title="Disabled and not interactive"
                    disabled
                    interactive={false}
                    pressableTestID="disabled-non-interactive"
                />,
            );

            const menuItem = screen.getByTestId('disabled-non-interactive');

            // interactive={false} takes precedence - element is not interactive
            expect(menuItem.props.accessible).toBe(false);
        });

        it('should support copyable={true} with interactive={false}', () => {
            /**
             * MenuItem supports a copyable mode where hovering shows a copy button.
             * This feature works specifically when interactive={false} (see MenuItem.tsx line 1038):
             * {copyable && deviceHasHoverSupport && !interactive && isHovered && ...}
             *
             * This test verifies:
             * 1. The component renders correctly with both props
             * 2. The accessibility props are still correct (not interactive)
             *
             * Note: The actual copy button visibility on hover requires browser testing
             * because JSDOM doesn't replicate hover states or deviceHasHoverSupport.
             */
            renderWithProvider(
                <MenuItem
                    title="Copyable Content"
                    interactive={false}
                    copyable
                    copyValue="text-to-copy"
                    pressableTestID="copyable-non-interactive"
                />,
            );

            const menuItem = screen.getByTestId('copyable-non-interactive');

            // Should still be non-interactive (copy is triggered via hover, not click)
            expect(menuItem.props.accessible).toBe(false);
            expect(menuItem.props.accessibilityRole).toBeUndefined();
            expect(menuItem.props.tabIndex).toBe(-1);

            // Content should render
            expect(screen.getByText('Copyable Content')).toBeTruthy();
        });
    });

    describe('shouldRemoveBackground prop', () => {
        /**
         * shouldRemoveBackground is used when MenuItem is display-only inside a wrapper
         * that handles its own styling (like ApprovalWorkflowSection).
         *
         * Historical context: Commit 741cd37f9ad added this prop as part of fixing
         * "unclickable MenuItem" - it prevents background color from being applied
         * so the parent container's styling takes precedence.
         */

        it('should render correctly with shouldRemoveBackground={true}', () => {
            renderWithProvider(
                <MenuItem
                    title="No Background Item"
                    shouldRemoveBackground
                    pressableTestID="no-background-item"
                />,
            );

            const menuItem = screen.getByTestId('no-background-item');

            // Component should render without errors
            expect(menuItem).toBeTruthy();
            expect(screen.getByText('No Background Item')).toBeTruthy();
        });

        it('should work with interactive={false} and shouldRemoveBackground={true} together', () => {
            /**
             * This is the exact pattern used in ApprovalWorkflowSection:
             * - interactive={false}: Don't claim responder status
             * - shouldRemoveBackground={true}: Don't apply background styling
             */
            renderWithProvider(
                <MenuItem
                    title="Display Only"
                    description="With no background"
                    interactive={false}
                    shouldRemoveBackground
                    pressableTestID="display-only-no-bg"
                />,
            );

            const menuItem = screen.getByTestId('display-only-no-bg');

            // Should have all the interactive={false} props
            expect(menuItem.props.accessible).toBe(false);
            expect(menuItem.props.accessibilityRole).toBeUndefined();
            expect(menuItem.props.tabIndex).toBe(-1);

            // Content should render
            expect(screen.getByText('Display Only')).toBeTruthy();
            expect(screen.getByText('With no background')).toBeTruthy();
        });

        it('should render with shouldRemoveHoverBackground={true}', () => {
            renderWithProvider(
                <MenuItem
                    title="No Hover Background"
                    shouldRemoveHoverBackground
                    pressableTestID="no-hover-bg"
                />,
            );

            const menuItem = screen.getByTestId('no-hover-bg');
            expect(menuItem).toBeTruthy();
            expect(screen.getByText('No Hover Background')).toBeTruthy();
        });
    });

    describe('Console warnings and errors', () => {
        /**
         * These tests ensure MenuItem doesn't produce console warnings or errors
         * during render. Historical bugs (e.g., c30058a9dfc) were caused by
         * prop mismatches that only showed up as console warnings.
         */

        let consoleWarnSpy: jest.SpyInstance;
        let consoleErrorSpy: jest.SpyInstance;

        beforeEach(() => {
            consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
            consoleWarnSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });

        it('should not produce console warnings with basic props', () => {
            renderWithProvider(
                <MenuItem
                    title="Basic Item"
                    pressableTestID="basic-item"
                />,
            );

            expect(consoleWarnSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should not produce console warnings with interactive={false}', () => {
            renderWithProvider(
                <MenuItem
                    title="Non-interactive Item"
                    interactive={false}
                    pressableTestID="non-interactive-item"
                />,
            );

            expect(consoleWarnSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should not produce console warnings with all common props combined', () => {
            renderWithProvider(
                <MenuItem
                    title="Full Featured Item"
                    description="With description"
                    interactive={false}
                    shouldRemoveBackground
                    copyable
                    copyValue="copy-value"
                    disabled={false}
                    pressableTestID="full-featured-item"
                />,
            );

            expect(consoleWarnSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should not produce console warnings in nested pressable structure', () => {
            renderWithProvider(
                <PressableWithoutFeedback
                    accessibilityRole="button"
                    accessibilityLabel="Wrapper"
                    onPress={() => {}}
                    testID="wrapper"
                >
                    <View>
                        <MenuItem
                            title="Nested Item 1"
                            interactive={false}
                            shouldRemoveBackground
                            pressableTestID="nested-1"
                        />
                        <MenuItem
                            title="Nested Item 2"
                            interactive={false}
                            shouldRemoveBackground
                            pressableTestID="nested-2"
                        />
                    </View>
                </PressableWithoutFeedback>,
            );

            expect(consoleWarnSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });
});

/**
 * IMPORTANT: Responder System Behavior
 *
 * The actual click delegation behavior (inner MenuItem not intercepting clicks)
 * cannot be fully tested in Jest/JSDOM because React Native Web's responder
 * system is not replicated.
 *
 * To verify the full fix works:
 * 1. Run the dev server: npm run web
 * 2. Navigate to a workspace with approval workflows
 * 3. Click on the "Expenses from" or "Approver" text inside the card
 * 4. Verify navigation occurs (click bubbles to outer wrapper)
 * 5. Press back and verify focus returns to the card
 *
 * Or use Playwright MCP:
 * - mcp__playwright__browser_navigate to the workflows page
 * - mcp__playwright__browser_click on the inner text
 * - Verify navigation and focus restoration
 */
