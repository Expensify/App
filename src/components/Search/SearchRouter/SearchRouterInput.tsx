import React, {useState} from 'react';
import type {ReactNode, RefObject} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {SelectionListHandle} from '@components/SelectionList/types';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type SearchRouterInputProps = {
    /** Value of TextInput */
    value: string;

    /** Setter to TextInput value */
    setValue: (searchTerm: string) => void;

    /** Callback to update search in SearchRouter */
    updateSearch: (searchTerm: string) => void;

    /** SearchRouterList ref for managing TextInput and SearchRouterList focus */
    routerListRef?: RefObject<SelectionListHandle>;

    /** Whether the input is full width */
    isFullWidth: boolean;

    /** Whether the input is disabled */
    disabled?: boolean;

    /** Any additional styles to apply */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Any additional styles to apply when input is focused */
    wrapperFocusedStyle?: StyleProp<ViewStyle>;

    /** Component to be displayed on the right */
    rightComponent?: ReactNode;
};

function SearchRouterInput({value, setValue, updateSearch, routerListRef, isFullWidth, disabled = false, wrapperStyle, wrapperFocusedStyle, rightComponent}: SearchRouterInputProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const onChangeText = (text: string) => {
        setValue(text);
        updateSearch(text);
    };

    const inputWidth = isFullWidth ? styles.w100 : {width: variables.popoverWidth};

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, wrapperStyle ?? styles.searchRouterTextInputContainer, isFocused && wrapperFocusedStyle]}>
            <View style={styles.flex1}>
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    autoFocus
                    loadingSpinnerStyle={[styles.mt0, styles.mr2]}
                    role={CONST.ROLE.PRESENTATION}
                    placeholder={translate('search.searchPlaceholder')}
                    autoCapitalize="none"
                    disabled={disabled}
                    shouldUseDisabledStyles={false}
                    textInputContainerStyles={styles.borderNone}
                    inputStyle={[styles.searchInputStyle, inputWidth, styles.pl3, styles.pr3]}
                    onFocus={() => {
                        setIsFocused(true);
                        routerListRef?.current?.updateExternalTextInputFocus(true);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        routerListRef?.current?.updateExternalTextInputFocus(false);
                    }}
                    isLoading={!!isSearchingForReports}
                />
            </View>
            {rightComponent && <View style={styles.pr3}>{rightComponent}</View>}
        </View>
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
