import FormHelpMessage from '@components/FormHelpMessage';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import {useCurrencyListState} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useExportedToFilterOptions from '@hooks/useExportedToFilterOptions';
import useFocusAfterNav from '@hooks/useFocusAfterNav';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setSearchContext} from '@libs/actions/Search';
import {getAutocompleteCategories, getAutocompleteTags, parseForLiveMarkdown} from '@libs/SearchAutocompleteUtils';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ForwardedRef} from 'react';
import type {StyleProp, TextInputProps, TextStyle, ViewStyle} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';
import Animated, {interpolateColor, useAnimatedStyle, useSharedValue} from 'react-native-reanimated';

import type {SubstitutionMap} from './SearchRouter/getQueryWithSubstitutions';

const EMPTY_AUTOCOMPLETE_LIST: string[] = [];

type SearchAutocompleteInputProps = {
    /** Value of TextInput */
    value: string;

    /** Called with the new text and, for typed edits, the input event's timestamp (same clock as `performance.now()`) */
    onSearchQueryChange: (searchTerm: string, autoScrollToRight?: boolean, inputEventTimeStamp?: number) => void;

    /** Callback invoked when the user submits the input */
    onSubmit?: () => void;

    disabled?: boolean;
    shouldShowOfflineMessage?: boolean;

    /** Callback to call when the input gets focus */
    onFocus?: () => void;

    /** Callback to call when the input gets blur */
    onBlur?: () => void;

    wrapperStyle?: ViewStyle;

    /** Any additional styles to apply when input is focused */
    wrapperFocusedStyle?: ViewStyle;

    /** Any additional styles to apply to text input along with FormHelperMessage */
    outerWrapperStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    inputContainerStyle?: StyleProp<ViewStyle>;
    touchableInputWrapperStyle?: StyleProp<ViewStyle>;
    clearButtonStyle?: StyleProp<ViewStyle>;

    /** Whether the search reports API call is running  */
    isSearchingForReports?: boolean;

    /** Map of autocomplete suggestions. Required for highlighting to work properly */
    substitutionMap: SubstitutionMap;

    shouldDelayFocus?: boolean;
    ref?: ForwardedRef<BaseTextInputRef>;
} & Pick<TextInputProps, 'caretHidden' | 'autoFocus' | 'selection' | 'onKeyPress'>;

function SearchAutocompleteInput({
    value,
    onSearchQueryChange,
    onSubmit = () => {},
    disabled = false,
    shouldDelayFocus = false,
    autoFocus = true,
    shouldShowOfflineMessage = false,
    onFocus,
    onBlur,
    caretHidden = false,
    wrapperStyle,
    wrapperFocusedStyle = {},
    outerWrapperStyle,
    inputStyle,
    inputContainerStyle,
    touchableInputWrapperStyle,
    clearButtonStyle,
    isSearchingForReports,
    selection,
    substitutionMap,
    onKeyPress,
    ref,
}: SearchAutocompleteInputProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const inputRef = useRef<BaseTextInputRef>(null);
    const inputEventTimeStampRef = useRef<number | undefined>(undefined);
    const autoFocusAfterNav = useFocusAfterNav(inputRef, shouldDelayFocus);
    const {currencyList} = useCurrencyListState();
    const currencies = new Set(Object.keys(currencyList).filter((currencyCode) => !currencyList[currencyCode]?.retired));

    const [categoryNames = EMPTY_AUTOCOMPLETE_LIST] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {selector: getAutocompleteCategories});
    const categories = new Set(categoryNames);

    const [tagNames = EMPTY_AUTOCOMPLETE_LIST] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: getAutocompleteTags});
    const tags = new Set(tagNames);

    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const userLogins = new Set(Object.keys(loginList ?? {}));

    const {exportedToFilterOptions} = useExportedToFilterOptions();
    const exportedTo = new Set(exportedToFilterOptions);

    const offlineMessage: string = isOffline && shouldShowOfflineMessage ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const defaultBorderColor = theme.border;
    const {borderColor: focusedBorderColor = defaultBorderColor, ...restWrapperFocusedStyle} = wrapperFocusedStyle;
    const {borderColor: wrapperBorderColor = defaultBorderColor, ...restWrapperStyle} = wrapperStyle ?? {};

    // we are handling focused/unfocused style using shared value instead of using state to avoid re-rendering. Otherwise layout animation in `Animated.View` will lag.
    const focusedSharedValue = useSharedValue(false);
    const wrapperAnimatedStyle = useAnimatedStyle(() => {
        return focusedSharedValue.get() ? restWrapperFocusedStyle : (restWrapperStyle ?? {});
    });
    const wrapperBorderColorAnimatedStyle = useAnimatedStyle(() => {
        const borderColors = [wrapperBorderColor, focusedBorderColor].map((color) => (typeof color === 'string' ? color : defaultBorderColor));
        return {
            borderColor: interpolateColor(focusedSharedValue.get() ? 1 : 0, [0, 1], borderColors, 'RGB'),
        };
    });

    const currentUserDisplayName = currentUserPersonalDetails.displayName ?? '';

    // The parser runs on the locked Live Markdown runtime, so reading a SharedValue here can deadlock the app.
    const parser = (input: string) => {
        'worklet';

        return parseForLiveMarkdown(input, currentUserDisplayName, substitutionMap, {userLogins, currencies, categories, tags, exportedTo});
    };

    const clearInput = () => {
        onSearchQueryChange('');
        setSearchContext(false);
    };

    return (
        <View style={[outerWrapperStyle]}>
            <Animated.View style={[wrapperStyle ?? styles.searchRouterTextInputContainer, wrapperAnimatedStyle, wrapperBorderColorAnimatedStyle]}>
                <TextInput
                    testID="search-autocomplete-text-input"
                    value={value}
                    onChange={(event) => {
                        // `onChange` fires right before `onChangeText` for the same edit, so the ref holds this edit's timestamp.
                        // On web during IME composition (e.g. Android Chrome virtual keyboards), MarkdownTextInput only fires `onChangeText`,
                        // so the ref remains undefined and onSearchQueryChange safely falls back to performance.now().
                        inputEventTimeStampRef.current = event.timeStamp;
                    }}
                    onChangeText={(text) => {
                        const inputEventTimeStamp = inputEventTimeStampRef.current;
                        inputEventTimeStampRef.current = undefined;
                        onSearchQueryChange(text, false, inputEventTimeStamp);
                    }}
                    autoFocus={shouldDelayFocus ? autoFocusAfterNav : autoFocus}
                    caretHidden={caretHidden}
                    role={CONST.ROLE.SEARCHBOX}
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
                    textInputContainerStyles={[styles.borderNone, styles.pb0, styles.ph3, inputContainerStyle]}
                    inputStyle={[styles.w100, styles.lineHeightUndefined, inputStyle]}
                    touchableInputWrapperStyle={touchableInputWrapperStyle}
                    clearButtonStyle={clearButtonStyle}
                    placeholderTextColor={theme.textSupporting}
                    loadingSpinnerStyle={[styles.mt0, styles.mr1, styles.justifyContentCenter]}
                    onFocus={() => {
                        onFocus?.();
                        focusedSharedValue.set(true);
                    }}
                    onBlur={() => {
                        focusedSharedValue.set(false);
                        onBlur?.();
                    }}
                    onKeyPress={onKeyPress}
                    isLoading={isSearchingForReports}
                    ref={(element) => {
                        if (!ref) {
                            return;
                        }

                        inputRef.current = element;

                        if (typeof ref === 'function') {
                            ref(element);
                            return;
                        }

                        // eslint-disable-next-line no-param-reassign
                        ref.current = element;
                    }}
                    type="markdown"
                    multiline={false}
                    parser={parser}
                    selection={selection}
                    shouldShowClearButton={!!value && !isSearchingForReports}
                    shouldHideClearButton={false}
                    onClearInput={clearInput}
                />
            </Animated.View>
            <FormHelpMessage
                style={styles.ph3}
                isError={false}
                message={offlineMessage}
            />
        </View>
    );
}

export type {SearchAutocompleteInputProps};
export default SearchAutocompleteInput;
