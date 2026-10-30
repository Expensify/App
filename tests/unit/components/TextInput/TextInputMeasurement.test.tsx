import {fireEvent, render} from '@testing-library/react-native';

import Text from '@components/Text';
import TextInputMeasurement from '@components/TextInput/TextInputMeasurement';

import {isMobileChrome, isMobileSafari, isSafari} from '@libs/Browser';

import {textVariants} from '@styles/typography';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';
import {PlatformColor, StyleSheet, View} from 'react-native';

jest.mock('@components/Text', () => jest.requireActual<{Text: typeof Text}>('react-native').Text);
jest.mock('@hooks/useThemeStyles', () => () => ({
    hiddenElementOutsideOfWindow: {left: -9999},
    visibilityHidden: {opacity: 0},
    wAuto: {width: 'auto'},
    autoGrowHeightHiddenInput: (width: number) => ({width}),
}));
jest.mock('@libs/Browser', () => ({
    isMobileChrome: jest.fn(() => false),
    isMobileSafari: jest.fn(() => false),
    isSafari: jest.fn(() => false),
}));
describe('TextInputMeasurement', () => {
    beforeEach(() => {
        jest.mocked(isMobileChrome).mockReturnValue(false);
        jest.mocked(isMobileSafari).mockReturnValue(false);
        jest.mocked(isSafari).mockReturnValue(false);
    });
    it('preserves nested and false input styles, trailing newline and measured dimensions', () => {
        // Given a multiline value and a nested StyleProp with a false entry
        const inputStyle: StyleProp<TextStyle> = [textVariants.text, {marginLeft: 2, paddingLeft: 4}, false, [textVariants.textStrong, {marginLeft: 7, color: 'red'}]];
        const inputPaddingLeft = {paddingLeft: 13};
        const onSetTextInputWidth = jest.fn();
        const onSetTextInputHeight = jest.fn();
        // When the prefix measurement branch renders and reports layout
        const {UNSAFE_getByType: getByType} = render(
            <TextInputMeasurement
                value={'line\n'}
                contentWidth={100}
                width={100}
                inputStyle={inputStyle}
                inputPaddingLeft={inputPaddingLeft}
                isPrefixCharacterPaddingCalculated
                onSetTextInputWidth={onSetTextInputWidth}
                onSetTextInputHeight={onSetTextInputHeight}
            />,
        );
        const view = getByType(View);
        fireEvent(view, 'layout', {
            nativeEvent: {layout: {width: 80, height: 25}},
        });
        // Then the wrapper retains effective nested styles and the newline measurement text is protected
        expect(StyleSheet.flatten(view.props.style)).toMatchObject({
            marginLeft: 7,
            paddingLeft: 13,
            color: 'red',
        });
        expect(getByType(Text).props).toMatchObject({
            style: expect.arrayContaining([inputStyle]),
            children: 'line\n\u200B',
        });
        expect(onSetTextInputWidth).toHaveBeenCalledWith(80);
        expect(onSetTextInputHeight).toHaveBeenCalledWith(25);
    });
    it('omits a native opaque text color from the wrapper while retaining the inner Text style', () => {
        // Given a native color token in the input style
        const opaqueColor = PlatformColor('android:color/black');
        const inputStyle: StyleProp<TextStyle> = [{marginLeft: 3}, {color: opaqueColor}];
        // When the real prefix measurement branch renders
        const {UNSAFE_getByType: getByType} = render(
            <TextInputMeasurement
                value="native"
                contentWidth={100}
                width={100}
                inputStyle={inputStyle}
                isPrefixCharacterPaddingCalculated
                onSetTextInputWidth={jest.fn()}
                onSetTextInputHeight={jest.fn()}
            />,
        );
        // Then its View has layout style without the opaque color and Text keeps the original inputStyle
        expect(getByType(View).props.style).toEqual(expect.arrayContaining([expect.objectContaining({marginLeft: 3, color: undefined})]));
        expect(getByType(Text).props.style).toEqual(expect.arrayContaining([inputStyle]));
        expect(getByType(Text).props.style).toEqual(expect.arrayContaining([expect.arrayContaining([expect.objectContaining({color: opaqueColor})])]));
    });
    it('skips zero layout and adds two pixels on mobile Chrome in auto growth', () => {
        // Given a browser that needs cursor clearance in the hidden growth branch
        jest.mocked(isMobileChrome).mockReturnValue(true);
        const onSetTextInputWidth = jest.fn();
        const onSetTextInputHeight = jest.fn();
        // When the branch first reports zero then a measured width
        const {UNSAFE_getByType: getByType} = render(
            <TextInputMeasurement
                value="growth"
                width={100}
                autoGrow
                isPrefixCharacterPaddingCalculated={false}
                onSetTextInputWidth={onSetTextInputWidth}
                onSetTextInputHeight={onSetTextInputHeight}
            />,
        );
        const text = getByType(Text);
        fireEvent(text, 'layout', {
            nativeEvent: {layout: {width: 0, height: 0}},
        });
        expect(onSetTextInputWidth).not.toHaveBeenCalled();
        fireEvent(text, 'layout', {
            nativeEvent: {layout: {width: 50, height: 20}},
        });
        // Then only the nonzero layout reaches the callbacks with the browser adjustment
        expect(onSetTextInputWidth).toHaveBeenCalledWith(52);
        expect(onSetTextInputHeight).toHaveBeenCalledWith(20);
    });
});
