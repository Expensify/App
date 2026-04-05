/* eslint-disable @typescript-eslint/naming-convention */
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {PropsWithChildren} from 'react';
// Import after mocks
// eslint-disable-next-line import/first
import ThreeDotsMenu from '@components/ThreeDotsMenu';

type CapturedPopoverProps = {
    isVisible?: boolean;
    wasOpenedViaKeyboard?: boolean;
    onClose?: () => void;
};

type CapturedTriggerProps = {
    onPress?: () => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    children?: React.ReactNode;
};

let mockLatestPopoverProps: CapturedPopoverProps | undefined;
let mockLatestTriggerProps: CapturedTriggerProps | undefined;
const mockTriggerBlurSpy = jest.fn();

const mockWasRecentKeyboardInteraction = jest.fn<boolean, []>();
const mockClearKeyboardInteractionFlag = jest.fn<void, []>();

jest.mock('@components/PopoverMenu', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const ReactModule = jest.requireActual<typeof import('react')>('react');
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {View} = jest.requireActual<typeof import('react-native')>('react-native');

    return {
        __esModule: true,
        default: (props: PropsWithChildren<CapturedPopoverProps>) => {
            mockLatestPopoverProps = props;
            return ReactModule.createElement(View, {testID: 'mock-popover-menu'}, props.children);
        },
    };
});

jest.mock('@components/Pressable/PressableWithoutFeedback', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const ReactModule = jest.requireActual<typeof import('react')>('react');
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {Pressable} = jest.requireActual<typeof import('react-native')>('react-native');

    const MockPressableWithoutFeedback = ReactModule.forwardRef((props: CapturedTriggerProps, ref: React.Ref<{blur: () => void}>) => {
        mockLatestTriggerProps = props;

        ReactModule.useImperativeHandle(ref, () => ({blur: mockTriggerBlurSpy}), []);

        return (
            <Pressable
                testID="three-dots-trigger"
                onPress={props.onPress}
                accessibilityRole="button"
            >
                {props.children}
            </Pressable>
        );
    });

    MockPressableWithoutFeedback.displayName = 'MockPressableWithoutFeedback';

    return {
        __esModule: true,
        default: MockPressableWithoutFeedback,
    };
});

jest.mock('@components/Tooltip/EducationalTooltip', () => ({
    __esModule: true,
    default: ({children}: PropsWithChildren) => children,
}));

jest.mock('@components/Tooltip/PopoverAnchorTooltip', () => ({
    __esModule: true,
    default: ({children}: PropsWithChildren) => children,
}));

jest.mock('@components/Icon', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('@components/Button/utils', () => ({
    getButtonRole: () => 'button',
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({ThreeDots: () => null}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (value: string) => value}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [null],
}));

jest.mock('@hooks/usePopoverPosition', () => ({
    __esModule: true,
    default: () => ({calculatePopoverPosition: jest.fn()}),
}));

jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: () => ({success: 'green', icon: 'gray'}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({
        touchableButtonImage: {},
        mh4: {},
        pv2: {},
        productTrainingTooltipWrapper: {},
    }),
}));

jest.mock('@hooks/useWindowDimensions', () => ({
    __esModule: true,
    default: () => ({windowWidth: 1024, windowHeight: 768}),
}));

jest.mock('@libs/Browser', () => ({
    isMobile: () => false,
}));

jest.mock('@libs/NavigationFocusManager', () => ({
    __esModule: true,
    default: {
        wasRecentKeyboardInteraction: () => mockWasRecentKeyboardInteraction(),
        clearKeyboardInteractionFlag: () => mockClearKeyboardInteractionFlag(),
    },
}));

describe('ThreeDotsMenu focus coverage', () => {
    const menuItems = [{text: 'First action'}];
    const anchorPosition = {horizontal: 0, vertical: 0};

    beforeEach(() => {
        mockLatestPopoverProps = undefined;
        mockLatestTriggerProps = undefined;
        jest.clearAllMocks();
        mockWasRecentKeyboardInteraction.mockReturnValue(false);
    });

    it('captures keyboard open state and resets it when the menu closes', () => {
        mockWasRecentKeyboardInteraction.mockReturnValue(true);

        render(
            <ThreeDotsMenu
                menuItems={menuItems}
                anchorPosition={anchorPosition}
            />,
        );

        expect(mockLatestPopoverProps?.isVisible).toBe(false);

        fireEvent.press(screen.getByTestId('three-dots-trigger'));

        expect(mockTriggerBlurSpy).toHaveBeenCalledTimes(1);
        expect(mockWasRecentKeyboardInteraction).toHaveBeenCalledTimes(1);
        expect(mockClearKeyboardInteractionFlag).toHaveBeenCalledTimes(1);
        expect(mockLatestPopoverProps?.isVisible).toBe(true);
        expect(mockLatestPopoverProps?.wasOpenedViaKeyboard).toBe(true);

        act(() => {
            mockLatestPopoverProps?.onClose?.();
        });

        expect(mockLatestPopoverProps?.isVisible).toBe(false);
        expect(mockLatestPopoverProps?.wasOpenedViaKeyboard).toBe(false);
    });

    it('intercepts nested Enter key presses and opens the menu', () => {
        render(
            <ThreeDotsMenu
                menuItems={menuItems}
                anchorPosition={anchorPosition}
                isNested
            />,
        );

        const stopPropagation = jest.fn();
        const preventDefault = jest.fn();
        const event = {
            key: 'Enter',
            stopPropagation,
            preventDefault,
        } as unknown as React.KeyboardEvent;

        act(() => {
            mockLatestTriggerProps?.onKeyDown?.(event);
        });

        expect(stopPropagation).toHaveBeenCalledTimes(1);
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(mockLatestPopoverProps?.isVisible).toBe(true);
    });
});
