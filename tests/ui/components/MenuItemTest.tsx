import {act, fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemGroup from '@components/MenuItemGroup';
import Text from '@components/Text';

import type * as WebSingleExecution from '@hooks/useSingleExecution/index';
import type * as NativeSingleExecution from '@hooks/useSingleExecution/index.native';
import useThemeStyles from '@hooks/useThemeStyles';

import getOperatingSystem from '@libs/getOperatingSystem';
import getPlatform from '@libs/getPlatform';
import runAfterPredictedTransition from '@libs/Navigation/runAfterPredictedTransition';

import CONST from '@src/CONST';

import type * as NativeNavigation from '@react-navigation/native';
import type {StyleProp, TextStyle} from 'react-native';
import type {SvgProps} from 'react-native-svg';

import {NavigationContainer, useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';

import createMock from '../../utils/createMock';
import {translateLocal} from '../../utils/TestHelper';

const mockNewWindowIcon: React.FC<SvgProps> = () => null;
const mockLinkIcon: React.FC<SvgProps> = () => null;
const mockDownloadIcon: React.FC<SvgProps> = () => null;
const mockCheckmarkIcon: React.FC<SvgProps> = () => null;

let mockUseNativeSingleExecution = false;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useFocusEffect: jest.fn<ReturnType<typeof useFocusEffect>, Parameters<typeof useFocusEffect>>(),
}));
jest.mock('@hooks/useSingleExecution', () => ({
    __esModule: true,
    default: () => {
        const hook = mockUseNativeSingleExecution
            ? jest.requireActual<typeof NativeSingleExecution>('@hooks/useSingleExecution/index.native.ts').default
            : jest.requireActual<typeof WebSingleExecution>('@hooks/useSingleExecution/index.ts').default;
        return hook();
    },
}));
jest.mock('@libs/Navigation/runAfterPredictedTransition', () => ({
    __esModule: true,
    default: jest.fn<ReturnType<typeof runAfterPredictedTransition>, Parameters<typeof runAfterPredictedTransition>>(() => ({cancel: jest.fn()})),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        NewWindow: mockNewWindowIcon,
    })),
}));

jest.mock('@libs/getPlatform', () => jest.fn());
jest.mock('@libs/getOperatingSystem', () => jest.fn());

const mockedGetPlatform = jest.mocked(getPlatform);
const mockedGetOperatingSystem = jest.mocked(getOperatingSystem);

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('MenuItem', () => {
    beforeEach(() => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
        mockedGetOperatingSystem.mockReturnValue(CONST.OS.WINDOWS);
    });

    describe('accessibility label with NewWindow icon', () => {
        it('appends "Opens in a new tab" to the accessibility label when iconRight is NewWindow', () => {
            const customLabel = 'Open external link';
            const opensInNewTabText = translateLocal('common.opensInNewTab');
            const expectedAccessibilityLabel = `${customLabel}. ${opensInNewTabText}`;

            render(
                <Wrapper>
                    <MenuItem
                        title={customLabel}
                        icon={mockLinkIcon}
                        iconRight={mockNewWindowIcon}
                        accessibilityLabel={customLabel}
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            const menuItem = screen.getByLabelText(expectedAccessibilityLabel);
            expect(menuItem).toBeOnTheScreen();
        });

        it('uses default accessibility label (from title) with "Opens in a new tab" when iconRight is NewWindow and no accessibilityLabel is passed', () => {
            const title = 'Download app';
            const opensInNewTabText = translateLocal('common.opensInNewTab');
            const expectedAccessibilityLabel = `${title}. ${opensInNewTabText}`;

            render(
                <Wrapper>
                    <MenuItem
                        title={title}
                        icon={mockDownloadIcon}
                        iconRight={mockNewWindowIcon}
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            const menuItem = screen.getByLabelText(expectedAccessibilityLabel);
            expect(menuItem).toBeOnTheScreen();
        });

        it('does not append "Opens in a new tab" when iconRight is not NewWindow', () => {
            const customLabel = 'Go to next';

            render(
                <Wrapper>
                    <MenuItem
                        title={customLabel}
                        icon={mockCheckmarkIcon}
                        iconRight={mockCheckmarkIcon}
                        accessibilityLabel={customLabel}
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            const menuItem = screen.getByLabelText(customLabel);
            expect(menuItem).toBeOnTheScreen();
            expect(screen.queryByLabelText(`${customLabel}. ${translateLocal('common.opensInNewTab')}`)).not.toBeOnTheScreen();
        });
    });

    describe('context-menu accessibility hint', () => {
        it('adds the desktop web hint when a context menu is available on desktop web', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            const title = 'Help';
            const contextMenuHint = translateLocal('accessibilityHints.contextMenuAvailable');
            const expectedAccessibilityLabel = `${title}. ${contextMenuHint}`;

            render(
                <Wrapper>
                    <MenuItem
                        title={title}
                        icon={mockLinkIcon}
                        shouldShowContextMenuHint
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            expect(screen.getByLabelText(expectedAccessibilityLabel)).toBeOnTheScreen();
            expect(screen.queryByAccessibilityHint(contextMenuHint)).not.toBeOnTheScreen();
        });

        it('adds the mac desktop web hint when a context menu is available on macos web', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            mockedGetOperatingSystem.mockReturnValue(CONST.OS.MAC_OS);
            const title = 'Help';
            const contextMenuHint = translateLocal('accessibilityHints.contextMenuAvailableMacOS');
            const expectedAccessibilityLabel = `${title}. ${contextMenuHint}`;

            render(
                <Wrapper>
                    <MenuItem
                        title={title}
                        icon={mockLinkIcon}
                        shouldShowContextMenuHint
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            expect(screen.getByLabelText(expectedAccessibilityLabel)).toBeOnTheScreen();
            expect(screen.queryByAccessibilityHint(contextMenuHint)).not.toBeOnTheScreen();
        });

        it('adds the native hint when a context menu is available on native', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
            const title = 'Help';
            const contextMenuHint = translateLocal('accessibilityHints.contextMenuAvailableNative');

            render(
                <Wrapper>
                    <MenuItem
                        title={title}
                        icon={mockLinkIcon}
                        shouldShowContextMenuHint
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            expect(screen.getByAccessibilityHint(contextMenuHint)).toBeOnTheScreen();
        });

        it('preserves the native fallback hint when no context-menu hint is provided', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
            const title = 'Help';

            render(
                <Wrapper>
                    <MenuItem
                        title={title}
                        icon={mockLinkIcon}
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            expect(screen.getByAccessibilityHint(title)).toBeOnTheScreen();
            expect(screen.queryByAccessibilityHint(translateLocal('accessibilityHints.contextMenuAvailable'))).not.toBeOnTheScreen();
            expect(screen.queryByAccessibilityHint(translateLocal('accessibilityHints.contextMenuAvailableNative'))).not.toBeOnTheScreen();
        });
    });
});

describe('MenuItem style and press preservation', () => {
    it('keeps top-level title concatenation and nested description style precedence', () => {
        // Given registered, nested and falsy style values accepted by React Native.
        const registered = StyleSheet.create({title: {color: 'red'}, description: {color: 'green'}});
        const titleStyle: StyleProp<TextStyle> = [registered.title, false, [{color: 'blue'}]];
        const descriptionTextStyle: StyleProp<TextStyle> = [registered.description, false, [{color: 'purple'}]];
        // When the real MenuItem composes both style paths.
        render(
            <Wrapper>
                <MenuItem
                    title="Styled title"
                    description="Styled description"
                    shouldShowDescriptionOnTop
                    titleStyle={titleStyle}
                    descriptionTextStyle={descriptionTextStyle}
                />
            </Wrapper>,
        );
        // Then the title appends entries individually while the description retains the supplied nested entry.
        const title = screen.UNSAFE_getAllByType(Text).find((text) => text.props.children === 'Styled title');
        const description = screen.UNSAFE_getAllByType(Text).find((text) => text.props.children === 'Styled description');
        expect(title).toBeDefined();
        expect(description).toBeDefined();
        expect(title?.props.style).toEqual(expect.arrayContaining([registered.title, false, [{color: 'blue'}]]));
        expect(description?.props.style).toEqual(expect.arrayContaining([descriptionTextStyle]));
        expect(StyleSheet.flatten<unknown>(title?.props.style)).toMatchObject({color: 'blue'});
        expect(StyleSheet.flatten<unknown>(description?.props.style)).toMatchObject({color: 'purple'});
    });

    it.each<StyleProp<TextStyle>>([false, []])('preserves description fallback truthiness for %s', (descriptionTextStyle) => {
        // Given false requests the existing fallback, whereas an empty style array is intentionally truthy.
        // When the real MenuItem renders its description.
        render(
            <Wrapper>
                <MenuItem
                    title="Fallback title"
                    description="Fallback description"
                    shouldShowDescriptionOnTop
                    descriptionTextStyle={descriptionTextStyle}
                />
            </Wrapper>,
        );
        const description = screen.UNSAFE_getAllByType(Text).find((text) => text.props.children === 'Fallback description');
        expect(description).toBeDefined();
        const {result} = renderHook(useThemeStyles);
        // Then the consumed fallback slot distinguishes false from a truthy empty array, even when other styles are empty.
        const descriptionStyles: unknown = description?.props.style;
        expect(Array.isArray(descriptionStyles)).toBe(true);
        if (!Array.isArray(descriptionStyles)) {
            throw new Error('The rendered description must retain its style composition');
        }
        expect(descriptionStyles).toHaveLength(8);
        if (Array.isArray(descriptionTextStyle)) {
            expect(descriptionStyles.at(6)).toBe(descriptionTextStyle);
        } else {
            expect(descriptionStyles.at(6)).toBe(result.current.breakWord);
        }
    });

    it('blurs a click target with its original receiver before invoking the callback once', () => {
        // Given a DOM click target whose blur method depends on its receiver.
        const target = document.createElement('button');
        const order: string[] = [];
        const blur = jest.spyOn(target, 'blur').mockImplementation(function blur(this: HTMLButtonElement) {
            expect(this).toBe(target);
            order.push('blur');
        });
        const onPress = jest.fn<ReturnType<NonNullable<MenuItemProps['onPress']>>, Parameters<NonNullable<MenuItemProps['onPress']>>>(() => {
            order.push('press');
        });
        const event = createMock<KeyboardEvent>({type: 'click', currentTarget: target});
        render(
            <Wrapper>
                <MenuItem
                    title="Clickable item"
                    onPress={onPress}
                />
            </Wrapper>,
        );
        // When the actual MenuItem press handler receives the click.
        fireEvent.press(screen.getByLabelText('Clickable item'), event);
        // Then focus is removed before the single callback.
        expect(order).toEqual(['blur', 'press']);
        expect(blur).toHaveBeenCalledTimes(1);
        expect(onPress).toHaveBeenCalledTimes(1);
        expect(onPress).toHaveBeenCalledWith(event);
    });

    it.each([
        {disabled: true, interactive: true},
        {disabled: false, interactive: false},
    ])('returns before blur and callback for %o', (props) => {
        // Given a disabled or non-interactive item with a real DOM target.
        const target = document.createElement('button');
        const blur = jest.spyOn(target, 'blur');
        const onPress = jest.fn();
        render(
            <Wrapper>
                <MenuItem
                    title="Inactive item"
                    {...props}
                    onPress={onPress}
                />
            </Wrapper>,
        );
        // When a click is delivered to the item.
        fireEvent.press(screen.getByText('Inactive item'), createMock<KeyboardEvent>({type: 'click', currentTarget: target}));
        // Then the early return prevents both focus changes and execution.
        expect(blur).not.toHaveBeenCalled();
        expect(onPress).not.toHaveBeenCalled();
    });

    it('does not blur non-click events and forwards their identity once', () => {
        // Given a keyboard event with a focusable current target.
        const target = document.createElement('button');
        const blur = jest.spyOn(target, 'blur');
        const onPress = jest.fn();
        const event = createMock<KeyboardEvent>({type: 'keydown', currentTarget: target});
        render(
            <Wrapper>
                <MenuItem
                    title="Keyboard item"
                    onPress={onPress}
                />
            </Wrapper>,
        );
        // When the actual handler receives the keyboard action.
        fireEvent.press(screen.getByLabelText('Keyboard item'), event);
        // Then keyboard focus remains and the original event reaches the callback.
        expect(blur).not.toHaveBeenCalled();
        expect(onPress).toHaveBeenCalledTimes(1);
        expect(onPress).toHaveBeenCalledWith(event);
    });
});

it.each([false, true])('preserves navigation waiting through the actual single-execution hook with native=%s', async (isNative) => {
    // Given focus and transition completion are controlled below the real group and platform hooks.
    mockUseNativeSingleExecution = isNative;
    jest.mocked(runAfterPredictedTransition).mockClear();
    const order: string[] = [];
    const target = document.createElement('button');
    const blur = jest.spyOn(target, 'blur').mockImplementation(function blur(this: HTMLButtonElement) {
        expect(this).toBe(target);
        order.push('blur');
    });
    const onPress = jest.fn<ReturnType<NonNullable<MenuItemProps['onPress']>>, Parameters<NonNullable<MenuItemProps['onPress']>>>(() => {
        order.push('press');
    });
    const event = createMock<KeyboardEvent>({type: 'click', currentTarget: target});
    const {unmount} = render(
        <NavigationContainer>
            <Wrapper>
                <MenuItemGroup>
                    <MenuItem
                        title="Navigate once"
                        onPress={onPress}
                    />
                </MenuItemGroup>
            </Wrapper>
        </NavigationContainer>,
    );
    const focus = jest.mocked(useFocusEffect).mock.calls.at(-1)?.[0];
    expect(focus).toBeDefined();
    const loseFocus = focus?.();
    // When presses arrive before navigation and its predicted transition complete.
    fireEvent.press(screen.getByLabelText('Navigate once'), event);
    fireEvent.press(screen.getByLabelText('Navigate once'), event);
    // Then native excludes the pending callback after click blur while web passes each callback through.
    expect(onPress).toHaveBeenCalledTimes(isNative ? 1 : 2);
    expect(onPress).toHaveBeenLastCalledWith(event);
    expect(order).toEqual(isNative ? ['blur', 'press', 'blur'] : ['blur', 'press', 'blur', 'press']);
    if (isNative) {
        const transitions = jest.mocked(runAfterPredictedTransition).mock.calls.map(([complete]) => complete);
        // Both the group and its pressable leaf wait for the predicted transition.
        expect(transitions).toHaveLength(2);
        await act(async () => {
            for (const complete of transitions) {
                await complete();
            }
        });
        fireEvent.press(screen.getByLabelText('Navigate once'), event);
        expect(onPress).toHaveBeenCalledTimes(1);
    }
    // When leaving focus resolves the real navigation promise, native releases its pending execution.
    await act(async () => {
        loseFocus?.();
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 0);
        });
    });
    fireEvent.press(screen.getByLabelText('Navigate once'), event);
    // Then the next allowed press retains receiver order and event identity.
    expect(onPress).toHaveBeenCalledTimes(isNative ? 2 : 3);
    expect(onPress).toHaveBeenLastCalledWith(event);
    expect(order.slice(-2)).toEqual(['blur', 'press']);
    expect(blur).toHaveBeenCalledTimes(isNative ? 4 : 3);
    unmount();
    mockUseNativeSingleExecution = false;
});
