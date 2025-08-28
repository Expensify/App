import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/MultiSelectListItem';
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

type SearchFilterMultiSelectProps = {
    /** The filter key */
    filterKey: SearchFilterKey;
    
    /** Title translation key */
    titleKey: TranslationPaths;
    
    /** Available options to select from */
    options: SelectOption[];
    
    /** Function to get the display text for a value */
    getOptionText?: (value: string) => string;
    
    /** Default value when no items are selected */
    defaultValue?: string | string[];
};

function SearchFilterMultiSelect({
    filterKey,
    titleKey,
    options,
    getOptionText,
    defaultValue,
}: SearchFilterMultiSelectProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const currentValue = searchAdvancedFiltersForm?.[filterKey];

    const [selectedItems, setSelectedItems] = useState<string[]>(() => {
        if (!currentValue || (typeof currentValue === 'string' && currentValue === defaultValue)) {
            return [];
        }

        if (typeof currentValue === 'string') {
            return currentValue.split(',');
        }

        return Array.isArray(currentValue) ? currentValue : [];
    });

    const items: ListItem[] = useMemo(() => {
        return options.map((option) => ({
            text: getOptionText ? getOptionText(option.value) : option.text,
            keyForList: option.value,
            value: option.value,
            isSelected: selectedItems.includes(option.value),
        }));
    }, [options, selectedItems, getOptionText]);

    const updateSelectedItems = useCallback(
        (listItem: ListItem) => {
            if (listItem.isSelected) {
                setSelectedItems(selectedItems.filter((i) => i !== listItem.keyForList));
                return;
            }

            const newItem = options.find((i) => i.value === listItem.keyForList)?.value;

            if (newItem) {
                setSelectedItems([...selectedItems, newItem]);
            }
        },
        [options, selectedItems],
    );

    const resetChanges = useCallback(() => {
        setSelectedItems([]);
    }, []);

    const applyChanges = useCallback(() => {
        const newValue = selectedItems.length ? selectedItems : defaultValue;
        updateAdvancedFilters({[filterKey]: newValue});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [filterKey, selectedItems, defaultValue]);

    const title = translate(titleKey);

    return (
        <ScreenWrapper
            testID={SearchFilterMultiSelect.displayName}
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
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelectedItems}
                />
            </View>
            <FixedFooter style={styles.mtAuto}>
                <SearchFilterPageFooterButtons
                    resetChanges={resetChanges}
                    applyChanges={applyChanges}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

SearchFilterMultiSelect.displayName = 'SearchFilterMultiSelect';

export default SearchFilterMultiSelect;