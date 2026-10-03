import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import AutoGrowHeightInputContainer from '@components/AutoGrowHeightInputContainer';
import ScrollView from '@components/ScrollView';

import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import variables from '@styles/variables';

import type ReactNative from 'react-native';

import React from 'react';
import {Platform, View} from 'react-native';

type MeasureContent = NonNullable<React.ComponentProps<typeof AutoGrowHeightInputContainer>['measureContent']>;

const mockMeasureContent = jest.fn<void, Parameters<MeasureContent>>();
const mockUseKeyboardState = jest.mocked(useKeyboardState);
const mockUseSafeAreaInsets = jest.mocked(useSafeAreaInsets);
const mockUseWindowDimensions = jest.mocked(useWindowDimensions);

let platformReplaceProperty: jest.ReplaceProperty<string>;

jest.mock('@hooks/useKeyboardState', () =>
    jest.fn(() => ({
        isKeyboardShown: false,
        isKeyboardActive: false,
        keyboardHeight: 0,
        keyboardActiveHeight: 0,
        isKeyboardAnimatingRef: {current: false},
    })),
);
jest.mock('@hooks/useSafeAreaInsets', () => jest.fn(() => ({top: 0, right: 0, bottom: 0, left: 0})));
jest.mock('@hooks/useThemeStyles', () => () => ({flex1: {flex: 1}}));
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 300, windowHeight: 800})));
jest.mock('@libs/getKeyboardHeight', () => ({
    __esModule: true,
    default: (height: number, bottomInset: number) => {
        const {Platform: nativePlatform} = jest.requireActual<typeof ReactNative>('react-native');
        return nativePlatform.OS === 'android' ? height - bottomInset : height;
    },
}));

describe('AutoGrowHeightInputContainer', () => {
    beforeEach(() => {
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'web');
        mockUseKeyboardState.mockReset();
        mockUseKeyboardState.mockReturnValue({
            isKeyboardShown: false,
            isKeyboardActive: false,
            keyboardHeight: 0,
            keyboardActiveHeight: 0,
            isKeyboardAnimatingRef: {current: false},
        });
        mockUseSafeAreaInsets.mockReset();
        mockUseSafeAreaInsets.mockReturnValue({top: 0, right: 0, bottom: 0, left: 0});
        mockMeasureContent.mockReset();
        mockUseWindowDimensions.mockReset();
        mockUseWindowDimensions.mockReturnValue({
            windowWidth: 300,
            windowHeight: 800,
        });
    });

    afterEach(() => {
        platformReplaceProperty.restore();
    });

    it('measures reserved content after clamping and tracks layout changes', async () => {
        const measuredContentHeights: number[] = [];
        mockMeasureContent.mockImplementation((_content, callback) => {
            callback(measuredContentHeights.shift() ?? 0);
        });

        render(
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => (
                    <View
                        testID="measured-height"
                        accessibilityLabel={String(maxAutoGrowHeight)}
                    />
                )}
            </AutoGrowHeightInputContainer>,
        );

        const content = screen.getByTestId('measured-height').parent;
        if (!content) {
            throw new Error('Expected the measured input to have a content container');
        }
        const container = screen.UNSAFE_getByType(ScrollView);

        expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe(String(variables.textInputAutoGrowMaxHeight));
        expect(container.props.keyboardShouldPersistTaps).toBe('handled');
        expect(container.props.nestedScrollEnabled).toBe(true);

        measuredContentHeights.push(420);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 420}},
        });
        expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('420');
        await waitFor(() => expect(mockMeasureContent).toHaveBeenCalledTimes(1));

        measuredContentHeights.push(76);
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 444}}});
        await waitFor(() => expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('396'));

        measuredContentHeights.push(100);
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 444}}});
        await waitFor(() => expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('372'));

        measuredContentHeights.push(372);
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 372}}});
        await waitFor(() => expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('420'));

        measuredContentHeights.push(284, 76);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 260}},
        });
        await waitFor(() => expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('236'));

        measuredContentHeights.push(76);
        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 0}}});
        await waitFor(() => expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe(String(variables.componentSizeLarge)));
        expect(mockMeasureContent).toHaveBeenCalled();
    });

    it('recomputes the cap across keyboard shrink, dismissal, and reopen without a reduced container layout', async () => {
        let currentWindowHeight = 800;
        let renderedMaxAutoGrowHeight: number = variables.textInputAutoGrowMaxHeight;
        mockUseWindowDimensions.mockImplementation(() => ({
            windowWidth: 300,
            windowHeight: currentWindowHeight,
        }));
        mockMeasureContent.mockImplementation((_content, callback) => {
            callback(renderedMaxAutoGrowHeight === variables.componentSizeLarge ? 76 : renderedMaxAutoGrowHeight + 24);
        });

        const renderInput = () => (
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => {
                    renderedMaxAutoGrowHeight = maxAutoGrowHeight;
                    return (
                        <View
                            testID="keyboard-height"
                            accessibilityLabel={String(maxAutoGrowHeight)}
                        />
                    );
                }}
            </AutoGrowHeightInputContainer>
        );

        const {rerender} = render(renderInput());
        const container = screen.UNSAFE_getByType(ScrollView);

        // Establish the initial exact allocation, then let the input grow into it.
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('keyboard-height').props.accessibilityLabel).toBe('776'));

        // Each keyboard transition changes only the mocked viewport. No reduced container layout is emitted.
        currentWindowHeight = 500;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('keyboard-height').props.accessibilityLabel).toBe('476'));

        currentWindowHeight = 800;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('keyboard-height').props.accessibilityLabel).toBe('776'));

        currentWindowHeight = 500;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('keyboard-height').props.accessibilityLabel).toBe('476'));
    });

    it('uses an exact container layout as the baseline after a viewport fallback', async () => {
        let currentWindowHeight = 800;
        let renderedMaxAutoGrowHeight: number = variables.textInputAutoGrowMaxHeight;
        mockUseWindowDimensions.mockImplementation(() => ({
            windowWidth: 300,
            windowHeight: currentWindowHeight,
        }));
        mockMeasureContent.mockImplementation((_content, callback) => {
            callback(renderedMaxAutoGrowHeight === variables.componentSizeLarge ? 76 : renderedMaxAutoGrowHeight + 24);
        });

        const renderInput = () => (
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => {
                    renderedMaxAutoGrowHeight = maxAutoGrowHeight;
                    return (
                        <View
                            testID="exact-layout-height"
                            accessibilityLabel={String(maxAutoGrowHeight)}
                        />
                    );
                }}
            </AutoGrowHeightInputContainer>
        );

        const {rerender} = render(renderInput());
        const container = screen.UNSAFE_getByType(ScrollView);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('exact-layout-height').props.accessibilityLabel).toBe('776'));

        currentWindowHeight = 500;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('exact-layout-height').props.accessibilityLabel).toBe('476'));

        // The exact layout for the contracted slot must replace, not compound, the viewport fallback.
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 500, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('exact-layout-height').props.accessibilityLabel).toBe('476'));

        currentWindowHeight = 800;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('exact-layout-height').props.accessibilityLabel).toBe('776'));
    });

    it('recomputes the cap across native keyboard will-show, did-show, will-hide, and reopen without a reduced container layout', async () => {
        platformReplaceProperty.restore();
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');

        let isKeyboardActive = false;
        let isKeyboardShown = false;
        let keyboardHeight = 0;
        let keyboardActiveHeight = 0;
        let renderedMaxAutoGrowHeight: number = variables.textInputAutoGrowMaxHeight;
        mockUseKeyboardState.mockImplementation(() => ({
            isKeyboardShown,
            isKeyboardActive,
            keyboardHeight,
            keyboardActiveHeight,
            isKeyboardAnimatingRef: {current: false},
        }));
        mockMeasureContent.mockImplementation((_content, callback) => {
            callback(renderedMaxAutoGrowHeight === variables.componentSizeLarge ? 76 : renderedMaxAutoGrowHeight + 24);
        });

        const renderInput = () => (
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => {
                    renderedMaxAutoGrowHeight = maxAutoGrowHeight;
                    return (
                        <View
                            testID="native-keyboard-height"
                            accessibilityLabel={String(maxAutoGrowHeight)}
                        />
                    );
                }}
            </AutoGrowHeightInputContainer>
        );

        const {rerender} = render(renderInput());
        const container = screen.UNSAFE_getByType(ScrollView);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('native-keyboard-height').props.accessibilityLabel).toBe('776'));

        // keyboardWillShow: keyboardActiveHeight is available before keyboardHeight settles.
        isKeyboardActive = true;
        keyboardActiveHeight = 300;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('native-keyboard-height').props.accessibilityLabel).toBe('476'));

        // keyboardDidShow must not apply the same height a second time.
        isKeyboardShown = true;
        keyboardHeight = 300;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('native-keyboard-height').props.accessibilityLabel).toBe('476'));

        // keyboardWillHide clears the active height before the native view has finished expanding.
        // Keep the settled keyboard height and ignore intermediate layouts until keyboardDidHide.
        isKeyboardActive = false;
        keyboardActiveHeight = 0;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('native-keyboard-height').props.accessibilityLabel).toBe('476'));

        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 620, width: 300}},
        });
        expect(screen.getByTestId('native-keyboard-height').props.accessibilityLabel).toBe('476');

        isKeyboardShown = false;
        keyboardHeight = 0;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('native-keyboard-height').props.accessibilityLabel).toBe('776'));

        // Reopening must shrink the already restored allocation again.
        isKeyboardActive = true;
        keyboardActiveHeight = 300;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('native-keyboard-height').props.accessibilityLabel).toBe('476'));
    });

    it('ignores stale repeated native layouts while the keyboard fallback waits for the exact allocation', async () => {
        platformReplaceProperty.restore();
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');

        let isKeyboardActive = false;
        let keyboardActiveHeight = 0;
        let renderedMaxAutoGrowHeight: number = variables.textInputAutoGrowMaxHeight;
        mockUseKeyboardState.mockImplementation(() => ({
            isKeyboardShown: isKeyboardActive,
            isKeyboardActive,
            keyboardHeight: isKeyboardActive ? 300 : 0,
            keyboardActiveHeight,
            isKeyboardAnimatingRef: {current: false},
        }));
        mockMeasureContent.mockImplementation((_content, callback) => {
            callback(renderedMaxAutoGrowHeight === variables.componentSizeLarge ? 76 : renderedMaxAutoGrowHeight + 24);
        });

        const renderInput = () => (
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => {
                    renderedMaxAutoGrowHeight = maxAutoGrowHeight;
                    return (
                        <View
                            testID="stale-native-layout-height"
                            accessibilityLabel={String(maxAutoGrowHeight)}
                        />
                    );
                }}
            </AutoGrowHeightInputContainer>
        );

        const {rerender} = render(renderInput());
        const container = screen.UNSAFE_getByType(ScrollView);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('stale-native-layout-height').props.accessibilityLabel).toBe('776'));

        isKeyboardActive = true;
        keyboardActiveHeight = 300;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('stale-native-layout-height').props.accessibilityLabel).toBe('476'));

        // Intermediate animation frames are no more authoritative than a repeated stale allocation.
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 620, width: 300}},
        });
        expect(screen.getByTestId('stale-native-layout-height').props.accessibilityLabel).toBe('476');

        // A repeated pre-keyboard allocation must not undo the fallback shrink.
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        expect(screen.getByTestId('stale-native-layout-height').props.accessibilityLabel).toBe('476');

        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 500, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('stale-native-layout-height').props.accessibilityLabel).toBe('476'));

        isKeyboardActive = false;
        keyboardActiveHeight = 0;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('stale-native-layout-height').props.accessibilityLabel).toBe('776'));

        // The same guard is required in the opposite direction while dismissal expands the slot.
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 500, width: 300}},
        });
        expect(screen.getByTestId('stale-native-layout-height').props.accessibilityLabel).toBe('776');

        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('stale-native-layout-height').props.accessibilityLabel).toBe('776'));

        isKeyboardActive = true;
        keyboardActiveHeight = 300;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('stale-native-layout-height').props.accessibilityLabel).toBe('476'));

        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        expect(screen.getByTestId('stale-native-layout-height').props.accessibilityLabel).toBe('476');
    });

    it('does not reuse an unrelated settled layout for a coincident keyboard delta', async () => {
        platformReplaceProperty.restore();
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');

        let isKeyboardActive = false;
        let keyboardActiveHeight = 0;
        let renderedMaxAutoGrowHeight: number = variables.textInputAutoGrowMaxHeight;
        mockUseKeyboardState.mockImplementation(() => ({
            isKeyboardShown: isKeyboardActive,
            isKeyboardActive,
            keyboardHeight: isKeyboardActive ? 300 : 0,
            keyboardActiveHeight,
            isKeyboardAnimatingRef: {current: false},
        }));
        mockMeasureContent.mockImplementation((_content, callback) => {
            callback(renderedMaxAutoGrowHeight === variables.componentSizeLarge ? 76 : renderedMaxAutoGrowHeight + 24);
        });

        const renderInput = () => (
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => {
                    renderedMaxAutoGrowHeight = maxAutoGrowHeight;
                    return (
                        <View
                            testID="unrelated-layout-height"
                            accessibilityLabel={String(maxAutoGrowHeight)}
                        />
                    );
                }}
            </AutoGrowHeightInputContainer>
        );

        const {rerender} = render(renderInput());
        const container = screen.UNSAFE_getByType(ScrollView);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('unrelated-layout-height').props.accessibilityLabel).toBe('776'));

        // A settled layout change unrelated to the keyboard must not become a future keyboard-transition baseline.
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 500, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('unrelated-layout-height').props.accessibilityLabel).toBe('476'));

        // No second reduced layout arrives. The later 300px keyboard delta must still shrink the 500px slot.
        isKeyboardActive = true;
        keyboardActiveHeight = 300;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('unrelated-layout-height').props.accessibilityLabel).toBe('176'));
    });

    it('updates the exact baseline before recording a coincident keyboard layout', async () => {
        platformReplaceProperty.restore();
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');

        let isKeyboardActive = false;
        let keyboardActiveHeight = 0;
        let renderedMaxAutoGrowHeight: number = variables.textInputAutoGrowMaxHeight;
        const isKeyboardAnimatingRef = {current: false};
        mockUseKeyboardState.mockImplementation(() => ({
            isKeyboardShown: isKeyboardActive,
            isKeyboardActive,
            keyboardHeight: isKeyboardActive ? 300 : 0,
            keyboardActiveHeight,
            isKeyboardAnimatingRef,
        }));
        mockMeasureContent.mockImplementation((_content, callback) => {
            callback(renderedMaxAutoGrowHeight === variables.componentSizeLarge ? 76 : renderedMaxAutoGrowHeight + 24);
        });

        const renderInput = () => (
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => {
                    renderedMaxAutoGrowHeight = maxAutoGrowHeight;
                    return (
                        <View
                            testID="coincident-keyboard-layout-height"
                            accessibilityLabel={String(maxAutoGrowHeight)}
                        />
                    );
                }}
            </AutoGrowHeightInputContainer>
        );

        const {rerender} = render(renderInput());
        const container = screen.UNSAFE_getByType(ScrollView);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 500, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('coincident-keyboard-layout-height').props.accessibilityLabel).toBe('476'));

        // A settled non-keyboard resize establishes 800 as the current exact allocation.
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('coincident-keyboard-layout-height').props.accessibilityLabel).toBe('776'));

        // The next keyboard layout returns to 500, which coincides with the old allocation.
        isKeyboardAnimatingRef.current = true;
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 500, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('coincident-keyboard-layout-height').props.accessibilityLabel).toBe('476'));

        // No second reduced layout arrives; the exact keyboard layout must remain authoritative.
        isKeyboardActive = true;
        keyboardActiveHeight = 300;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('coincident-keyboard-layout-height').props.accessibilityLabel).toBe('476'));
    });

    it('keeps an exact contracted native layout authoritative when the keyboard state arrives afterward', async () => {
        platformReplaceProperty.restore();
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');

        let isKeyboardShown = false;
        let isKeyboardActive = false;
        let keyboardHeight = 0;
        let keyboardActiveHeight = 0;
        let renderedMaxAutoGrowHeight: number = variables.textInputAutoGrowMaxHeight;
        mockUseKeyboardState.mockImplementation(() => ({
            isKeyboardShown,
            isKeyboardActive,
            keyboardHeight,
            keyboardActiveHeight,
            isKeyboardAnimatingRef: {current: true},
        }));
        mockMeasureContent.mockImplementation((_content, callback) => {
            callback(renderedMaxAutoGrowHeight === variables.componentSizeLarge ? 76 : renderedMaxAutoGrowHeight + 24);
        });

        const renderInput = () => (
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => {
                    renderedMaxAutoGrowHeight = maxAutoGrowHeight;
                    return (
                        <View
                            testID="contracted-native-height"
                            accessibilityLabel={String(maxAutoGrowHeight)}
                        />
                    );
                }}
            </AutoGrowHeightInputContainer>
        );

        const {rerender} = render(renderInput());
        const container = screen.UNSAFE_getByType(ScrollView);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('contracted-native-height').props.accessibilityLabel).toBe('776'));

        // The OS layout can contract before the keyboard controller context publishes willShow.
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 500, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('contracted-native-height').props.accessibilityLabel).toBe('476'));

        isKeyboardActive = true;
        keyboardActiveHeight = 300;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('contracted-native-height').props.accessibilityLabel).toBe('476'));

        isKeyboardShown = true;
        keyboardHeight = 300;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('contracted-native-height').props.accessibilityLabel).toBe('476'));
    });

    it('keeps an exact expanded native layout authoritative when keyboard dismissal arrives afterward', async () => {
        platformReplaceProperty.restore();
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');

        let isKeyboardShown = true;
        let isKeyboardActive = true;
        let keyboardHeight = 300;
        let keyboardActiveHeight = 300;
        let renderedMaxAutoGrowHeight: number = variables.textInputAutoGrowMaxHeight;
        mockUseKeyboardState.mockImplementation(() => ({
            isKeyboardShown,
            isKeyboardActive,
            keyboardHeight,
            keyboardActiveHeight,
            isKeyboardAnimatingRef: {current: true},
        }));
        mockMeasureContent.mockImplementation((_content, callback) => {
            callback(renderedMaxAutoGrowHeight === variables.componentSizeLarge ? 76 : renderedMaxAutoGrowHeight + 24);
        });

        const renderInput = () => (
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => {
                    renderedMaxAutoGrowHeight = maxAutoGrowHeight;
                    return (
                        <View
                            testID="expanded-native-height"
                            accessibilityLabel={String(maxAutoGrowHeight)}
                        />
                    );
                }}
            </AutoGrowHeightInputContainer>
        );

        const {rerender} = render(renderInput());
        const container = screen.UNSAFE_getByType(ScrollView);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 500, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('expanded-native-height').props.accessibilityLabel).toBe('476'));

        // The OS layout can expand before keyboard controller context publishes willHide.
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('expanded-native-height').props.accessibilityLabel).toBe('776'));

        isKeyboardActive = false;
        keyboardActiveHeight = 0;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('expanded-native-height').props.accessibilityLabel).toBe('776'));

        isKeyboardShown = false;
        keyboardHeight = 0;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('expanded-native-height').props.accessibilityLabel).toBe('776'));
    });

    it('normalizes the Android active keyboard height by the bottom safe-area inset', async () => {
        platformReplaceProperty.restore();
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'android');
        mockUseSafeAreaInsets.mockReturnValue({top: 0, right: 0, bottom: 20, left: 0});

        let isKeyboardActive = false;
        let keyboardActiveHeight = 0;
        let renderedMaxAutoGrowHeight: number = variables.textInputAutoGrowMaxHeight;
        mockUseKeyboardState.mockImplementation(() => ({
            isKeyboardShown: false,
            isKeyboardActive,
            keyboardHeight: 0,
            keyboardActiveHeight,
            isKeyboardAnimatingRef: {current: false},
        }));
        mockMeasureContent.mockImplementation((_content, callback) => {
            callback(renderedMaxAutoGrowHeight === variables.componentSizeLarge ? 76 : renderedMaxAutoGrowHeight + 24);
        });

        const renderInput = () => (
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => {
                    renderedMaxAutoGrowHeight = maxAutoGrowHeight;
                    return (
                        <View
                            testID="android-keyboard-height"
                            accessibilityLabel={String(maxAutoGrowHeight)}
                        />
                    );
                }}
            </AutoGrowHeightInputContainer>
        );

        const {rerender} = render(renderInput());
        const container = screen.UNSAFE_getByType(ScrollView);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 800, width: 300}},
        });
        await waitFor(() => expect(screen.getByTestId('android-keyboard-height').props.accessibilityLabel).toBe('776'));

        isKeyboardActive = true;
        keyboardActiveHeight = 300;
        rerender(renderInput());
        await waitFor(() => expect(screen.getByTestId('android-keyboard-height').props.accessibilityLabel).toBe('496'));
    });

    it('keeps an in-flight measurement valid when the same layout repeats', async () => {
        const measurementCallbacks: Array<(contentHeight: number) => void> = [];
        mockMeasureContent.mockImplementation((_content, callback) => {
            measurementCallbacks.push(callback);
        });

        render(
            <AutoGrowHeightInputContainer measureContent={mockMeasureContent}>
                {(maxAutoGrowHeight) => (
                    <View
                        testID="deferred-height"
                        accessibilityLabel={String(maxAutoGrowHeight)}
                    />
                )}
            </AutoGrowHeightInputContainer>,
        );

        const container = screen.UNSAFE_getByType(ScrollView);
        const content = screen.getByTestId('deferred-height').parent;
        if (!content) {
            throw new Error('Expected the deferred input to have a content container');
        }

        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 420, width: 300}},
        });
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 420, width: 300}},
        });
        await waitFor(() => expect(measurementCallbacks).toHaveLength(1));

        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 420, width: 280}},
        });
        await waitFor(() => expect(measurementCallbacks).toHaveLength(2));

        fireEvent(content, 'layout', {
            nativeEvent: {layout: {height: 430, width: 280}},
        });
        fireEvent(content, 'layout', {
            nativeEvent: {layout: {height: 430, width: 280}},
        });
        await waitFor(() => expect(measurementCallbacks).toHaveLength(3));

        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 260, width: 280}},
        });
        await waitFor(() => expect(measurementCallbacks).toHaveLength(4));
        fireEvent(content, 'layout', {
            nativeEvent: {layout: {height: 284, width: 280}},
        });
        await waitFor(() => expect(measurementCallbacks).toHaveLength(5));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe('260');

        act(() => {
            for (const callback of measurementCallbacks.slice(0, 4)) {
                callback(444);
            }
        });
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe('260');

        act(() => measurementCallbacks[4](260));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe('260');

        fireEvent(content, 'layout', {
            nativeEvent: {layout: {height: 284, width: 280}},
        });
        await waitFor(() => expect(measurementCallbacks).toHaveLength(6));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe(String(variables.componentSizeLarge));

        fireEvent(content, 'layout', {
            nativeEvent: {layout: {height: 80, width: 280}},
        });
        fireEvent(content, 'layout', {
            nativeEvent: {layout: {height: 80, width: 280}},
        });
        await waitFor(() => expect(measurementCallbacks).toHaveLength(7));

        act(() => measurementCallbacks[5](100));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe(String(variables.componentSizeLarge));

        act(() => measurementCallbacks[6](80));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe('232');
    });

    it('ignores a pending callback when the measurement dependency changes', async () => {
        const firstMeasurementCallbacks: Array<(contentHeight: number) => void> = [];
        const secondMeasurementCallbacks: Array<(contentHeight: number) => void> = [];
        const firstMeasureContent = jest.fn<void, Parameters<MeasureContent>>((_content, callback) => firstMeasurementCallbacks.push(callback));
        const secondMeasureContent = jest.fn<void, Parameters<MeasureContent>>((_content, callback) => secondMeasurementCallbacks.push(callback));
        const renderContainer = (measureContent: MeasureContent) => (
            <AutoGrowHeightInputContainer measureContent={measureContent}>
                {(maxAutoGrowHeight) => (
                    <View
                        testID="dependency-height"
                        accessibilityLabel={String(maxAutoGrowHeight)}
                    />
                )}
            </AutoGrowHeightInputContainer>
        );

        const {rerender} = render(renderContainer(firstMeasureContent));
        const container = screen.UNSAFE_getByType(ScrollView);
        fireEvent(container, 'layout', {
            nativeEvent: {layout: {height: 420, width: 300}},
        });
        await waitFor(() => expect(firstMeasurementCallbacks).toHaveLength(1));

        rerender(renderContainer(secondMeasureContent));
        await waitFor(() => expect(secondMeasurementCallbacks).toHaveLength(1));

        act(() => firstMeasurementCallbacks[0](444));
        expect(screen.getByTestId('dependency-height').props.accessibilityLabel).toBe('420');

        act(() => secondMeasurementCallbacks[0](420));
        expect(screen.getByTestId('dependency-height').props.accessibilityLabel).toBe('420');
    });
});
