import React from 'react';
import {View} from 'react-native';
import ScrollView from '@components/ScrollView';
import SpacerView from '@components/SpacerView';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchFilter} from '@libs/SearchUIUtils';
import FilterItem from './FilterItem';
import useFullscreenAdvancedFilters from './useFullscreenAdvancedFilters';

type FilterListProps = {
    selectedFilter: SearchFilter['key'] | null;
    onFilterSelected: (filter: SearchFilter['key']) => void;
};

function FilterList({selectedFilter, onFilterSelected}: FilterListProps) {
    const styles = useThemeStyles();
    const {typeFiltersKeys} = useAdvancedSearchFilters();
    const fullscreen = useFullscreenAdvancedFilters();

    return (
        <ScrollView
            style={[styles.typeFiltersContainer, fullscreen && styles.pv0, !!selectedFilter && styles.dNone]}
            contentContainerStyle={[fullscreen && styles.pb5]}
            showsVerticalScrollIndicator={false}
        >
            {typeFiltersKeys.map((section, index) => (
                <View key={`${section.at(0)}`}>
                    {index !== 0 && (
                        <SpacerView
                            shouldShow
                            style={[styles.reportHorizontalRule]}
                        />
                    )}
                    {section.map((item) => (
                        <FilterItem
                            key={item}
                            filterKey={item}
                            isSelected={item === selectedFilter}
                            onHoverIn={!fullscreen ? () => onFilterSelected(item) : undefined}
                            onFocus={!fullscreen ? () => onFilterSelected(item) : undefined}
                            onPress={fullscreen ? () => onFilterSelected(item) : undefined}
                        />
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}

export default FilterList;
