// NOTE: This component has a static twin in SearchPageNarrow/StaticSearchPageInput.tsx
// used for fast perceived performance. If you change the UI here, verify the
// static version still looks visually identical.
import React, {useState} from 'react';
import type {SearchQueryJSON} from '@components/Search/types';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {buildFilterValuesString, getKeywordQueryWithCurrentSearchContext, getQueryWithUpdatedValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import KeyboardUtils from '@src/utils/keyboard';

type SearchPageInputProps = {
    queryJSON: SearchQueryJSON;
    onFocus?: () => void;
};

function SearchPageInput({queryJSON, onFocus}: SearchPageInputProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [textInputValue, setTextInputValue] = useState('');

    const keywordFilters = queryJSON.flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD)?.filters ?? [];
    const keywordQuery = buildFilterValuesString(CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD, keywordFilters).trim();
    const [prevKeywordQuery, setPrevKeywordQuery] = useState('');

    if (keywordQuery !== prevKeywordQuery) {
        setTextInputValue(keywordQuery);
        setPrevKeywordQuery(keywordQuery);
    }

    function submitSearch(query: string) {
        const queryWithContext = getKeywordQueryWithCurrentSearchContext(query, queryJSON);
        const updatedQuery = getQueryWithUpdatedValues(queryWithContext);

        if (!updatedQuery) {
            return;
        }

        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: updatedQuery}));
    }

    return (
        <TextInput
            value={textInputValue}
            onChangeText={setTextInputValue}
            role={CONST.ROLE.SEARCHBOX}
            placeholder={translate('search.searchPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            enterKeyHint="search"
            accessibilityLabel={translate('search.searchPlaceholder')}
            maxLength={CONST.SEARCH_QUERY_LIMIT}
            onSubmitEditing={() => {
                if (shouldUseNarrowLayout) {
                    KeyboardUtils.dismiss().then(() => submitSearch(textInputValue));
                    return;
                }
                submitSearch(textInputValue);
            }}
            containerStyles={[shouldUseNarrowLayout ? styles.flex1 : undefined]}
            textInputContainerStyles={[styles.pb0, shouldUseNarrowLayout ? styles.ph3 : styles.ph2]}
            inputStyle={[styles.w100, styles.lineHeightUndefined, shouldUseNarrowLayout ? undefined : styles.fontSizeLabel]}
            touchableInputWrapperStyle={shouldUseNarrowLayout ? styles.searchPageInputNarrowTouchableWrapper : styles.searchPageInputWideTouchableWrapper}
            clearButtonStyle={shouldUseNarrowLayout ? undefined : styles.mh0}
            placeholderTextColor={theme.textSupporting}
            shouldShowClearButton={!!textInputValue}
            shouldHideClearButton={false}
            onClearInput={() => {
                setTextInputValue('');
                submitSearch('');
            }}
            onFocus={onFocus}
        />
    );
}

export default SearchPageInput;
export type {SearchPageInputProps};
