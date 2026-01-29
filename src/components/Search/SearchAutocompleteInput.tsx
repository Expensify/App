/* eslint-disable rulesdir/no-acc-spread-in-reduce */
import type {ForwardedRef, RefObject} from 'react';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {StyleProp, TextInputProps, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Animated, {interpolateColor, useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import FormHelpMessage from '@components/FormHelpMessage';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import type {SelectionListHandle} from '@components/SelectionListWithSections/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useCurrencyList from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFocusAfterNav from '@hooks/useFocusAfterNav';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSearchContext} from '@libs/actions/Search';
import scheduleOnLiveMarkdownRuntime from '@libs/scheduleOnLiveMarkdownRuntime';
import {getAutocompleteCategories, getAutocompleteTags, parseForLiveMarkdown} from '@libs/SearchAutocompleteUtils';
import {getAllTranslatedStatusValues} from '@libs/SearchTranslationUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SubstitutionMap} from './SearchRouter/getQueryWithSubstitutions';

type SearchAutocompleteInputProps = {
    /** Value of TextInput */
    value: string;

    /** Callback to update search in SearchRouter */
    onSearchQueryChange: (searchTerm: string) => void;

    /** Callback invoked when the user submits the input */
    onSubmit?: () => void;

    /** SearchAutocompleteList ref for managing TextInput and SearchAutocompleteList focus */
    autocompleteListRef?: RefObject<SelectionListHandle | null>;

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
    wrapperStyle?: ViewStyle;

    /** Any additional styles to apply when input is focused */
    wrapperFocusedStyle?: ViewStyle;

    /** Any additional styles to apply to text input along with FormHelperMessage */
    outerWrapperStyle?: StyleProp<ViewStyle>;

    /** Whether the search reports API call is running  */
    isSearchingForReports?: boolean;

    /** Map of autocomplete suggestions. Required for highlighting to work properly */
    substitutionMap: SubstitutionMap;

    /** Whether the focus should be delayed */
    shouldDelayFocus?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<BaseTextInputRef>;
} & Pick<TextInputProps, 'caretHidden' | 'autoFocus' | 'selection'>;

function SearchAutocompleteInput({
    value,
    onSearchQueryChange,
    onSubmit = () => {},
    autocompleteListRef,
    isFullWidth,
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
    isSearchingForReports,
    selection,
    substitutionMap,
    ref,
}: SearchAutocompleteInputProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const inputRef = useRef<AnimatedTextInputRef>(null);
    const autoFocusAfterNav = useFocusAfterNav(inputRef, shouldDelayFocus);
    const {currencyList} = useCurrencyList();
    const currencyAutocompleteList = Object.keys(currencyList).filter((currencyCode) => !currencyList[currencyCode]?.retired);
    const currencySharedValue = useSharedValue(currencyAutocompleteList);

    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: false});
    const categoryAutocompleteList = useMemo(() => {
        return getAutocompleteCategories(allPolicyCategories);
    }, [allPolicyCategories]);
    const categorySharedValue = useSharedValue(categoryAutocompleteList);

    const [allPoliciesTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: false});
    const tagAutocompleteList = useMemo(() => {
        return getAutocompleteTags(allPoliciesTags);
    }, [allPoliciesTags]);
    const tagSharedValue = useSharedValue(tagAutocompleteList);

    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: false});
    const emailList = Object.keys(loginList ?? {});
    const emailListSharedValue = useSharedValue(emailList);

    const translatedStatusSet = useMemo(() => getAllTranslatedStatusValues(translate), [translate]);
    const translatedStatusSharedValue = useSharedValue(translatedStatusSet);

    const offlineMessage: string = isOffline && shouldShowOfflineMessage ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const {borderColor: focusedBorderColor = theme.border, ...restWrapperFocusedStyle} = wrapperFocusedStyle;
    const {borderColor: wrapperBorderColor = theme.border, ...restWrapperStyle} = wrapperStyle ?? {};

    // we are handling focused/unfocused style using shared value instead of using state to avoid re-rendering. Otherwise layout animation in `Animated.View` will lag.
    const focusedSharedValue = useSharedValue(false);
    const wrapperAnimatedStyle = useAnimatedStyle(() => {
        return focusedSharedValue.get() ? restWrapperFocusedStyle : (restWrapperStyle ?? {});
    });
    const wrapperBorderColorAnimatedStyle = useAnimatedStyle(() => {
        return {
            borderColor: interpolateColor(focusedSharedValue.get() ? 1 : 0, [0, 1], [wrapperBorderColor as string, focusedBorderColor as string], 'RGB'),
        };
    });

    useEffect(() => {
        scheduleOnLiveMarkdownRuntime(() => {
            'worklet';

            emailListSharedValue.set(emailList);
        });
    }, [emailList, emailListSharedValue]);

    useEffect(() => {
        scheduleOnLiveMarkdownRuntime(() => {
            'worklet';

            currencySharedValue.set(currencyAutocompleteList);
        });
    }, [currencyAutocompleteList, currencySharedValue]);

    useEffect(() => {
        scheduleOnLiveMarkdownRuntime(() => {
            'worklet';

            categorySharedValue.set(categoryAutocompleteList);
        });
    }, [categorySharedValue, categoryAutocompleteList]);

    useEffect(() => {
        scheduleOnLiveMarkdownRuntime(() => {
            'worklet';

            tagSharedValue.set(tagAutocompleteList);
        });
    }, [tagSharedValue, tagAutocompleteList]);

    useEffect(() => {
        scheduleOnLiveMarkdownRuntime(() => {
            'worklet';

            translatedStatusSharedValue.set(translatedStatusSet);
        });
    }, [translatedStatusSharedValue, translatedStatusSet]);

    const parser = useCallback(
        (input: string) => {
            'worklet';

            return parseForLiveMarkdown(
                input,
                currentUserPersonalDetails.displayName ?? '',
                substitutionMap,
                emailListSharedValue,
                currencySharedValue,
                categorySharedValue,
                tagSharedValue,
                translatedStatusSharedValue,
            );
        },
        [currentUserPersonalDetails.displayName, substitutionMap, currencySharedValue, categorySharedValue, tagSharedValue, emailListSharedValue, translatedStatusSharedValue],
    );

    const clearInput = useCallback(() => {
        onSearchQueryChange('');
        setSearchContext(false);
    }, [onSearchQueryChange]);

    const inputWidth = isFullWidth ? styles.w100 : {width: variables.popoverWidth};

    return (
        <View style={[outerWrapperStyle]}>
            <Animated.View style={[styles.flexRow, styles.alignItemsCenter, wrapperStyle ?? styles.searchRouterTextInputContainer, wrapperAnimatedStyle, wrapperBorderColorAnimatedStyle]}>
                <View style={styles.flex1}>
                    <TextInput
                        testID="search-autocomplete-text-input"
                        value={value}
                        onChangeText={onSearchQueryChange}
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
                        textInputContainerStyles={[styles.borderNone, styles.pb0, styles.pl3]}
                        inputStyle={[inputWidth, styles.lineHeightUndefined]}
                        placeholderTextColor={theme.textSupporting}
                        loadingSpinnerStyle={[styles.mt0, styles.mr1, styles.justifyContentCenter]}
                        onFocus={() => {
                            onFocus?.();
                            autocompleteListRef?.current?.updateExternalTextInputFocus(true);
                            focusedSharedValue.set(true);
                        }}
                        onBlur={() => {
                            autocompleteListRef?.current?.updateExternalTextInputFocus(false);
                            focusedSharedValue.set(false);

                            onBlur?.();
                        }}
                        isLoading={isSearchingForReports}
                        ref={(element) => {
                            if (!ref) {
                                return;
                            }

                            inputRef.current = element as AnimatedTextInputRef;

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
                </View>
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
