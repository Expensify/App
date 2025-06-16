/* eslint-disable rulesdir/no-acc-spread-in-reduce */
import type {ForwardedRef, RefObject} from 'react';
import React, {forwardRef, useCallback, useEffect, useLayoutEffect, useMemo} from 'react';
import type {StyleProp, TextInputProps, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import FormHelpMessage from '@components/FormHelpMessage';
import type {SelectionListHandle} from '@components/SelectionList/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextInputClearButton from '@components/TextInput/TextInputClearButton';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAdvancedFilters} from '@libs/actions/Search';
import {parseFSAttributes} from '@libs/Fullstory';
import Navigation from '@libs/Navigation/Navigation';
import runOnLiveMarkdownRuntime from '@libs/runOnLiveMarkdownRuntime';
import {getAutocompleteCategories, getAutocompleteTags, parseForLiveMarkdown} from '@libs/SearchAutocompleteUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import getSearchFiltersButtonTransition from './getSearchFiltersButtonTransition.ts/index';
import type {SubstitutionMap} from './SearchRouter/getQueryWithSubstitutions';

const SearchFiltersButtonTransition = getSearchFiltersButtonTransition();

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
    wrapperStyle?: ViewStyle;

    /** Any additional styles to apply when input is focused */
    wrapperFocusedStyle?: ViewStyle;

    /** Any additional styles to apply to text input along with FormHelperMessage */
    outerWrapperStyle?: StyleProp<ViewStyle>;

    /** Whether the search reports API call is running  */
    isSearchingForReports?: boolean;

    /** Map of autocomplete suggestions. Required for highlighting to work properly */
    substitutionMap: SubstitutionMap;
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
        wrapperFocusedStyle = {},
        outerWrapperStyle,
        isSearchingForReports,
        selection,
        substitutionMap,
    }: SearchAutocompleteInputProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: false});
    const currencyAutocompleteList = Object.keys(currencyList ?? {}).filter((currencyCode) => !currencyList?.[currencyCode]?.retired);
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

    const offlineMessage: string = isOffline && shouldShowOfflineMessage ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    // we are handling focused/unfocused style using shared value instead of using state to avoid re-rendering. Otherwise layout animation in `Animated.View` will lag.
    const focusedSharedValue = useSharedValue(false);
    const wrapperAnimatedStyle = useAnimatedStyle(() => {
        return focusedSharedValue.get() ? wrapperFocusedStyle : (wrapperStyle ?? {});
    });

    useEffect(() => {
        runOnLiveMarkdownRuntime(() => {
            'worklet';

            emailListSharedValue.set(emailList);
        })();
    }, [emailList, emailListSharedValue]);

    useEffect(() => {
        runOnLiveMarkdownRuntime(() => {
            'worklet';

            currencySharedValue.set(currencyAutocompleteList);
        })();
    }, [currencyAutocompleteList, currencySharedValue]);

    useEffect(() => {
        runOnLiveMarkdownRuntime(() => {
            'worklet';

            categorySharedValue.set(categoryAutocompleteList);
        })();
    }, [categorySharedValue, categoryAutocompleteList]);

    useEffect(() => {
        runOnLiveMarkdownRuntime(() => {
            'worklet';

            tagSharedValue.set(tagAutocompleteList);
        })();
    }, [tagSharedValue, tagAutocompleteList]);

    const parser = useCallback(
        (input: string) => {
            'worklet';

            return parseForLiveMarkdown(input, currentUserPersonalDetails.displayName ?? '', substitutionMap, emailListSharedValue, currencySharedValue, categorySharedValue, tagSharedValue);
        },
        [currentUserPersonalDetails.displayName, substitutionMap, currencySharedValue, categorySharedValue, tagSharedValue, emailListSharedValue],
    );

    const clearFilters = useCallback(() => {
        clearAdvancedFilters();
        onSearchQueryChange('');

        // Check if we are on the search page before clearing query. If we are using the popup search menu,
        // then the clear button is ONLY available when the search is *not* saved, so we don't have to navigate
        const currentRoute = Navigation.getActiveRouteWithoutParams();
        const isSearchPage = currentRoute === `/${ROUTES.SEARCH_ROOT.route}`;

        if (isSearchPage) {
            Navigation.navigate(
                ROUTES.SEARCH_ROOT.getRoute({
                    query: buildCannedSearchQuery(),
                }),
            );
        }
    }, [onSearchQueryChange]);

    const inputWidth = isFullWidth ? styles.w100 : {width: variables.popoverWidth};

    // Parse Fullstory attributes on initial render
    useLayoutEffect(parseFSAttributes, []);

    return (
        <View style={[outerWrapperStyle]}>
            <Animated.View style={[styles.flexRow, styles.alignItemsCenter, wrapperStyle ?? styles.searchRouterTextInputContainer, wrapperAnimatedStyle]}>
                <View
                    style={styles.flex1}
                    fsClass={CONST.FULL_STORY.UNMASK}
                    testID={CONST.FULL_STORY.UNMASK}
                >
                    <TextInput
                        testID="search-autocomplete-text-input"
                        value={value}
                        onChangeText={onSearchQueryChange}
                        autoFocus={autoFocus}
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
                        textInputContainerStyles={[styles.borderNone, styles.pb0, styles.pl3]}
                        inputStyle={[inputWidth, {lineHeight: undefined}]}
                        placeholderTextColor={theme.textSupporting}
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
                        ref={ref}
                        type="markdown"
                        multiline={false}
                        parser={parser}
                        selection={selection}
                    />
                </View>
                {!!value && (
                    <Animated.View
                        style={styles.pr3}
                        layout={SearchFiltersButtonTransition}
                    >
                        <TextInputClearButton
                            onPressButton={clearFilters}
                            style={styles.mt0}
                        />
                    </Animated.View>
                )}
            </Animated.View>
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
