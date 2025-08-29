import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchFilterKey} from '@components/Search/types';

type SelectOption = {
    text: string;
    value: string;
};

type SearchFilterSingleSelectProps = {
    /** The filter key */
    filterKey: SearchFilterKey;
    
    /** Title translation key */
    titleKey: TranslationPaths;
    
    /** Available options to select from */
    options: SelectOption[];
    
    /** Function to get the display text for a value */
    getOptionText?: (value: string) => string;
};

function SearchFilterSingleSelect({
    filterKey,
    titleKey,
    options,
    getOptionText,
}: SearchFilterSingleSelectProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const currentValue = searchAdvancedFiltersForm?.[filterKey as keyof typeof searchAdvancedFiltersForm] as string | undefined;

    const [selectedItem, setSelectedItem] = useState<string | null>(() => {
        return typeof currentValue === 'string' ? currentValue : null;
    });

    const items: ListItem[] = useMemo(() => {
        return options.map((option) => ({
            text: getOptionText ? getOptionText(option.value) : option.text,
            keyForList: option.value,
            value: option.value,
            isSelected: selectedItem === option.value,
        }));
    }, [options, selectedItem, getOptionText]);

    const updateFilter = useCallback((item: ListItem) => {
        const newValue = item.isSelected ? null : (item as any).value as string;
        setSelectedItem(newValue);
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(null);
    }, []);

    const applyChanges = useCallback(() => {
        updateAdvancedFilters({[filterKey]: selectedItem});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [filterKey, selectedItem]);

    const title = translate(titleKey);

    return (
        <ScreenWrapper
            testID={SearchFilterSingleSelect.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    sections={[{data: items}]}
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateFilter}
                />
            </View>
            <FixedFooter style={styles.mtAuto}>
                <SearchFilterPageFooterButtons
                    applyChanges={applyChanges}
                    resetChanges={resetChanges}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

SearchFilterSingleSelect.displayName = 'SearchFilterSingleSelect';

export default SearchFilterSingleSelect;