import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import SearchFiltersResetButton from './SearchFiltersResetButton';
import SearchFiltersSaveButton from './SearchFiltersSaveButton';

type SearchFiltersActionButtonsProps = {
    hasFiltersChanged: boolean;
    hasFiltersOrKeywordChanged: boolean;
    resetFilters: () => void;
};

function SearchFiltersActionButtons({hasFiltersChanged, hasFiltersOrKeywordChanged, resetFilters}: SearchFiltersActionButtonsProps) {
    const styles = useThemeStyles();

    if (!hasFiltersOrKeywordChanged) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            {hasFiltersChanged && <SearchFiltersResetButton onPress={resetFilters} />}
            <SearchFiltersSaveButton />
        </View>
    );
}

export default SearchFiltersActionButtons;
