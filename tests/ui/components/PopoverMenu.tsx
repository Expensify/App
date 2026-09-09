import {act, fireEvent, render, renderHook, screen, waitFor} from '@testing-library/react-native';

import type {PopoverMenuItem, PopoverMenuProps} from '@components/PopoverMenu';
import PopoverMenu, {buildKeyPathFromIndexPath, getItemKey, resolveIndexPathByKeyPath} from '@components/PopoverMenu';
import useNoopPopoverMenuFocusManagement from '@components/PopoverMenu/usePopoverMenuFocusManagement/noop';

import getPlatform from '@libs/getPlatform';
import {getShouldSuppressBackgroundInputFocus} from '@libs/ModalFocusManager';

import CONST from '@src/CONST';

import type {PropsWithChildren} from 'react';
import type {GestureResponderEvent, View} from 'react-native';

import React from 'react';

type MockMeasuredPopoverProps = PropsWithChildren<{
    isVisible?: boolean;
    onClose?: () => void;
    onModalHide?: () => void;
    restoreFocusType?: string;
    shouldEnableNewFocusManagement?: boolean;
}>;

type RestoreFocusType = PopoverMenuProps['restoreFocusType'];

const mockPopoverWithMeasuredContent = jest.fn<void, [MockMeasuredPopoverProps]>();
const mockClose = jest.fn<void, [(() => void | Promise<void>) | undefined, boolean | undefined, boolean | undefined]>();
const mockGetPlatform = jest.mocked(getPlatform);

jest.mock('@libs/getPlatform');

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

jest.mock('@userActions/Modal', () => ({
    close: (callback?: () => void | Promise<void>, isNavigating?: boolean, shouldCloseAllModals?: boolean) => {
        mockClose(callback, isNavigating, shouldCloseAllModals);
    },
}));

jest.mock('@components/PopoverWithMeasuredContent', () => ({
    __esModule: true,
    default: (props: MockMeasuredPopoverProps) => {
        mockPopoverWithMeasuredContent(props);
        return props.children;
    },
}));

jest.mock('@components/FocusableMenuItem', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {Pressable, Text} = require('react-native');

    return {
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

describe('PopoverMenu integration — focus policy and close lifecycle', () => {
    const anchorRef = React.createRef<View>();
    const anchorPosition = {horizontal: 0, vertical: 0};

    beforeEach(() => {
        mockPopoverWithMeasuredContent.mockReset();
        mockPopoverWithMeasuredContent.mockImplementation(() => {});
        mockClose.mockReset();
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);
    });

    function getLatestMeasuredPopoverProps(): MockMeasuredPopoverProps {
        const props = mockPopoverWithMeasuredContent.mock.calls.at(-1)?.[0];
        if (!props) {
            throw new Error('PopoverWithMeasuredContent was not rendered');
        }
        return props;
    }

    function renderLifecycleMenu(menuItems: PopoverMenuItem[], onClose = jest.fn(), restoreFocusType?: RestoreFocusType, onItemSelected?: PopoverMenuProps['onItemSelected']) {
        render(
            <PopoverMenu
                isVisible
                restoreFocusType={restoreFocusType}
                menuItems={menuItems}
                onClose={onClose}
                onItemSelected={onItemSelected}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );
        return onClose;
    }

    it('commits DELETE focus policy before close and invokes marked action after hide', () => {
        const order: string[] = [];
        const onSelected = jest.fn(() => order.push('selected'));
        const onItemSelected = jest.fn(() => order.push('visibility-change'));
        mockPopoverWithMeasuredContent.mockImplementation((props) => {
            if (props.restoreFocusType !== CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE) {
                return;
            }
            order.push('delete-policy');
        });
        mockClose.mockImplementation((callback, isNavigating, shouldCloseAllModals) => {
            order.push('close');
            expect(callback).toEqual(expect.any(Function));
            expect(isNavigating).toBeUndefined();
            expect(shouldCloseAllModals).toBe(true);
        });

        renderLifecycleMenu(
            [
                {
                    text: 'Delete',
                    shouldCallAfterModalHide: true,
                    shouldCloseAllModals: true,
                    shouldSkipFocusRestore: true,
                    onSelected,
                },
            ],
            jest.fn(),
            undefined,
            onItemSelected,
        );

        fireEvent.press(screen.getByTestId('PopoverMenuItem-Delete'));

        const deletePolicyIndex = order.indexOf('delete-policy');
        const visibilityChangeIndex = order.indexOf('visibility-change');
        const closeIndex = order.indexOf('close');
        expect(visibilityChangeIndex).toBeGreaterThanOrEqual(0);
        expect(deletePolicyIndex).toBeGreaterThanOrEqual(0);
        expect(closeIndex).toBeGreaterThan(deletePolicyIndex);
        expect(getLatestMeasuredPopoverProps().shouldEnableNewFocusManagement).toBe(true);
        expect(onSelected).not.toHaveBeenCalled();

        const onModalClose = mockClose.mock.calls.at(0)?.[0];
        act(() => {
            onModalClose?.();
        });
        expect(onSelected).toHaveBeenCalledTimes(1);
        expect(order.indexOf('close')).toBeLessThan(order.indexOf('selected'));
    });

    it('preserves default focus policy for ordinary selection and dismissal', () => {
        const onSelected = jest.fn();
        const onClose = renderLifecycleMenu([
            {
                text: 'Delete marked',
                shouldCallAfterModalHide: true,
                shouldSkipFocusRestore: true,
                onSelected: jest.fn(),
            },
            {
                text: 'Ordinary',
                shouldCallAfterModalHide: true,
                onSelected,
            },
        ]);

        fireEvent.press(screen.getByTestId('PopoverMenuItem-Ordinary'));

        expect(getLatestMeasuredPopoverProps().restoreFocusType).toBeUndefined();
        expect(getLatestMeasuredPopoverProps().shouldEnableNewFocusManagement).toBe(true);
        expect(mockClose).toHaveBeenCalledTimes(1);
        expect(onSelected).not.toHaveBeenCalled();

        const onModalClose = mockClose.mock.calls.at(0)?.[0];
        act(() => {
            onModalClose?.();
        });
        expect(onSelected).toHaveBeenCalledTimes(1);

        const dismissProps = getLatestMeasuredPopoverProps();
        act(() => dismissProps.onClose?.());
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(dismissProps.restoreFocusType).toBeUndefined();
    });

    it.each([CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE, CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE])(
        'keeps caller-driven restoreFocusType updates visible to the close lifecycle: %s',
        (nextRestoreFocusType) => {
            const onSelected = jest.fn();
            const menuItems: PopoverMenuItem[] = [{text: 'Caller option', onSelected}];

            const {rerender} = render(
                <PopoverMenu
                    isVisible
                    menuItems={menuItems}
                    onItemSelected={() => {}}
                    onClose={() => {}}
                    anchorPosition={anchorPosition}
                    anchorRef={anchorRef}
                />,
            );
            fireEvent.press(screen.getByTestId('PopoverMenuItem-Caller option'));

            rerender(
                <PopoverMenu
                    isVisible={false}
                    restoreFocusType={nextRestoreFocusType}
                    menuItems={menuItems}
                    onItemSelected={() => {}}
                    onClose={() => {}}
                    anchorPosition={anchorPosition}
                    anchorRef={anchorRef}
                />,
            );

            expect(getLatestMeasuredPopoverProps().restoreFocusType).toBe(nextRestoreFocusType);
            expect(onSelected).toHaveBeenCalledTimes(1);
        },
    );

    it('clears a stale marked override on modal hide and restores the caller policy', () => {
        const menuItems: PopoverMenuItem[] = [
            {
                text: 'Delete',
                shouldCallAfterModalHide: true,
                shouldSkipFocusRestore: true,
                onSelected: jest.fn(),
            },
        ];
        const {rerender} = render(
            <PopoverMenu
                isVisible
                restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE}
                menuItems={menuItems}
                onClose={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );

        fireEvent.press(screen.getByTestId('PopoverMenuItem-Delete'));
        expect(getLatestMeasuredPopoverProps().restoreFocusType).toBe(CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE);

        rerender(
            <PopoverMenu
                isVisible={false}
                restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE}
                menuItems={menuItems}
                onClose={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );
        act(() => getLatestMeasuredPopoverProps().onModalHide?.());
        expect(getLatestMeasuredPopoverProps().restoreFocusType).toBe(CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE);
    });

    it('does not close or override focus for a keep-open selection', () => {
        const onSelected = jest.fn();

        renderLifecycleMenu([
            {
                text: 'Keep open',
                shouldCloseModalOnSelect: false,
                shouldSkipFocusRestore: true,
                onSelected,
            },
        ]);

        fireEvent.press(screen.getByTestId('PopoverMenuItem-Keep open'));

        expect(mockClose).not.toHaveBeenCalled();
        expect(onSelected).toHaveBeenCalledTimes(1);
        expect(getLatestMeasuredPopoverProps().restoreFocusType).toBeUndefined();
    });

    it('releases only its acquired suppression after the marked modal really hides', () => {
        const menuItems: PopoverMenuItem[] = [
            {
                text: 'Delete',
                shouldCallAfterModalHide: true,
                shouldSkipFocusRestore: true,
                onSelected: jest.fn(),
            },
        ];
        const {rerender} = render(
            <PopoverMenu
                isVisible
                menuItems={menuItems}
                onClose={() => {}}
                onItemSelected={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );

        fireEvent.press(screen.getByTestId('PopoverMenuItem-Delete'));
        expect(getShouldSuppressBackgroundInputFocus()).toBe(true);

        rerender(
            <PopoverMenu
                isVisible={false}
                menuItems={menuItems}
                onClose={() => {}}
                onItemSelected={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );
        act(() => getLatestMeasuredPopoverProps().onModalHide?.());

        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);
    });

    it('keeps suppression through a stale hide after reopen and releases it after the real hide', () => {
        const menuItems: PopoverMenuItem[] = [
            {
                text: 'Delete',
                shouldCallAfterModalHide: true,
                shouldSkipFocusRestore: true,
                onSelected: jest.fn(),
            },
        ];
        const renderMenu = (isVisible: boolean) => (
            <PopoverMenu
                isVisible={isVisible}
                menuItems={menuItems}
                onClose={() => {}}
                onItemSelected={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />
        );
        const {rerender} = render(renderMenu(true));

        fireEvent.press(screen.getByTestId('PopoverMenuItem-Delete'));
        expect(getShouldSuppressBackgroundInputFocus()).toBe(true);

        rerender(renderMenu(false));
        rerender(renderMenu(true));
        act(() => getLatestMeasuredPopoverProps().onModalHide?.());
        expect(getShouldSuppressBackgroundInputFocus()).toBe(true);

        rerender(renderMenu(false));
        act(() => getLatestMeasuredPopoverProps().onModalHide?.());
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);
    });

    it('releases acquired suppression when the popover unmounts before modal hide', () => {
        const {unmount} = render(
            <PopoverMenu
                isVisible
                menuItems={[
                    {
                        text: 'Delete',
                        shouldCallAfterModalHide: true,
                        shouldSkipFocusRestore: true,
                        onSelected: jest.fn(),
                    },
                ]}
                onClose={() => {}}
                onItemSelected={() => {}}
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
            />,
        );

        fireEvent.press(screen.getByTestId('PopoverMenuItem-Delete'));
        expect(getShouldSuppressBackgroundInputFocus()).toBe(true);

        unmount();
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);
    });

    it('keeps legacy focus management for a marked option in the non-iOS hook', () => {
        const menuItem = {
            text: 'Delete',
            shouldCallAfterModalHide: true,
            shouldSkipFocusRestore: true,
            onSelected: jest.fn(),
        };
        const {result} = renderHook(() =>
            useNoopPopoverMenuFocusManagement({
                isVisible: true,
                menuItems: [menuItem],
            }),
        );

        expect(result.current.effectiveRestoreFocusType).toBeUndefined();
        expect(result.current.shouldUseNewFocusManagement).toBe(false);
        expect(result.current.prepareForSelection(menuItem)).toBe(false);
    });

    it('applies DELETE focus policy to a marked nested submenu item', () => {
        mockClose.mockImplementation(() => {});

        renderLifecycleMenu([
            {
                text: 'Actions',
                subMenuItems: [
                    {
                        text: 'Delete nested',
                        shouldCallAfterModalHide: true,
                        shouldSkipFocusRestore: true,
                        onSelected: jest.fn(),
                    },
                ],
            },
        ]);

        fireEvent.press(screen.getByTestId('PopoverMenuItem-Actions'));
        fireEvent.press(screen.getByTestId('PopoverMenuItem-Delete nested'));

        expect(getLatestMeasuredPopoverProps().restoreFocusType).toBe(CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE);
        expect(mockClose).toHaveBeenCalledTimes(1);
    });
});
