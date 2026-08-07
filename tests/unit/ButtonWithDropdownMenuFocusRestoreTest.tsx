import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {PopoverMenuProps} from '@components/PopoverMenu';

import {resolvePopoverLauncherElement, setActivePopoverLauncher} from '@libs/LauncherStack';
import restoreFocusWithModality from '@libs/restoreFocusWithModality';

import CONST from '@src/CONST';

import React from 'react';

const mockAnchor = document.createElement('button');

jest.mock('@libs/LauncherStack', () => ({
    resolvePopoverLauncherElement: jest.fn(),
    setActivePopoverLauncher: jest.fn(),
}));

jest.mock('@libs/restoreFocusWithModality', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useTheme', () => () => ({
    icon: '#000',
    buttonIcon: '#111',
    buttonSuccessText: '#fff',
    danger: '#f00',
}));

jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));

jest.mock('@hooks/useStyleUtils', () => () => ({
    getDropDownButtonHeight: () => ({}),
}));

jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false}));

jest.mock('@hooks/useSafeAreaPaddings', () => () => ({paddingBottom: 0}));

jest.mock('@hooks/usePopoverPosition', () => () => ({
    calculatePopoverPosition: jest.fn(() => Promise.resolve({horizontal: 0, vertical: 0})),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: (_, name) => String(name)}),
}));

jest.mock('@hooks/useKeyboardShortcut', () => () => undefined);

let mockIsSafari = false;
jest.mock('@libs/Browser', () => ({
    isSafari: () => mockIsSafari,
}));

jest.mock('@components/ButtonComposed', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module
    const {Pressable, Text} = jest.requireActual('react-native');
    const ReactActual = jest.requireActual<typeof React>('react');

    const MockButton = ReactActual.forwardRef(
        (
            {
                children,
                onPress,
                testID,
                disabled,
                accessibilityState,
            }: {
                children?: React.ReactNode;
                onPress?: () => void;
                testID?: string;
                disabled?: boolean;
                accessibilityState?: {expanded?: boolean};
            },
            // forwardRef requires the second arg; Pressable does not need the host ref in this stub.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _ref: React.Ref<unknown>,
        ) => (
            <Pressable
                testID={testID}
                onPress={onPress}
                disabled={disabled}
                accessibilityState={accessibilityState}
                accessibilityRole="button"
            >
                {children}
            </Pressable>
        ),
    );

    return {
        __esModule: true,
        default: Object.assign(MockButton, {
            Text: ({children}: {children?: React.ReactNode}) => <Text>{children}</Text>,
            Icon: () => null,
            KeyboardShortcut: () => null,
        }),
    };
});

jest.mock('@components/Icon', () => () => null);
jest.mock('@components/Icon/InlineIcon', () => () => null);
jest.mock('@components/Text', () => ({__esModule: true, default: () => null}));

const latestPopoverProps: {current: PopoverMenuProps | null} = {current: null};

jest.mock('@components/PopoverMenu', () => {
    return (props: PopoverMenuProps) => {
        latestPopoverProps.current = props;
        return null;
    };
});

const TRIGGER_TEST_ID = 'more-dropdown-trigger';

function renderMenu() {
    return render(
        <ButtonWithDropdownMenu
            onPress={() => {}}
            shouldAlwaysShowDropdownMenu
            isSplitButton={false}
            customText="More"
            testID={TRIGGER_TEST_ID}
            options={[
                {text: 'Settings', value: 'settings', onSelected: jest.fn()},
                {text: 'Import', value: 'import', onSelected: jest.fn()},
            ]}
        />,
    );
}

describe('ButtonWithDropdownMenu focus restore handshake', () => {
    beforeEach(() => {
        mockIsSafari = false;
        latestPopoverProps.current = null;
        jest.mocked(setActivePopoverLauncher).mockClear();
        jest.mocked(resolvePopoverLauncherElement).mockClear();
        jest.mocked(resolvePopoverLauncherElement).mockReturnValue(mockAnchor);
        jest.mocked(restoreFocusWithModality).mockClear();
    });

    it('registers the dropdown launcher when opening the menu', () => {
        renderMenu();

        fireEvent.press(screen.getByTestId(TRIGGER_TEST_ID));

        expect(setActivePopoverLauncher).toHaveBeenCalledWith(mockAnchor);
    });

    it('restores the anchor on hide for deferred shouldCallAfterModalHide selection', () => {
        renderMenu();

        fireEvent.press(screen.getByTestId(TRIGGER_TEST_ID));

        const settingsItem = latestPopoverProps.current?.menuItems.at(0);
        if (!settingsItem) {
            throw new Error('Expected Settings menu item');
        }

        expect(settingsItem.shouldCallAfterModalHide).toBe(true);
        expect(latestPopoverProps.current?.shouldEnableNewFocusManagement).toBe(true);

        act(() => {
            latestPopoverProps.current?.onItemSelected?.(settingsItem, 0);
        });

        act(() => {
            latestPopoverProps.current?.onModalHide?.();
        });

        expect(restoreFocusWithModality).toHaveBeenCalledWith(mockAnchor);
    });

    it('does not restore the anchor on hide for shouldCallAfterModalHide items in Safari (immediate path)', () => {
        mockIsSafari = true;
        renderMenu();

        fireEvent.press(screen.getByTestId(TRIGGER_TEST_ID));

        const settingsItem = latestPopoverProps.current?.menuItems.at(0);
        if (!settingsItem) {
            throw new Error('Expected Safari menu item');
        }

        act(() => {
            latestPopoverProps.current?.onItemSelected?.(settingsItem, 0);
        });

        expect(latestPopoverProps.current?.restoreFocusType).toBe(CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE);

        act(() => {
            latestPopoverProps.current?.onModalHide?.();
        });

        expect(restoreFocusWithModality).not.toHaveBeenCalled();
    });
});
