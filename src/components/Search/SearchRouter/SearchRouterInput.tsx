import React, {useState} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import BaseTextInput from '@components/TextInput/BaseTextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SearchRouterInputProps = {
    onChange?: (searchTerm: string) => void;

    onSubmit?: () => void;

    /** Whether the input is full width */
    isFullWidth: boolean;

    /** Default value for text input */
    defaultValue?: string;

    /** Whether the input is disabled */
    disabled?: boolean;

    /** Any additional styles to apply */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Should render component on the right */
    shouldShowRightComponent?: boolean;

    /** Component to be displayed on the right */
    rightComponent?: ReactNode;
};

function SearchRouterInput({isFullWidth, onChange, onSubmit, defaultValue = '', disabled = false, wrapperStyle, shouldShowRightComponent = false, rightComponent}: SearchRouterInputProps) {
    const styles = useThemeStyles();

    const [value, setValue] = useState(defaultValue);

    const onChangeText = (text: string) => {
        setValue(text);
        if (onChange) {
            onChange(text);
        }
    };

    const inputWidth = isFullWidth ? styles.w100 : {width: variables.popoverWidth};

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, wrapperStyle ?? styles.searchRouterInputStyle]}>
            <View style={styles.flex1}>
                <BaseTextInput
                    disabled={disabled}
                    shouldUseDisabledStyles={false}
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmit}
                    autoFocus
                    textInputContainerStyles={[{borderBottomWidth: 0}, styles.ph3, inputWidth]}
                    inputStyle={[styles.searchInputStyle]}
                    role={CONST.ROLE.PRESENTATION}
                    autoCapitalize="none"
                />
            </View>
            {shouldShowRightComponent && rightComponent}
        </View>
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
