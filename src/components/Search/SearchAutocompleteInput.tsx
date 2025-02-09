import type {ForwardedRef, ReactNode, RefObject} from 'react';
import React, {forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, TextInputProps, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {useSharedValue} from 'react-native-reanimated';
import FormHelpMessage from '@components/FormHelpMessage';
import type {SelectionListHandle} from '@components/SelectionList/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {parseFSAttributes} from '@libs/Fullstory';
import runOnLiveMarkdownRuntime from '@libs/runOnLiveMarkdownRuntime';
import {getAutocompleteCategories, getAutocompleteTags, parseForLiveMarkdown} from '@libs/SearchAutocompleteUtils';
import handleKeyPress from '@libs/SearchInputOnKeyPress';
import shouldDelayFocus from '@libs/shouldDelayFocus';
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
        wrapperFocusedStyle,
        outerWrapperStyle,
        rightComponent,
        isSearchingForReports,
        selection,
        substitutionMap,
    }: SearchAutocompleteInputProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const {isOffline} = useNetwork();
    const {activeWorkspaceID} = useActiveWorkspace();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const currencyAutocompleteList = Object.keys(currencyList ?? {});
    const currencySharedValue = useSharedValue(currencyAutocompleteList);

    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const categoryAutocompleteList = useMemo(() => {
        return getAutocompleteCategories(allPolicyCategories, activeWorkspaceID);
    }, [activeWorkspaceID, allPolicyCategories]);
    const categorySharedValue = useSharedValue(categoryAutocompleteList);

    const [allPoliciesTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const tagAutocompleteList = useMemo(() => {
        return getAutocompleteTags(allPoliciesTags, activeWorkspaceID);
    }, [activeWorkspaceID, allPoliciesTags]);
    const tagSharedValue = useSharedValue(tagAutocompleteList);

    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const emailList = Object.keys(loginList ?? {});
    const emailListSharedValue = useSharedValue(emailList);

    const offlineMessage: string = isOffline && shouldShowOfflineMessage ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

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
        });
    }, [tagSharedValue, tagAutocompleteList]);

    const parser = useCallback(
        (input: string) => {
            'worklet';

            return parseForLiveMarkdown(input, currentUserPersonalDetails.displayName ?? '', substitutionMap, emailListSharedValue, currencySharedValue, categorySharedValue, tagSharedValue);
        },
        [currentUserPersonalDetails.displayName, substitutionMap, currencySharedValue, categorySharedValue, tagSharedValue, emailListSharedValue],
    );

    const inputWidth = isFullWidth ? styles.w100 : {width: variables.popoverWidth};

    // Parse Fullstory attributes on initial render
    useLayoutEffect(parseFSAttributes, []);

    return (
        <View style={[outerWrapperStyle]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, wrapperStyle ?? styles.searchRouterTextInputContainer, isFocused && wrapperFocusedStyle]}>
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
                        textInputContainerStyles={[styles.borderNone, styles.pb0, styles.pr3]}
                        inputStyle={[inputWidth, styles.pl3, styles.pr3]}
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
                        type="markdown"
                        multiline={false}
                        parser={parser}
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
