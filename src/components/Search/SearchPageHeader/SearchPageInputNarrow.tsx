// NOTE: This component has a static twin in SearchPageNarrow/StaticSearchPageInput.tsx
// used for fast perceived performance. If you change the UI here, verify the
// static version still looks visually identical.
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import SearchInputSelectionWrapper from '@components/Search/SearchInputSelectionWrapper';
import type {SearchQueryJSON} from '@components/Search/types';
import useThemeStyles from '@hooks/useThemeStyles';
import KeyboardUtils from '@src/utils/keyboard';
import useSearchPageInput from './useSearchPageInput';

type SearchPageInputNarrowProps = {
    queryJSON: SearchQueryJSON;
    searchRouterListVisible: boolean;
    hideSearchRouterList: () => void;
    onSearchRouterFocus: () => void;
    handleSearch: (value: string) => void;
    skipSkeleton: boolean;
};
function SearchPageInputNarrow({queryJSON, searchRouterListVisible, hideSearchRouterList, onSearchRouterFocus, handleSearch, skipSkeleton}: SearchPageInputNarrowProps) {
    const styles = useThemeStyles();

    const {
        autocompleteSubstitutions,
        autocompleteQueryValue,
        searchQueryItem,
        selection,
        textInputRef,
        textInputValue,
        handleKeyPress,
        handleSearchAction,
        onListItemPress,
        onSearchQueryChange,
        submitSearch,
    } = useSearchPageInput({
        queryJSON,
        onSearch: handleSearch,
        onSubmit: hideSearchRouterList,
    });

    // useEffect for blurring TextInput when we cancel SearchRouter interaction on narrow layout
    useEffect(() => {
        if (!!searchRouterListVisible || !textInputRef.current || !textInputRef.current.isFocused()) {
            return;
        }
        textInputRef.current.blur();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchRouterListVisible]);

    return (
        <View
            dataSet={{dragArea: false}}
            style={[styles.flex1, styles.appBG]}
        >
            <View style={[styles.flexRow, styles.ml5, searchRouterListVisible ? [styles.mb3, styles.mr5] : [styles.mb4, styles.mr3]]}>
                <Animated.View style={[styles.flex1, styles.zIndex10]}>
                    <SearchInputSelectionWrapper
                        value={textInputValue}
                        substitutionMap={autocompleteSubstitutions}
                        selection={selection}
                        onSearchQueryChange={onSearchQueryChange}
                        isFullWidth
                        onSubmit={() => {
                            KeyboardUtils.dismiss().then(() => submitSearch(textInputValue));
                        }}
                        autoFocus={false}
                        onFocus={onSearchRouterFocus}
                        touchableInputWrapperStyle={styles.searchPageInputNarrowTouchableWrapper}
                        wrapperStyle={{...styles.searchAutocompleteInputResults, ...styles.br2}}
                        wrapperFocusedStyle={styles.searchAutocompleteInputResultsFocused}
                        ref={textInputRef}
                        onKeyPress={handleKeyPress}
                        skipSkeleton={skipSkeleton}
                    />
                </Animated.View>
            </View>
            {!!searchRouterListVisible && (
                <SearchAutocompleteList
                    autocompleteQueryValue={autocompleteQueryValue}
                    handleSearch={handleSearchAction}
                    searchQueryItem={searchQueryItem}
                    onListItemPress={onListItemPress}
                    textInputRef={textInputRef}
                />
            )}
        </View>
    );
}

export default SearchPageInputNarrow;
export type {SearchPageInputNarrowProps};
