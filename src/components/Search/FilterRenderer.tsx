import React from 'react';
import {View} from 'react-native';
import SearchBooleanFilterBasePage from '@components/Search/SearchBooleanFilterBasePage';
import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';
import SearchFiltersAmountBase from '@components/Search/SearchFiltersAmountBase';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FilterConfig} from '@libs/SearchFilters/types';

type FilterRendererProps = {
    config: FilterConfig;
};

function FilterRenderer({config}: FilterRendererProps) {
    const styles = useThemeStyles();

    switch (config.type) {
        case 'datePreset':
            return (
                <SearchDatePresetFilterBasePage
                    dateKey={config.dateKey}
                    titleKey={config.titleKey}
                />
            );

        case 'amount':
            return (
                <SearchFiltersAmountBase
                    filterKey={config.filterKey}
                    title={config.titleKey}
                    testID={config.testID}
                />
            );

        case 'text':
            return (
                <SearchFiltersTextBase
                    filterKey={config.filterKey}
                    titleKey={config.titleKey}
                    testID={config.testID}
                    characterLimit={config.characterLimit}
                />
            );

        case 'boolean':
            return (
                <SearchBooleanFilterBasePage
                    filterKey={config.filterKey}
                    titleKey={config.titleKey}
                />
            );

        case 'multiSelect':
            // TODO: Implement multiSelect renderer using SearchMultipleSelectionPicker
            // This will be used when we migrate complex filters
            return <View style={styles.flex1} />;

        case 'custom':
            const CustomComponent = config.component;
            return <CustomComponent />;

        default:
            // Should never happen with proper typing, but safe fallback
            return <View style={styles.flex1} />;
    }
}

FilterRenderer.displayName = 'FilterRenderer';

export default FilterRenderer;