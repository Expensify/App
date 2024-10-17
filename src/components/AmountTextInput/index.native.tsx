import React from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Text from '@components/Text';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useTheme from '@hooks/useTheme';

type AmountTextInputProps = {
    /** Style for the input */
    style?: StyleProp<TextStyle>;

    /** Style for the TextInput container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Formatted amount in local currency  */
    formattedAmount: string;

    /** Placeholder value for amount text input */
    placeholder: string;
} & Pick<BaseTextInputProps, 'autoFocus'>;

function AmountTextInput(
    {style, containerStyle, formattedAmount, placeholder}: AmountTextInputProps,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ref: ForwardedRef<BaseTextInputRef>,
) {
    const theme = useTheme();
    const shouldShowPlaceholder = !formattedAmount;

    return (
        <View style={containerStyle}>
            <Text style={[style, shouldShowPlaceholder && {color: theme.placeholderText}]}>{shouldShowPlaceholder ? placeholder : formattedAmount}</Text>
        </View>
    );
}

AmountTextInput.displayName = 'AmountTextInput';

export default React.forwardRef(AmountTextInput);
