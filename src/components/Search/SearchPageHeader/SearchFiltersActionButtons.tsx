import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import SearchFiltersResetButton from './SearchFiltersResetButton';
import SearchFiltersSaveButton from './SearchFiltersSaveButton';

type SearchFiltersActionButtonsProps = {
    canReset: boolean;
    canSave: boolean;
    resetFilters: () => void;
};

function SearchFiltersActionButtons({canReset, canSave, resetFilters}: SearchFiltersActionButtonsProps) {
    const styles = useThemeStyles();

    if (!canSave && !canReset) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            {canReset && <SearchFiltersResetButton onPress={resetFilters} />}
            {canSave && <SearchFiltersSaveButton />}
        </View>
    );
}

export default SearchFiltersActionButtons;
