import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import type {PropsWithChildren} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu, {buildKeyPathFromIndexPath, getItemKey, resolveIndexPathByKeyPath} from '@components/PopoverMenu';

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

jest.mock('@components/PopoverWithMeasuredContent', () => {
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: (props: PropsWithChildren<Record<string, unknown>>) => props.children,
    };
});

jest.mock('@components/FocusableMenuItem', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {Pressable, Text} = require('react-native');

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: (props: {title: string; pressableTestID?: string; onPress?: (event: GestureResponderEvent) => void}) => (
            <Pressable
                testID={props.pressableTestID}
                onPress={props.onPress}
                accessibilityLabel="Pressable"
            >
                <Text>{props.title}</Text>
            </Pressable>
        ),
    };
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
