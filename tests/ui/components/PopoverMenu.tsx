import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import type {PropsWithChildren} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import {buildKeyPathFromIndexPath, getInitialFocusTargetFromContainer, getItemKey, resolveIndexPathByKeyPath} from '@components/PopoverMenuUtils';
import type FocusUtilsModule from '@libs/focusUtils/types';
import CONST from '@src/CONST';

jest.mock('@libs/Log');
jest.mock('@expensify/react-native-hybrid-app', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        isHybridApp: () => false,
    },
}));

jest.mock('@libs/focusUtils', () => {
    const webFocusUtils = jest.requireActual<{default: FocusUtilsModule}>('../../../src/libs/focusUtils/index.web.ts');
    return webFocusUtils;
});

const mockRegisteredKeyboardShortcuts = new Map<string, (event?: KeyboardEvent) => void>();
let latestPopoverWithMeasuredContentProps: Record<string, unknown> | undefined;

jest.mock('@hooks/useKeyboardShortcut', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: (shortcut: {shortcutKey: string}, callback: (event?: KeyboardEvent) => void, config?: {isActive?: boolean}) => {
        if (config?.isActive === false) {
            return;
        }
        mockRegisteredKeyboardShortcuts.set(shortcut.shortcutKey, callback);
    },
}));

function triggerShortcut(shortcutKey: string, event?: KeyboardEvent) {
    const callback = mockRegisteredKeyboardShortcuts.get(shortcutKey);
    if (!callback) {
        throw new Error(`Shortcut callback not registered for key: ${shortcutKey}`);
    }
    callback(event);
}

describe('PopoverMenu utils', () => {
    const menuItems: PopoverMenuItem[] = [
        {text: 'Item 1'},
        {
            text: 'Item 2',
            subMenuItems: [{text: 'Sub 1'}, {text: 'Sub 2', subMenuItems: [{text: 'Deep 1'}]}],
        },
        {text: 'Item 3'},
    ];

    describe('getItemKey', () => {
        test('returns explicit key if defined', () => {
            const item = {text: 'Hello', key: 'custom-key'};
            expect(getItemKey(item)).toBe('custom-key');
        });

        test('falls back to text if no key provided', () => {
            const item = {text: 'Fallback'};
            expect(getItemKey(item)).toBe('Fallback');
        });

        test('handles items with empty text and no key', () => {
            const item = {text: ''};
            expect(getItemKey(item)).toBe('');
        });
    });

    describe('buildKeyPathFromIndexPath', () => {
        test('builds correct path for deep nested item', () => {
            const path = buildKeyPathFromIndexPath(menuItems, [1, 1, 0]);
            expect(path).toEqual(['Item 2', 'Sub 2', 'Deep 1']);
        });

        test('returns empty array for empty index path', () => {
            const path = buildKeyPathFromIndexPath(menuItems, []);
            expect(path).toEqual([]);
        });

        test('returns partial path when out of bounds occurs mid-way', () => {
            const path = buildKeyPathFromIndexPath(menuItems, [1, 10]);
            expect(path).toEqual(['Item 2']);
        });

        test('returns full path when indexes are valid', () => {
            const path = buildKeyPathFromIndexPath(menuItems, [1, 0]);
            expect(path).toEqual(['Item 2', 'Sub 1']);
        });

        test('returns [] when first index out of bounds', () => {
            const path = buildKeyPathFromIndexPath(menuItems, [99]);
            expect(path).toEqual([]);
        });
    });

    describe('resolveIndexPathByKeyPath', () => {
        test('resolves deep nested key path correctly', () => {
            const result = resolveIndexPathByKeyPath(menuItems, ['Item 2', 'Sub 2', 'Deep 1']);
            expect(result).toEqual({
                found: true,
                indexes: [1, 1, 0],
                itemsAtLeaf: [],
            });
        });

        test('returns itemsAtLeaf containing subMenuItems at the last valid node', () => {
            const result = resolveIndexPathByKeyPath(menuItems, ['Item 2']);
            expect(result).toEqual({
                found: true,
                indexes: [1],
                itemsAtLeaf: [{text: 'Sub 1'}, {text: 'Sub 2', subMenuItems: [{text: 'Deep 1'}]}],
            });
        });

        test('returns not found if path partially invalid', () => {
            const result = resolveIndexPathByKeyPath(menuItems, ['Item 2', 'Missing']);
            expect(result).toEqual({found: false});
        });

        test('returns not found if first key does not exist', () => {
            const result = resolveIndexPathByKeyPath(menuItems, ['Invalid']);
            expect(result).toEqual({found: false});
        });

        test('handles empty key path and returns empty indexes', () => {
            const result = resolveIndexPathByKeyPath(menuItems, []);
            expect(result).toEqual({
                found: true,
                indexes: [],
                itemsAtLeaf: menuItems,
            });
        });

        test('returns not found if same text keys appear in different levels but mismatch path', () => {
            const nestedMenu: PopoverMenuItem[] = [
                {text: 'A', subMenuItems: [{text: 'B'}]},
                {text: 'B'}, // same text at root
            ];

            const result = resolveIndexPathByKeyPath(nestedMenu, ['B', 'C']);
            expect(result).toEqual({found: false});
        });
    });

    describe('buildKeyPathFromIndexPath + resolveIndexPathByKeyPath integration', () => {
        test('resolves to the same indexes after building and resolving', () => {
            const indexPath = [1, 1, 0];
            const keyPath = buildKeyPathFromIndexPath(menuItems, indexPath);
            const result = resolveIndexPathByKeyPath(menuItems, keyPath);
            expect(result.found).toBe(true);
            expect(result.indexes).toEqual(indexPath);
        });

        test('round-trip works for top-level items', () => {
            const indexPath = [2];
            const keyPath = buildKeyPathFromIndexPath(menuItems, indexPath);
            const result = resolveIndexPathByKeyPath(menuItems, keyPath);
            expect(result.found).toBe(true);
            expect(result.indexes).toEqual(indexPath);
        });

        test('returns consistent empty result when index path is invalid', () => {
            const keyPath = buildKeyPathFromIndexPath(menuItems, [5, 0]);
            expect(keyPath).toEqual([]);
            const result = resolveIndexPathByKeyPath(menuItems, keyPath);
            expect(result).toEqual({
                found: true,
                indexes: [],
                itemsAtLeaf: menuItems,
            });
        });
    });
});

describe('PopoverMenu initialFocus role/query behavior', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('returns first item when role menuitem is present', () => {
        const container = document.createElement('div');
        const item1 = document.createElement('div');
        item1.setAttribute('role', 'menuitem');
        item1.tabIndex = 0;
        item1.textContent = 'Settings';
        const item2 = document.createElement('div');
        item2.setAttribute('role', 'menuitem');
        item2.tabIndex = 0;
        item2.textContent = 'Sign out';

        container.appendChild(item1);
        container.appendChild(item2);
        document.body.appendChild(container);

        expect(getInitialFocusTargetFromContainer(container)).toBe(item1);
    });

    it('returns false when container is empty', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        expect(getInitialFocusTargetFromContainer(container)).toBe(false);
    });

    it('returns first actionable candidate for mixed roles', () => {
        const container = document.createElement('div');
        const roles = ['link', 'tab', 'button', 'option'];
        for (const role of roles) {
            const item = document.createElement('div');
            item.setAttribute('role', role);
            if (role === 'button') {
                item.tabIndex = 0;
            }
            container.appendChild(item);
        }
        document.body.appendChild(container);

        const firstActionable = container.querySelector('[role="button"]');
        expect(getInitialFocusTargetFromContainer(container)).toBe(firstActionable);
    });

    it('skips disabled, aria-disabled, inert and tabIndex=-1 candidates', () => {
        const container = document.createElement('div');

        const disabled = document.createElement('div');
        disabled.setAttribute('role', 'button');
        disabled.setAttribute('disabled', '');

        const ariaDisabled = document.createElement('div');
        ariaDisabled.setAttribute('role', 'button');
        ariaDisabled.setAttribute('aria-disabled', 'true');

        const inertParent = document.createElement('div');
        inertParent.setAttribute('inert', '');
        const inertChild = document.createElement('div');
        inertChild.setAttribute('role', 'button');
        inertParent.appendChild(inertChild);

        const nonFocusable = document.createElement('div');
        nonFocusable.setAttribute('role', 'button');
        nonFocusable.tabIndex = -1;

        const actionable = document.createElement('div');
        actionable.setAttribute('role', 'button');
        actionable.tabIndex = 0;

        container.appendChild(disabled);
        container.appendChild(ariaDisabled);
        container.appendChild(inertParent);
        container.appendChild(nonFocusable);
        container.appendChild(actionable);
        document.body.appendChild(container);

        expect(getInitialFocusTargetFromContainer(container)).toBe(actionable);
    });

    it('skips a candidate that is itself inert even when otherwise actionable', () => {
        const container = document.createElement('div');

        const selfInert = document.createElement('div');
        selfInert.setAttribute('role', 'button');
        selfInert.setAttribute('inert', '');
        selfInert.tabIndex = 0;

        const actionable = document.createElement('div');
        actionable.setAttribute('role', 'button');
        actionable.tabIndex = 0;

        container.appendChild(selfInert);
        container.appendChild(actionable);
        document.body.appendChild(container);

        expect(getInitialFocusTargetFromContainer(container)).toBe(actionable);
    });

    it('skips aria-disabled menuitems even when they are tabbable', () => {
        const container = document.createElement('div');

        const ariaDisabledMenuItem = document.createElement('div');
        ariaDisabledMenuItem.setAttribute('role', 'menuitem');
        ariaDisabledMenuItem.setAttribute('aria-disabled', 'true');
        ariaDisabledMenuItem.tabIndex = 0;

        const actionable = document.createElement('div');
        actionable.setAttribute('role', 'menuitem');
        actionable.tabIndex = 0;

        container.appendChild(ariaDisabledMenuItem);
        container.appendChild(actionable);
        document.body.appendChild(container);

        expect(getInitialFocusTargetFromContainer(container)).toBe(actionable);
    });

    it('skips wrong-role candidates even when they are tabbable', () => {
        const container = document.createElement('div');

        const wrongRole = document.createElement('div');
        wrongRole.setAttribute('role', 'link');
        wrongRole.tabIndex = 0;

        const actionable = document.createElement('div');
        actionable.setAttribute('role', 'button');
        actionable.tabIndex = 0;

        container.appendChild(wrongRole);
        container.appendChild(actionable);
        document.body.appendChild(container);

        expect(getInitialFocusTargetFromContainer(container)).toBe(actionable);
    });
});

jest.mock('@components/PopoverWithMeasuredContent', () => {
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: (props: PropsWithChildren<Record<string, unknown>>) => {
            latestPopoverWithMeasuredContentProps = props;
            return props.children;
        },
    };
});

jest.mock('@components/FocusableMenuItem', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {Pressable, Text} = require('react-native');

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: (props: {title: string; pressableTestID?: string; onPress?: (event: GestureResponderEvent) => void; onFocus?: () => void; focused?: boolean}) => (
            <Pressable
                testID={props.pressableTestID}
                onPress={props.onPress}
                onFocus={props.onFocus}
                accessibilityLabel="Pressable"
                accessibilityState={{selected: !!props.focused}}
            >
                <Text>{props.title}</Text>
            </Pressable>
        ),
    };
});

afterEach(() => {
    mockRegisteredKeyboardShortcuts.clear();
    latestPopoverWithMeasuredContentProps = undefined;
});

describe('PopoverMenu integration — submenu open/close behaviors', () => {
    const baseMenu: PopoverMenuItem[] = [
        {text: 'Item A', key: 'A'},
        {
            text: 'Item B',
            key: 'B',
            subMenuItems: [
                {text: 'Sub B1', key: 'B1'},
                {text: 'Sub B2', key: 'B2'},
            ],
        },
        {text: 'Item C', key: 'C'},
    ];

    const anchorRef = React.createRef<View>();
    const anchorPosition = {horizontal: 0, vertical: 0};

    const renderPopover = (menuItems: PopoverMenuItem[]) =>
        render(
            <PopoverMenu
                isVisible
                menuItems={menuItems}
                onClose={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );

    it('keeps submenu open when root item is added', async () => {
        const {rerender} = renderPopover(baseMenu);

        // Click on B
        fireEvent.press(screen.getByTestId('PopoverMenuItem-Item B'));

        // Expect submenu to open
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Sub B1')).toBeTruthy();
        });

        // Add new root
        const newMenu = [...baseMenu, {text: 'Item D', key: 'D'}];
        rerender(
            <PopoverMenu
                isVisible
                menuItems={newMenu}
                onClose={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );

        // Check that submenu is still open
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Sub B1')).toBeTruthy();
        });
    });

    it('closes submenu when parent is removed', async () => {
        const {rerender} = renderPopover(baseMenu);

        fireEvent.press(screen.getByTestId('PopoverMenuItem-Item B'));
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Sub B1')).toBeTruthy();
        });

        // Remove Item B (parent)
        const newMenu = baseMenu.filter((item) => item.key !== 'B');
        rerender(
            <PopoverMenu
                isVisible
                menuItems={newMenu}
                onClose={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );

        // Submenu should close
        await waitFor(() => {
            expect(screen.queryByTestId('PopoverMenuItem-Sub B1')).toBeNull();
        });

        // And only main menu (Item A, Item C) should be displayed
        expect(screen.getByTestId('PopoverMenuItem-Item A')).toBeTruthy();
        expect(screen.getByTestId('PopoverMenuItem-Item C')).toBeTruthy();
    });

    it('keeps submenu open when sibling root item is removed', async () => {
        const {rerender} = renderPopover(baseMenu);

        // Open submenu for Item B
        fireEvent.press(screen.getByTestId('PopoverMenuItem-Item B'));

        // Make sure submenu is open
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Sub B1')).toBeTruthy();
        });

        // Remove Item A (sibling item)
        const newMenu = baseMenu.filter((item) => item.key !== 'A');
        rerender(
            <PopoverMenu
                isVisible
                menuItems={newMenu}
                onClose={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );

        // Check that submenu is still open
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Sub B1')).toBeTruthy();
        });

        // Check that Item A is no longer displayed
        expect(screen.queryByTestId('PopoverMenuItem-Item A')).toBeNull();
    });

    it('keeps submenu open when submenu items are updated', async () => {
        const {rerender} = renderPopover(baseMenu);

        // Open submenu for Item B
        fireEvent.press(screen.getByTestId('PopoverMenuItem-Item B'));

        // Make sure submenu is open
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Sub B1')).toBeTruthy();
        });

        // Add new item to submenu of Item B
        const newMenu = baseMenu.map((item) => {
            if (item.key === 'B' && item.subMenuItems) {
                return {
                    ...item,
                    subMenuItems: [...item.subMenuItems, {text: 'Sub B3', key: 'B3'}],
                };
            }
            return item;
        });

        rerender(
            <PopoverMenu
                isVisible
                menuItems={newMenu}
                onClose={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );

        // Check that submenu is still open
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Sub B1')).toBeTruthy();
        });

        // Check that the new submenu item is displayed
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Sub B3')).toBeTruthy();
        });
    });
});

describe('PopoverMenu prop forwarding', () => {
    const anchorRef = React.createRef<View>();
    const anchorPosition = {horizontal: 0, vertical: 0};

    it('forwards shouldHandleNavigationBack to PopoverWithMeasuredContent', () => {
        // Given a visible PopoverMenu configured to handle navigation back
        render(
            <PopoverMenu
                isVisible
                menuItems={[{text: 'Action'}]}
                onClose={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
                shouldHandleNavigationBack
            />,
        );

        // When the PopoverMenu renders

        // Then PopoverWithMeasuredContent should receive the back-navigation flag
        expect(latestPopoverWithMeasuredContentProps?.shouldHandleNavigationBack).toBe(true);
    });
});

describe('PopoverMenu keyboard focusedIndex synchronization', () => {
    const anchorRef = React.createRef<View>();
    const anchorPosition = {horizontal: 0, vertical: 0};

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('syncs focusedIndex via onFocus and Enter activates the auto-focused row', () => {
        const onItemSelected = jest.fn();
        const menuItems: PopoverMenuItem[] = [{text: 'First action'}, {text: 'Second action'}];

        render(
            <PopoverMenu
                isVisible
                menuItems={menuItems}
                onClose={() => {}}
                onItemSelected={onItemSelected}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
                wasOpenedViaKeyboard
            />,
        );

        // Before focus sync, Enter is a no-op because focusedIndex is -1.
        act(() => {
            triggerShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey);
        });
        expect(onItemSelected).not.toHaveBeenCalled();

        // This mirrors the effect of keyboard initialFocus focusing the first actionable row.
        // Even if focus is applied redundantly (FocusTrap + useSyncFocus), the onFocus-driven
        // focusedIndex update is idempotent and harmless.
        fireEvent(screen.getByTestId('PopoverMenuItem-First action'), 'focus');
        const firstActionItem = screen.getByTestId('PopoverMenuItem-First action');
        const accessibilityState = firstActionItem.props.accessibilityState as {selected?: boolean} | undefined;
        expect(accessibilityState?.selected).toBe(true);

        act(() => {
            triggerShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey);
        });

        expect(onItemSelected).toHaveBeenCalledWith(expect.objectContaining({text: 'First action'}), 0, undefined);
    });
});
