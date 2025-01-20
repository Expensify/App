import type {ForwardedRef, ReactNode, RefObject} from 'react';
import React, {forwardRef, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, TextInputProps, TextStyle, ViewStyle} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import type {SelectionListHandle} from '@components/SelectionList/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {parseForLiveMarkdown} from '@libs/SearchAutocompleteUtils';
import handleKeyPress from '@libs/SearchInputOnKeyPress';
import shouldDelayFocus from '@libs/shouldDelayFocus';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SearchAutocompleteInputProps = {
    /** Value of TextInput */
    value: string;

    /** Callback to update search in SearchRouter */
    onSearchQueryChange: (searchTerm: string) => void;

    /** Callback invoked when the user submits the input */
    onSubmit?: () => void;

    /** SearchAutocompleteList ref for managing TextInput and SearchAutocompleteList focus */
    autocompleteListRef?: RefObject<SelectionListHandle>;

    /** Whether the input is full width */
    isFullWidth: boolean;

    /** Whether the input is disabled */
    disabled?: boolean;

    /** Whether the offline message should be shown */
    shouldShowOfflineMessage?: boolean;

    /** Callback to call when the input gets focus */
    onFocus?: () => void;

    /** Callback to call when the input gets blur */
    onBlur?: () => void;

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

    /** input style */
    inputStyle?: StyleProp<TextStyle>;
} & Pick<TextInputProps, 'caretHidden' | 'autoFocus' | 'selection'>;

function SearchAutocompleteInput(
    {
        value,
        onSearchQueryChange,
        onSubmit = () => {},
        autocompleteListRef,
        isFullWidth,
        disabled = false,
        shouldShowOfflineMessage = false,
        autoFocus = true,
        onFocus,
        onBlur,
        caretHidden = false,
        wrapperStyle,
        wrapperFocusedStyle,
        outerWrapperStyle,
        rightComponent,
        isSearchingForReports,
        selection,
        inputStyle,
    }: SearchAutocompleteInputProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const offlineMessage: string = isOffline && shouldShowOfflineMessage ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const inputWidth = isFullWidth ? styles.w100 : {width: variables.popoverWidth};

    return (
        <View style={[outerWrapperStyle]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, wrapperStyle ?? styles.searchRouterTextInputContainer, isFocused && wrapperFocusedStyle]}>
                <View style={styles.flex1}>
                    <TextInput
                        testID="search-autocomplete-text-input"
                        value={value}
                        onChangeText={onSearchQueryChange}
                        autoFocus={autoFocus}
                        shouldDelayFocus={shouldDelayFocus}
                        caretHidden={caretHidden}
                        loadingSpinnerStyle={[styles.mt0, styles.mr2]}
                        role={CONST.ROLE.PRESENTATION}
                        placeholder={translate('search.searchPlaceholder')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        enterKeyHint="search"
                        accessibilityLabel={translate('search.searchPlaceholder')}
                        disabled={disabled}
                        maxLength={CONST.SEARCH_QUERY_LIMIT}
                        onSubmitEditing={onSubmit}
                        shouldUseDisabledStyles={false}
                        textInputContainerStyles={[styles.borderNone, styles.pb0]}
                        inputStyle={[inputWidth, inputStyle]}
                        onFocus={() => {
                            setIsFocused(true);
                            autocompleteListRef?.current?.updateExternalTextInputFocus(true);
                            onFocus?.();
                        }}
                        onBlur={() => {
                            setIsFocused(false);
                            autocompleteListRef?.current?.updateExternalTextInputFocus(false);
                            onBlur?.();
                        }}
                        isLoading={!!isSearchingForReports}
                        ref={ref}
                        onKeyPress={handleKeyPress(onSubmit)}
                        isMarkdownEnabled
                        multiline={false}
                        parser={(input: string) => {
                            'worklet';

                            return parseForLiveMarkdown(input, currentUserPersonalDetails.login ?? '', currentUserPersonalDetails.displayName ?? '');
                        }}
                        selection={selection}
                    />
                </View>
                {!!rightComponent && <View style={styles.pr3}>{rightComponent}</View>}
            </View>
            <FormHelpMessage
                style={styles.ph3}
                isError={false}
                message={offlineMessage}
            />
        </View>
    );
}

SearchAutocompleteInput.displayName = 'SearchAutocompleteInput';

export type {SearchAutocompleteInputProps};
export default forwardRef(SearchAutocompleteInput);
