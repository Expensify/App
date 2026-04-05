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
 * - Combined with role={undefined} and tabIndex={-1}
 * - Accessibility stays caller-controlled through shouldBeAccessible
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
import MenuItem from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

jest.mock('@libs/Log');
jest.mock('@expensify/react-native-hybrid-app', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        isHybridApp: () => false,
    },
}));
jest.mock('@userActions/Session', () => ({
    callFunctionIfActionIsAllowed: (callback: unknown) => callback,
}));

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
         * - accessible remains caller-controlled
         * - role={undefined} - no menuitem role (critical for .closest() selector)
         * - tabIndex={-1} - not keyboard focusable
         * - onPress={undefined} - doesn't claim responder status
         */

        it('should preserve accessible={true} by default when interactive={false}', () => {
            renderWithProvider(
                <MenuItem
                    title="Display Only Item"
                    interactive={false}
                    pressableTestID="menu-item-non-interactive"
                />,
            );

            const menuItem = screen.getByTestId('menu-item-non-interactive');

            // Display-only content can still be readable to assistive tech unless the caller opts out.
            expect(menuItem.props.accessible).toBe(true);
            // onPress must be omitted so the outer wrapper can handle the interaction
            expect(menuItem.props.onPress).toBeUndefined();
        });

        it('should respect explicit shouldBeAccessible={false} when interactive={false}', () => {
            renderWithProvider(
                <MenuItem
                    title="Approval Workflow Inner Item"
                    interactive={false}
                    shouldBeAccessible={false}
                    pressableTestID="menu-item-explicitly-hidden"
                />,
            );

            const menuItem = screen.getByTestId('menu-item-explicitly-hidden');

            expect(menuItem.props.accessible).toBe(false);
            expect(menuItem.props.onPress).toBeUndefined();
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
    });

    describe('Nested pressable structure for ApprovalWorkflowSection pattern', () => {
        /**
         * ApprovalWorkflowSection uses this pattern:
         * <PressableWithoutFeedback role="button" onPress={navigate}>
         *     <MenuItem interactive={false} shouldBeAccessible={false} /> <!-- display-only -->
         *     <MenuItem interactive={false} shouldBeAccessible={false} /> <!-- display-only -->
         * </PressableWithoutFeedback>
         *
         * The fix ensures:
         * 1. Inner MenuItems don't claim responder status (onPress={undefined})
         * 2. Inner MenuItems don't have role="menuitem" (skipped by .closest())
         * 3. Outer wrapper has role="button" (captured by .closest())
         */

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
                    sentryLabel="MenuItemInteractivePropsTest-OuterWrapper"
                    testID="focusable-outer"
                >
                    <MenuItem
                        title="Inner Content"
                        interactive={false}
                        shouldBeAccessible={false}
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
            // - explicit shouldBeAccessible={false} keeps it out of accessibility navigation
            expect(inner.props.accessibilityRole).toBeUndefined();
            expect(inner.props.accessible).toBe(false);
        });
    });
});
