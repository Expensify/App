import type {ReactNode, RefObject} from 'react';
import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import type {SelectionListHandle} from '@components/SelectionList/types';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import shouldDelayFocus from '@libs/shouldDelayFocus';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SearchRouterInputProps = {
    /** Value of TextInput */
    value: string;

    /** Setter to TextInput value */
    setValue: (searchTerm: string) => void;

    /** Callback to update search in SearchRouter */
    updateSearch: (searchTerm: string) => void;

    /** Callback invoked when the user submits the input */
    onSubmit?: () => void;

    /** SearchRouterList ref for managing TextInput and SearchRouterList focus */
    routerListRef?: RefObject<SelectionListHandle>;

    /** Whether the input is full width */
    isFullWidth: boolean;

    /** Whether the input is disabled */
    disabled?: boolean;

    /** Whether the offline message should be shown */
    shouldShowOfflineMessage?: boolean;

    /** Whether the input should be focused */
    autoFocus?: boolean;

    /** Any additional styles to apply */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Any additional styles to apply when input is focused */
    wrapperFocusedStyle?: StyleProp<ViewStyle>;

    /** Any additional styles to apply to text input along with FormHelperMessage */
    outerWrapperStyle?: StyleProp<ViewStyle>;

    /** Component to be displayed on the right */
    rightComponent?: ReactNode;

    /** Whether the search reports API call is running  */
    isSearchingForReports?: boolean;
};

function SearchRouterInput({
    value,
    setValue,
    updateSearch,
    onSubmit = () => {},
    routerListRef,
    isFullWidth,
    disabled = false,
    shouldShowOfflineMessage = false,
    autoFocus = true,
    wrapperStyle,
    wrapperFocusedStyle,
    outerWrapperStyle,
    rightComponent,
    isSearchingForReports,
}: SearchRouterInputProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const {isOffline} = useNetwork();
    const offlineMessage: string = isOffline && shouldShowOfflineMessage ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const onChangeText = (text: string) => {
        setValue(text);
        updateSearch(text);
    };

    const inputWidth = isFullWidth ? styles.w100 : {width: variables.popoverWidth};

    return (
        <View style={[outerWrapperStyle]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, wrapperStyle ?? styles.searchRouterTextInputContainer, isFocused && wrapperFocusedStyle]}>
                <View style={styles.flex1}>
                    <TextInput
                        testID="search-router-text-input"
                        value={value}
                        onChangeText={onChangeText}
                        autoFocus={autoFocus}
                        shouldDelayFocus={shouldDelayFocus}
                        loadingSpinnerStyle={[styles.mt0, styles.mr2]}
                        role={CONST.ROLE.PRESENTATION}
                        placeholder={translate('search.searchPlaceholder')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        enterKeyHint="search"
                        accessibilityLabel={translate('search.searchPlaceholder')}
                        disabled={disabled}
                        onSubmitEditing={onSubmit}
                        shouldUseDisabledStyles={false}
                        textInputContainerStyles={[styles.borderNone, styles.pb0]}
                        inputStyle={[inputWidth, styles.pl3, styles.pr3]}
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
            <FormHelpMessage
                style={styles.ph3}
                isError={false}
                message={offlineMessage}
            />
        </View>
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
