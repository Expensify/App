import {render, screen} from '@testing-library/react-native';

import {InputBlurContextProvider} from '@components/InputBlurContext';
import getScreenWrapperMaxHeight from '@components/ScreenWrapper/getScreenWrapperMaxHeight';
import getScreenWrapperMaxHeightNative from '@components/ScreenWrapper/getScreenWrapperMaxHeight/index.native';
import type GetScreenWrapperMaxHeight from '@components/ScreenWrapper/getScreenWrapperMaxHeight/types';
import ScreenWrapperContainer from '@components/ScreenWrapper/ScreenWrapperContainer';

import {isRecord} from '@libs/ObjectUtils';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

// jest.mock factories may only reference variables prefixed with `mock`.
const MockView = View;

const WINDOW_HEIGHT = 640;
const KEYBOARD_AVOIDING_VIEW_TEST_ID = 'keyboardAvoidingView';

// The test harness resolves platform files as native, so the web variant is loaded by its own path below and the
// container is handed whichever answer a test wants.
jest.mock('@components/ScreenWrapper/getScreenWrapperMaxHeight', () => jest.fn());
const getScreenWrapperMaxHeightWeb = jest.requireActual<{default: GetScreenWrapperMaxHeight}>('@components/ScreenWrapper/getScreenWrapperMaxHeight/index.ts').default;

jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 360, windowHeight: WINDOW_HEIGHT})));
jest.mock('@components/KeyboardAvoidingView', () => ({children, style}: {children: React.ReactNode; style: StyleProp<ViewStyle>}) => (
    <MockView
        style={style}
        testID="keyboardAvoidingView"
    >
        {children}
    </MockView>
));

// The provider marks inputs as focused, which the container needs before it applies the cap at all.
function renderContainer() {
    render(
        <InputBlurContextProvider>
            <ScreenWrapperContainer
                testID="screen"
                shouldEnableMaxHeight
            >
                <View />
            </ScreenWrapperContainer>
        </InputBlurContextProvider>,
    );
}

function getKeyboardAvoidingViewMaxHeight() {
    const style = StyleSheet.flatten<unknown>(screen.getByTestId(KEYBOARD_AVOIDING_VIEW_TEST_ID).props.style);
    return isRecord(style) ? style.maxHeight : undefined;
}

describe('ScreenWrapperContainer', () => {
    it('does not cap the content height to the window height on native', () => {
        // Given a native platform, where the window height already is the root view's size and a cap on it would only
        // lag behind the real size during a rotation
        // When a screen opts into the height cap
        const maxHeight = getScreenWrapperMaxHeightNative(WINDOW_HEIGHT);

        // Then the content is left to fill its parent
        expect(maxHeight).toBeUndefined();
    });

    it('caps the content height to the window height on web', () => {
        // Given web, where the visual viewport shrinks under the keyboard while the layout viewport does not
        // When a screen opts into the height cap
        const maxHeight = getScreenWrapperMaxHeightWeb(WINDOW_HEIGHT);

        // Then the content is capped to the window height
        expect(maxHeight).toBe(WINDOW_HEIGHT);
    });

    it('applies the cap the platform asks for to the content', () => {
        // Given a platform that caps the content to the window height
        jest.mocked(getScreenWrapperMaxHeight).mockReturnValue(WINDOW_HEIGHT);

        // When a screen opts into the height cap
        renderContainer();

        // Then the content is capped to the window height
        expect(getKeyboardAvoidingViewMaxHeight()).toBe(WINDOW_HEIGHT);
    });

    it('leaves the content uncapped when the platform asks for no cap', () => {
        // Given a platform that wants the content to fill its parent
        jest.mocked(getScreenWrapperMaxHeight).mockReturnValue(undefined);

        // When a screen opts into the height cap
        renderContainer();

        // Then no cap is applied
        expect(getKeyboardAvoidingViewMaxHeight()).toBeUndefined();
    });
});
