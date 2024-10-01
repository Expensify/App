import React, {useState} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import TextInput from '@components/TextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SearchRouterInputProps = {
    /** Callback triggered when the input text changes */
    onChange?: (searchTerm: string) => void;

    /** Callback invoked when the user submits the input */
    onSubmit?: () => void;

    /** Whether the input is full width */
    isFullWidth: boolean;

    /** Default value for text input */
    defaultValue?: string;

    /** Whether the input is disabled */
    disabled?: boolean;

    /** Any additional styles to apply */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Any additional styles to apply when input is focused */
    wrapperFocusedStyle?: StyleProp<ViewStyle>;

    /** Component to be displayed on the right */
    rightComponent?: ReactNode;
};

function SearchRouterInput({isFullWidth, onChange, onSubmit, defaultValue = '', disabled = false, wrapperStyle, wrapperFocusedStyle, rightComponent}: SearchRouterInputProps) {
    const styles = useThemeStyles();

    const [value, setValue] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const onChangeText = (text: string) => {
        setValue(text);
        onChange?.(text);
    };

    const inputWidth = isFullWidth ? styles.w100 : {width: variables.popoverWidth};

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, wrapperStyle ?? styles.searchRouterInput, isFocused && wrapperFocusedStyle]}>
            <View style={styles.flex1}>
                <TextInput
                    autoFocus
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmit}
                    role={CONST.ROLE.PRESENTATION}
                    autoCapitalize="none"
                    disabled={disabled}
                    shouldUseDisabledStyles={false}
                    textInputContainerStyles={styles.borderNone}
                    inputStyle={[styles.searchInputStyle, inputWidth, styles.pl3, styles.pr3]}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </View>
            {rightComponent && (
                <View style={styles.pr3}>
                    {rightComponent}
                </View>
            )}
        </View>
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
