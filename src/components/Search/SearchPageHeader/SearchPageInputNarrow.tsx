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
};
// NOTE: This is intentionally unused for now. It will be wired up in https://github.com/Expensify/App/issues/84876
function SearchPageInputNarrow({queryJSON, searchRouterListVisible, hideSearchRouterList, onSearchRouterFocus, handleSearch}: SearchPageInputNarrowProps) {
    const styles = useThemeStyles();

    const {
        allFeeds,
        autocompleteSubstitutions,
        autocompleteQueryValue,
        personalAndWorkspaceCards,
        personalDetails,
        reports,
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
            style={[styles.flex1, styles.appBG, searchRouterListVisible && styles.pt2]}
        >
            <View style={[styles.flexRow, styles.mh5, searchRouterListVisible ? styles.mb3 : styles.mb4, styles.alignItemsCenter, styles.justifyContentCenter]}>
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
                        wrapperStyle={{...styles.newSearchAutocompleteInputResults, ...styles.br2}}
                        wrapperFocusedStyle={styles.searchAutocompleteInputResultsFocused}
                        ref={textInputRef}
                        onKeyPress={handleKeyPress}
                    />
                </Animated.View>
            </View>
            {!!searchRouterListVisible && (
                <SearchAutocompleteList
                    autocompleteQueryValue={autocompleteQueryValue}
                    handleSearch={handleSearchAction}
                    searchQueryItem={searchQueryItem}
                    onListItemPress={onListItemPress}
                    personalDetails={personalDetails}
                    reports={reports}
                    allCards={personalAndWorkspaceCards}
                    allFeeds={allFeeds}
                    textInputRef={textInputRef}
                />
            )}
        </View>
    );
}

export default SearchPageInputNarrow;
