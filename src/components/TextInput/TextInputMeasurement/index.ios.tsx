import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type TextInputMeasurementProps from './types';

function TextInputMeasurement({
    value,
    placeholder,
    contentWidth,
    inputStyle,
    inputPaddingLeft,
    onSetTextInputWidth,
    onSetTextInputHeight,
    isPrefixCharacterPaddingCalculated,
}: TextInputMeasurementProps) {
    const styles = useThemeStyles();

    // On iOS, we don't need to measure for the auto grow size since iOS supports auto grow
    return (
        !!contentWidth &&
        isPrefixCharacterPaddingCalculated && (
            <View
                style={[inputStyle as ViewStyle, styles.hiddenElementOutsideOfWindow, styles.visibilityHidden, styles.wAuto, inputPaddingLeft]}
                onLayout={(e) => {
                    if (e.nativeEvent.layout.width === 0 && e.nativeEvent.layout.height === 0) {
                        return;
                    }
                    onSetTextInputWidth(e.nativeEvent.layout.width);
                    onSetTextInputHeight(e.nativeEvent.layout.height);
                }}
            >
                <Text style={[inputStyle, {width: contentWidth}]}>{value ? `${value}${value.endsWith('\n') ? '\u200B' : ''}` : placeholder}</Text>
            </View>
        )
    );
}

TextInputMeasurement.displayName = 'TextInputMeasurement';

export default TextInputMeasurement;
