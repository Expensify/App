import {render, screen} from '@testing-library/react-native';

import {InputBlurContextProvider} from '@components/InputBlurContext';
import ScreenWrapperContainer from '@components/ScreenWrapper/ScreenWrapperContainer';

import getPlatform from '@libs/getPlatform';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

// jest.mock factories may only reference variables prefixed with `mock`.
const MockView = View;

const WINDOW_HEIGHT = 640;
const KEYBOARD_AVOIDING_VIEW_TEST_ID = 'keyboardAvoidingView';

jest.mock('@libs/getPlatform', () => jest.fn());
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
    it.each([CONST.PLATFORM.IOS, CONST.PLATFORM.ANDROID])('does not cap the content height to the window height on %s', (platform) => {
        // Given a native platform, where the window height already is the root view's size and a cap on it would only
        // lag behind the real size during a rotation
        jest.mocked(getPlatform).mockReturnValue(platform);

        // When a screen opts into the height cap
        renderContainer();

        // Then the content is left to fill its parent
        expect(getKeyboardAvoidingViewMaxHeight()).toBeUndefined();
    });

    it('caps the content height to the window height on web', () => {
        // Given web, where the visual viewport shrinks under the keyboard while the layout viewport does not
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);

        // When a screen opts into the height cap
        renderContainer();

        // Then the content is capped to the window height
        expect(getKeyboardAvoidingViewMaxHeight()).toBe(WINDOW_HEIGHT);
    });
});
