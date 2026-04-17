import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import SearchInputSelectionWrapper from '@components/Search/SearchInputSelectionWrapper';
import {useSearchRouterActions} from '@components/Search/SearchRouter/SearchRouterContext';
import type {SearchQueryJSON} from '@components/Search/types';
import type {SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useSearchPageInput from './useSearchPageInput';

type SearchPageInputWideProps = {
    queryJSON: SearchQueryJSON;
    handleSearch: (value: string) => void;
};

function SearchPageInputWide({queryJSON, handleSearch}: SearchPageInputWideProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const isFocused = useIsFocused();
    const {registerSearchPageInput} = useSearchRouterActions();

    const [isAutocompleteListVisible, setIsAutocompleteListVisible] = useState(false);

    const listRef = useRef<SelectionListWithSectionsHandle>(null);

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
        onSubmit: () => setIsAutocompleteListVisible(false),
    });

    useEffect(() => {
        if (!isFocused || !textInputRef.current) {
            return;
        }

        registerSearchPageInput(textInputRef.current);
    }, [isFocused, registerSearchPageInput, textInputRef]);

    const hideAutocompleteList = () => setIsAutocompleteListVisible(false);
    const showAutocompleteList = () => setIsAutocompleteListVisible(true);

    const autocompleteInputStyle = isAutocompleteListVisible
        ? [styles.border, styles.borderRadiusComponentLarge, styles.pAbsolute, styles.pt2, styles.w100, styles.zIndex10, {top: 0, maxWidth: 675}, {boxShadow: theme.shadow}]
        : [];
    const inputWrapperActiveStyle = isAutocompleteListVisible ? styles.ph2 : null;

    return (
        <>
            {/* An empty view as the input placeholder so that the applied filters won't move when the real input position becomes absolute */}
            {isAutocompleteListVisible && <View style={styles.searchPageInputWidePlaceholder} />}
            <View
                dataSet={{dragArea: false}}
                style={[styles.appBG, styles.searchResultsHeaderBar, ...autocompleteInputStyle]}
            >
                <SearchInputSelectionWrapper
                    value={textInputValue}
                    onSearchQueryChange={onSearchQueryChange}
                    isFullWidth
                    inputStyle={isAutocompleteListVisible ? undefined : styles.fontSizeLabel}
                    inputContainerStyle={isAutocompleteListVisible ? undefined : styles.ph2}
                    touchableInputWrapperStyle={isAutocompleteListVisible ? undefined : styles.searchPageInputWideTouchableWrapper}
                    onSubmit={() => {
                        const focusedOption = listRef.current?.getFocusedOption();
                        if (focusedOption) {
                            return;
                        }
                        submitSearch(textInputValue);
                    }}
                    autoFocus={false}
                    onFocus={showAutocompleteList}
                    onBlur={hideAutocompleteList}
                    wrapperStyle={{...styles.searchAutocompleteInputResults, ...styles.br2}}
                    wrapperFocusedStyle={styles.searchAutocompleteInputResultsFocused}
                    outerWrapperStyle={[inputWrapperActiveStyle, styles.flex1]}
                    ref={textInputRef}
                    selection={selection}
                    substitutionMap={autocompleteSubstitutions}
                    onKeyPress={handleKeyPress}
                />
                {isAutocompleteListVisible && (
                    <View style={[styles.mh65vh, styles.mt3]}>
                        <SearchAutocompleteList
                            autocompleteQueryValue={autocompleteQueryValue}
                            handleSearch={handleSearchAction}
                            searchQueryItem={searchQueryItem}
                            onListItemPress={onListItemPress}
                            ref={listRef}
                            shouldSubscribeToArrowKeyEvents={isAutocompleteListVisible}
                            textInputRef={textInputRef}
                            autocompleteSubstitutions={autocompleteSubstitutions}
                        />
                    </View>
                )}
            </View>
        </>
    );
}

export default SearchPageInputWide;
