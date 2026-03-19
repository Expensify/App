import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {PropsWithChildren} from 'react';
// Import after mocks
// eslint-disable-next-line import/first
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';

type CapturedPopoverProps = {
    isVisible?: boolean;
    wasOpenedViaKeyboard?: boolean;
    onModalHide?: () => void;
};

let mockLatestPopoverProps: CapturedPopoverProps | undefined;
let mockLastButtonFocusSpy: jest.Mock | undefined;

const mockWasRecentKeyboardInteraction = jest.fn<boolean, []>();
const mockClearKeyboardInteractionFlag = jest.fn<void, []>();
const mockCalculatePopoverPosition = jest.fn<Promise<{horizontal: number; vertical: number}>, []>(() => new Promise(() => {}));

jest.mock(
    'expo-web-browser',
    () => ({
        openAuthSessionAsync: jest.fn(),
    }),
    {virtual: true},
);

jest.mock('@components/PopoverMenu', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const ReactModule = jest.requireActual<typeof import('react')>('react');
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {View} = jest.requireActual<typeof import('react-native')>('react-native');

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: (props: PropsWithChildren<CapturedPopoverProps>) => {
            mockLatestPopoverProps = props;
            return ReactModule.createElement(View, {testID: 'mock-popover-menu'}, props.children);
        },
    };
});

jest.mock('@components/Button', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const ReactModule = jest.requireActual<typeof import('react')>('react');
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {Pressable, Text} = jest.requireActual<typeof import('react-native')>('react-native');

    const MockButton = ReactModule.forwardRef(
        (
            props: PropsWithChildren<{
                onPress?: () => void;
                text?: string;
                children?: React.ReactNode;
            }>,
            ref: React.Ref<{focus: () => void}>,
        ) => {
            const focusSpy = jest.fn();
            mockLastButtonFocusSpy = focusSpy;

            ReactModule.useImperativeHandle(ref, () => ({focus: focusSpy}), [focusSpy]);

            return (
                <Pressable
                    onPress={props.onPress}
                    role="button"
                >
                    {props.text ? <Text>{props.text}</Text> : null}
                    {props.children}
                </Pressable>
            );
        },
    );

    MockButton.displayName = 'MockButton';

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: MockButton,
    };
});

jest.mock('@libs/NavigationFocusManager', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        wasRecentKeyboardInteraction: () => mockWasRecentKeyboardInteraction(),
        clearKeyboardInteractionFlag: () => mockClearKeyboardInteractionFlag(),
    },
}));

jest.mock('@hooks/usePopoverPosition', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        calculatePopoverPosition: () => mockCalculatePopoverPosition(),
    }),
}));

describe('ButtonWithDropdownMenu focus coverage', () => {
    const options = [
        {text: 'Option 1', value: 'one'},
        {text: 'Option 2', value: 'two'},
    ];

    beforeEach(() => {
        mockLatestPopoverProps = undefined;
        mockLastButtonFocusSpy = undefined;
        jest.clearAllMocks();
        mockWasRecentKeyboardInteraction.mockReturnValue(false);
    });

    it('tracks keyboard open state in toggleMenu and clears it on close', () => {
        mockWasRecentKeyboardInteraction.mockReturnValue(true);

        render(
            <ButtonWithDropdownMenu
                options={options}
                onPress={jest.fn()}
                isSplitButton={false}
            />,
        );

        expect(mockLatestPopoverProps?.isVisible).toBe(false);

        fireEvent.press(screen.getByText('Option 1'));

        expect(mockWasRecentKeyboardInteraction).toHaveBeenCalledTimes(1);
        expect(mockClearKeyboardInteractionFlag).toHaveBeenCalledTimes(1);
        expect(mockLatestPopoverProps?.isVisible).toBe(true);
        expect(mockLatestPopoverProps?.wasOpenedViaKeyboard).toBe(true);

        fireEvent.press(screen.getByText('Option 1'));

        expect(mockLatestPopoverProps?.isVisible).toBe(false);
        expect(mockLatestPopoverProps?.wasOpenedViaKeyboard).toBe(false);
        expect(mockClearKeyboardInteractionFlag).toHaveBeenCalledTimes(1);
    });

    it('focuses the single-button anchor in onModalHide', () => {
        render(
            <ButtonWithDropdownMenu
                options={options}
                onPress={jest.fn()}
                isSplitButton={false}
            />,
        );

        expect(typeof mockLatestPopoverProps?.onModalHide).toBe('function');
        expect(mockLastButtonFocusSpy).toBeDefined();

        mockLatestPopoverProps?.onModalHide?.();

        expect(mockLastButtonFocusSpy).toHaveBeenCalledTimes(1);
    });

    it('focuses the split-button anchor in onModalHide', () => {
        render(
            <ButtonWithDropdownMenu
                options={options}
                onPress={jest.fn()}
            />,
        );

        expect(typeof mockLatestPopoverProps?.onModalHide).toBe('function');
        expect(mockLastButtonFocusSpy).toBeDefined();

        mockLatestPopoverProps?.onModalHide?.();

        expect(mockLastButtonFocusSpy).toHaveBeenCalledTimes(1);
    });
});
